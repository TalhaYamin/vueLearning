// routes/buyerRoutes.js
const express = require('express');
const { getBuyers, createBuyer, updateBuyer, deleteBuyer, exampleRoute } = require('../controllers/buyerController');
const { validateRequest } = require('../middlewares/validationMiddleware'); // Corrected import path
const { authenticate, authorize } = require('../middlewares/authMiddleware'); // Corrected import path
const { createBuyerSchema, updateBuyerSchema } = require('../validation/buyerValidation'); // Corrected import path

const router = express.Router();

// Protect routes with the authentication middleware
router.get('/', authenticate, getBuyers);
router.post('/', authenticate, authorize(['admin','member']), validateRequest(createBuyerSchema), createBuyer);
router.put('/:id', authenticate, authorize(['admin']), validateRequest(updateBuyerSchema), updateBuyer);
router.delete('/:id', authenticate, authorize(['admin']), deleteBuyer);

router.get('/error', exampleRoute);

module.exports = router;
