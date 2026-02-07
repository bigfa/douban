export type RequestParams = Record<
    string,
    string | number | boolean | null | undefined
>;

const DEFAULT_HEADERS = {
    Referer: "https://servicewechat.com/wx2f9b06c1de1ccfca/84/page-frame.html",
    "user-agent":
        "User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 15_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.16(0x18001023) NetType/WIFI Language/zh_CN",
};

export async function dbRequest(url: string, params: RequestParams = {}) {
    const requestParams: RequestParams = {
        ...params,
        apiKey: "0ac44ae016490db2204ce0a042db2916",
    };

    const searchParams = new URLSearchParams();
    Object.entries(requestParams).forEach(([key, value]) => {
        if (value === null || value === undefined) {
            return;
        }

        searchParams.set(key, String(value));
    });

    return fetch(`${url}?${searchParams}`, {
        headers: DEFAULT_HEADERS,
    });
}
