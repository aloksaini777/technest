const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        userMessage: { type: String, required: true },
        botReply:    { type: String, required: true },
        intentName:  { type: String, default: "unknown" },
        parameters:  { type: mongoose.Schema.Types.Mixed, default: {} },
        confidence:  { type: Number, default: 0 },
        escalated:   { type: Boolean, default: false },
    },
    { timestamps: true }
);

const conversationSchema = new mongoose.Schema(
    {
        sessionId: { type: String, required: true, unique: true },
        userId:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        messages:  [messageSchema],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Conversation", conversationSchema);