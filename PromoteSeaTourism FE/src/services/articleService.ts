import api from "../utils/axiosInstance";
import type {
  ArticlesResponse,
  ArticlesParams,
  ArticleDetail,
  ArticleDetailResponse,
  CreateArticleRequest,
  UpdateArticleRequest,
} from "../types/article";

export const articleService = {
  async getArticles(params: ArticlesParams = {}): Promise<ArticlesResponse> {
    const { page = 1, pageSize = 20 } = params;
    const response = await api.get(`/articles/list`, {
      params: {
        page,
        pageSize,
      },
    });
    return response.data;
  },

  async getArticleById(id: number): Promise<ArticleDetail> {
    const response = await api.get<ArticleDetailResponse>(
      `/articles/get/${id}`
    );
    return response.data.data;
  },

  async getArticleBySlug(slug: string): Promise<ArticleDetail> {
    const response = await api.get<ArticleDetailResponse>(
      `/articles/slug/${slug}`
    );
    return response.data.data;
  },

  async createArticle(articleData: CreateArticleRequest) {
    const response = await api.post("/articles/create", articleData);
    return response.data;
  },

  async updateArticle(id: number, articleData: UpdateArticleRequest) {
    const response = await api.put(`/articles/update/${id}`, articleData);
    return response.data;
  },

  async deleteArticle(id: number) {
    const response = await api.delete(`/articles/delete/${id}`);
    return response.data;
  },
};
