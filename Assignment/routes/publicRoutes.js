const express = require("express");

const router = express.Router();

/**
 * @swagger
 * /public/info:
 *   get:
 *     summary: Returns public information
 *     description: This endpoint is publicly accessible and does not require authentication.
 *     responses:
 *       200:
 *         description: Public information returned successfully
 */
router.get("/info", (req, res) => {
    return res.status(200).json({
        message: "Welcome stranger! This info is public."
    });
});

module.exports = router;