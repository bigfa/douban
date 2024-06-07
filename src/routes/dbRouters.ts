import { Hono } from "hono";
import { cors } from "hono/cors";
import { douban, doubanSync } from "../controllers";

const db = new Hono();
db.get(
    "/list",
    cors({
        origin: "*",
    }),
    (c) => douban.getObjects(c)
);

db.get("/:type/:id{.+\\.jpg$}", (c) => douban.fetchDBPoster(c));

// fetch single item
db.get("/:type/:id", (c) => douban.fetchDBObject(c));

db.get("/sync", (c) => doubanSync.sync(c));

export default db;
