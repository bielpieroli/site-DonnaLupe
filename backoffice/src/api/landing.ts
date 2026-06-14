import client from "./client";

export type LandingContent = {
  id: number;
  name: string;
  secao: string;
  titulo: string;
  subtitulo: string;
  descricao: string;
  imagem: string;
  botaoTexto: string;
  botaoLink: string;
  status: string;
};

export type LandingContentInput = Omit<LandingContent, "id">;

export const landingAPI = {
  getAll: async (): Promise<{ contents: LandingContent[] }> => {
    const res = await client.get<{ contents: LandingContent[] }>("/admin/landing");
    return res.data;
  },

  create: async (input: LandingContentInput): Promise<{ content: LandingContent }> => {
    const res = await client.post<{ content: LandingContent }>("/admin/landing", input);
    return res.data;
  },

  update: async (
    id: number,
    input: LandingContentInput,
  ): Promise<{ content: LandingContent }> => {
    const res = await client.put<{ content: LandingContent }>(`/admin/landing/${id}`, input);
    return res.data;
  },

  delete: async (id: number): Promise<{ message: string }> => {
    const res = await client.delete<{ message: string }>(`/admin/landing/${id}`);
    return res.data;
  },
};
