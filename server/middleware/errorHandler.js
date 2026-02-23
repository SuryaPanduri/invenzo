module.exports = (err, req, res, next) => {
  void next;

  const status = err.status || 500;
  const payload = {
    message: err.message || 'Internal server error',
    code: err.code || 'INTERNAL_ERROR'
  };

  if (err.details) {
    payload.details = err.details;
  }

  if (status >= 500) {
    console.error('Unhandled error:', err);
  }

  res.status(status).json(payload);
};
