import { Schema, model, Types } from "mongoose";

const captainSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "name is required"],
      lowercase: true,
      minLength: [2, "name is too short"],
    },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: [true, "email is unique"],
    },
    password: {
      type: String,
      required: [true, "password is required"],
    },
    phone: {
      type: String,
      required: [true, "phone is required"],
    },
    age: {
      type: Number,
      required: [true, "age is required"],
    },
    confirmed: {
      type: Boolean,
      default: false,
    },
    clubName: { type: String, required: [true, "clubName is required"] },
    code: String,
    changePassAt: Date,
  },
  {
    timestamps: true,
  }
);

const captainModel = model("Captain", captainSchema);

export default captainModel
