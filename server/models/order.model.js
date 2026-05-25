const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        orderId: {
            type: String,
            required: true,
            unique: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
            product: {
            name: String,
            gadgetType: String, // matches your @gadget-type Dialogflow entity
            brand: String,
            price: Number,
        },
        status: {
            type: String,
            enum: ["placed", "processing", "shipped", "out_for_delivery", "delivered", "cancelled", "returned"],
            default: "placed",
        },
        estimatedDelivery: Date,
        refundStatus: {
            type: String,
            enum: ["not_applicable", "initiated", "processing", "completed"],
            default: "not_applicable",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);