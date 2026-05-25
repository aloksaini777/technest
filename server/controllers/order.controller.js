const Order = require("../models/order.model");

// GET /api/orders — all orders for logged-in user
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json({ orders });
    } catch (err) {
        console.error("Orders error:", err);
        res.status(500).json({ error: "Could not fetch orders." });
    }
};

// GET /api/orders/:orderId — single order
const getOrder = async (req, res) => {
    try {
        const order = await Order.findOne({
            orderId: req.params.orderId,
            userId:  req.user._id,
        });
        if (!order) return res.status(404).json({ error: "Order not found." });
        res.json({ order });
    } catch (err) {
        console.error("Order error:", err);
        res.status(500).json({ error: "Could not fetch order." });
    }
};


const generateOrderId = () => Math.floor(100000 + Math.random() * 900000).toString();
const createUniqueOrderId = async () => {
    let orderId;
    let exists = true;
    while (exists) {
        orderId = generateOrderId();
        exists = await Order.exists({ orderId });
    }
    return orderId;
};

// POST /api/orders/seed — creates dummy orders for demo
const seedOrders = async (req, res) => {
    try {
        const userId = req.user._id;
        console.log('checking: ', createUniqueOrderId());

        const dummyOrders = [
            {
                orderId: await createUniqueOrderId(),
                userId,
                product: { name: "Apple iPhone 15", gadgetType: "smartphone", brand: "Apple", price: 79999 },
                status: "delivered",
                estimatedDelivery: new Date("2024-12-01"),
            },
            {
                orderId: await createUniqueOrderId(),
                userId,
                product: { name: "Sony WH-1000XM5", gadgetType: "headphones", brand: "Sony", price: 29999 },
                status: "out_for_delivery",
                estimatedDelivery: new Date(),
            },
            {
                orderId: await createUniqueOrderId(),
                userId,
                product: { name: "MacBook Pro M3", gadgetType: "laptop", brand: "Apple", price: 199999 },
                status: "processing",
                estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            },
            {
                orderId: await createUniqueOrderId(),
                userId,
                product: { name: "Samsung Galaxy S24", gadgetType: "smartphone", brand: "Samsung", price: 74999 },
                status: "shipped",
                estimatedDelivery: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
            },
            {
                orderId: await createUniqueOrderId(),
                userId,
                product: { name: "boAt Rockerz 550", gadgetType: "headphones", brand: "boAt", price: 2499 },
                status: "cancelled",
                refundStatus: "completed",
            },
        ];

        // insertMany with skipDuplicates so re-seeding doesn't throw
        await Order.insertMany(dummyOrders, { ordered: false }).catch(() => {});

        res.json({ message: "Dummy orders seeded successfully.", count: dummyOrders.length });
    } catch (err) {
        console.error("Seed error:", err);
        res.status(500).json({ error: "Seeding failed." });
    }
};

module.exports = { getMyOrders, getOrder, seedOrders };