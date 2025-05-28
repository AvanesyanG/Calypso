import User from "../models/UserModel.js";
import Channel from "../models/ChannelModel.js";
import Message from "../models/MessagesModel.js";
import mongoose from "mongoose";

export const createChannel = async (request, response, next) => {

    try {

        const {name, members} = request.body;

        const userID = request.userID;

        const admin = User.findById(userID);

        if(!admin) { 
             return response.status(400).send("Admin user not found.");
          }

         const validMembers = await User.find({_id: {$in:members}});

        if(validMembers.length !==members.length) {
            return response.status(400).send("Some members are not valid users.");
        }

        const newChannel = new Channel({
            name, members, admin: userID
        });

        await newChannel.save();

        return response.status(201).json({channel: newChannel});
   
    } catch (error) {
        return response.status(500).send("internal Server Error");
    }
    next()
};

export const getUserChannels = async (request, response, next) => {
    try {
        const userID = request.userID;
        const userId = new mongoose.Types.ObjectId(userID); // Convert userID to ObjectId using `new`

        // Get the channels where the user is either an admin or a member
        const channels = await Channel.find({ $or: [{ admin: userId }, { members: userId }] }).sort({ updatedAt: -1 });

        // If no channels are found, send a 204 response
        if (channels.length === 0) {
            return response.status(204).send('No channels');
        }

        // Fetch unread count for each channel using aggregation
        const channelsWithUnreadCount = await Promise.all(
            channels.map(async (channel) => {
                // Use aggregation to calculate unread messages count
                const unreadCountResult = await Message.aggregate([
                    {
                        $match: {
                            channelId: channel._id,
                            $and: [
                                // Use $nin to check if userID is not in the readBy array
                                {
                                    $or: [
                                        { readBy: { $nin: [userId] } }, // Check if the user is not in the readBy array
                                        { readBy: { $exists: false } }    // Also consider messages where `readBy` doesn't exist
                                    ]
                                }
                            ]
                        }
                    },
                    {
                        $count: "unreadCount" // Count the unread messages
                    }
                ]);

                // If unreadCountResult is not empty, assign the count, otherwise set it to 0
                const count = unreadCountResult.length > 0 ? unreadCountResult[0].unreadCount : 0;

                // Create a new object to include unreadCount and ensure it's returned correctly
                return {
                    ...channel.toObject(),  // Spread the original channel data
                    unreadCount: count      // Add unreadCount to the response
                };
            })
        );

        // Return the channels with unread count
        return response.status(200).json({ channels: channelsWithUnreadCount });
    } catch (error) {
        console.error('Error fetching channels:', error);
        return response.status(500).send("Internal Server Error");
    }

    next();
};


export const getChannelMessages = async (request, response, next) => {
    try {
        const { channelId } = request.params;
        const userID = request.userID; // Get userID from the request

        // Find the channel and populate the messages and sender info
        const channel = await Channel.findById(channelId).populate({
            path: "messages",
            populate: {
                path: "sender",
                select: "firstName lastName email _id image color",
            }
        });

        if (!channel) {
            return response.status(404).send("Channel not found.");
        } else {
            const messages = channel.messages;

            if (messages.length === 0) {
                return response.status(204).send('No messages');
            } else {
                // Loop through messages to add userID to readBy if it's not already there
                const updatedMessages = await Promise.all(
                    messages.map(async (message) => {
                        if (message.readBy && !message.readBy.includes(userID)) {
                            message.readBy.push(userID);  // Add userID to the readBy array
                            await message.save(); // Save the updated message
                        }
                        return message; // Return the updated message
                    })
                );

                return response.status(201).json({ messages: updatedMessages });
            }
        }
    } catch (error) {
        console.error(error);
        return response.status(500).send("Internal Server Error");
    } finally {
        next();  // Always call the next middleware if applicable
    }
};


export const deleteChannel = async (request, response, next) => {

    try {

         const userID = request.userID;

         
         const channel = await Channel.findOneAndDelete({admin: userID});
//         const channels = await Channel.findOneAndDelete({$or:[{admin: userID}, {members: userID}]});

         console.log(channel);

        if(channel) {
            return response.status(204).send('channel deleted');
        }
        else { 
            return response.status(200).send('You should be admin to delete the Channel');  
             }

    } 
    catch (error) {

        return response.status(500).send("internal Server Error");
    }
   next();

};

