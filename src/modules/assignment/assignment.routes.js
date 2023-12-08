import { Router } from "express";
import * as AC from "./assignment.controller.js";
import * as AV from "./assignment.validation.js";
import { validation } from "../../middleware/validation.js";





const router = Router();

router.post("/", validation(AV.createAssignment), AC.createAssignment);
router.put("/:id", validation(AV.updateAssignment), AC.updateAssignment);
router.delete("/:id", validation(AV.delteAssignment), AC.deleteAssignment);
router.get("/", AC.getAllAssignment);





export default router;
