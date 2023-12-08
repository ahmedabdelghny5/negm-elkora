import joi from "joi"
import { generalFiled } from "../../middleware/validation.js"


export const createAssignment = joi.object({
    question: joi.string().required(),
    answers: joi.array().items(joi.object({
        answer: joi.string().required(),
        rate: joi.number().integer().required()
    })).required(),
    taskName: joi.string().required()

}).required()

export const updateAssignment = joi.object({
    question: joi.string().optional(),
    answers: joi.array().items(joi.object({
        answer: joi.string().required(),
        rate: joi.number().integer().required()
    })).optional(),
    id: generalFiled.id.required(),
    answerId: generalFiled.id.optional(),
    answer: joi.string().optional(),
    rate: joi.number().positive().integer().min(1).max(3).optional()
}).required()

export const delteAssignment = joi.object({
    id: generalFiled.id.required(),
}).required()

