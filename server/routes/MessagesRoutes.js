import express from "express";
import { getMessages, uploadFile, deleteMessages} from "../controllers/MessagesController.js"
import { verifyToken } from "../middleware/AuthMiddleware.js";
import multer from "multer";

const messagesRoutes = express.Router();

const upload = multer({dest: "uploads/files"});

messagesRoutes.post("/api/messages/get-messages", verifyToken, getMessages);
messagesRoutes.post("/api/messages/delete-messages", verifyToken, deleteMessages);
messagesRoutes.post("/api/messages/upload-file", verifyToken, upload.array("file"), uploadFile);


export default messagesRoutes;
