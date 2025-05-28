//here we prepare some invitation codes. Inactive.
import Code from "../models/CodeModel.js";

const newCodes = async () => {
    console.log('sss');
    try {
        let text1 = "hello1";
        let counter1 = 1;
        const code = await Code.create({text1, counter1});

    } catch(error) {
        console.log(error);
    }
}

export default newCodes;