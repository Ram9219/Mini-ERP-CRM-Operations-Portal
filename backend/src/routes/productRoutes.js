const express = require('express');
const { authenticateUser } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const {
  getProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  addStock,
  getStockMovements,
} = require('../controllers/productController');

const router = express.Router();

router.get('/', authenticateUser, getProducts);
router.post('/', authenticateUser, authorizeRoles('Admin', 'Warehouse'), createProduct);
router.get('/:id', authenticateUser, getProductById);
router.put('/:id', authenticateUser, authorizeRoles('Admin', 'Warehouse'), updateProduct);
router.delete('/:id', authenticateUser, authorizeRoles('Admin'), deleteProduct);

router.post('/:id/stock', authenticateUser, authorizeRoles('Admin', 'Warehouse'), addStock);
router.get('/:id/stock-movements', authenticateUser, authorizeRoles('Admin', 'Warehouse', 'Sales', 'Accounts'), getStockMovements);

module.exports = router;
