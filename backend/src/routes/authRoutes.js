const express = require('express');
const { login, me, logout } = require('../controllers/authController');
const { authenticateUser } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/login', login);
router.get('/me', authenticateUser, me);
router.post('/logout', authenticateUser, logout);

module.exports = router;
