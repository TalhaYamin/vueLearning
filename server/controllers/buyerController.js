const buyerService = require('../services/buyerService');
const AppError = require('../utils/errorHandler');

exports.createBuyer = async (req, res) => {
    try {
        const newBuyer = await buyerService.createBuyer(req.body);
        res.status(201).json(newBuyer);
    } catch (error) {
        next(new AppError('Failed to create buyer: ' + error.message, 400));
    }
};

exports.getBuyers = async (req, res) => {
    try {
        const buyers = await buyerService.getBuyers(req.query);
        res.status(200).json(buyers);
    } catch (error) {
        next(new AppError('Failed to get buyer: ' + error.message, 400));
    }
};

exports.updateBuyer = async (req, res) => {
    try {
        const updatedBuyer = await buyerService.updateBuyer(req.params.id, req.body);
        res.status(200).json(updatedBuyer);
    } catch (error) {
         next(new AppError('Failed to update buyer: ' + error.message, 400));
    }
};

exports.deleteBuyer = async (req, res) => {
    try {
        const result = await buyerService.deleteBuyer(req.params.id);
        res.status(200).json(result);
    } catch (error) {
        next(new AppError('Failed to delete buyer: ' + error.message, 400));
    }
};

exports.exampleRoute = async (req, res, next) => {
    try {
        // Simulate an operational error for testing
        throw new AppError('This is an example error', 400);
    } catch (err) {
        next(err); // Pass the error to the global error handler
    }
};
