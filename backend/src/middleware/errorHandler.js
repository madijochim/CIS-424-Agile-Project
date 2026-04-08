// Global error handler: consistent JSON; no stack traces in production (US-033)
function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const status = err.statusCode || err.status || 500;
  const body = {
    error:
      status === 500 && process.env.NODE_ENV === "production"
        ? "Internal server error."
        : err.message || "Internal server error.",
  };

  if (process.env.NODE_ENV !== "production" && err.stack) {
    body.stack = err.stack;
  }

  return res.status(status).json(body);
}

module.exports = { errorHandler };
