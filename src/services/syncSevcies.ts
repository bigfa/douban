import { Context } from "hono";
import { DoubanSubject } from "../models";
import { DBID } from "../enviroments";
import { fetchDoubanObjects } from "../api";
import { ObjectTypes, ObjectStatus } from "../types";

export const syncSevices = async (
    c: Context,
    type: ObjectTypes,
    status: ObjectStatus
) => {
    console.log("syncing", type, status);
    let confition: boolean = true,
        i: number = 0;
    while (confition) {
        const res: any = await fetchDoubanObjects(DBID, type, status, i);
        let data: any = await res.json();
        const interets = data.interests;
        if (interets.length === 0) {
            confition = false;
            console.log("No more data");
        } else {
            for (let interet of interets) {
                try {
                    const dbobject = await DoubanSubject.findOne({
                        subject_id: interet.subject.id,
                        type: type,
                    });

                    if (!dbobject) {
                        console.log(
                            interet.subject.id,
                            interet.subject.title,
                            interet.subject.card_subtitle,
                            interet.create_time,
                            interet.subject.rating.value,
                            interet.subject.url,
                            interet.subject.pubdate
                                ? interet.subject.pubdate[0]
                                : "",
                            interet.subject.year,
                            type,
                            interet.status
                        );
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
                            poster: interet.subject.pic.large,
                            pubdate: interet.subject.pubdate
                                ? interet.subject.pubdate[0]
                                : "",
                            year: interet.subject.year,
                            status: interet.status,
                        });
                    } else {
                        if (dbobject.status != interet.status) {
                            await DoubanSubject.updateOne(
                                {
                                    subject_id: interet.subject.id,
                                    type: type,
                                },
                                {
                                    status: interet.status,
                                    create_time: interet.create_time,
                                }
                            );
                        } else {
                            console.log("no new data");
                            confition = false;
                            break;
                        }
                    }
                } catch (e) {
                    console.log(e);
                    return c.json({ err: e });
                }
            }
            i++;
        }
    }
};
