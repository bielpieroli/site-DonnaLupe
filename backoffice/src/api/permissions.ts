import client from "./client";
import type { Permission, PermissionsResponse } from "@/types/APIResponseType";
import { usersAPI } from "./users";

export type UserPermissionsRow = {
  email: string;
  permissions: Permission[];
};

export const permissionsAPI = {
  getUsersPermissions: async (): Promise<{ users: UserPermissionsRow[] }> => {
    try {
      const response = await client.get<{ users: UserPermissionsRow[] }>("/admin/permissions/users");
      return response.data;
    } catch {
      const usersRes = await usersAPI.getAll({ limit: 1000 });
      const users = await Promise.all(
        usersRes.users.map(async (user) => {
          const permissions = await permissionsAPI.getByUser(user.email);
          return { email: user.email, permissions: permissions.permissions };
        }),
      );
      return { users };
    }
  },

  getByUser: async (email: string): Promise<PermissionsResponse> => {
    const response = await client.get<PermissionsResponse>(
      `/admin/users/${encodeURIComponent(email)}/permissions`,
    );
    return response.data;
  },

  setByUser: async (
    email: string,
    permissions: Permission[],
  ): Promise<PermissionsResponse> => {
    const response = await client.put<PermissionsResponse>(
      `/admin/users/${encodeURIComponent(email)}/permissions`,
      { permissions },
    );
    return response.data;
  },
};
