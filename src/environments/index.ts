import dotenv from "dotenv";

dotenv.config({ quiet: true });

export const DBID: string = process.env.DBID || "54529369";
export const DB_NAME: string = process.env.DB_NAME || "douban";
export const DOMAIN: string = process.env.DOMAIN || "http://localhost:3000";
export const MONGO_URI: string =
    process.env.MONGO_URI || "mongodb://localhost:27017/douban";
export const PORT: number = Number.parseInt(process.env.PORT || "3000", 10);
export const API_BASE: string = process.env.API_BASE || "/";
