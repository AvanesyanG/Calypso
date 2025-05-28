import mongoose, { mongo } from "mongoose";


const messageSchema = new mongoose.Schema({

    sender: {
        type:mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true,
        },

    recipient: {
        type:mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: false,
        },

    messageType: {
        type:String,
        enum: ["text", "file"],
        required: false,
        },

   content: {
        type:String,
        required: function () {
            return this.messageType === "text"
        },
    },

    fileUrl: {
        type:String,
        required: function () {
            return this.messageType === "file"
        },
    },

    timeStamp: {
        type: Date,
        default: Date.now(),
    },

    channelId: {
        type:mongoose.Schema.Types.ObjectId,
        ref: "Channels",
        required: false,
    },

    readBy: {
        type: [mongoose.Schema.Types.ObjectId],
        default: [],
    },
        
});


messageSchema.pre('save', async function (next) {
    this.timeStamp = Date.now();
    next();   
});

const Message = mongoose.model("Messages", messageSchema);

export default Message;
