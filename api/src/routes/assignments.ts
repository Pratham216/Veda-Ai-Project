import { Router } from "express";
import { z } from "zod";
import { Types } from "mongoose";
import { AssignmentModel, toJSON } from "../models/Assignment.js";
import { getQueue } from "../queue.js";
import { emitAssignment } from "../ws/io.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";

const router = Router();

const isValidId = (id: string) =>
  Types.ObjectId.isValid(id) && String(new Types.ObjectId(id)) === id;

const QuestionTypeSchema = z.object({
  type: z.string().min(1),
  count: z.number().int().min(1).max(50),
  marks: z.number().int().min(1).max(100),
});

const CreateSchema = z.object({
  title: z.string().min(1, "Title is required").max(120),
  schoolName: z.string().max(200).optional().default(""),
  teacherName: z.string().max(120).optional().default(""),
  dueDate: z.string().regex(/^\d{2}-\d{2}-\d{4}$/, "DD-MM-YYYY"),
  additionalInfo: z.string().max(2000).optional().default(""),
  questionTypes: z.array(QuestionTypeSchema).min(1),
  file: z
    .object({ name: z.string(), size: z.number() })
    .nullable()
    .optional(),
});

router.use(requireAuth);

router.get("/", async (req: AuthedRequest, res) => {
  const docs = await AssignmentModel.find({ userId: req.userId })
    .sort({ createdAt: -1 })
    .limit(100);
  res.json(docs.map((d) => toJSON(d as never)));
});

router.get("/:id", async (req: AuthedRequest, res) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ error: "Invalid id" });
  const d = await AssignmentModel.findOne({ _id: req.params.id, userId: req.userId });
  if (!d) return res.status(404).json({ error: "Not found" });
  res.json(toJSON(d as never));
});

router.post("/", async (req: AuthedRequest, res) => {
  const parsed = CreateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
  }
  const todayDmy = new Date().toLocaleDateString("en-GB").replaceAll("/", "-");
  const created = await AssignmentModel.create({
    ...parsed.data,
    userId: req.userId,
    assignedOn: todayDmy,
    status: "queued",
    progress: 0,
  });
  const id = String(created._id);
  await getQueue().add(
    "generate",
    { assignmentId: id },
    {
      removeOnComplete: 1000,
      removeOnFail: 1000,
      attempts: 2,
      backoff: { type: "exponential", delay: 1500 },
    },
  );
  emitAssignment(id, "status", { status: "queued", progress: 0 });
  res.status(201).json(toJSON(created as never));
});

router.delete("/:id", async (req: AuthedRequest, res) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ error: "Invalid id" });
  const d = await AssignmentModel.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!d) return res.status(404).json({ error: "Not found" });
  res.json({ ok: true });
});

export default router;
