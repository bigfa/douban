import { Hono } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { sync } from "./syncControllers";
import { syncServices } from "../services";

vi.mock("../services", () => {
    return {
        syncServices: vi.fn(),
    };
});

describe("syncControllers", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("iterates all type/status combinations", async () => {
        vi.mocked(syncServices).mockResolvedValue(undefined);

        const app = new Hono();
        app.get("/sync", (c) => sync(c));

        const response = await app.request(
            "http://localhost/sync?types=movie,book&statuses=done,doing"
        );
        const text = await response.text();

        expect(text).toBe("finish sync");
        expect(syncServices).toHaveBeenCalledTimes(4);
        expect(syncServices).toHaveBeenNthCalledWith(
            1,
            expect.anything(),
            "movie",
            "done"
        );
        expect(syncServices).toHaveBeenNthCalledWith(
            2,
            expect.anything(),
            "movie",
            "doing"
        );
        expect(syncServices).toHaveBeenNthCalledWith(
            3,
            expect.anything(),
            "book",
            "done"
        );
        expect(syncServices).toHaveBeenNthCalledWith(
            4,
            expect.anything(),
            "book",
            "doing"
        );
    });
});
