const { v4: uuidv4 } = require("uuid");
const { detectIntent } = require("../dialogflow");
const Conversation = require("../models/conversation.model");
const Order = require("../models/order.model");

// ─────────────────────────────────────────────
// POST /api/chat
// ─────────────────────────────────────────────
const sendMessage = async (req, res) => {
    try {
        const { message, sessionId } = req.body;
        const userId = req.user._id;

        if (!message?.trim()) {
            return res.status(400).json({ error: "Message is required." });
        }

        const activeSessionId = sessionId || uuidv4();

        const { intentName, parameters, fulfillmentText, confidence } =
            await detectIntent(message, activeSessionId);

        const botReply = await handleIntent(
            intentName,
            parameters,
            fulfillmentText,
            userId
        );

        const escalate =
            intentName === "escalate_to_agent" ||
            intentName === "Default Fallback Intent";

        await Conversation.findOneAndUpdate(
            { sessionId: activeSessionId },
            {
                $set: { userId },
                $push: {
                    messages: {
                        userMessage: message,
                        botReply: typeof botReply === "string" ? botReply : botReply.text,
                        intentName,
                        parameters,
                        confidence,
                        escalated: escalate,
                    },
                },
            },
            { upsert: true, new: true }
        );

        res.json({
            reply: botReply,       // can be string OR { type, text, order } for frontend card
            sessionId: activeSessionId,
            intent: intentName,
            escalate,
        });
    } catch (err) {
        console.error("Chat error:", err);
        res.status(500).json({ error: "Something went wrong. Please try again." });
    }
};

// ─────────────────────────────────────────────
// GET /api/chat/history
// ─────────────────────────────────────────────
const getHistory = async (req, res) => {
    try {
        const conversations = await Conversation.find({ userId: req.user._id })
            .sort({ updatedAt: -1 })
            .limit(10);
        res.json({ conversations });
    } catch (err) {
        console.error("History error:", err);
        res.status(500).json({ error: "Could not fetch history." });
    }
};

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

// Returns a structured response the frontend renders as an order card
const orderCard = (type, text, order) => ({
    type,   // "track" | "cancel_confirm" | "cancel_deny" | "return_confirm"
    text,   // fallback plain text (also saved to DB)
    order: {
        orderId:     order.orderId,
        productName: order.product.name,
        gadgetType:  order.product.gadgetType,
        brand:       order.product.brand,
        price:       order.product.price,
        status:      order.status,
    },
});

const STATUS_LABELS = {
    placed:           { label: "Order Placed",        emoji: "✅" },
    processing:       { label: "Processing",           emoji: "📦" },
    shipped:          { label: "Shipped",              emoji: "🚛" },
    out_for_delivery: { label: "Out for Delivery",     emoji: "🚚" },
    delivered:        { label: "Delivered",            emoji: "✅" },
    cancelled:        { label: "Cancelled",            emoji: "❌" },
    returned:         { label: "Returned",             emoji: "↩️" },
};

const statusLine = (order) => {
    const s = STATUS_LABELS[order.status] || { label: order.status, emoji: "📋" };
    return `${s.emoji} ${s.label}`;
};

