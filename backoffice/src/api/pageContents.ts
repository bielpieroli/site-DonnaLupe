import client from "./client";

export type PageContent = {
  id: number;
  page: string;
  name: string;
  section: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  buttonText: string;
  buttonLink: string;
  status: string;
};

export type PageContentInput = Omit<PageContent, "id">;

export const pageContentsAPI = {
  getAll: async (): Promise<{ contents: PageContent[] }> => {
    const res = await client.get<{ contents: PageContent[] }>("/admin/page-contents");
    return res.data;
  },

  create: async (input: PageContentInput): Promise<{ content: PageContent }> => {
    const res = await client.post<{ content: PageContent }>("/admin/page-contents", input);
    return res.data;
  },

  update: async (id: number, input: PageContentInput): Promise<{ content: PageContent }> => {
    const res = await client.put<{ content: PageContent }>(`/admin/page-contents/${id}`, input);
    return res.data;
  },

  delete: async (id: number): Promise<{ message: string }> => {
    const res = await client.delete<{ message: string }>(`/admin/page-contents/${id}`);
    return res.data;
  },
};
