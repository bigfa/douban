import { Connection } from "mongoose";
import "tsconfig-paths/register";

import { MemosItem, memoSchema } from "../../src/models/memos";

export default {
    async up(mongoose: Connection) {
        const model = mongoose.model("MemosItem", memoSchema);
        return await model.insertMany([
            {
                post_title: "webhook",
            },
        ]);
    },
};
