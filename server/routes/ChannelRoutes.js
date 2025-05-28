import express from "express";
import { createChannel, getUserChannels, getChannelMessages, deleteChannel} from "../controllers/ChannelController.js"
import { verifyToken } from "../middleware/AuthMiddleware.js";

const channelRoutes = express.Router();

channelRoutes.post("/api/channels/create-channel", verifyToken, createChannel);
channelRoutes.get("/api/channels/get-user-channels", verifyToken, getUserChannels);
channelRoutes.get("/api/channels/get-channel-messages/:channelId", verifyToken, getChannelMessages);
channelRoutes.post("/api/channels/delete-channel", verifyToken, deleteChannel);

export default channelRoutes;
