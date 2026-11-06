export function errorMiddleware(error, req, res, next) {
  const status = error.status || error.statusCode || 500;

  res.status(status).json({
    success: false,
    error: error.payload || {
      message: status === 500
        ? "Internal server error"
        : error.message
    }
  });
}
