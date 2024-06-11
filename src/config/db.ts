import * as mongoose from "mongoose";
import { MONGO_URI } from "../enviroments";
const connectDB = async () => {
    console.log("Connecting to MongoDB...");
    try {
        console.log(MONGO_URI);
        // if (process.env.MONGO_URI !== undefined) {
        const conn = await mongoose.connect(MONGO_URI as string, {
            autoIndex: true,
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
        // }
    } catch (err: any) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
    }
};

export default connectDB;
