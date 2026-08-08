const express = require('express');
const { authenticateUser } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const {
  getChallans,
  createChallan,
  getChallanById,
  confirmChallan,
  cancelChallan,
} = require('../controllers/challanController');

const router = express.Router();

router.get('/', authenticateUser, getChallans);
router.post('/', authenticateUser, authorizeRoles('Admin', 'Sales'), createChallan);
router.get('/:id', authenticateUser, getChallanById);
router.post('/:id/confirm', authenticateUser, authorizeRoles('Admin', 'Sales'), confirmChallan);
router.post('/:id/cancel', authenticateUser, authorizeRoles('Admin', 'Sales'), cancelChallan);

module.exports = router;
