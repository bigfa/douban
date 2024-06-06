import { Document, Schema, model } from "mongoose";

interface IMemosItem {
    post_title: string;
    post_id: string;
    post_date: string;
    post_author: string;
    post_url: string;
}

export const memoSchema = new Schema<IMemosItem>(
    {
        post_title: { type: String, required: true },
        post_id: { type: String, required: true },
        post_date: { type: String, required: true },
        post_author: { type: String, required: true },
        post_url: { type: String, required: true },
    },
    {
        timestamps: true,
    }
);

export const MemosItem = model("MemosItem", memoSchema);
