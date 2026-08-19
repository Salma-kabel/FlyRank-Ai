const supabase = require("../db/supabase");
const { ValidationError, UnauthorizedError } = require("../errors");

async function signup(data) {
    if (!data) {
        throw new ValidationError("Body is missing");
    }
    
    const { email, password } = data;
    if (!email || !password) {
        throw new ValidationError("Email and password are required");
    }

    const { data: result, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) {
        throw new ValidationError(error.message);
    }

    return result.user;
}

async function login(data) {
    if (!data) {
        throw new ValidationError("Body is missing");
    }

    const { email, password } = data;
    if (!email || !password) {
        throw new ValidationError("Email and password are required");
    }

    const { data: result, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        throw new UnauthorizedError("Invalid login credentials");
    }

    return {
        access_token: result.session.access_token,
        refresh_token: result.session.refresh_token
    };
}

module.exports = {
    signup,
    login
};