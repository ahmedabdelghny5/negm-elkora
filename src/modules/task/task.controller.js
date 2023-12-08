import { AppError, asyncHandler } from "../../utils/globalError.js";
import taskModel from "../../../DB/models/task.model.js"
import childModel from './../../../DB/models/child.model.js';


//**************************createTask******************* *//
export const createTask = asyncHandler(async (req, res, next) => {
  const { name } = req.body;
  const exist = await taskModel.findOne({ name: name.toLowerCase() });
  if (exist) {
    return next(new AppError("task is already exist", 401));
  }
  const task = await taskModel.create({ name })
  res.status(201).json({ msg: "done", task })
});

//**************************updateTask******************* *//
export const updateTask = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;
  const task = await taskModel.findOneAndUpdate({ _id: id }, { name: name.toLowerCase() });
  if (!task) {
    return next(new AppError("task not exist", 401));
  }
  res.status(200).json({ msg: "done", task })
});

//**************************deleteTask******************* *//
export const deleteTask = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const exist = await taskModel.findByIdAndDelete(id);
  if (!exist) {
    return next(new AppError("task not exist", 401));
  }
  res.status(200).json({ msg: "done" })
});

//**************************getTasks******************* *//
export const getTasks = asyncHandler(async (req, res, next) => {
  const tasks = await taskModel.find({}).populate([
    {
      path: "questions",
      // select: "question answers -_id",
    }
  ])
  if (!tasks?.length) {
    return next(new AppError("tasks not exist", 401));
  }
  res.status(200).json({ msg: "done", tasks })
});
//**************************getOneTask******************* *//
export const getOneTask = asyncHandler(async (req, res, next) => {
  const { id } = req.params
  const task = await taskModel.findById(id).populate([
    {
      path: "questions",
      // select: "question answers -_id",
    }
  ])
  if (!task) {
    return next(new AppError("task not exist", 401));
  }
  res.status(200).json({ msg: "done", task })
});

//**************************doTask******************* *//
export const doTask = asyncHandler(async (req, res, next) => {
  const { taskId, degree } = req.body
  const task = await taskModel.findById(taskId).populate([
    {
      path: "questions",
    }
  ])
  if (!task) {
    return next(new AppError("task not exist", 401));
  }
  const child = await childModel.findOne({ _id: req.user._id })
  if (child) {
    // let match = false
    // for (let i = 0; i < child.tasks.length; i++) {
    //   if (child.tasks[i].taskId.toString() == taskId) {
    //     child.tasks[i].degree.degree
    //     match = true
    //     break;
    //   }
    // }
    // if (!match) {
    //   await child.tasks.push({ taskId, degree })
    // }
    const index = child.tasks.findIndex((ele) => {
      return ele.taskId.toString() == taskId
    })
    if (index >= 0) {
      child.tasks[index].degree = degree

    } else {
      child.tasks.push({ taskId, degree })
    }
    child.subDegree = child.tasks.reduce(function (sum, answer) {
      return sum + answer.degree
    }, 0)
    await child.save()
    return res.status(200).json({ msg: "done", child })
  }
  return next(new AppError("email child not exist", 401));

});



//**************************get all tasks with all child doing it******************* *//
export const TaskswithChild = asyncHandler(async (req, res, next) => {

  const tasks = await taskModel.find({}).populate([
    {
      path: "Child",
      select: "name email"
    }
  ]);
  if (!tasks.length) {
    return next(new AppError("user not exist", 401));
  }
  res.status(200).json({ msg: "done", tasks })
});


//**************************get tasks with certain user doing it******************* *//
export const TasksOfCertainChild = asyncHandler(async (req, res, next) => {
  const child = await childModel.findById(req.user._id)
  let idsArr = [];
  for (const task of child.tasks) {
    idsArr.push(task.taskId)
  }
  const tasks = await taskModel.find({ _id: { $in: idsArr } })
  if (!tasks.length) {
    return next(new AppError("tasks not exist", 401));
  }
  res.status(200).json({ msg: "done", tasks })
});

//**************************get tasks with certain user not doing******************* *//
export const TasksNotOfCertainChild = asyncHandler(async (req, res, next) => {
  const child = await childModel.findById(req.user._id)
  let idsArr = [];
  for (const task of child.tasks) {
    idsArr.push(task.taskId)
  }
  const tasks = await taskModel.find({ _id: { $nin: idsArr } })
  if (!tasks.length) {
    return next(new AppError("tasks not exist", 401));
  }
  res.status(200).json({ msg: "done", tasks })
});
