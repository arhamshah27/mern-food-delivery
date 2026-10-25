/**
 * 404 handler — catches any request that didn't match a defined route.
 */
const notFound = (req, res, _next) => {
    res.status(404).json({
        success: false,
        message: `Not Found — ${req.method} ${req.originalUrl}`,
    });
};

module.exports = notFound;
