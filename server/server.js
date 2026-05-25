require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

require("./config/db");

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:5174",
].filter(Boolean);

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.use("/api/auth",   require("./routes/auth.routes"));
app.use("/api/chat",   require("./routes/chat.routes"));
app.use("/api/orders", require("./routes/order.routes"));

app.get("/health", (_req, res) => res.json({ status: "TechNest server running" }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));