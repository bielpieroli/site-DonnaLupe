import client, { TOKEN_KEY } from "./client";
import type { LoginResponse } from "@/types/APIResponseType";

export const authAPI = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await client.post<LoginResponse>("/admin/auth/login", {
      email,
      password,
    });

    localStorage.setItem(TOKEN_KEY, response.data.token);
    return response.data;
  },

  me: async (): Promise<Omit<LoginResponse, "message" | "token">> => {
    const response = await client.get<Omit<LoginResponse, "message" | "token">>("/admin/auth/me");
    return response.data;
  },

  register: async (
    email: string,
    password: string,
    permissions?: { resource: string; level: string }[],
  ): Promise<{ message: string; user: { email: string } }> => {
    const response = await client.post("/admin/auth/register", {
      email,
      password,
      permissions,
    });
    return response.data;
  },
};
