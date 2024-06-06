import { Context } from "hono";
import { DoubanSubject } from "../models";
import { dbRequest } from "../utils";
import { fetchDoubanObject, fetchDoubanObjects } from "../api";
import { ObjectTypes, ObjectStatus } from "../types";
import fs from "fs";
import { resolve } from "path";
import { mkdirpSync, pathExistsSync } from "fs-extra";

export const getObjects = async (c: Context) => {
    const type: ObjectTypes = (c.req.query("type") as ObjectTypes) || "movie";
    const paged: number = parseInt(c.req.query("paged") || "1");
    const status: ObjectStatus =
        (c.req.query("status") as ObjectStatus) || "done";
    console.log(status);
    // find by type and paged
    const objects = await DoubanSubject.find({
        type: type,
        status: status,
    })
        .sort({ douban_score: -1 })
        .skip((paged - 1) * 20)
        .limit(20);

    console.log(objects);

    const results = objects.map((movie: any) => {
        movie.poster = movie.poster
            ? `${c.env.R2DOMAIN}/${type}/${movie.subject_id}.jpg`
            : `${c.env.WOKRERDOMAIN}/${type}/${movie.subject_id}.jpg`;
        return movie;
    });

    return c.json({ results });
};

export const initDB = async (c: Context) => {
    const paged: number = parseInt(c.req.query("paged") || "0");
    const type: ObjectTypes = (c.req.query("type") as ObjectTypes) || "movie";
    const status: ObjectStatus =
        (c.req.query("status") as ObjectStatus) || "done";
    console.log(paged);

    const res: any = await fetchDoubanObjects(54529369, type, status, paged);
    let data: any = await res.json();
    const interets = data.interests;
    console.log(type, status, interets.length, paged);
    if (interets.length === 0) {
        return c.text("No more data");
    } else {
        for (let interet of interets) {
            try {
                console.log(
                    interet.subject.id,
                    interet.subject.title,
                    interet.subject.card_subtitle,
                    interet.create_time,
                    interet.subject.rating.value,
                    interet.subject.url,
                    interet.subject.pubdate ? interet.subject.pubdate[0] : "",
                    interet.subject.year,
                    type
                );
                // 过滤无法显示的内容
                if (
                    interet.subject.title == "未知电视剧" ||
                    interet.subject.title == "未知电影"
                )
                    continue;

                await DoubanSubject.create({
                    subject_id: interet.subject.id,
                    name: interet.subject.title,
                    card_subtitle: interet.subject.card_subtitle,
                    create_time: interet.create_time,
                    douban_score: interet.subject.rating.value,
                    link: interet.subject.url,
                    type: type,
                    poster: "",
                    pubdate: interet.subject.pubdate
                        ? interet.subject.pubdate[0]
                        : "",
                    year: interet.subject.year,
                    status: status,
                });

                // await c.env.DB.prepare(
                //     "INSERT INTO douban_objects (subject_id, name , card_subtitle, create_time, douban_score,link,type ,status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
                // )
                //     .bind(
                //         interet.subject.id,
                //         interet.subject.title,
                //         interet.subject.card_subtitle,
                //         interet.create_time,
                //         interet.subject.rating.value,
                //         interet.subject.url,
                //         type,
                //         interet.status
                //     )
                //     .run();
            } catch (e) {
                console.log(e);
                return c.json({ err: e }, 500);
            }
        }
    }

    return c.text("Synced");
};

export const fetchDBPoster = async (c: Context) => {
    // get url from query
    const type: ObjectTypes = (c.req.param("type") as ObjectTypes) || "movie";
    console.log(c.req.query("type"));
    // remove .jpg
    const id = c.req.param("id").replace(".jpg", "");

    if (!id) {
        return c.text("ID not found");
    }

    const ROOT_PATH = process.cwd();

    const STATIC_DIR: string = resolve(ROOT_PATH, "static");

    const staticDir = `${STATIC_DIR}/${type}`;

    // make folder if not exist

    if (!pathExistsSync(staticDir)) {
        mkdirpSync(staticDir);
    }

    const key = "/" + id + ".jpg";

    // get file from ./static if not fold create one
    let object: any = null;
    try {
        object = fs.readFileSync(`${staticDir}/${key}`);

        // return stream object

        // const objheaders = new Headers();
        // object.writeHttpMetadata(objheaders);
        // objheaders.set("etag", object.httpEtag);

        return new Response(Buffer.from(object), {
            headers: {
                "Content-Type": "image/jpeg",
                "Cache-Control": "max-age=31536000",
                ETag: object.httpEtag,
            },
        });
    } catch (e) {
        const d: any = await fetchDoubanObject(type, id);
        const data = await d.json();
        console.log(data);
        const poster = data.pic.large;

        // download douban image and upload to bucket
        const res = await dbRequest(poster);

        // check if error code: 522
        if (res.status === 522) {
            return c.text("Error 522");
        }

        const dbobject = await DoubanSubject.findOne({
            subject_id: id,
            type: type,
        });

        if (dbobject === null) {
            return c.text("Not found");
        }

        // update poster to db

        await DoubanSubject.updateOne(
            { subject_id: id, type: type },
            { poster: `${c.env.WOKRERDOMAIN}/${type}/${id}.jpg` }
        );

        const buffer = await res.arrayBuffer();
        fs.writeFileSync(`${staticDir}/${key}`, Buffer.from(buffer));

        object = fs.readFileSync(`${staticDir}/${key}`);

        return new Response(Buffer.from(object), {
            headers: {
                "Content-Type": "image/jpeg",
                "Cache-Control": "max-age=31536000",
                ETag: object.httpEtag,
            },
        });
    }
};

export const fetchDBObject = async (c: Context) => {
    const type: ObjectTypes = (c.req.param("type") as ObjectTypes) || "movie";
    const id = c.req.param("id");
    // @ts-ignore
    let object = await DoubanSubject.findOne({ subject_id: id, type: type });

    console.log(object);

    if (object === null) {
        const d: any = await fetchDoubanObject(type, id);
        const data = await d.json();

        await DoubanSubject.create({
            subject_id: data.id,
            name: data.title,
            card_subtitle: data.card_subtitle,
            create_time: new Date(),
            douban_score: data.rating.value,
            link: data.url,
            type: type,
            poster: "",
            pubdate: data.pubdate ? data.pubdate[0] : "",
            year: data.year,
            status: "done",
        });

        object = await DoubanSubject.findOne({ subject_id: id, type: type });

        if (object === null) {
            return c.text("Not found");
        }

        object.poster = `${c.env.WOKRERDOMAIN}/${type}/${id}.jpg`;

        return c.json(object);
    } else {
        if (!object.poster) {
            object.poster = `${c.env.WOKRERDOMAIN}/${type}/${id}.jpg`;
        } else {
            object.poster = `${c.env.R2DOMAIN}/${object.poster}`;
        }
        return c.json(object);
    }
};
