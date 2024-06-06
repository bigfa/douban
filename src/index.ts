import { serve } from "@hono/node-server";
import { Hono } from "hono";
import connectDB from "./config/db";
import db from "./routes/dbRouters";
import { user } from "./controllers";
import { errorHandler, notFound } from "./middlewares";
import { serveStatic } from "@hono/node-server/serve-static";

const app = new Hono();
connectDB();
app.use("/static/*", serveStatic({ root: "./" }));

app.get("/", (c) => {
    return c.text("Hello Hono!");
});

app.get("/users", (c) => user.getUsers(c));
app.get("/create", (c) => user.createUser(c));

app.route("/", db);

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
const port = 3000;
console.log(`Server is runnings on port ${port}`);

serve({
    fetch: app.fetch,
    port,
});
