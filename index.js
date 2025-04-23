import express from "express";
import { Server } from "socket.io";
import cors from "cors";
import http from "http";
import connectDB from "./config/mongoose.js";
import { chatModel } from "./chat.schema.js";

const app = express();

// 1. Creating server using http.
const server = http.createServer(app);

// 2. Create socket server.
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// 3. Use socket events.

io.on("connection", (socket) => {
  console.log("Connection is established");
  socket.on("join", (data) => {
    socket.username = data;
    // Send old messages to the new user
    chatModel
      .find()
      .sort({ timestamp: 1 })
      .limit(50)
      .then((messages) => {
        socket.emit("load_messages", messages);
      })
      .catch((err) => {
        console.error("Error fetching old messages:", err);
      });
    console.log("User joined:", socket.username);
  });
  socket.on("chat message", async (message) => {
    let userMessage = {
      username: socket.username,
      message: message,
    };

    // Save the message to the database
    // Create a new chat message instance
    const newChat = new chatModel({
      username: socket.username,
      message: message,
      timestamp: new Date(),
    });
    try {
      await newChat.save();
      console.log("Message saved to database:", userMessage);
    } catch (err) {
      console.error("Error saving message to database:", err);
    }
    // broadcast this message to all the clients.
    socket.broadcast.emit("broadcast_message", userMessage);
  });

  socket.on("disconnect", () => {
    console.log("Connection is disconnected");
  });
});

server.listen(3000, () => {
  console.log("App is listening on 3000");
  connectDB();
});
