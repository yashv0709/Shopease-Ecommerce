const { GoogleGenerativeAI } = require('@google/generative-ai');
const { z } = require('zod');
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const jwt = require('jsonwebtoken');

// Zod Schema to validate structured JSON returned by Gemini
const aiResponseSchema = z.object({
  isFollowUp: z.boolean(),
  search: z.string().max(100).nullable().optional(),
  category: z.string().nullable().optional(),
  minPrice: z.number().min(0).nullable().optional(),
  maxPrice: z.number().min(0).nullable().optional(),
  sort: z.enum(['price_asc', 'price_desc', 'newest']).nullable().optional(),
  explanation: z.string().nullable().optional(),
  action: z.string().nullable().optional(),
  orderId: z.string().nullable().optional(),
}).refine((data) => {
  if (!data.isFollowUp && data.minPrice !== undefined && data.maxPrice !== undefined && data.minPrice !== null && data.maxPrice !== null) {
    return data.minPrice <= data.maxPrice;
  }
  return true;
}, {
  message: "minPrice must be less than or equal to maxPrice"
});

// Initialize Gemini SDK if API key exists
let genAI = null;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

// Helper to safely clean string and parse JSON from LLM
const parseJSONResponse = (text) => {
  try {
    // Strip markdown formatting if the model wraps JSON in codeblocks
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (e) {
    throw new Error('Failed to parse JSON response from AI model');
  }
};

// Helper to save support requests to database
const saveSupportRequest = async (currentUser, message, responseText) => {
  try {
    const SupportRequest = require('../models/SupportRequest');
    await SupportRequest.create({
      user: currentUser ? currentUser._id : null,
      userName: currentUser ? currentUser.name : 'Guest User',
      userEmail: currentUser ? currentUser.email : 'guest@example.com',
      message,
      response: responseText,
    });
  } catch (err) {
    console.error('Error saving support request:', err);
  }
};

// @desc    AI Product Recommendation & Customer Support Assistant
// @route   POST /api/ai/assistant
// @access  Public
const getRecommendation = async (req, res, next) => {
  try {
    const { message, previousProducts = [] } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ success: false, message: 'Message prompt cannot be empty' });
    }

    // Decode JWT from cookie if user is logged in
    let currentUser = null;
    let userOrders = [];
    if (req.cookies && req.cookies.token) {
      try {
        const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET || 'shopeasedefaultjwtsecretkey999');
        currentUser = await User.findById(decoded.id).select('-password');
        if (currentUser) {
          userOrders = await Order.find({ user: currentUser._id }).populate('items.product').sort({ createdAt: -1 }).limit(5);
        }
      } catch (err) {
        // Continue as guest
      }
    }

    const supportContext = currentUser ? {
      authenticated: true,
      userName: currentUser.name,
      userEmail: currentUser.email,
      recentOrders: userOrders.map(o => ({
        id: o._id,
        status: o.status,
        totalAmount: o.totalAmount,
        paymentStatus: o.paymentStatus,
        createdAt: o.createdAt,
        items: o.items.map(item => ({
          name: item.product ? (item.product.name || item.product) : 'Product',
          quantity: item.quantity,
          price: item.price
        }))
      }))
    } : {
      authenticated: false
    };

    // 1. Sanitize previousProducts (Max 10 items, whitelisted fields)
    const sanitizedPreviousProducts = previousProducts
      .slice(0, 10)
      .map((p) => ({
        id: p._id || p.id,
        name: p.name,
        price: p.price,
        category: p.category,
        rating: p.ratings || p.rating || 0,
        numOfReviews: p.numOfReviews || 0,
      }));

    // Check if Gemini is configured. If not, use local keyword fallback
    if (!genAI) {
      return executeRuleBasedFallback(message, res, currentUser, userOrders);
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    // 2. Draft the context-aware structured prompt including Support Context
    const prompt = `
You are the ShopEase AI Shopping & Customer Support Assistant.
You can help users find products, track orders, compare options, cancel orders, and answer general support policy questions (returns, refunds, contact support) similar to a professional Flipkart support bot.

Allowed categories: "Sports", "Casual", "Electronics", "Accessories", "Footwear"
Allowed sorting: "price_asc" (Price: Low to High), "price_desc" (Price: High to Low), "newest" (Newest first)

Support Policies:
1. Return Policy: Products can be returned within 14 days of delivery.
2. Refund Policy: Refund processing takes 5-7 business days to go back to the original payment method after quality check.
3. Cancellations: Orders can be cancelled at any time BEFORE they are Shipped.
4. Contact Support: Email support@shopease.com or call us at +1-800-123-SHOP.

User Session & Order Context:
${JSON.stringify(supportContext, null, 2)}

Previously displayed products context (max 10):
${JSON.stringify(sanitizedPreviousProducts, null, 2)}

User's new message: "${message}"

Analyze the user's message. You must output a JSON object matching one of these structures:

If the user is asking to cancel an order:
- If they are NOT logged in, set "isFollowUp": true and set "explanation" to "Please sign in first to cancel your order."
- If they have no active orders in Placed or Confirmed status, set "isFollowUp": true and set "explanation" to "You don't have any active orders that can be cancelled."
- If they want to cancel but have NOT typed "CONFIRM CANCEL" yet:
  Identify the latest Placed or Confirmed order from User Session. Set "isFollowUp": true, set "action": null, and set "explanation" to: "I found your active order #[ORDER_ID_LAST_6_DIGITS]. Are you sure you want to cancel? Please reply CONFIRM CANCEL to execute."
- If their message contains "CONFIRM CANCEL":
  Identify the latest Placed or Confirmed order ID. You must set:
  {
    "isFollowUp": true,
    "action": "cancel_order",
    "orderId": "[FULL_MONGODB_ORDER_ID_FROM_SESSION_CONTEXT]"
  }

If the user is asking a support question, tracking orders, comparing products, or general chat:
{
  "isFollowUp": true,
  "explanation": "Provide a friendly, highly conversational response. If the user is logged in, address them by name (e.g. Yash) and look up their orders to answer tracking questions. Maintain a supportive Flipkart-like tone."
}

If the user is initiating a new search or changing search criteria:
{
  "isFollowUp": false,
  "search": string | null (keywords, max 100 chars),
  "category": string | null (one of the allowed categories),
  "minPrice": number | null (>= 0),
  "maxPrice": number | null (>= 0),
  "sort": "price_asc" | "price_desc" | "newest" | null
}
`;

    // 3. Request LLM structured JSON
    const result = await model.generateContent(prompt);
    const parsedData = parseJSONResponse(result.response.text());

    // 4. Validate with Zod
    const validatedData = aiResponseSchema.parse(parsedData);

    // 5. Handle Follow-up Flow (Comparison/Support/Cancel)
    if (validatedData.isFollowUp) {
      // Intercept cancel order actions from LLM
      if (validatedData.action === 'cancel_order' && validatedData.orderId) {
        try {
          const orderService = require('../services/orderService');
          const cancelled = await orderService.cancelOrder(validatedData.orderId);
          const confirmMsg = `I have successfully cancelled order #${cancelled._id.toString().slice(-6).toUpperCase()} and restored the product stocks to the store inventory.`;
          await saveSupportRequest(currentUser, message, confirmMsg);
          return res.status(200).json({
            success: true,
            mode: 'ai',
            isFollowUp: true,
            response: confirmMsg,
            products: [],
          });
        } catch (err) {
          const errorMsg = `Failed to cancel order: ${err.message}`;
          await saveSupportRequest(currentUser, message, errorMsg);
          return res.status(200).json({
            success: true,
            mode: 'ai',
            isFollowUp: true,
            response: errorMsg,
            products: [],
          });
        }
      }

      await saveSupportRequest(currentUser, message, validatedData.explanation);
      return res.status(200).json({
        success: true,
        mode: 'ai',
        isFollowUp: true,
        response: validatedData.explanation,
        products: previousProducts, // Keep showing previous products
      });
    }

    // 6. Handle New Search Flow
    const mongoQuery = {};

    if (validatedData.search) {
      mongoQuery.$or = [
        { name: { $regex: validatedData.search, $options: 'i' } },
        { description: { $regex: validatedData.search, $options: 'i' } },
      ];
    }

    if (validatedData.category && validatedData.category !== 'All') {
      mongoQuery.category = validatedData.category;
    }

    if (validatedData.minPrice || validatedData.maxPrice) {
      mongoQuery.price = {};
      if (validatedData.minPrice) mongoQuery.price.$gte = validatedData.minPrice;
      if (validatedData.maxPrice) mongoQuery.price.$lte = validatedData.maxPrice;
    }

    let sortBy = { createdAt: -1 };
    if (validatedData.sort === 'price_asc') {
      sortBy = { price: 1 };
    } else if (validatedData.sort === 'price_desc') {
      sortBy = { price: -1 };
    }

    // Fetch matching products from DB
    const matchingProducts = await Product.find(mongoQuery).sort(sortBy).limit(10);

    // 7. Get Gemini to conversationalize the results explanation
    const explainPrompt = `
You are the ShopEase AI Shopping Assistant. Summarize the search results for the user's request.
User request: "${message}"

Matching products found in database:
${JSON.stringify(
  matchingProducts.map((p) => ({
    name: p.name,
    price: p.price,
    category: p.category,
    rating: p.ratings,
  })),
  null,
  2
)}

Draft a friendly 2-3 sentence response. Introduce the matching products and explain how they fit the user's requirements. If no products match, politely suggest other categories or products.
Do not hallucinate any specs or products not listed above.
`;

    const explanationResult = await model.generateContent(explainPrompt);
    const aiResponse = explanationResult.response.text().trim();

    return res.status(200).json({
      success: true,
      mode: 'ai',
      isFollowUp: false,
      response: aiResponse,
      products: matchingProducts,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(422).json({
        success: false,
        message: 'AI returned invalid search parameters validation failed',
        errors: error.errors,
      });
    }
    next(error);
  }
};

