// buyerRoutes.js
const express = require('express');
const { getBuyers, createBuyer, updateBuyer, deleteBuyer, exampleRoute } = require('../controllers/buyerController');
const authenticateJWT = require('../middlewares/authMiddleware'); 

const router = express.Router();

// Protect routes with the authentication middleware
router.get('/', authenticateJWT, getBuyers);
router.post('/', authenticateJWT, createBuyer);
router.put('/:id', authenticateJWT, updateBuyer);
router.delete('/:id', authenticateJWT, deleteBuyer);

router.get('/error', exampleRoute);

module.exports = router;
