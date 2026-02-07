import { Context } from "hono";
import { ObjectTypes, ObjectStatus } from "../types";
import { syncServices } from "../services";

export const sync = async (c: Context) => {
    const TYPES = c.req.query("types") || "movie,book,music,game,drama";
    const STATUSES = c.req.query("statuses") || "done,mark,doing";

    const typeList: ObjectTypes[] = TYPES.split(",").map(
        (item: string) => item as ObjectTypes
    );

    const statusList: ObjectStatus[] = STATUSES.split(",").map(
        (item: string) => item as ObjectStatus
    );

    for (const type of typeList) {
        for (const status of statusList) {
            await syncServices(c, type, status);
        }
    }

    return c.text("finish sync");
};
