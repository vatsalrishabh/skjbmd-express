/**
 * @desc    Universal error handler wrapper for controllers
 * @param   {Function} fn - Controller function to wrap
 * @returns {Function} Express middleware
 */
const handleErrorWrapper = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

module.exports = { handleErrorWrapper };
