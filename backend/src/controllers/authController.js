const bcrypt = require('bcrypt');
const { pool } = require('../config/db');

const safeUserFields = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
});

const login = async (req, res, next) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) {
    return res.status(400).json({
      success: false,
      message: 'Email, password, and role are required',
    });
  }

  try {
    const result = await pool.query(
      'SELECT id, name, email, password, role FROM users WHERE email = $1',
      [email]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const user = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (role !== user.role) {
      return res.status(403).json({
        success: false,
        message: 'Selected role does not match this account.',
      });
    }

    req.session.user = safeUserFields(user);

    return res.json({
      success: true,
      message: 'Login successful',
      user: req.session.user,
    });
  } catch (error) {
    next(error);
  }
};

const me = (req, res) => {
  return res.json({
    success: true,
    user: req.session.user,
  });
};

const logout = (req, res, next) => {
  req.session.destroy((error) => {
    if (error) {
      return next(error);
    }

    res.clearCookie('sid', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return res.json({
      success: true,
      message: 'Logout successful',
    });
  });
};

module.exports = {
  login,
  me,
  logout,
};
