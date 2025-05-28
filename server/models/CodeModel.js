import mongoose, { mongo } from "mongoose";

const codeSchema = new mongoose.Schema({

    text: {
        type: String,
        required: true,
        },
    counter: {
        type: Number,
        default: 1,
        required: true,
    }
       
});


const Code = mongoose.model("Codes", codeSchema);

export default Code;