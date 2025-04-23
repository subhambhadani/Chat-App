import mongoose from "mongoose";

export const chatSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export const chatModel = mongoose.model("Chat", chatSchema);
