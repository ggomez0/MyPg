import { Hono } from "hono";
import { DataService } from "../services/data.service";
import { apiAuth } from "../middleware/auth";
import { checkApiKeyPermission } from "../utils/permissions";
import type { AppEnv } from "../types";

const dataRouter = new Hono<AppEnv>();

dataRouter.use("*", apiAuth);

dataRouter.get("/:collection", async (c) => {
  const collection = c.req.param("collection");
  if (c.get("authType") === "apikey") {
    if (!checkApiKeyPermission(c.get("apiKeyPermissions"), collection, "read")) {
      return c.json({ error: `Forbidden: API Key does not have read permission for collection '${collection}'` }, 403);
    }
  }
  const projectId = c.get("projectId");
  const role = c.get("role");
  const userId = c.get("userId");
  const query: any = c.req.query();
  if (query.filter && typeof query.filter === "string") {
    try {
      query.filter = JSON.parse(query.filter);
    } catch (e) {}
  }
  try {
    const result = await DataService.list(projectId, collection, query, role, userId);
    return c.json({ data: result.records, meta: { total: result.totalCount, page: result.page, perPage: result.perPage, totalPages: result.totalPages } });
  } catch (err: any) {
    return c.json({ error: err.message }, 400);
  }
});

dataRouter.get("/:collection/:id", async (c) => {
  const collection = c.req.param("collection");
  if (c.get("authType") === "apikey") {
    if (!checkApiKeyPermission(c.get("apiKeyPermissions"), collection, "read")) {
      return c.json({ error: `Forbidden: API Key does not have read permission for collection '${collection}'` }, 403);
    }
  }
  const id = c.req.param("id");
  const projectId = c.get("projectId");
  const role = c.get("role");
  const userId = c.get("userId");
  try {
    const result = await DataService.list(projectId, collection, { filter: { id } }, role, userId);
    if (result.records.length === 0) return c.json({ error: "Not found" }, 404);
    return c.json({ data: result.records[0] });
  } catch (err: any) {
    return c.json({ error: err.message }, 400);
  }
});

dataRouter.post("/:collection", async (c) => {
  const collection = c.req.param("collection");
  if (c.get("authType") === "apikey") {
    if (!checkApiKeyPermission(c.get("apiKeyPermissions"), collection, "create")) {
      return c.json({ error: `Forbidden: API Key does not have create permission for collection '${collection}'` }, 403);
    }
  }
  const projectId = c.get("projectId");
  const role = c.get("role");
  const userId = c.get("userId");
  const body = await c.req.json();
  try {
    const record = await DataService.create(projectId, collection, body, role, userId);
    return c.json({ data: record });
  } catch (err: any) {
    return c.json({ error: err.message }, 400);
  }
});

dataRouter.patch("/:collection/:id", async (c) => {
  const collection = c.req.param("collection");
  if (c.get("authType") === "apikey") {
    if (!checkApiKeyPermission(c.get("apiKeyPermissions"), collection, "update")) {
      return c.json({ error: `Forbidden: API Key does not have update permission for collection '${collection}'` }, 403);
    }
  }
  const id = c.req.param("id");
  const projectId = c.get("projectId");
  const role = c.get("role");
  const userId = c.get("userId");
  const body = await c.req.json();
  try {
    const record = await DataService.update(projectId, collection, id, body, role, userId);
    return c.json({ data: record });
  } catch (err: any) {
    return c.json({ error: err.message }, 400);
  }
});

dataRouter.delete("/:collection/:id", async (c) => {
  const collection = c.req.param("collection");
  if (c.get("authType") === "apikey") {
    if (!checkApiKeyPermission(c.get("apiKeyPermissions"), collection, "delete")) {
      return c.json({ error: `Forbidden: API Key does not have delete permission for collection '${collection}'` }, 403);
    }
  }
  const id = c.req.param("id");
  const projectId = c.get("projectId");
  const role = c.get("role");
  const userId = c.get("userId");
  try {
    const record = await DataService.delete(projectId, collection, id, role, userId);
    return c.json({ data: record });
  } catch (err: any) {
    return c.json({ error: err.message }, 400);
  }
});

export { dataRouter };
