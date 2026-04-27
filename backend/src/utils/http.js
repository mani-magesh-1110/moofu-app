class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

function successResponse(res, data, status = 200) {
  return res.status(status).json({
    success: true,
    data,
  });
}

module.exports = {
  HttpError,
  successResponse,
};
