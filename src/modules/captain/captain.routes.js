import { Router } from "express";
import * as CC from "./captain.controller.js";
import { validation } from "../../middleware/validation.js";
import * as CV from "./captain.validation.js";




const router = Router();

router.post("/signUp", validation(CV.signUp), CC.signUp);
router.get("/confirmEmail/:token", validation(CV.confirmEmail), CC.confirmemail);
router.get("/rfreashToken/:token", validation(CV.rfreashToken), CC.rfreashToken);
router.patch("/forgetPassword", validation(CV.forgetPassword), CC.forgetPassword);
router.patch("/resetPassword/:token", validation(CV.resetPassword), CC.resetPassword);
router.post("/signIn", validation(CV.signIn), CC.signIn);
router.get("/", CC.getAllCaptains);




export default router;
