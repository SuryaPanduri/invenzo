const crypto = require('crypto');
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { normalizeRole } = require('../middleware/validate');

function hashResetToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

exports.signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
      [name, email, hashedPassword, 'viewer']
    );

    res.status(201).json({ message: 'User created successfully.' });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Server error during signup.' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const normalizedRole = normalizeRole(user.role) || 'viewer';

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: normalizedRole },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: normalizedRole
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const userResult = await db.query('SELECT id FROM users WHERE email = $1', [email]);

    if (userResult.rows.length === 0) {
      return res.json({
        message: 'If that email exists, password reset instructions have been generated.'
      });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashResetToken(rawToken);

    await db.query(
      `UPDATE users
       SET reset_token_hash = $1,
           reset_token_expires_at = NOW() + INTERVAL '30 minutes'
       WHERE email = $2`,
      [tokenHash, email]
    );

    const payload = {
      message: 'If that email exists, password reset instructions have been generated.'
    };

    if (process.env.NODE_ENV !== 'production') {
      payload.resetToken = rawToken;
      payload.resetUrl = `/reset-password.html?token=${rawToken}`;
    }

    return res.json(payload);
  } catch (err) {
    console.error('Forgot password error:', err);
    return res.status(500).json({ message: 'Failed to process forgot password request.' });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;

  try {
    const tokenHash = hashResetToken(token);

    const userResult = await db.query(
      `SELECT id
       FROM users
       WHERE reset_token_hash = $1
         AND reset_token_expires_at IS NOT NULL
         AND reset_token_expires_at > NOW()
       LIMIT 1`,
      [tokenHash]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }

    const userId = userResult.rows[0].id;
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      `UPDATE users
       SET password = $1,
           reset_token_hash = NULL,
           reset_token_expires_at = NULL
       WHERE id = $2`,
      [hashedPassword, userId]
    );

    return res.json({ message: 'Password has been reset successfully.' });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ message: 'Failed to reset password.' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const result = await db.query('SELECT id, name, email, role FROM users ORDER BY id DESC');
    const users = result.rows.map((user) => ({
      ...user,
      role: normalizeRole(user.role) || 'viewer'
    }));
    res.json(users);
  } catch (err) {
    console.error('Fetch users error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);

    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
      [name, email, hashedPassword, role]
    );

    res.status(201).json({ message: 'User added successfully' });
  } catch (err) {
    console.error('Add user error:', err);
    res.status(500).json({ message: 'Server error while adding user' });
  }
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, role } = req.body;

  try {
    const result = await db.query('UPDATE users SET name=$1, email=$2, role=$3 WHERE id=$4', [
      name,
      email,
      role,
      id
    ]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User updated successfully' });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ message: 'Server error while updating user' });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query('DELETE FROM users WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ message: 'Server error while deleting user' });
  }
};
