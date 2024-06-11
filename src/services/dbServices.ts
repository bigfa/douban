import { dbRequest } from "../utils";
import fs from "fs";
import { ObjectTypes, ObjectStatus } from "../types";
import { DoubanSubject } from "../models";
import { DOMAIN } from "../enviroments";
import { fetchDoubanObject } from "../api";
import { mkdirpSync, pathExistsSync } from "fs-extra";
import { resolve } from "path";

export const checkFolder = (type: string) => {
    const ROOT_PATH = process.cwd();

    const STATIC_DIR: string = resolve(ROOT_PATH, "static");

    const staticDir = `${STATIC_DIR}/${type}`;

    if (!pathExistsSync(staticDir)) {
        mkdirpSync(staticDir);
    }
};

export const getCoverFromLocal = async (type: ObjectTypes, id: string) => {
    const ROOT_PATH = process.cwd();

    const STATIC_DIR: string = resolve(ROOT_PATH, "static");

    const staticDir = `${STATIC_DIR}/${type}`;

    checkFolder(type);

    const key = "/" + id + ".jpg";
    let object: any = null;
    try {
        object = fs.readFileSync(`${staticDir}/${key}`);
    } catch (e) {
        const result: any = await fetchDoubanObject(type, id);
        const data = await result.json();
        const poster = data.pic.large;
        await downloadCover(type, key, poster);
        object = fs.readFileSync(`${staticDir}/${key}`);
    }
    return object;
};

export const downloadCover = async (
    type: string,
    key: string,
    poster: string
) => {
    const ROOT_PATH = process.cwd();
    const STATIC_DIR: string = resolve(ROOT_PATH, "static");
    const staticDir = `${STATIC_DIR}/${type}`;
    try {
        const obj = fs.readFileSync(`${staticDir}/${key}`);
        if (!obj) {
            const res = await dbRequest(poster);
            if (res.status === 522) {
                return "Error 522";
            }

            const buffer = await res.arrayBuffer();
            fs.writeFileSync(`${staticDir}/${key}`, Buffer.from(buffer));
            console.log("file not exist");
        } else {
            console.log("file exist");
        }
    } catch (e) {
        const res = await dbRequest(poster);
        if (res.status === 522) {
            return "Error 522";
        }

        const buffer = await res.arrayBuffer();
        fs.writeFileSync(`${staticDir}/${key}`, Buffer.from(buffer));
    }
};

export const getDoubanSubject = async (id: string, type: ObjectTypes) => {
    let object = await DoubanSubject.findOne({ subject_id: id, type: type });
    if (object === null) {
        const result: any = await fetchDoubanObject(type, id);
        const data = await result.json();
        await DoubanSubject.create({
            subject_id: data.id,
            name: data.title,
            card_subtitle: data.card_subtitle,
            create_time: null,
            douban_score: data.rating.value,
            link: data.url,
            type: type,
            poster: data.pic.large,
            pubdate: data.pubdate ? data.pubdate[0] : "",
            year: data.year,
            status: null,
        });
        console.log("create new object");
        object = await DoubanSubject.findOne({ subject_id: id, type: type });
        if (object === null) {
            return {
                error: "object not found",
            };
        }
        object.poster = `${DOMAIN}/${type}/${id}.jpg`;
    } else {
        object.poster = `${DOMAIN}/${type}/${id}.jpg`;
    }
    checkFolder(type);
    const key = "/" + object.subject_id + ".jpg";
    await downloadCover(type, key, object.poster);
    console.log(object);

    return object;
};

export const getDoubanSubjects = async (
    type: ObjectTypes,
    status: ObjectStatus,
    paged: number
) => {
    const objects = await DoubanSubject.find({
        type: type,
        status: status,
    })
        .sort({ create_time: -1 })
        .skip((paged - 1) * 20)
        .limit(20);

    checkFolder(type);

    // download all cover

    for (let object of objects) {
        const key = "/" + object.subject_id + ".jpg";
        await downloadCover(type, key, object.poster);
    }

    // update poster url to local cover

    for (let object of objects) {
        object.poster = `${DOMAIN}/static/${type}/${object.subject_id}.jpg`;
    }

    return objects;
};
