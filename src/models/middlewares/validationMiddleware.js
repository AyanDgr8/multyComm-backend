// src/middlewares/validationMiddleware.js

// import Joi from 'joi';

// const userDetailsSchema = Joi.object({
//   name: Joi.string().required(),
//   phoneNumber: Joi.number().required().integer().min(1000000000).max(9999999999),
//   email: Joi.string().email().required(),
//   gender: Joi.string().valid('men', 'women', 'others').required(),
//   purchaseType: Joi.string().valid('trial', 'permanent').required(),
//   selectedDate: Joi.string().required(),
//   selectedBodyParts: Joi.array().items(Joi.string()).required(),
//   coupon: Joi.string().allow(''),
// });

// export const validateInput = (req, res, next) => {
//   const validationResult = userDetailsSchema.validate(req.body);
//   if (validationResult.error) {
//     return res.status(400).json({ error: validationResult.error.message });
//   }
//   next();
// };