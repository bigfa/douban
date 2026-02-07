import { serve } from "@hono/node-server";
import { createApp } from "./app";
import connectDB from "./config/db";
import { PORT } from "./environments";

const app = createApp();

connectDB();

console.log(`Server is runnings on port ${PORT}`);

serve({
    fetch: app.fetch,
    port: PORT,
});
