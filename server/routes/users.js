const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { loginRateLimit } = require('../middleware/rateLimit');
const {
  validateSignup,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateUserCreate,
  validateUserUpdate
} = require('../middleware/validate');

router.post('/signup', validateSignup, userController.signup);
router.post('/login', loginRateLimit, validateLogin, userController.login);
router.post('/forgot-password', validateForgotPassword, userController.forgotPassword);
router.post('/reset-password', validateResetPassword, userController.resetPassword);

router.get('/admin-data', auth, authorize('admin'), (req, res) => {
  res.send('Only admins can see this');
});

router.get('/manager-area', auth, authorize('admin', 'manager'), (req, res) => {
  res.send('Admins and Managers can access this');
});

router.post('/', auth, authorize('admin'), validateUserCreate, userController.addUser);
router.put('/:id', auth, authorize('admin', 'manager'), validateUserUpdate, userController.updateUser);
router.get('/', auth, authorize('admin', 'manager', 'viewer'), userController.getAllUsers);
router.delete('/:id', auth, authorize('admin'), userController.deleteUser);

module.exports = router;
