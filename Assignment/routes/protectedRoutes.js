const express = require("express");
const authService = require("../services/authService");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/profile", authMiddleware, async (req, res, next) => {
    try {
        const user = await authService.getProfile(req.user);

        return res.status(200).json(user);
    } catch (err) {
        next(err);
    }
});

router.get("/dashboard", authMiddleware, async (req, res, next) => {
    try {
        const dashboard = await authService.getDashboard(req.user);

        return res.status(200).json(dashboard);
    } catch (err) {
        next(err);
    }
});

module.exports = router;