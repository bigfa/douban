import { Context } from "hono";
import { fetchDoubanObjects } from "../api";
import { DBID } from "../environments";
import { DoubanSubject } from "../models";
import {
    DoubanInterestPayload,
    DoubanInterestsResponse,
    ObjectStatus,
    ObjectTypes,
} from "../types";

const shouldSkipSubject = (interest: DoubanInterestPayload): boolean => {
    return (
        interest.subject.title === "未知电视剧" ||
        interest.subject.title === "未知电影"
    );
};

export const syncServices = async (
    c: Context,
    type: ObjectTypes,
    status: ObjectStatus
): Promise<Response | void> => {
    let hasMore = true;
    let page = 0;

    while (hasMore) {
        const response = await fetchDoubanObjects(DBID, type, status, page);
        const data = (await response.json()) as DoubanInterestsResponse;
        const interests = data.interests;

        if (!interests || interests.length === 0) {
            hasMore = false;
            continue;
        }

        for (const interest of interests) {
            try {
                const dbObject = await DoubanSubject.findOne({
                    subject_id: interest.subject.id,
                    type,
                });

                if (!dbObject) {
                    if (shouldSkipSubject(interest)) {
                        continue;
                    }

                    await DoubanSubject.create({
                        subject_id: interest.subject.id,
                        name: interest.subject.title,
                        card_subtitle: interest.subject.card_subtitle,
                        create_time: interest.create_time,
                        douban_score: interest.subject.rating.value,
                        link: interest.subject.url,
                        type,
                        poster: interest.subject.pic.large,
                        pubdate: interest.subject.pubdate
                            ? interest.subject.pubdate[0]
                            : "",
                        year: interest.subject.year,
                        status: interest.status,
                    });
                    continue;
                }

                if (dbObject.status !== interest.status) {
                    await DoubanSubject.updateOne(
                        {
                            subject_id: interest.subject.id,
                            type,
                        },
                        {
                            status: interest.status,
                            create_time: interest.create_time,
                        }
                    );
                } else {
                    hasMore = false;
                    break;
                }
            } catch (error) {
                return c.json({ err: error });
            }
        }

        page++;
    }
};

// Backward-compatible alias for old typo export.
export const syncSevices = syncServices;
