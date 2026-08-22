const express = require("express");
const authService = require("../services/authService");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

/**
 * @swagger
 * /protected/profile:
 *  get:
 *     summary: Returns the authenticated user's profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *       401:
 *         description: Missing, invalid, or expired access token
 */
router.get("/profile", authMiddleware, async (req, res, next) => {
    try {
        const user = await authService.getProfile(req.user);

        return res.status(200).json(user);
    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /protected/dashboard:
 *   get:
 *     summary: Returns the authenticated user's dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data
 *       401:
 *         description: Missing, invalid, or expired access token
 */
router.get("/dashboard", authMiddleware, async (req, res, next) => {
    try {
        const dashboard = await authService.getDashboard(req.user);

        return res.status(200).json(dashboard);
    } catch (err) {
        next(err);
    }
});

module.exports = router;