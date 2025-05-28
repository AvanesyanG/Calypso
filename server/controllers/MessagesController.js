import Message from "../models/MessagesModel.js";
import path from "path";
import {mkdirSync, renameSync} from 'fs';
import { Buffer } from "buffer";

export const getMessages = async (request, response, next) => {
    try {
        const user1 = request.userID;
        const user2 = request.body.id;

        if (!user1 || !user2) {
            return response.status(400).send("Both user's IDs are required.");
        }

        const messages = await Message.find({
            $or: [
                { sender: user1, recipient: user2 },
                { sender: user2, recipient: user1 }
            ]
        }).sort({ timestamp: 1 });

        if (messages.length === 0) {
            return response.status(204).send("No messages found.");
        }

        const result = await Message.updateMany(
            {
                sender: user2,
                recipient: user1,
                readBy: { $ne: user1 }
            },
            {
                $addToSet: { readBy: user1 }
            }
        );

        return response.status(200).json({
            messages,
            updatedCount: result.nModified,
        });

    } catch (error) {
        console.error("Error fetching messages:", error);
        return response.status(500).send("Internal Server Error");
    } finally {
        next();
    }
};


export const deleteMessages = async (request, response, next) => {

    try {

        const user1 = request.userID;
        const user2 = request.body.id;

        if(!user1||!user2) {
            return response.status(400).send("Both user's IDs are required.");
        }

        await Message.deleteMany({
            $or: [{sender: user1, recipient: user2}, {sender: user2, recipient: user1},
        ]
    });

        return response.status(200).send("contacts and messages are removed");

    } catch (error) {
        console.log({error});
        return response.status(500).send("internal Server Error");
    }
    next()
};


export const uploadFile = async (request, response, next) => {
    try {
      if (!request.files || request.files.length === 0) {
        return response.status(400).send("At least one file is required.");
      }
  
      const filePaths = [];
  
      for (const file of request.files) {
        // Decode and sanitize original filename
        let decodedFilename = Buffer.from(file.originalname, 'latin1').toString('utf8');
        const ext = path.extname(decodedFilename);
        const base = path.basename(decodedFilename, ext).replace(/[<>:"/\\|?*\x00-\x1F]/g, "_");
  
        // Append timestamp for uniqueness
        const uniqueFilename = `${base}_${Date.now()}${ext}`;
  
        // Create date-based folder
        const date = new Date().toISOString().split('T')[0];
        const fileDir = `uploads/files/${date}`;
        const fullPath = path.join(fileDir, uniqueFilename);
  
        // Ensure directory exists and move file
        mkdirSync(fileDir, { recursive: true });
        renameSync(file.path, fullPath);
  
        // Normalize and encode path
        const normalizedPath = fullPath.replace(/\\/g, '/');
        const encodedFileUrl = encodeURIComponent(normalizedPath);
        filePaths.push(encodedFileUrl);
      }
  
      return response.status(200).json({ filePaths });
    } catch (error) {
      console.error({ error });
      return response.status(500).send("Internal Server Error");
    } finally {
      next();
    }
  };
