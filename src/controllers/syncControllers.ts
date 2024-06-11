import { Context } from "hono";
import { ObjectTypes, ObjectStatus } from "../types";
import { syncSevices } from "../services";

export const sync = async (c: Context) => {
    const TYPES: string = c.req.query("types") || "movie";
    const STATUSES: string = c.req.query("statuses") || "done,mark,doing";

    const typeList: Array<ObjectTypes> = TYPES.split(",").map(
        (status: string) => status as ObjectTypes
    );

    const statusList: Array<ObjectStatus> = STATUSES.split(",").map(
        (status: string) => status as ObjectStatus
    );

    for (let type of typeList) {
        for (let status of statusList) {
            await syncSevices(c, type, status);
        }
    }

    return c.text("finish sync");
};
