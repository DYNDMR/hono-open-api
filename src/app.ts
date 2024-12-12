import type { PinoLogger } from "hono-pino";

import { OpenAPIHono } from "@hono/zod-openapi";
import { notFound, onError } from "stoker/middlewares";

import { pinoLogger } from "./midlewares/pino-logger";


interface AppBindings {
    Variables:{
        logger: PinoLogger;
    };
};


const app = new OpenAPIHono<AppBindings>();
app.use(pinoLogger())

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get('/error', (c) => {
    c.status(422);
    c.var.logger.info("Wow! Log here!")
    throw new Error("Oh no!")
})

app.notFound(notFound);
app.onError(onError)

export default app;