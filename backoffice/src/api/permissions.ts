import client from "./client";
import type { Permission, PermissionsResponse } from "@/types/APIResponseType";

export const permissionsAPI = {
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
