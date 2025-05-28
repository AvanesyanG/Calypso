import User from "../models/UserModel.js";
import Message from "../models/MessagesModel.js";
import mongoose, { mongo } from "mongoose";

export const getContactsForDMList = async (request, response, next) => {
    try {
        let { userID } = request;
        userID = new mongoose.Types.ObjectId(userID);

        const contacts = await Message.aggregate([
            {
                $match: {
                    $or: [{ sender: userID }, { recipient: userID }]
                }
            },
            {
                $sort: { timeStamp: -1 }
            },
            {
                $group: {
                    _id: {
                        $cond: {
                            if: { $eq: ["$sender", userID] },
                            then: "$recipient",
                            else: "$sender"
                        }
                    },
                    lastMessageTime: { $first: "$timeStamp" }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "contactInfo"
                }
            },
            {
                $unwind: "$contactInfo"
            },
            {
                $lookup: {
                    from: "messages",
                    let: { contactId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$sender", "$$contactId"] },
                                        { $eq: ["$recipient", userID] },
                                        { $not: { $in: [userID, "$readBy"] } } // Check if userID is NOT in the readBy array
                                    ]
                                }
                            }
                        },
                        { $count: "unreadCount" }
                    ],
                    as: "unreadMessages"
                }
            },
            {
                $addFields: {
                    unreadCount: {
                        $cond: [
                            { $gt: [{ $size: "$unreadMessages" }, 0] },
                            { $arrayElemAt: ["$unreadMessages.unreadCount", 0] },
                            0
                        ]
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    lastMessageTime: 1,
                    email: "$contactInfo.email",
                    firstName: "$contactInfo.firstName",
                    lastName: "$contactInfo.lastName",
                    image: "$contactInfo.image",
                    color: "$contactInfo.color",
                    unreadCount: 1
                }
            },
            {
                $sort: { lastMessageTime: -1 }
            }
        ]);

        if (contacts.length === 0) {
            return response.status(204).send('No contacts');
        } else {
            return response.status(200).json({ contacts });
        }

    } catch (error) {
        console.log({ error });
        return response.status(500).send("Internal Server Error");
    }

    next();
};



export const searchContacts = async (request, response, next) => {

    try {

        const {searchTerm} = request.body;

        if(searchTerm === undefined || searchTerm === null) {
            return response.status(400).send("searchTerm are required.");
        }

        const santizedSearchTerm = searchTerm.replace (
            /[.*+?^${}()|[\]\\] /g, "\\$&"
        );

        const regex = new RegExp(santizedSearchTerm, "i");

        const contacts = await User.find({
            $and: [
               { _id: {$ne: request.userId} },
               {
                $or: [{firstName: regex}, {lastName: regex}, {email:regex} ] 
               },
            ]
        });


        return response.status(200).json({contacts});

    } catch (error) {
        console.log({error});
        return response.status(500).send("internal Server Error");
    }
    next()
};

export const getAllContacts = async (request, response, next) => {

    try { 

      const users = await User.find({_id:{$ne: request.userId}}, "firstName lastName _id email");

        const contacts = users.map((user)=> (
            { label: user.firstName ? `${user.firstName} ${user.lastName}` : user.email, value: user._id }
        ));

        if (contacts.length === 0) {           
            return response.status(204).send('no contacts');
        } else { 
            return response.status(200).json({contacts});
        }
    } catch (error) {
        console.log({error});
        return response.status(500).send("internal Server Error");
    }
    next()
};