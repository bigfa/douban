import { beforeEach, describe, expect, it, vi } from "vitest";
import { createApp } from "./app";
import { getDoubanSubject, getDoubanSubjects } from "./services";

vi.mock("./services", () => {
    return {
        getDoubanSubjects: vi.fn(),
        getDoubanSubject: vi.fn(),
        getCoverFromLocal: vi.fn(),
        syncServices: vi.fn(),
    };
});

describe("API contract", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("keeps /list response wrapper and item keys", async () => {
        vi.mocked(getDoubanSubjects).mockResolvedValue([
            {
                subject_id: "100",
                name: "Movie",
                card_subtitle: "subtitle",
                create_time: "2026-01-01",
                douban_score: "8.8",
                link: "https://douban/item/100",
                type: "movie",
                poster: "https://img/100.jpg",
                pubdate: "2026-01-01",
                year: "2026",
                status: "done",
            },
        ] as never);

        const app = createApp();
        const response = await app.request("http://localhost/list");
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body).toHaveProperty("results");
        expect(Array.isArray(body.results)).toBe(true);
        expect(body.results[0]).toMatchObject({
            subject_id: expect.any(String),
            name: expect.any(String),
            type: expect.any(String),
            poster: expect.any(String),
            status: expect.any(String),
        });
    });

    it("keeps /:type/:id object keys", async () => {
        vi.mocked(getDoubanSubject).mockResolvedValue({
            subject_id: "101",
            name: "Book",
            card_subtitle: "subtitle",
            create_time: "2026-01-01",
            douban_score: "7.0",
            link: "https://douban/item/101",
            type: "book",
            poster: "https://img/101.jpg",
            pubdate: "2025-10-01",
            year: "2025",
            status: "mark",
        } as never);

        const app = createApp();
        const response = await app.request("http://localhost/book/101");
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body).toMatchObject({
            subject_id: expect.any(String),
            name: expect.any(String),
            card_subtitle: expect.any(String),
            create_time: expect.any(String),
            douban_score: expect.any(String),
            link: expect.any(String),
            type: expect.any(String),
            poster: expect.any(String),
            pubdate: expect.any(String),
            year: expect.any(String),
            status: expect.any(String),
        });
    });
});
