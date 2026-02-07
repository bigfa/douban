import * as mongoose from "mongoose";
import { MONGO_URI } from "../environments";

const connectDB = async () => {
    console.log("Connecting to MongoDB...");
    try {
        const conn = await mongoose.connect(MONGO_URI, {
            autoIndex: true,
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Unknown MongoDB error";
        console.error(`Error: ${message}`);
        process.exit(1);
    }
};

export default connectDB;
