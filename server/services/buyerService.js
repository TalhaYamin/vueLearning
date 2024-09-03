// services/buyerService.js
const Buyer = require('../models/Buyer');

// Create a new buyer
const createBuyer = async (buyerData) => {
    const { name, email, phone, company } = buyerData;
    const newBuyer = new Buyer({ name, email, phone, company });
    await newBuyer.save();
    return newBuyer;
};

// Get buyers with optional filters
const getBuyers = async (filters) => {
    const { name, company } = filters;
    const filter = {};
    if (name) filter.name = { $regex: name, $options: 'i' };
    if (company) filter.company = { $regex: company, $options: 'i' };
    const buyers = await Buyer.find(filter);
    return buyers;
};

// Update a buyer by ID
const updateBuyer = async (id, updates) => {
    const buyer = await Buyer.findByIdAndUpdate(id, updates, { new: true });
    return buyer;
};

// Delete a buyer by ID
const deleteBuyer = async (id) => {
    await Buyer.findByIdAndDelete(id);
    return { message: 'Buyer deleted' };
};

module.exports = {
    createBuyer,
    getBuyers,
    updateBuyer,
    deleteBuyer,
};
