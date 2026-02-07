import { dbRequest } from "../utils";
import { ObjectTypes, ObjectStatus } from "../types";

export const fetchDoubanObject = async (
    type: ObjectTypes,
    id: string
): Promise<Response> => {
    return dbRequest(`https://frodo.douban.com/api/v2/${type}/${id}`);
};

export const fetchDoubanObjects = async (
    dbid: string,
    type: ObjectTypes,
    status: ObjectStatus,
    paged: number
): Promise<Response> => {
    return dbRequest(
        `https://frodo.douban.com/api/v2/user/${dbid}/interests`,
        {
            count: 50,
            start: 50 * paged,
            type,
            status,
        }
    );
};
