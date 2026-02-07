import { Hono } from "hono";
import { cors } from "hono/cors";
import { douban, doubanSync } from "../controllers";

const doubanRouter = new Hono();

doubanRouter.get(
    "/list",
    cors({
        origin: "*",
    }),
    (c) => douban.getObjects(c)
);

doubanRouter.get("/:type/:id{.+\\.jpg$}", (c) => douban.fetchDBPoster(c));
doubanRouter.get("/:type/:id", (c) => douban.fetchDBObject(c));
doubanRouter.get("/sync", (c) => doubanSync.sync(c));

export default doubanRouter;