// Local Rule-Based Fallback logic if API key is not configured
const executeRuleBasedFallback = async (message, res, currentUser = null, userOrders = []) => {
  const query = {};
  const cleanMsg = message.toLowerCase();

  // 1. Return / Refund Policy check
  if (cleanMsg.includes('return') || cleanMsg.includes('refund') || cleanMsg.includes('replace') || cleanMsg.includes('policy')) {
    let returnText = "At ShopEase, you can return any item within 14 days of delivery. Refunds are processed back to your original payment method within 5-7 business days after our quality check passes.";
    await saveSupportRequest(currentUser, message, returnText);
    return res.status(200).json({
      success: true,
      mode: 'smart-support',
      isFollowUp: true,
      response: returnText,
      products: [],
    });
  }

  // 2. Confirm Cancellation check
  if (cleanMsg.includes('confirm cancel')) {
    let cancelText = "You do not have any active, cancellable orders currently.";
    if (currentUser && userOrders.length > 0) {
      const cancellable = userOrders.filter(o => o.status === 'Placed' || o.status === 'Confirmed');
      if (cancellable.length > 0) {
        try {
          const orderService = require('../services/orderService');
          const cancelled = await orderService.cancelOrder(cancellable[0]._id);
          cancelText = `I have successfully cancelled order #${cancelled._id.toString().slice(-6).toUpperCase()} and restored the product inventory.`;
        } catch (err) {
          cancelText = `Failed to cancel order: ${err.message}`;
        }
      }
    }
    await saveSupportRequest(currentUser, message, cancelText);
    return res.status(200).json({
      success: true,
      mode: 'smart-support',
      isFollowUp: true,
      response: cancelText,
      products: [],
    });
  }

  // 3. Regular Cancellation request check
  if (cleanMsg.includes('cancel')) {
    let cancelText = "You can cancel any order directly from your 'My Orders' dashboard before it is Shipped. If it has already shipped, you can refuse delivery or initiate a return.";
    if (currentUser) {
      if (userOrders.length > 0) {
        const cancellable = userOrders.filter(o => o.status === 'Placed' || o.status === 'Confirmed');
        if (cancellable.length > 0) {
          cancelText = `Hi ${currentUser.name}! I found your active order #${cancellable[0]._id.toString().slice(-6).toUpperCase()} (Status: ${cancellable[0].status}). Are you sure you want to cancel this order? Reply **CONFIRM CANCEL** to execute cancellation.`;
        } else {
          cancelText = `Hi ${currentUser.name}, you don't have any active orders in 'Placed' or 'Confirmed' status. Shipped or Delivered orders cannot be cancelled.`;
        }
      } else {
        cancelText = `Hi ${currentUser.name}, you haven't placed any orders yet.`;
      }
    } else {
      cancelText = "To cancel your order, please log in first.";
    }
    await saveSupportRequest(currentUser, message, cancelText);
    return res.status(200).json({
      success: true,
      mode: 'smart-support',
      isFollowUp: true,
      response: cancelText,
      products: [],
    });
  }

  // 4. Order Tracking check
  if (cleanMsg.includes('track') || cleanMsg.includes('order') || cleanMsg.includes('where is') || cleanMsg.includes('status')) {
    let orderText = "To track your orders, please sign in and check the 'My Orders' tab on the navigation bar.";
    if (currentUser) {
      if (userOrders.length > 0) {
        const latest = userOrders[0];
        const dateStr = new Date(latest.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
        orderText = `Hi ${currentUser.name}! I found your latest order #${latest._id.toString().slice(-6).toUpperCase()} placed on ${dateStr}. Status: **${latest.status}** (Payment: ${latest.paymentStatus}).`;
      } else {
        orderText = `Hi ${currentUser.name}, you haven't placed any orders yet. Visit the Store to explore items!`;
      }
    }
    await saveSupportRequest(currentUser, message, orderText);
    return res.status(200).json({
      success: true,
      mode: 'smart-support',
      isFollowUp: true,
      response: orderText,
      products: [],
    });
  }

  // 5. Contact support check
  if (cleanMsg.includes('contact') || cleanMsg.includes('support') || cleanMsg.includes('help') || cleanMsg.includes('call') || cleanMsg.includes('phone') || cleanMsg.includes('number') || cleanMsg.includes('email')) {
    const contactText = "Our customer support team is available 24/7. You can email us at support@shopease.com or call us directly at +1-800-123-SHOP.";
    await saveSupportRequest(currentUser, message, contactText);
    return res.status(200).json({
      success: true,
      mode: 'smart-support',
      isFollowUp: true,
      response: contactText,
      products: [],
    });
  }

  // Keyword extraction supporting singular, plural, and multiple search phrases
  const searchTerms = [];
  if (cleanMsg.includes('shoe') || cleanMsg.includes('sneaker') || cleanMsg.includes('nike') || cleanMsg.includes('footwear')) {
    searchTerms.push('shoe', 'sneaker', 'nike');
  }
  if (cleanMsg.includes('t-shirt') || cleanMsg.includes('shirt') || cleanMsg.includes('cotton') || cleanMsg.includes('tee')) {
    searchTerms.push('t-shirt', 'shirt', 'cotton');
  }
  if (cleanMsg.includes('watch') || cleanMsg.includes('workout') || cleanMsg.includes('smartwatch')) {
    searchTerms.push('watch', 'workout');
  }
  if (cleanMsg.includes('headphone') || cleanMsg.includes('earphone') || cleanMsg.includes('audio') || cleanMsg.includes('sound')) {
    searchTerms.push('headphone', 'audio');
  }
  if (cleanMsg.includes('bag') || cleanMsg.includes('messenger') || cleanMsg.includes('backpack')) {
    searchTerms.push('bag', 'messenger', 'backpack');
  }
  if (cleanMsg.includes('basketball') || cleanMsg.includes('ball')) {
    searchTerms.push('basketball', 'ball');
  }
  if (cleanMsg.includes('sweatpants') || cleanMsg.includes('jogger') || cleanMsg.includes('pants')) {
    searchTerms.push('sweatpants', 'jogger', 'pants');
  }
  if (cleanMsg.includes('sunglasses') || cleanMsg.includes('glasses') || cleanMsg.includes('aviator')) {
    searchTerms.push('sunglasses', 'glasses', 'aviator');
  }
  if (cleanMsg.includes('keyboard') || cleanMsg.includes('key')) {
    searchTerms.push('keyboard', 'key');
  }
  if (cleanMsg.includes('camera') || cleanMsg.includes('action')) {
    searchTerms.push('camera', 'action');
  }
  if (cleanMsg.includes('power bank') || cleanMsg.includes('powerbank') || cleanMsg.includes('charger')) {
    searchTerms.push('power bank', 'powerbank', 'charger');
  }

  if (searchTerms.length > 0) {
    const regexPattern = searchTerms.join('|');
    query.$or = [
      { name: { $regex: regexPattern, $options: 'i' } },
      { description: { $regex: regexPattern, $options: 'i' } },
    ];
  }

  // Category extraction
  if (cleanMsg.includes('sports')) {
    query.category = 'Sports';
  } else if (cleanMsg.includes('casual')) {
    query.category = 'Casual';
  } else if (cleanMsg.includes('electronics')) {
    query.category = 'Electronics';
  } else if (cleanMsg.includes('accessory') || cleanMsg.includes('accessories')) {
    query.category = 'Accessories';
  } else if (cleanMsg.includes('footwear') || cleanMsg.includes('shoe') || cleanMsg.includes('sneaker')) {
    query.category = 'Footwear';
  }

  // Price extraction (e.g. under 5000 or under 4000)
  const priceMatch = cleanMsg.match(/(?:under|below|less than|₹|\b)\s*(\d+)/);
  if (priceMatch && priceMatch[1]) {
    const maxVal = Number(priceMatch[1]);
    if (maxVal > 0) {
      query.price = { $lte: maxVal };
    }
  }

  const matchingProducts = await Product.find(query).limit(10);

  let responseMessage = '';
  if (matchingProducts.length > 0) {
    responseMessage = `[Smart Search] I found ${matchingProducts.length} items in the database that match your request. Here are the recommendations:`;
  } else {
    responseMessage = `[Smart Search] I couldn't find any products matching your specific query. Try searching for categories like 'Sports', 'Casual', or 'Electronics'.`;
  }

  return res.status(200).json({
    success: true,
    mode: 'smart-search',
    isFollowUp: false,
    response: responseMessage,
    products: matchingProducts,
  });
};

// @desc    AI Product Description Generator
// @route   POST /api/ai/describe
// @access  Private/Admin
const generateDescription = async (req, res, next) => {
  try {
    const { name, features } = req.body;

    if (!name || !features) {
      return res.status(400).json({ success: false, message: 'Please provide product name and feature bullets' });
    }

    const featureStr = Array.isArray(features) ? features.join(', ') : String(features);

    // Fallback if no key is configured
    if (!genAI) {
      const fallbackDesc = `A premium quality ${name} featuring: ${featureStr}. Designed for durability and performance.`;
      return res.status(200).json({ success: true, description: fallbackDesc });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
Write a professional, attractive e-commerce product description for the following product:
Product Name: "${name}"
Product Features: "${featureStr}"

Rules:
1. Use ONLY the information provided in name and features. Do not infer, assume, or invent specifications, performance claims, certifications, warranties, materials, compatibility, discounts, or measurements.
2. Style it as a single cohesive marketing paragraph.
3. Be concise, professional and accurate.
`;

    const result = await model.generateContent(prompt);
    const descriptionText = result.response.text().trim();

    return res.status(200).json({
      success: true,
      description: descriptionText,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user's support requests
// @route   GET /api/ai/my-support-requests
// @access  Private
const getMySupportRequests = async (req, res, next) => {
  try {
    const SupportRequest = require('../models/SupportRequest');
    const requests = await SupportRequest.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: requests.length, requests });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecommendation,
  generateDescription,
  getMySupportRequests,
};
