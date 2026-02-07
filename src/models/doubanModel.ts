import { Model, model, models, Schema } from "mongoose";

export interface DoubanSubjectRecord {
    subject_id: string;
    name: string;
    card_subtitle: string;
    create_time: Date | null;
    douban_score: string;
    link: string;
    type: string;
    poster: string;
    pubdate: string;
    year: string;
    status: string | null;
}

const doubanSchema = new Schema<DoubanSubjectRecord>(
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

export const DoubanSubject: Model<DoubanSubjectRecord> =
    (models.DoubanSubject as Model<DoubanSubjectRecord>) ||
    model<DoubanSubjectRecord>("DoubanSubject", doubanSchema);
