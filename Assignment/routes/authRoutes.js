const express = require("express");
const authService = require("../services/authService");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/signup", async(req, res, next) => {
    try {
        const user = await authService.signup(req.body);
        res.status(201).json(user);
    } catch (err) {
        next(err);
    }
});
router.post("/login", async(req, res, next) => {
    try {
        const tokens = await authService.login(req.body);
        res.status(200).json(tokens);
    } catch (err) {
        next(err);
    }
});

router.post("/logout", authMiddleware, async (req, res, next) => {
    try {
        await authService.logout(req.token);

        return res.status(204).send();
    } catch (err) {
        next(err);
    }
});

module.exports = router;