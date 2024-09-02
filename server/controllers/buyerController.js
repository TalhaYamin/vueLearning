const Buyer = require('../models/Buyer');

exports.createBuyer = async (req, res) => {
    const { name, email, phone, company } = req.body;
    try {
        const newBuyer = new Buyer({ name, email, phone, company });
        await newBuyer.save();
        res.status(201).json(newBuyer);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getBuyers = async (req, res) => {
    const { name, company } = req.query;
    try {
        const filter = {};
        if (name) filter.name = { $regex: name, $options: 'i' };
        if (company) filter.company = { $regex: company, $options: 'i' };
        
        const buyers = await Buyer.find(filter);
        res.status(200).json(buyers);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.updateBuyer = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    try {
        const buyer = await Buyer.findByIdAndUpdate(id, updates, { new: true });
        res.status(200).json(buyer);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.deleteBuyer = async (req, res) => {
    const { id } = req.params;
    try {
        await Buyer.findByIdAndDelete(id);
        res.status(200).json({ message: 'Buyer deleted' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
