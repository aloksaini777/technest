const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

// Helper: sign a JWT for a user
const signToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });

// Helper: build clean response (no password)
const sendAuthResponse = (res, statusCode, user, token) => {
    res.status(statusCode).json({
        token,
        user: {
            id:    user._id,
            name:  user.name,
            email: user.email,
        },
    });
};

// ─────────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────────
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Basic validation
        if (!name || !email || !password) {
            return res.status(400).json({ error: "Name, email and password are required." });
        }
        if (password.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters." });
        }

        // Check if email already exists
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(409).json({ error: "An account with this email already exists." });
        }

        // Create user (password is hashed by the model pre-save hook)
        const user = await User.create({ name, email, password });
        const token = signToken(user._id);

        sendAuthResponse(res, 201, user, token);
    } catch (err) {
        console.error("Register error:", err);
        res.status(500).json({ error: "Registration failed. Please try again." });
    }
};

// ─────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required." });
        }

        // Explicitly select password (select: false on model)
        const user = await User.findOne({ email }).select("+password");
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: "Invalid email or password." });
        }

        const token = signToken(user._id);
        sendAuthResponse(res, 200, user, token);
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: "Login failed. Please try again." });
    }
};

// ─────────────────────────────────────────────
// GET /api/auth/me  (protected)
// Returns current logged-in user from token
// ─────────────────────────────────────────────
const getMe = async (req, res) => {
    res.json({
        user: {
            id:    req.user._id,
            name:  req.user.name,
            email: req.user.email,
        },
    });
};

module.exports = { register, login, getMe };