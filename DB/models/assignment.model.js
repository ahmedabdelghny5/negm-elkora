import { Schema, model, Types } from "mongoose";

const assignmentSchema = new Schema(
  {
    question: {
      type: String,
      required: [true, "question is required"],
      unique: [true, "question is required"],
      lowercase: true,
      trim: true
    },
    answers: [{
      answer: { type: String, required: [true, "answer is required"] },
      rate: { type: Number, required: [true, "rate is required"] }
    }]
  },
  {
    timestamps: true,
  }
);

const assignmentModel = model("Assignment", assignmentSchema);

export default assignmentModel
