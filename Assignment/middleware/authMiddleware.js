const supabase = require("../db/supabase");
const { UnauthorizedError } = require("../errors");

async function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedError("Access token required");
        }

        const token = authHeader.substring(7);

        if (!token) {
            throw new UnauthorizedError("Access token required");
        }

        const { data, error } = await supabase.auth.getUser(token);

        if (error || !data.user) {
            throw new UnauthorizedError("Invalid or expired token");
        }
        req.token = token;
        req.user = data.user;
        return next();
    } catch (err) {
        next(err);
    }
}

module.exports = authMiddleware;