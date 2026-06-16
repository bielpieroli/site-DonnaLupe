import client from "./client";
import type { UserListResponse } from "@/types/APIResponseType";

export const usersAPI = {
  getAll: async (params: {
    page?: number;
    limit?: number;
    search_value?: string;
  } = {}): Promise<UserListResponse> => {
    const response = await client.get<UserListResponse>("/admin/users", {
      params: {
        page: params.page,
        limit: params.limit,
        ...(params.search_value
          ? { search_by: "email", search_value: params.search_value }
          : {}),
      },
    });
    return response.data;
  },

  update: async (
    email: string,
    password: string,
  ): Promise<{ message: string }> => {
    const response = await client.put(`/admin/users/${encodeURIComponent(email)}`, {
      password,
    });
    return response.data;
  },

  delete: async (email: string): Promise<{ message: string }> => {
    const response = await client.delete(
      `/admin/users/${encodeURIComponent(email)}`,
    );
    return response.data;
  },
};
