import fs from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchDoubanObject } from "../api";
import { DOMAIN } from "../environments";
import { DoubanSubject } from "../models";
import { dbRequest } from "../utils";
import {
    checkFolder,
    downloadCover,
    getCoverFromLocal,
    getDoubanSubject,
    getDoubanSubjects,
} from "./doubanServices";

vi.mock("../api", () => {
    return {
        fetchDoubanObject: vi.fn(),
    };
});

vi.mock("../utils", () => {
    return {
        dbRequest: vi.fn(),
    };
});

vi.mock("../models", () => {
    return {
        DoubanSubject: {
            findOne: vi.fn(),
            create: vi.fn(),
            find: vi.fn(),
        },
    };
});

describe("doubanServices", () => {
    const originalCwd = process.cwd();
    let tempDir = "";

    beforeEach(() => {
        vi.clearAllMocks();
        tempDir = fs.mkdtempSync(join(tmpdir(), "douban-services-"));
        process.chdir(tempDir);
    });

    afterEach(() => {
        process.chdir(originalCwd);
        fs.rmSync(tempDir, { recursive: true, force: true });
    });

    it("downloads cover once when file does not exist", async () => {
        vi.mocked(dbRequest).mockResolvedValue(
            new Response(Uint8Array.from([1, 2, 3]).buffer, { status: 200 })
        );

        checkFolder("movie");
        await downloadCover("movie", "/1.jpg", "https://img/1.jpg");
        await downloadCover("movie", "/1.jpg", "https://img/1.jpg");

        expect(dbRequest).toHaveBeenCalledTimes(1);
        expect(fs.existsSync(join(tempDir, "static", "movie", "1.jpg"))).toBe(
            true
        );
    });

    it("returns local cover directly when file exists", async () => {
        checkFolder("book");
        const localFile = join(tempDir, "static", "book", "11.jpg");
        fs.writeFileSync(localFile, Buffer.from("local"));

        const buffer = await getCoverFromLocal("book", "11");

        expect(fetchDoubanObject).not.toHaveBeenCalled();
        expect(buffer.toString()).toBe("local");
    });

    it("fetches cover data when local file is missing", async () => {
        vi.mocked(fetchDoubanObject).mockResolvedValue(
            new Response(
                JSON.stringify({
                    id: "22",
                    title: "x",
                    card_subtitle: "",
                    rating: { value: "0" },
                    url: "https://x",
                    pic: { large: "https://img/22.jpg" },
                    year: "2026",
                })
            )
        );
        vi.mocked(dbRequest).mockResolvedValue(
            new Response(Uint8Array.from([9, 9, 9]).buffer, { status: 200 })
        );

        const buffer = await getCoverFromLocal("movie", "22");

        expect(fetchDoubanObject).toHaveBeenCalledWith("movie", "22");
        expect(dbRequest).toHaveBeenCalledWith("https://img/22.jpg");
        expect(buffer.length).toBe(3);
    });

    it("creates subject when missing and returns preserved poster url shape", async () => {
        vi.mocked(fetchDoubanObject).mockResolvedValue(
            new Response(
                JSON.stringify({
                    id: "2",
                    title: "title",
                    card_subtitle: "sub",
                    rating: { value: "8.8" },
                    url: "https://douban/item/2",
                    pic: { large: "https://img/2.jpg" },
                    pubdate: ["2026-01-01"],
                    year: "2026",
                })
            )
        );
        vi.mocked(dbRequest).mockResolvedValue(
            new Response(Uint8Array.from([4, 5, 6]).buffer, { status: 200 })
        );

        vi.mocked(DoubanSubject.findOne)
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce({
                subject_id: "2",
                poster: "https://img/2.jpg",
            } as never);

        const result = await getDoubanSubject("2", "book");

        expect(DoubanSubject.create).toHaveBeenCalledTimes(1);
        expect(result).toMatchObject({
            subject_id: "2",
            poster: `${DOMAIN}/book/2.jpg`,
        });
        expect(dbRequest).toHaveBeenCalledWith(`${DOMAIN}/book/2.jpg`);
    });

    it("returns paged subject list and rewrites poster to local static path", async () => {
        const objects = [
            { subject_id: "a1", poster: "https://img/a1.jpg" },
            { subject_id: "a2", poster: "https://img/a2.jpg" },
        ];

        const limit = vi.fn().mockResolvedValue(objects);
        const skip = vi.fn().mockReturnValue({ limit });
        const sort = vi.fn().mockReturnValue({ skip });
        vi.mocked(DoubanSubject.find).mockReturnValue({ sort } as never);

        vi.mocked(dbRequest).mockImplementation(async () => {
            return new Response(Uint8Array.from([7, 8, 9]).buffer, {
                status: 200,
            });
        });

        const result = await getDoubanSubjects("movie", "done", 2);

        expect(skip).toHaveBeenCalledWith(20);
        expect(dbRequest).toHaveBeenCalledTimes(2);
        expect(result[0].poster).toBe(`${DOMAIN}/static/movie/a1.jpg`);
        expect(result[1].poster).toBe(`${DOMAIN}/static/movie/a2.jpg`);
    });
});
