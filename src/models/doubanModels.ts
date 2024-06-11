import { Document, Schema, model } from "mongoose";

interface IDoubanSubject {
    subject_id: string;
    name: string;
    card_subtitle: string;
    create_time: any;
    douban_score: string;
    link: string;
    type: string;
    poster: string;
    pubdate: string;
    year: string;
    status: string;
}

const doubanSchema = new Schema<IDoubanSubject>(
    {
        subject_id: { type: String, required: true },
        name: { type: String, required: true },
        card_subtitle: { type: String, required: false },
        create_time: { type: Date, required: false },
        douban_score: { type: String, required: false },
        link: { type: String, required: true },
        type: { type: String, required: true },
        poster: { type: String, required: false },
        pubdate: { type: String, required: false },
        year: { type: String, required: false },
        status: { type: String, required: false },
    },
    {
        timestamps: true,
    }
);

export const DoubanSubject = model("DoubanSubject", doubanSchema);
