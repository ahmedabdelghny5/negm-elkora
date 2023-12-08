import { Router } from "express";
import * as CHC from "./child.controller.js";
import { allowedValidation, multerCloudinary } from "../../utils/multerCloud.js";
import * as CHV from "./child.validation.js";
import { validation } from "../../middleware/validation.js";
import { auth, role } from "../../middleware/auth.js";




const router = Router();

router.post("/signUp",
    multerCloudinary(allowedValidation.image).single("image"),
    validation(CHV.signUp),
    CHC.signUp);

router.get("/confirmEmail/:token", validation(CHV.confirmEmail), CHC.confirmemail);
router.get("/rfreashToken/:token", validation(CHV.rfreashToken), CHC.rfreashToken);
router.patch("/forgetPassword", validation(CHV.forgetPassword), CHC.forgetPassword);
router.patch("/resetPassword/:token", validation(CHV.resetPassword), CHC.resetPassword);
router.post("/signIn", validation(CHV.signIn), CHC.signIn);

router.patch("/uploadVideos",
    multerCloudinary(allowedValidation.video).array("videos", 1),
    validation(CHV.uploadVideos),
    CHC.uploadVideos);

router.get("/degree", CHC.getChildDgree);
router.get("/", CHC.getChildsDoingTasks);
router.get("/tasks", auth(role.Child), CHC.getChildWithTasks);


export default router;
