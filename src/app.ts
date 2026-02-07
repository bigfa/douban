import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { API_BASE } from "./environments";
import { errorHandler, notFound } from "./middlewares";
import doubanRouter from "./routes/doubanRouter";

export const createApp = (): Hono => {
    const app = new Hono();

    app.use("/static/*", serveStatic({ root: "./" }));

    app.get("/", (c) => {
        return c.text("Hello Hono!");
    });

    app.route(API_BASE, doubanRouter);

    app.onError((error, c) => {
        return errorHandler(c, error);
    });

    app.notFound((c) => {
        return notFound(c);
    });

    return app;
};
