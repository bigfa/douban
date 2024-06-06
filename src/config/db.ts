import * as mongoose from "mongoose";

const connectDB = async () => {
    console.log("Connecting to MongoDB...");
    try {
        // if (process.env.MONGO_URI !== undefined) {
        const conn = await mongoose.connect(
            "mongodb://localhost:27017/fatesinger",
            {
                autoIndex: true,
            }
        );

        console.log(`MongoDB Connected: ${conn.connection.host}`);
        // }
    } catch (err: any) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
    }
};

export default connectDB;
