export type PermissionAction = "read" | "create" | "update" | "delete";

export type ApiKeyPermissions = {
  mode?: "full" | "readonly" | "custom";
  collections?: Record<string, PermissionAction[] | string[] | string>;
};

export function checkApiKeyPermission(
  permissions: ApiKeyPermissions | null | undefined,
  collection: string,
  action: PermissionAction
): boolean {
  if (!permissions) {
    return true;
  }

  if (permissions.mode === "readonly") {
    return action === "read";
  }

  if (permissions.mode === "full") {
    return true;
  }

  if (permissions.collections) {
    const tablePerms = permissions.collections[collection] ?? permissions.collections["*"];
    if (!tablePerms) {
      return false;
    }

    if (Array.isArray(tablePerms)) {
      const permsList = tablePerms as string[];
      return permsList.includes(action) || permsList.includes("*") || permsList.includes("all");
    }

    if (tablePerms === "*" || tablePerms === "all") {
      return true;
    }

    if (tablePerms === "readonly" || tablePerms === "read") {
      return action === "read";
    }

    return false;
  }

  return true;
}
