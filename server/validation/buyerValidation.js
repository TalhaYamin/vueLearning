// validation/buyerValidation.js
const Joi = require('joi');

exports.createBuyerSchema = Joi.object({
  name: Joi.string().min(3).required().messages({
    'string.base': `"Name" should be a type of 'text'`,
    'string.empty': `"Name" cannot be an empty field`,
    'string.min': `"Name" should have a minimum length of {#limit}`,
    'any.required': `"Name" is a required field`,
  }),
  email: Joi.string().email().required().messages({
    'string.email': `"Email" must be a valid email address`,
    'any.required': `"Email" is a required field`,
  }),
  phone: Joi.string().min(10).optional().messages({
    'string.min': `"Phone" should have a minimum length of {#limit}`,
  }),
  company: Joi.string().optional(),
});

exports.updateBuyerSchema = Joi.object({
  name: Joi.string().min(3).optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().min(10).optional(),
  company: Joi.string().optional(),
});
