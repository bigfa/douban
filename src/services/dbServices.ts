import { dbRequest } from "../utils";
import fs from "fs";

export const downloadCover = async (
    staticDir: string,
    key: string,
    poster: string
) => {
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
