const express = require("express");
const router = express.Router();
const { getMyOrders, getOrder, seedOrders } = require("../controllers/order.controller");
const { protect } = require("../middleware/auth.middleware");

// All order routes are protected
router.get("/",             protect, getMyOrders);
router.get("/:orderId",     protect, getOrder);
router.post("/seed",        protect, seedOrders);  // call once after register to populate dummy data

module.exports = router;