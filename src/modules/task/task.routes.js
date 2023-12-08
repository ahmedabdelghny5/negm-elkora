import { Router } from "express";
import * as TC from "./task.controller.js";
import { validation } from "../../middleware/validation.js";
import * as TV from "./task.validation.js";
import { auth, role } from './../../middleware/auth.js';





const router = Router();

router.post("/", validation(TV.createTask), TC.createTask);
router.patch("/:id", validation(TV.updateTask), TC.updateTask);
router.delete("/:id", validation(TV.deleteTask), TC.deleteTask);
router.put("/:id", auth(role.Child), TC.doTask);
router.get("/TasksOfCertainChild", auth(role.Child), TC.TasksOfCertainChild);
router.get("/TasksNotOfCertainChild", auth(role.Child), TC.TasksNotOfCertainChild);
router.get("/TaskswithChild", TC.TaskswithChild);
router.get("/allTasks", TC.getTasks);
router.get("/:id", TC.getOneTask);




export default router;