// ─────────────────────────────────────────────
// INTENT ROUTER
// ─────────────────────────────────────────────
async function handleIntent(intentName, parameters, defaultResponse, userId) {
    console.log("intentName: ", intentName);
    console.log("parameters: ", parameters);

    switch (intentName) {

        // ── TRACK ORDER ────────────────────────────────────────────
        case "track_order": {
            const orderId = parameters?.["order-id"];

            // No order-id yet — Dialogflow will prompt for it
            if (!orderId) return defaultResponse;

            const order = await Order.findOne({ orderId: String(orderId), userId });

            if (!order) {
                return `I couldn't find any order with ID #${orderId} on your account. Please double-check the order ID.`;
            }

            return orderCard(
                "track",
                `Your order #${orderId} (${order.product.name}) — ${statusLine(order)}`,
                order
            );
        }

        // ── CANCEL ORDER ───────────────────────────────────────────
        case "cancel_order": {
            const orderId = parameters?.["order-id"];

            // No order-id yet — Dialogflow will prompt for it
            if (!orderId) return defaultResponse;

            const order = await Order.findOne({ orderId: String(orderId), userId });

            if (!order) {
                return `I couldn't find any order with ID #${orderId} on your account. Please double-check the order ID.`;
            }

            // Already in a terminal state — can't cancel
            if (order.status === "delivered") {
                return orderCard(
                "cancel_deny",
                `Order #${orderId} (${order.product.name}) has already been delivered and cannot be cancelled.`,
                order
                );
            }

            if (order.status === "cancelled") {
                return orderCard(
                "cancel_deny",
                `Order #${orderId} (${order.product.name}) is already cancelled.`,
                order
                );
            }

            if (order.status === "returned") {
                return orderCard(
                "cancel_deny",
                `Order #${orderId} (${order.product.name}) has already been returned.`,
                order
                );
            }

            // Order is cancellable — let Dialogflow ask for confirmation
            // (awaiting-cancel-confirmation context is set by Dialogflow)
            return defaultResponse;
        }

        // ── CONFIRM CANCEL ─────────────────────────────────────────
        case "confirm_cancel_order": {
            const orderId = parameters?.["order-id"];

            // No order-id from context — let Dialogflow handle
            if (!orderId) return defaultResponse;

            const order = await Order.findOne({ orderId: String(orderId), userId });

            if (!order) {
                return `I couldn't locate order #${orderId} to cancel. Please contact support.`;
            }

            // Update DB
            await Order.findOneAndUpdate(
                { orderId: String(orderId), userId },
                { $set: { status: "cancelled" } }
            );

            order.status = "cancelled"; // reflect in card

            return orderCard(
                "cancel_confirm",
                `Order #${orderId} (${order.product.name}) has been cancelled. Your refund will be processed in 3–5 business days. 💸`,
                order
            );
        }

        // ── DENY CANCEL ────────────────────────────────────────────
        case "deny_cancel_order": {
            const orderId = parameters?.["order-id"];

            if (!orderId) return defaultResponse;

            const order = await Order.findOne({ orderId: String(orderId), userId });

            if (!order) return defaultResponse;

            return orderCard(
                "cancel_deny",
                `No problem! Your order #${orderId} (${order.product.name}) is safe and on its way. 😊`,
                order
            );
        }

        // ── RETURN ITEM ────────────────────────────────────────────
        case "return_item": {
            const orderId    = parameters?.["order-id"];
            const gadgetType = parameters?.["gadget-type"];

            // Missing either slot — Dialogflow is still slot-filling
            if (!orderId || !gadgetType?.length) return defaultResponse;

            const order = await Order.findOne({ orderId: String(orderId), userId });

            if (!order) {
                return `I couldn't find any order with ID #${orderId} on your account. Please double-check the order ID.`;
            }

            if (order.status === "returned") {
                return orderCard(
                "cancel_deny",
                `Order #${orderId} (${order.product.name}) has already been returned.`,
                order
                );
            }

            if (order.status === "cancelled") {
                return orderCard(
                "cancel_deny",
                `Order #${orderId} (${order.product.name}) was cancelled — no return needed.`,
                order
                );
            }

            // Order valid — let Dialogflow ask for return reason
            // (awaiting_return_reason context carries order-id + gadget-type forward)
            return defaultResponse;
        }

        // ── RETURN ITEM REASON ─────────────────────────────────────
        case "return_item_reason": {
            const reason     = parameters?.["return-reason"];
            const orderId    = parameters?.["order-id"];    // from awaiting_return_reason context (Option 3)
            const gadgetType = parameters?.["gadget-type"]; // from awaiting_return_reason context

            // No reason yet — Dialogflow will prompt for it
            if (!reason) return defaultResponse;

            if (!orderId) {
                // Rare edge case — context didn't carry forward
                return `Thank you! Return reason "${reason}" noted. Our team will reach out within 24 hours to arrange the return. 📦`;
            }

            const order = await Order.findOne({ orderId: String(orderId), userId });

            if (!order) {
                return `Thank you for the reason. However, I couldn't locate order #${orderId}. Please contact support for assistance.`;
            }

            // Update DB — mark as returned
            await Order.findOneAndUpdate(
                { orderId: String(orderId), userId },
                { $set: { status: "returned" } }
            );

            order.status = "returned"; // reflect in card

            return orderCard(
                "return_confirm",
                `Return initiated for your ${order.product.name} (Order #${orderId}). Reason: "${reason}". A return shipping label will be emailed within 24 hours. ↩️`,
                order
            );
        }

        // ── GREETING ───────────────────────────────────────────────
        case "Default Welcome Intent":
        case "greeting": {
            return defaultResponse;
        }

        // ── GOODBYE ────────────────────────────────────────────────
        case "goodbye": {
            return defaultResponse;
        }

        // ── ESCALATE / FALLBACK ────────────────────────────────────
        case "escalate_to_agent":
        case "Default Fallback Intent": {
            return "I'm connecting you to a live support agent. Please hold on — someone will be with you shortly. 👨‍💻";
        }

        // ── ANYTHING ELSE ──────────────────────────────────────────
        default: {
            return defaultResponse || "I'm not sure how to help with that. Would you like me to connect you to a live agent?";
        }
    }
}

module.exports = { sendMessage, getHistory };