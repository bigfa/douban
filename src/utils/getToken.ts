import { Jwt } from "hono/utils/jwt";

const genToken = (id: string) => {
    return Jwt.sign({ id }, "richiscool" || "");
};

export default genToken;
