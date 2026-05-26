import { Schema, model, type InferSchemaType } from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    schoolName: { type: String, default: "", trim: true, maxlength: 200 },
    location: { type: String, default: "", trim: true, maxlength: 200 },
  },
  { timestamps: true },
);

export type UserDoc = InferSchemaType<typeof UserSchema> & { _id: unknown };
export const UserModel = model("User", UserSchema);

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function publicUser(d: UserDoc & { _id: { toString(): string } }) {
  return {
    id: d._id.toString(),
    name: d.name,
    email: d.email,
    schoolName: d.schoolName,
    location: d.location,
  };
}
