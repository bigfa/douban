import { Context } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchDoubanObjects } from "../api";
import { DoubanSubject } from "../models";
import { syncServices } from "./syncServices";

vi.mock("../api", () => {
    return {
        fetchDoubanObjects: vi.fn(),
    };
});

vi.mock("../models", () => {
    return {
        DoubanSubject: {
            findOne: vi.fn(),
            create: vi.fn(),
            updateOne: vi.fn(),
        },
    };
});

describe("syncServices", () => {
    const context = {
        json: vi.fn(),
    } as unknown as Context;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("stops early when same status already exists", async () => {
        vi.mocked(fetchDoubanObjects).mockResolvedValue(
            new Response(
                JSON.stringify({
                    interests: [
                        {
                            create_time: "2026-01-01",
                            status: "done",
                            subject: {
                                id: "1",
                                title: "Movie",
                                card_subtitle: "",
                                rating: { value: "8.1" },
                                url: "https://douban/item/1",
                                pic: { large: "https://img/1.jpg" },
                                year: "2026",
                            },
                        },
                    ],
                })
            )
        );

        vi.mocked(DoubanSubject.findOne).mockResolvedValue({
            status: "done",
        } as never);

        await syncServices(context, "movie", "done");

        expect(fetchDoubanObjects).toHaveBeenCalledTimes(1);
        expect(DoubanSubject.create).not.toHaveBeenCalled();
        expect(DoubanSubject.updateOne).not.toHaveBeenCalled();
    });

    it("creates records and keeps paging until no interests", async () => {
        vi.mocked(fetchDoubanObjects)
            .mockResolvedValueOnce(
                new Response(
                    JSON.stringify({
                        interests: [
                            {
                                create_time: "2026-01-01",
                                status: "doing",
                                subject: {
                                    id: "2",
                                    title: "Book",
                                    card_subtitle: "subtitle",
                                    rating: { value: "7.9" },
                                    url: "https://douban/item/2",
                                    pic: { large: "https://img/2.jpg" },
                                    pubdate: ["2025-08-01"],
                                    year: "2025",
                                },
                            },
                        ],
                    })
                )
            )
            .mockResolvedValueOnce(
                new Response(
                    JSON.stringify({
                        interests: [],
                    })
                )
            );

        vi.mocked(DoubanSubject.findOne).mockResolvedValue(null);

        await syncServices(context, "book", "doing");

        expect(fetchDoubanObjects).toHaveBeenNthCalledWith(
            1,
            expect.any(String),
            "book",
            "doing",
            0
        );
        expect(fetchDoubanObjects).toHaveBeenNthCalledWith(
            2,
            expect.any(String),
            "book",
            "doing",
            1
        );
        expect(DoubanSubject.create).toHaveBeenCalledTimes(1);
    });
});
