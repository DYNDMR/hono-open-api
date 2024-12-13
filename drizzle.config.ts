import { defineConfig } from "drizzle-kit";

import env from "@/env";

console.log("DATABASE_URL:", env.DATABASE_URL);
console.log("DATABASE_AUTH_TOKEN:", env.DATABASE_AUTH_TOKEN);

export default defineConfig({
    schema: "./src/db/schema.ts",
    out: "./src/db/migrations",
    dialect: "sqlite",
    dbCredentials: {
        url: env.DATABASE_URL,
    },
});
