
import joi from "joi"
import { generalFiled } from "../../middleware/validation.js"





export const signUp = joi.object({
    name: joi.string().min(2).max(25).required(),
    email: generalFiled.email,
    password: generalFiled.password,
    rePassword: generalFiled.rePassword,
    age: joi.number().min(12).max(22).required(),
    phone: joi.string().required(),
    clubName: joi.string().required(),
}).required()

export const confirmEmail = joi.object({
    token: joi.string().required(),
}).required()

export const rfreashToken = joi.object({
    token: joi.string().required(),
}).required()

export const forgetPassword = joi.object({
    email: generalFiled.email,

}).required()

export const resetPassword = joi.object({
    token: joi.string().required(),
    newPassword: generalFiled.password,
    rePassword: joi.string().valid(joi.ref("newPassword")).required(),
    code: joi.string().min(6).max(6).required(),
}).required()

export const signIn = joi.object({
    email: generalFiled.email,
    password: generalFiled.password,
}).required()

