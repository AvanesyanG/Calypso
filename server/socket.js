import { Server as SocketIOServer} from "socket.io";
import Message from "./models/MessagesModel.js";
import Channel from "./models/ChannelModel.js";


const setupSocket = (server) => {

    const io = new SocketIOServer(server, {
    cors: {
       origin: process.env.ORIGIN,
       methods: ["GET", "POST"],
       credentials: true,
    }
    });

    const userSocketMap = new Map();

    const disconnect = (socket)=> {

        console.log(`Client Disconnected: ${socket.id}`);

        for(const[userId, socketIds] of userSocketMap.entries()) {
            if(socketIds.has(socket.id)) {
               socketIds.delete(socket.id);
               if(socketIds.size === 0) {
                   userSocketMap.delete(userId);
               }
               break;
            }
        }
    }

    const sendMessage = async(message) => {

        const createdMessage = await Message.create(message);
   
        const messageData = await Message.findById(createdMessage._id)
        .populate("sender", "id email firstName lastName image color")
        .populate("recipient", "id email firstName lastName image color");

        const senderSockets = userSocketMap.get(message.sender);
        if (senderSockets) {
            senderSockets.forEach(socketId => {
                io.to(socketId).emit("recieveMessage", messageData);
            });
        }

        const recipientSockets = userSocketMap.get(message.recipient);
        if (recipientSockets) {
            recipientSockets.forEach(socketId => {
                io.to(socketId).emit("recieveMessage", messageData);
            });
        }

    }

    const sendChannelMessage = async(message) => {

        const {sender, content, channelId, messageType, fileUrl} = message;

        const createdMessage = await Message.create({
            sender,
            recipient: null,
            content,
            messageType,
            timeStamp: new Date(),
            fileUrl,
            channelId,
            readBy: [sender]
        });
       
        const messageData = await Message.findById(createdMessage._id)
        .populate("sender", "id email firstName lastName image color")
        .exec();

        await Channel.findByIdAndUpdate(channelId, {
            $push: {messages: createdMessage._id}
        });

        const channel = await Channel.findById(channelId).populate("members");

        if(channel && channel.members) {
            channel.members.forEach((member)=> {
                const memberSockets = userSocketMap.get(member._id.toString());
                if (memberSockets) {
                    memberSockets.forEach(socketId => {
                        io.to(socketId).emit("recieve-channel-message", messageData);
                    });
                }
            });
                 const adminSockets = userSocketMap.get(channel.admin.toString());
                 if (adminSockets) {
                     adminSockets.forEach(socketId => {
                         io.to(socketId).emit("recieve-channel-message", messageData);
                     });
                 }
      }
    }


    io.on("connection", (socket) => {
        const userId = socket.handshake.query.userId;

        if(userId) {
            if (!userSocketMap.has(userId)) {
                userSocketMap.set(userId, new Set());
            }
            userSocketMap.get(userId).add(socket.id);
            console.log(`User connected: ${userId} with socket ID: ${socket.id}`)
        } else {
            console.log("User ID not provided during connection.")
        }

        socket.on("sendMessage", sendMessage);

        socket.on("send-channel-message", sendChannelMessage);

        socket.on("disconnect", () => disconnect(socket));
    })       
}

export default setupSocket 