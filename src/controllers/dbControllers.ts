import { Context } from "hono";
import { ObjectTypes, ObjectStatus } from "../types";
import {
    getDoubanSubject,
    getDoubanSubjects,
    getCoverFromLocal,
} from "../services";

export const getObjects = async (c: Context) => {
    const type: ObjectTypes = (c.req.query("type") as ObjectTypes) || "movie";
    const paged: number = parseInt(c.req.query("paged") || "1");
    const status: ObjectStatus =
        (c.req.query("status") as ObjectStatus) || "done";
    const objects = await getDoubanSubjects(type, status, paged);
    return c.json({ results: objects });
};

export const fetchDBPoster = async (c: Context) => {
    const type: ObjectTypes = (c.req.param("type") as ObjectTypes) || "movie";
    const id = c.req.param("id").replace(".jpg", "");

    if (!id) {
        return c.text("ID not found");
    }

    const object = await getCoverFromLocal(type, id);
    return new Response(Buffer.from(object), {
        headers: {
            "Content-Type": "image/jpeg",
            "Cache-Control": "max-age=31536000",
            ETag: object.httpEtag,
        },
    });
};

export const fetchDBObject = async (c: Context) => {
    const type: ObjectTypes = (c.req.param("type") as ObjectTypes) || "movie";
    const id = c.req.param("id");
    console.log(id);
    let object = await getDoubanSubject(id, type);
    console.log(object);
    return c.json(object);
};
