import joi from "joi";
import { AppError } from "../utils/globalError.js";
import { Types } from "mongoose";


const validationId = (vlaue, helper) => {
  return Types.ObjectId.isValid(vlaue) ? true : helper.message("invalid id")
}

export const generalFiled = {
  email: joi.string().email({ tlds: { allow: ["com", "net"] } }).required(),
  password: joi.string().pattern(new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)).required(),
  rePassword: joi.string().valid(joi.ref("password")).required(),
  id: joi.string().custom(validationId),
  file: joi.object({
    size: joi.number().positive().required(),
    path: joi.string().required(),
    filename: joi.string().required(),
    destination: joi.string().required(),
    mimetype: joi.string().required(),
    encoding: joi.string().required(),
    originalname: joi.string().required(),
    fieldname: joi.string().required(),
  }),
};


export const validation = (schema) => {
  return (req, res, next) => {
    const inputData = { ...req.body, ...req.query, ...req.params }
    if (req.file || req.files) {
      inputData.file = req.file || req.files
    }
    let arrErr = [];
    const { error } = schema.validate(inputData, { abortEarly: false });
    if (error) {
      error.details.map((err) => {
        arrErr.push(err.message);
      });
    }
    if (arrErr.length) {
      return next(new AppError(arrErr, 400));
    }
    next();
  };
};



