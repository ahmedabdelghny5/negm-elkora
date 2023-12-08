import { Schema, model, Types } from "mongoose";

const childSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "name is required"],
      lowercase: true,
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
    phoneFather: {
      type: String,
      required: [true, "phoneFather is required"],
    },
    age: {
      type: Number,
      required: [true, "age is required"],
    },
    favPlace: {
      type: String,
      required: [true, "favPlace is required"],
    },
    DOB: {
      type: Date,
      required: [true, "DOB is required"],
    },
    DOS: {
      type: Date,
      required: [true, "DOS is required"],
    },
    videos: [Object],
    image: Object,
    customId: String,
    confirmed: {
      type: Boolean,
      default: false,
    },
    tasks: [{
      taskId: { type: Types.ObjectId, ref: "Task" },
      degree: Number
    }],
    subDegree: { type: Number, default: 0 }
  },
  {
    timestamps: true,
  }
);

const childModel = model("Child", childSchema);

export default childModel
