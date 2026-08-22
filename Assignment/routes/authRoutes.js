const express = require("express");
const authService = require("../services/authService");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Creates a new user account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *     responses:
 *       201:
 *         description: User account created successfully
 *       400:
 *         description: Invalid signup data
 */
router.post("/signup", async(req, res, next) => {
    try {
        const user = await authService.signup(req.body);
        res.status(201).json(user);
    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Logs in a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 access_token:
 *                   type: string
 *                 refresh_token:
 *                   type: string
 *       401:
 *         description: Invalid login credentials
 */
router.post("/login", async(req, res, next) => {
    try {
        const tokens = await authService.login(req.body);
        res.status(200).json(tokens);
    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logs out the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Logout successful
 *       401:
 *         description: Missing, invalid, or expired access token
 */
router.post("/logout", authMiddleware, async (req, res, next) => {
    try {
        await authService.logout(req.token);

        return res.status(204).send();
    } catch (err) {
        next(err);
    }
});

module.exports = router;