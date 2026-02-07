import { afterEach, describe, expect, it, vi } from "vitest";
import { dbRequest } from "./request";

describe("dbRequest", () => {
    const fetchMock = vi.fn();

    afterEach(() => {
        fetchMock.mockReset();
        vi.unstubAllGlobals();
    });

    it("appends params and apiKey", async () => {
        fetchMock.mockResolvedValue(new Response(null, { status: 200 }));
        vi.stubGlobal("fetch", fetchMock);

        await dbRequest("https://example.com/path", {
            count: 20,
            type: "movie",
            nullable: undefined,
        });

        expect(fetchMock).toHaveBeenCalledTimes(1);
        const [calledURL, options] = fetchMock.mock.calls[0] as [
            string,
            RequestInit,
        ];

        expect(calledURL).toContain("https://example.com/path?");
        expect(calledURL).toContain("count=20");
        expect(calledURL).toContain("type=movie");
        expect(calledURL).toContain("apiKey=0ac44ae016490db2204ce0a042db2916");
        expect(calledURL).not.toContain("nullable");
        expect(options.headers).toHaveProperty("Referer");
        expect(options.headers).toHaveProperty("user-agent");
    });
});
