const express = require("express");
const authService = require("../services/authService");

const router = express.Router();

router.get("/profile", async (req, res, next) => {
    try {
        const user = await authService.getProfile(req.headers.authorization);

        return res.status(200).json(user);
    } catch (err) {
        next(err);
    }
});

module.exports = router;