import fs from "fs";
import { resolve } from "path";
import { mkdirpSync, pathExistsSync } from "fs-extra";
import { fetchDoubanObject } from "../api";
import { DOMAIN } from "../environments";
import { DoubanSubject } from "../models";
import { DoubanSubjectPayload, ObjectStatus, ObjectTypes } from "../types";
import { dbRequest } from "../utils";

const getStaticDir = (type: string): string => {
    const rootPath = process.cwd();
    return resolve(rootPath, "static", type);
};

const toFilePath = (type: string, key: string): string => {
    const normalizedKey = key.startsWith("/") ? key.slice(1) : key;
    return `${getStaticDir(type)}/${normalizedKey}`;
};

const toCoverKey = (subjectId: string): string => `/${subjectId}.jpg`;

const toLocalSubjectPosterURL = (type: ObjectTypes, id: string): string =>
    `${DOMAIN}/${type}/${id}.jpg`;

const toLocalStaticPosterURL = (type: ObjectTypes, id: string): string =>
    `${DOMAIN}/static/${type}/${id}.jpg`;

const parseJSON = async <T>(response: Response): Promise<T> => {
    return (await response.json()) as T;
};

export const checkFolder = (type: string): void => {
    const staticDir = getStaticDir(type);

    if (!pathExistsSync(staticDir)) {
        mkdirpSync(staticDir);
    }
};

export const getCoverFromLocal = async (
    type: ObjectTypes,
    id: string
): Promise<Buffer> => {
    checkFolder(type);

    const coverKey = toCoverKey(id);
    const filePath = toFilePath(type, coverKey);

    try {
        return fs.readFileSync(filePath);
    } catch {
        const result = await fetchDoubanObject(type, id);
        const data = await parseJSON<DoubanSubjectPayload>(result);
        const poster = data.pic.large;
        await downloadCover(type, coverKey, poster);

        return fs.readFileSync(filePath);
    }
};

export const downloadCover = async (
    type: string,
    key: string,
    poster: string
): Promise<void | "Error 522"> => {
    const filePath = toFilePath(type, key);

    if (fs.existsSync(filePath)) {
        return;
    }

    const response = await dbRequest(poster);
    if (response.status === 522) {
        return "Error 522";
    }

    const buffer = await response.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(buffer));
};

export const getDoubanSubject = async (id: string, type: ObjectTypes) => {
    let object = await DoubanSubject.findOne({ subject_id: id, type });

    if (object === null) {
        const result = await fetchDoubanObject(type, id);
        const data = await parseJSON<DoubanSubjectPayload>(result);

        await DoubanSubject.create({
            subject_id: data.id,
            name: data.title,
            card_subtitle: data.card_subtitle,
            create_time: null,
            douban_score: data.rating.value,
            link: data.url,
            type,
            poster: data.pic.large,
            pubdate: data.pubdate ? data.pubdate[0] : "",
            year: data.year,
            status: null,
        });

        object = await DoubanSubject.findOne({ subject_id: id, type });
        if (object === null) {
            return {
                error: "object not found",
            };
        }

        object.poster = toLocalSubjectPosterURL(type, id);
    } else {
        object.poster = toLocalSubjectPosterURL(type, id);
    }

    checkFolder(type);
    await downloadCover(type, toCoverKey(object.subject_id), object.poster);

    return object;
};

export const getDoubanSubjects = async (
    type: ObjectTypes,
    status: ObjectStatus,
    paged: number
) => {
    const objects = await DoubanSubject.find({
        type,
        status,
    })
        .sort({ create_time: -1 })
        .skip((paged - 1) * 20)
        .limit(20);

    checkFolder(type);

    for (const object of objects) {
        await downloadCover(type, toCoverKey(object.subject_id), object.poster);
    }

    for (const object of objects) {
        object.poster = toLocalStaticPosterURL(type, object.subject_id);
    }

    return objects;
};
