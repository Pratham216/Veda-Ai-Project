import mongoose from "mongoose";
import { config } from "./config.js";

let connected = false;

export async function connectMongo() {
  if (connected) return mongoose.connection;
  await mongoose.connect(config.mongoUrl, { serverSelectionTimeoutMS: 5000 });
  connected = true;
  console.log("[mongo] connected", config.mongoUrl);
  return mongoose.connection;
}
