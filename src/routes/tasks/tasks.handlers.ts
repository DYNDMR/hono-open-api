import type { AppRouteHandler } from "@/lib/types";

import type { ListRoute } from "./tasks.routes";

export const list: AppRouteHandler<ListRoute> =  (c) => {
  return c.json([{
    name: "learn hono",
    done: false,
  }]);
};
