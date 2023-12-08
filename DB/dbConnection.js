import mongoose from "mongoose";

export const dbConnection = async () => {
    return await mongoose.connect(process.env.url_local).then(() => {
        console.log(`db connection successfully on ${process.env.url_local} ........ `);
    }).catch((error) => {
        console.log(error);
        console.log("db connection failed ********");
    })
}

mongoose.set('strictQuery', true);