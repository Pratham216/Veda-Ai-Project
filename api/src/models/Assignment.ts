import { Schema, model, type InferSchemaType } from "mongoose";

const QuestionTypeRow = new Schema(
  {
    type: { type: String, required: true },
    count: { type: Number, required: true, min: 1 },
    marks: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const GeneratedQuestion = new Schema(
  {
    text: { type: String, required: true },
    difficulty: { type: String, enum: ["Easy", "Moderate", "Challenging"], required: true },
    marks: { type: Number, required: true },
  },
  { _id: false },
);

const GeneratedSection = new Schema(
  {
    title: { type: String, required: true },
    instruction: { type: String, default: "" },
    questions: { type: [GeneratedQuestion], default: [] },
  },
  { _id: false },
);

const Result = new Schema(
  {
    schoolName: { type: String, required: true },
    subject: { type: String, required: true },
    className: { type: String, required: true },
    timeAllowedMinutes: { type: Number, required: true },
    maximumMarks: { type: Number, required: true },
    sections: { type: [GeneratedSection], default: [] },
    answerKey: { type: [String], default: [] },
  },
  { _id: false },
);

const AssignmentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, default: "Untitled Assignment" },
    schoolName: { type: String, default: "" },
    teacherName: { type: String, default: "" },
    dueDate: { type: String, required: true },
    additionalInfo: { type: String, default: "" },
    questionTypes: { type: [QuestionTypeRow], default: [] },
    file: {
      name: { type: String },
      size: { type: Number },
    },
    assignedOn: { type: String, required: true },
    status: {
      type: String,
      enum: ["queued", "generating", "ready", "failed"],
      default: "queued",
      index: true,
    },
    progress: { type: Number, default: 0 },
    error: { type: String },
    result: { type: Result },
  },
  { timestamps: true },
);

export type AssignmentDoc = InferSchemaType<typeof AssignmentSchema> & { _id: unknown };
export const AssignmentModel = model("Assignment", AssignmentSchema);

export function toJSON(d: AssignmentDoc & { _id: { toString(): string } }) {
  return {
    id: d._id.toString(),
    title: d.title,
    schoolName: d.schoolName,
    teacherName: d.teacherName,
    dueDate: d.dueDate,
    additionalInfo: d.additionalInfo,
    questionTypes: d.questionTypes,
    file: d.file,
    assignedOn: d.assignedOn,
    status: d.status,
    progress: d.progress,
    error: d.error,
    result: d.result,
  };
}
