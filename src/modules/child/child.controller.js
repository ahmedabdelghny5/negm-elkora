import { AppError, asyncHandler } from "../../utils/globalError.js";
import childModel from "../../../DB/models/child.model.js"
import { sendEmail } from "../../utils/sendEmail.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"
import { nanoid } from "nanoid";
import cloudinary from './../../utils/cloudinary.js';


//**************************signUp******************* *//
export const signUp = asyncHandler(async (req, res, next) => {
  const { name, email, password, rePassword, age, phone, phoneFather, favPlace, DOB, DOS } = req.body;
  const exist = await childModel.findOne({ email });
  if (exist) {
    return next(new AppError("email is already exist", 401));
  }
  //send email
  const token = jwt.sign({ email }, process.env.signature, { expiresIn: 60 })
  const rfToken = jwt.sign({ email }, process.env.signature)
  const link = `${req.protocol}://${req.headers.host}/childs/confirmEmail/${token}`
  const rfLink = `${req.protocol}://${req.headers.host}/childs/rfreashToken/${rfToken}`
  const sended = await sendEmail(email, "confirm email", `<a href="${link}">confirm email</a> <br>
  <a href="${rfLink}">rfreashToken</a>`)
  if (!sended) {
    return next(new AppError("email not exist", 401));
  }
  //hash password
  const hash = bcrypt.hashSync(password, +process.env.saltOrRounds)
  //image
  const customId = nanoid(4)
  const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
    folder: `negm-kora/childs/${customId}`,
  })
  //create
  const child = await childModel.create({
    name, email,
    password: hash,
    age, phone,
    phoneFather, favPlace,
    DOB, DOS, customId,
    image: { secure_url, public_id }
  })
  if (!child) {
    //>>>not done <<<
    await cloudinary.uploader.destroy(child.image.public_id)
    return next(new AppError("fail", 400));
  }
  res.status(201).json({ msg: "done", child })
});


//**************************confirmemail******************* *//
export const confirmemail = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  if (!token) {
    return next(new AppError("token not  exist", 401));
  }
  const decoded = await jwt.verify(token, process.env.signature)
  if (!decoded) {
    return next(new AppError("invalid token", 401));
  }
  const child = await childModel.findOneAndUpdate(
    { email: decoded.email, confirmed: false },
    { confirmed: true },
    { new: true });

  child ?
    res.status(200).json({ msg: "email confirmed plz go to signIn " })
    : next(new AppError("child not exist or already confirmed", 400));

});

//**************************rfreashToken******************* *//
export const rfreashToken = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  if (!token) {
    return next(new AppError("token not  exist", 401));
  }
  const decoded = await jwt.verify(token, process.env.signature)
  if (!decoded) {
    return next(new AppError("invalid token", 401));
  }
  const child = await childModel.findOne({ email: decoded.email, confirmed: false })
  if (!child) {
    return next(new AppError("child not exist or already confirmed before", 401));
  }
  const rfToken = jwt.sign({ email: child.email }, process.env.signature, { expiresIn: 60 })
  const link = `${req.protocol}://${req.headers.host}/childs/confirmEmail/${rfToken}`

  const sended = await sendEmail(child.email, "confirm email", `<a href="${link}">confirm email</a>`)
  if (!sended) {
    return next(new AppError("email not exist", 401));
  }
  res.status(201).json({ msg: "plz go to confirm your email" })
});

//**************************forgetPassword******************* *//
export const forgetPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const exist = await childModel.findOne({ email });
  if (!exist) {
    return next(new AppError("email not exist", 401));
  }
  //generate code to more secure
  const code = nanoid(6)
  const token = jwt.sign({ email }, process.env.signature, { expiresIn: 60 })
  const link = `${req.protocol}://${req.headers.host}/childs/resetPassword/${token}`
  const sended = await sendEmail(email, "resetPassword", `<a href="${link}">resetPassword</a>  <br>
  <h1>${code}</h1>`)
  if (!sended) {
    return next(new AppError("email not exist", 401));
  }
  await childModel.updateOne({ email }, { code })
  res.status(201).json({ msg: "done check your email  to resetPassword", link })
});


//**************************resetPassword******************* *//
export const resetPassword = asyncHandler(async (req, res, next) => {
  const { newPassword, rePassword, code } = req.body
  const { token } = req.params;
  if (!token) {
    return next(new AppError("token not  exist", 401));
  }
  const decoded = await jwt.verify(token, process.env.signature)
  if (!decoded) {
    return next(new AppError("invalid token", 401));
  }
  const child = await childModel.findOne({ email: decoded.email, code })
  if (!child) {
    return next(new AppError("child not exist or invalid code", 401));
  }
  //hash
  const hashePassword = bcrypt.hashSync(newPassword, +process.env.saltOrRounds)
  const newchild = await childModel.updateOne({ email: decoded.email },
    { password: hashePassword, code: null, changePassAt: Date.now() })

  newchild ?
    res.status(201).json({ msg: "done" })
    : next(new AppError("fail", 400));
});


//**************************signIn******************* *//

//not completed////
export const signIn = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const child = await childModel.findOne({ email, confirmed: true });
  if (!child) {
    return next(new AppError("email not exist or not confirmed yet", 401));
  }
  const match = bcrypt.compareSync(password, child.password)
  if (!match) {
    return next(new AppError("invalid password", 401));
  }
  const token = jwt.sign({ email: child.email, id: child._id, role: "Child" }, process.env.signature, { expiresIn: "1year" })
  res.status(201).json({ msg: "done", token })
});

//**************************uploadVideos******************* *//
export const uploadVideos = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const child = await childModel.findOne({ email });
  if (!child) {
    return next(new AppError("email not exist", 401));
  }
  //videos
  let arrVideos = []
  for (const file of req.files) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, {
      folder: `negm-kora/childs/${child.customId}/videos`,
      resource_type: "video"
    })
    arrVideos.push({ secure_url, public_id })
  }
  child.videos = arrVideos
  await child.save()
  res.status(201).json({ msg: "done", child })
});

//**************************get all childs that doing certain task******************* *//
export const getChildsDoingTasks = asyncHandler(async (req, res, next) => {
  const { taskId } = req.query;
  const childs = await childModel.find({ "tasks.taskId": taskId }).select("name email");
  if (!childs.length) {
    return next(new AppError("no one do it yet", 404));
  }
  res.status(200).json({ msg: "done", childs })
});


//**************************get certain child with his  tasks******************* *//
export const getChildWithTasks = asyncHandler(async (req, res, next) => {
  const child = await childModel.findById(req.user._id).select("name email tasks subDegree -_id");
  if (!child) {
    return next(new AppError("user not exist", 404));
  }
  res.status(200).json({ msg: "done", child })
});

//**************************sort child with his degree******************* *//
export const getChildDgree = asyncHandler(async (req, res, next) => {
  const childs = await childModel.find({}).sort({ subDegree: -1 });
  if (!childs.length) {
    return next(new AppError("no childs exist", 404));
  }
  res.status(200).json({ msg: "done", childs })
});





