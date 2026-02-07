import { Context } from "hono";

// Error Handler
export const errorHandler = (c: Context, error: Error) => {
    return c.json({
        success: false,
        message: error.message,
        stack: process.env.NODE_ENV === "production" ? null : error.stack,
    });
};

// Not Found Handler
export const notFound = (c: Context) => {
    return c.json({
        success: false,
        message: `Not Found - [${c.req.method}] ${c.req.url}`,
    });
};
