import { AppError, asyncHandler } from "../../utils/globalError.js";
import assignmentModel from "../../../DB/models/assignment.model.js"
import taskModel from "../../../DB/models/task.model.js";


//**************************createAssignment******************* *//
export const createAssignment = asyncHandler(async (req, res, next) => {
  const { question, answers, taskName } = req.body;
  //exist or not
  const exist = await assignmentModel.findOne({ question: question.toLowerCase() });
  if (exist) {
    return next(new AppError("assignment is already exist", 401));
  }
  //check task exist first
  const taskExist = await taskModel.findOne({ name: taskName })
  if (!taskExist) {
    return next(new AppError("task not exist", 401));
  }
  //check total of rate of answers
  let allRate = answers.reduce(function (sum, answer) {
    return sum + answer.rate
  }, 0)
  if (allRate != 10) {
    return next(new AppError("total rate is invalid must equal 10 ", 401));
  }
  //push data
  let dummyAnswers = []
  for (const answer of answers) {
    dummyAnswers.push(answer)
  }
  const assignment = await assignmentModel.create({ question, answers: dummyAnswers })
  await taskModel.updateOne({ name: taskName }, { $push: { questions: assignment._id } })
  res.status(201).json({ msg: "done", assignment })
});

//**************************updateAssignment******************* *//
export const updateAssignment = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const assignment = await assignmentModel.findById(id);
  if (!assignment) {
    return next(new AppError("assignment not exist", 401));
  }
  if (req.body.question) {
    assignment.question = req.body.question.toLowerCase()
  }
  if (req.body.answers) {
    assignment.answers = req.body.answers
  }
  if (req.body.answerId) {
    for (let i = 0; i < assignment.answers.length; i++) {
      // console.log(assignment.answers[i]._id.toString(), req.body.answerId);
      if (assignment.answers[i]._id.toString() == req.body?.answerId) {
        assignment.answers[i].answer = req.body?.answer || assignment.answers[i].answer
        assignment.answers[i].rate = req.body?.rate || assignment.answers[i].rate
      } else {
        return next(new AppError("answerId not exist on it answers", 401));
      }
    }
  }
  assignment.save()
  res.status(200).json({ msg: "done", assignment })
});

//**************************deleteAssignment******************* *//
export const deleteAssignment = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const exist = await assignmentModel.findByIdAndDelete(id);
  if (!exist) {
    return next(new AppError("assignment not exist", 401));
  }
  res.status(200).json({ msg: "done" })
});


//**************************getAllAssignment******************* *//
export const getAllAssignment = asyncHandler(async (req, res, next) => {
  const assignments = await assignmentModel.find({});
  if (!assignments.length) {
    return next(new AppError("not assignment exist", 401));
  }
  res.status(200).json({ msg: "done", assignments })
});