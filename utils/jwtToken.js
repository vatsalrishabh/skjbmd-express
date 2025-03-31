const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

/**
 * @desc Generates a JWT token
 * @param {Object} payload - Data to include in the JWT
 * @param {Object} [options] - Additional JWT options (e.g., expiration, audience)
 * @returns {string} Signed JWT token
 */
const makeJwtToken = (payload, options = {}) => {
    if (!payload || typeof payload !== 'object') {
        throw new Error('Payload must be a valid object');
    }

    const defaultOptions = { expiresIn: '1h' }; // Default expiration time is 1 hour
    const tokenOptions = { ...defaultOptions, ...options };

    return jwt.sign(payload, SECRET_KEY, tokenOptions);
};

module.exports = {makeJwtToken};
