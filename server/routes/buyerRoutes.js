const express = require('express');
const { createBuyer, getBuyers, updateBuyer, deleteBuyer } = require('../controllers/buyerController');
const { requireAuth } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', requireAuth, createBuyer);
router.get('/', requireAuth, getBuyers);
router.put('/:id', requireAuth, updateBuyer);
router.delete('/:id', requireAuth, deleteBuyer);

module.exports = router;
