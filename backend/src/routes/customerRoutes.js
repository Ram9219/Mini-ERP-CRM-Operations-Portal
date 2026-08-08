const express = require('express');
const { authenticateUser } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const {
  getCustomers,
  createCustomer,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  createFollowup,
  getFollowups,
} = require('../controllers/customerController');

const router = express.Router();

router.get('/', authenticateUser, getCustomers);
router.post('/', authenticateUser, authorizeRoles('Admin', 'Sales'), createCustomer);
router.get('/:id', authenticateUser, getCustomerById);
router.put('/:id', authenticateUser, authorizeRoles('Admin', 'Sales'), updateCustomer);
router.delete('/:id', authenticateUser, authorizeRoles('Admin'), deleteCustomer);

router.post('/:id/followups', authenticateUser, authorizeRoles('Admin', 'Sales', 'Accounts'), createFollowup);
router.get('/:id/followups', authenticateUser, getFollowups);

module.exports = router;
