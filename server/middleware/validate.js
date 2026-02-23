function makeError(message, code, status = 400, details) {
  const err = new Error(message);
  err.code = code;
  err.status = status;
  if (details) {
    err.details = details;
  }
  return err;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isStrongPassword(password) {
  return typeof password === 'string' && password.length >= 8;
}

function normalizeRole(role) {
  if (typeof role !== 'string') {
    return null;
  }
  return role.toLowerCase();
}

function validateSignup(req, res, next) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return next(makeError('Name, email, and password are required.', 'VALIDATION_ERROR'));
  }

  if (!isValidEmail(email)) {
    return next(makeError('Invalid email format.', 'VALIDATION_ERROR'));
  }

  if (!isStrongPassword(password)) {
    return next(makeError('Password must be at least 8 characters.', 'WEAK_PASSWORD'));
  }

  req.body.name = String(name).trim();
  req.body.email = String(email).trim().toLowerCase();

  next();
}

function validateLogin(req, res, next) {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(makeError('Email and password are required.', 'VALIDATION_ERROR'));
  }

  if (!isValidEmail(email)) {
    return next(makeError('Invalid email format.', 'VALIDATION_ERROR'));
  }

  req.body.email = String(email).trim().toLowerCase();
  next();
}

function validateUserCreate(req, res, next) {
  const { name, email, password, role } = req.body;
  const normalizedRole = normalizeRole(role);

  if (!name || !email || !password || !normalizedRole) {
    return next(makeError('All fields are required.', 'VALIDATION_ERROR'));
  }

  if (!['admin', 'manager', 'viewer'].includes(normalizedRole)) {
    return next(makeError('Role must be admin, manager, or viewer.', 'VALIDATION_ERROR'));
  }

  if (!isValidEmail(email)) {
    return next(makeError('Invalid email format.', 'VALIDATION_ERROR'));
  }

  if (!isStrongPassword(password)) {
    return next(makeError('Password must be at least 8 characters.', 'WEAK_PASSWORD'));
  }

  req.body.name = String(name).trim();
  req.body.email = String(email).trim().toLowerCase();
  req.body.role = normalizedRole;

  next();
}

function validateUserUpdate(req, res, next) {
  const { name, email, role } = req.body;
  const normalizedRole = normalizeRole(role);

  if (!name || !email || !normalizedRole) {
    return next(makeError('Name, email and role are required.', 'VALIDATION_ERROR'));
  }

  if (!['admin', 'manager', 'viewer'].includes(normalizedRole)) {
    return next(makeError('Role must be admin, manager, or viewer.', 'VALIDATION_ERROR'));
  }

  if (!isValidEmail(email)) {
    return next(makeError('Invalid email format.', 'VALIDATION_ERROR'));
  }

  req.body.name = String(name).trim();
  req.body.email = String(email).trim().toLowerCase();
  req.body.role = normalizedRole;

  next();
}

function validateAssetCreate(req, res, next) {
  const { name, type, purchase_date, status, serial_number } = req.body;

  if (!name || !type || !purchase_date || !status || !serial_number) {
    return next(
      makeError(
        'name, type, purchase_date, status, and serial_number are required.',
        'VALIDATION_ERROR'
      )
    );
  }

  req.body.name = String(name).trim();
  req.body.type = String(type).trim();
  req.body.status = String(status).trim();
  req.body.serial_number = String(serial_number).trim();

  next();
}

function validateAssetUpdate(req, res, next) {
  return validateAssetCreate(req, res, next);
}

function validateAssetCheckout(req, res, next) {
  const checkedOutToUserId = Number(req.body.checkedOutToUserId);
  const dueDate = req.body.dueDate;

  if (!Number.isInteger(checkedOutToUserId) || checkedOutToUserId <= 0) {
    return next(makeError('checkedOutToUserId must be a valid positive integer.', 'VALIDATION_ERROR'));
  }

  if (dueDate) {
    const parsedDueDate = new Date(dueDate);
    if (Number.isNaN(parsedDueDate.getTime())) {
      return next(makeError('dueDate must be a valid date.', 'VALIDATION_ERROR'));
    }
  }

  next();
}

function validateAssetReturn(req, res, next) {
  if (req.body.notes && typeof req.body.notes !== 'string') {
    return next(makeError('notes must be a string.', 'VALIDATION_ERROR'));
  }

  next();
}

function validateForgotPassword(req, res, next) {
  const { email } = req.body;

  if (!email) {
    return next(makeError('Email is required.', 'VALIDATION_ERROR'));
  }

  if (!isValidEmail(email)) {
    return next(makeError('Invalid email format.', 'VALIDATION_ERROR'));
  }

  req.body.email = String(email).trim().toLowerCase();
  next();
}

function validateResetPassword(req, res, next) {
  const { token, password } = req.body;

  if (!token || typeof token !== 'string') {
    return next(makeError('Reset token is required.', 'VALIDATION_ERROR'));
  }

  if (!isStrongPassword(password)) {
    return next(makeError('Password must be at least 8 characters.', 'WEAK_PASSWORD'));
  }

  next();
}

module.exports = {
  validateSignup,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateUserCreate,
  validateUserUpdate,
  validateAssetCreate,
  validateAssetUpdate,
  validateAssetCheckout,
  validateAssetReturn,
  normalizeRole,
  makeError
};
