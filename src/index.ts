import { serve } from "@hono/node-server";
import { Hono } from "hono";
import connectDB from "./config/db";
import dbRouter from "./routes/dbRouters";
import { errorHandler, notFound } from "./middlewares";
import { serveStatic } from "@hono/node-server/serve-static";
import { PORT } from "./enviroments";
import * as dotenv from "dotenv";

dotenv.config();
const app = new Hono();
connectDB();
app.use("/static/*", serveStatic({ root: "./" }));

app.get("/", (c) => {
    return c.text("Hello Hono!");
});

app.route("/api", dbRouter);

// Error Handler
app.onError((err, c) => {
    const error = errorHandler(c);
    return error;
});

// Not Found Handler
app.notFound((c) => {
    const error = notFound(c);
    return error;
});

console.log(`Server is runnings on port ${PORT}`);

serve({
    fetch: app.fetch,
    port: PORT,
});
