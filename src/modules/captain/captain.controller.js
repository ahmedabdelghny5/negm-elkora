import { AppError, asyncHandler } from "../../utils/globalError.js";
import captainModel from "../../../DB/models/captain.model.js"
import { sendEmail } from "../../utils/sendEmail.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"
import { nanoid } from "nanoid";


//**************************signUp******************* *//
export const signUp = asyncHandler(async (req, res, next) => {
  const { name, email, password, rePassword, age, phone, clubName } = req.body;
  const exist = await captainModel.findOne({ email });
  if (exist) {
    return next(new AppError("email is already exist", 401));
  }
  const token = jwt.sign({ email }, process.env.signature, { expiresIn: 60 })
  const rfToken = jwt.sign({ email }, process.env.signature)
  const link = `${req.protocol}://${req.headers.host}/captains/confirmEmail/${token}`
  const rfLink = `${req.protocol}://${req.headers.host}/captains/rfreashToken/${rfToken}`
  const sended = await sendEmail(email, "confirm email", `<a href="${link}">confirm email</a> <br>
  <a href="${rfLink}">rfreashToken</a>`)
  if (!sended) {
    return next(new AppError("email not exist", 401));
  }
  const hash = bcrypt.hashSync(password, +process.env.saltOrRounds)
  const captain = new captainModel({ name, email, password: hash, age, phone, clubName })
  const newcaptain = await captain.save()
  if (!newcaptain) {
    return next(new AppError("fail", 400));
  }
  res.status(201).json({ msg: "done", newcaptain })
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
  const captain = await captainModel.findOneAndUpdate(
    { email: decoded.email, confirmed: false },
    { confirmed: true },
    { new: true });

  captain ?
    res.status(200).json({ msg: "email confirmed plz go to signIn " })
    : next(new AppError("captain not exist or already confirmed", 400));

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
  const captain = await captainModel.findOne({ email: decoded.email, confirmed: false })
  if (!captain) {
    return next(new AppError("captain not exist or already confirmed before", 401));
  }
  const rfToken = jwt.sign({ email: captain.email }, process.env.signature, { expiresIn: 60 })
  const link = `${req.protocol}://${req.headers.host}/captains/confirmEmail/${rfToken}`

  const sended = await sendEmail(captain.email, "confirm email", `<a href="${link}">confirm email</a>`)
  if (!sended) {
    return next(new AppError("email not exist", 401));
  }
  res.status(201).json({ msg: "plz go to confirm your email" })
});

//**************************forgetPassword******************* *//
export const forgetPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const exist = await captainModel.findOne({ email });
  if (!exist) {
    return next(new AppError("email not exist", 401));
  }
  const code = nanoid(4)

  const token = jwt.sign({ email }, process.env.signature, { expiresIn: 60 })
  const link = `${req.protocol}://${req.headers.host}/captains/resetPassword/${token}`
  const sended = await sendEmail(email, "resetPassword", `<a href="${link}">resetPassword</a> <br>
  <h1>${code}</h1>`)
  if (!sended) {
    return next(new AppError("email not exist", 401));
  }
  await captainModel.updateOne({ email }, { code })
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
  const captain = await captainModel.findOne({ email: decoded.email, code })
  if (!captain) {
    return next(new AppError("captain not exist or invalid code", 401));
  }

  const hashePassword = bcrypt.hashSync(newPassword, +process.env.saltOrRounds)

  const newcaptain = await captainModel.updateOne({ email: decoded.email },
    { password: hashePassword, code: null, changePassAt: Date.now() })

  newcaptain ?
    res.status(201).json({ msg: "done" })
    : next(new AppError("fail", 400));
});


//**************************signIn******************* *//
export const signIn = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const captain = await captainModel.findOne({ email, confirmed: true });
  if (!captain) {
    return next(new AppError("email not exist or not confirmed yet", 401));
  }
  const match = bcrypt.compareSync(password, captain.password)
  if (!match) {
    return next(new AppError("invalid password", 401));
  }
  const token = jwt.sign({ email: captain.email, id: captain._id, role: "Captain" }, process.env.signature, { expiresIn: "1year" })
  res.status(201).json({ msg: "done", token })
});

//**************************getAllCaptains******************* *//
export const getAllCaptains = asyncHandler(async (req, res, next) => {
  const captains = await captainModel.find({});
  if (!captains.length) {
    return next(new AppError("ther is no captains found", 404));
  }
  res.status(200).json({ msg: "done", captains })
});


