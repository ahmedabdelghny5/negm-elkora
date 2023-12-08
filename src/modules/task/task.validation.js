import joi from "joi"
import { generalFiled } from "../../middleware/validation.js"


export const createTask = joi.object({
    name: joi.string().required(),
}).required()

export const updateTask = joi.object({
    id: generalFiled.id.required(),
    name: joi.string().optional(),
}).required()

export const deleteTask = joi.object({
    id: generalFiled.id.required()
}).required()

