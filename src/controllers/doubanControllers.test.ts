import { Hono } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchDBObject, fetchDBPoster, getObjects } from "./doubanControllers";
import {
    getCoverFromLocal,
    getDoubanSubject,
    getDoubanSubjects,
} from "../services";

vi.mock("../services", () => {
    return {
        getDoubanSubjects: vi.fn(),
        getDoubanSubject: vi.fn(),
        getCoverFromLocal: vi.fn(),
    };
});

describe("doubanControllers", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("parses default query values for /list", async () => {
        vi.mocked(getDoubanSubjects).mockResolvedValue([]);

        const app = new Hono();
        app.get("/list", (c) => getObjects(c));

        const response = await app.request("http://localhost/list");
        const body = await response.json();

        expect(getDoubanSubjects).toHaveBeenCalledWith("movie", "done", 1);
        expect(body).toEqual({ results: [] });
    });

    it("returns object payload for /:type/:id", async () => {
        const result = { subject_id: "123", type: "book", name: "name" };
        vi.mocked(getDoubanSubject).mockResolvedValue(result as never);

        const app = new Hono();
        app.get("/:type/:id", (c) => fetchDBObject(c));

        const response = await app.request("http://localhost/book/123");
        const body = await response.json();

        expect(getDoubanSubject).toHaveBeenCalledWith("123", "book");
        expect(body).toEqual(result);
    });

    it("returns image response for /:type/:id.jpg", async () => {
        vi.mocked(getCoverFromLocal).mockResolvedValue(Buffer.from("img"));

        const app = new Hono();
        app.get("/:type/:id{.+\\.jpg$}", (c) => fetchDBPoster(c));

        const response = await app.request("http://localhost/movie/123.jpg");
        const body = Buffer.from(await response.arrayBuffer()).toString("utf-8");

        expect(getCoverFromLocal).toHaveBeenCalledWith("movie", "123");
        expect(response.headers.get("Content-Type")).toBe("image/jpeg");
        expect(response.headers.get("Cache-Control")).toBe("max-age=31536000");
        expect(response.headers.get("ETag")).toBeTruthy();
        expect(body).toBe("img");
    });
});
