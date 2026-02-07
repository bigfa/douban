import { createHash } from "crypto";
import { Context } from "hono";
import { getCoverFromLocal, getDoubanSubject, getDoubanSubjects } from "../services";
import { ObjectStatus, ObjectTypes } from "../types";

export const getObjects = async (c: Context) => {
    const type = (c.req.query("type") as ObjectTypes) || "movie";
    const paged = Number.parseInt(c.req.query("paged") || "1", 10);
    const status = (c.req.query("status") as ObjectStatus) || "done";

    const objects = await getDoubanSubjects(type, status, paged);
    return c.json({ results: objects });
};

export const fetchDBPoster = async (c: Context) => {
    const type = (c.req.param("type") as ObjectTypes) || "movie";
    const id = c.req.param("id").replace(".jpg", "");

    if (!id) {
        return c.text("ID not found");
    }

    const imageBuffer = await getCoverFromLocal(type, id);
    const etag = createHash("sha1").update(imageBuffer).digest("hex");

    return new Response(imageBuffer, {
        headers: {
            "Content-Type": "image/jpeg",
            "Cache-Control": "max-age=31536000",
            ETag: etag,
        },
    });
};

export const fetchDBObject = async (c: Context) => {
    const type = (c.req.param("type") as ObjectTypes) || "movie";
    const id = c.req.param("id");

    const object = await getDoubanSubject(id, type);
    return c.json(object);
};
