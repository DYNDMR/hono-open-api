/* eslint-disable ts/ban-ts-comment */
import { testClient } from "hono/testing";
import { execSync } from "node:child_process";
import fs from "node:fs";
import { afterAll, beforeAll, beforeEach, describe, expect, expectTypeOf, it } from "vitest";

import db from "@/db";
import env from "@/env";
import { ZOD_ERROR_MESSAGES } from "@/lib/constants";
import createApp from "@/lib/create-app";

import router from "./tasks.index";

if (env.NODE_ENV !== "test") {
  throw new Error("NODE_ENV must be 'test'");
}

const client = testClient(createApp().route("/", router));
let taskId: number;

describe("tasks routes", () => {
  beforeAll(() => {
    execSync("cross-env NODE_ENV=test npx drizzle-kit push");
  });

  beforeEach(async () => {
    const task = await createTask({ name: "Dynamic Task", done: false });
    taskId = task.id;
  });

  afterAll(async () => {
    try {
      await db.$client.close?.(); 
    } catch (err) {
      console.error("Erro ao fechar a conexão do banco:", err);
    }

    setTimeout(() => {
      fs.rmSync("test.db", { force: true });
    }, 500);
  });

  it("post /tasks validates the body when creating", async () => {
    const response = await client.tasks.$post({
      // @ts-expect-error
      json: { done: false },
    });
    expect(response.status).toBe(422);
    if (response.status === 422) {
      const json = await response.json();
      expect(json.error.issues[0].path[0]).toBe("name");
      expect(json.error.issues[0].message).toBe(ZOD_ERROR_MESSAGES.REQUIRED);
    }
  });

  it("post /tasks creates a task", async () => {
    const name = "Learn vitest";
    const response = await client.tasks.$post({
      json: { name, done: false },
    });
    expect(response.status).toBe(200);
    if (response.status === 200) {
      const json = await response.json();
      expect(json.name).toBe(name);
      expect(json.done).toBe(false);
    }
  });

  it("get /tasks lists all tasks", async () => {
    const response = await client.tasks.$get();
    expect(response.status).toBe(200);
    if (response.status === 200) {
      const json = await response.json();
      expectTypeOf(json).toBeArray();
      expect(json.length).toBeGreaterThan(0);
    }
  });

  it("get /tasks/{id} gets a single task", async () => {
    const response = await client.tasks[":id"].$get({ param: { id: taskId } });
    expect(response.status).toBe(200);
    if (response.status === 200) {
      const json = await response.json();
      expect(json.name).toBe("Dynamic Task");
      expect(json.done).toBe(false);
    }
  });

  it("delete /tasks/{id} removes a task", async () => {
    const response = await client.tasks[":id"].$delete({ param: { id: taskId } });
    expect(response.status).toBe(204);
  });
});

async function createTask(data: { name: string; done: boolean }) {
  const response = await client.tasks.$post({ json: data });
  if (response.status === 200) {
    return await response.json();
  }
  throw new Error("Failed to create task");
}
