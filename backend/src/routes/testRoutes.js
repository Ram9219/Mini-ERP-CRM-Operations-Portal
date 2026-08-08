const express = require('express');
const { authenticateUser } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/authenticated', authenticateUser, (req, res) => {
  res.json({
    success: true,
    message: 'Authenticated route working',
    user: req.session.user,
  });
});

router.get('/admin', authenticateUser, authorizeRoles('Admin'), (req, res) => {
  res.json({
    success: true,
    message: 'Admin route working',
    user: req.session.user,
  });
});

router.get('/sales', authenticateUser, authorizeRoles('Sales'), (req, res) => {
  res.json({
    success: true,
    message: 'Sales route working',
    user: req.session.user,
  });
});

router.get('/warehouse', authenticateUser, authorizeRoles('Warehouse'), (req, res) => {
  res.json({
    success: true,
    message: 'Warehouse route working',
    user: req.session.user,
  });
});

router.get('/accounts', authenticateUser, authorizeRoles('Accounts'), (req, res) => {
  res.json({
    success: true,
    message: 'Accounts route working',
    user: req.session.user,
  });
});

module.exports = router;
