import { Schema, model, Types } from "mongoose";

const taskSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "name is required"],
      lowercase: true
    },
    questions: [{
      type: Types.ObjectId, ref: "Assignment"
    }]
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    timestamps: true,
  }
);
taskSchema.virtual("Child", {
  ref: "Child",
  foreignField: "tasks.taskId",
  localField: "_id"
})

const taskModel = model("Task", taskSchema);

export default taskModel
