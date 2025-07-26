const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// Route: POST /api/users/signup
router.post('/signup', userController.signup);

// Route: POST /api/users/login
router.post('/login', userController.login);

// Route: GET /api/users/admin-data (Protected route for admin only)
router.get('/admin-data', auth, authorize('admin'), (req, res) => {
  res.send('Only admins can see this');
});

router.get('/manager-area', auth, authorize('admin', 'manager'), (req, res) => {
    res.send('Admins and Managers can access this');
  });

router.post('/', auth, authorize('admin'), userController.addUser); // POST /api/users

router.put('/:id', auth, authorize('admin','manager'), userController.updateUser);

router.get('/', auth, authorize('admin', 'manager', 'viewer'), userController.getAllUsers);

router.delete('/:id', auth, authorize('admin'), userController.deleteUser);

module.exports = router;