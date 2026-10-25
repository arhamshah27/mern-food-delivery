const jwt = require("jsonwebtoken");

/**
 * Generate a JWT for the given user ID.
 * @param {string} userId – MongoDB _id of the user
 * @returns {string} signed JWT
 */
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });
};

module.exports = generateToken;
