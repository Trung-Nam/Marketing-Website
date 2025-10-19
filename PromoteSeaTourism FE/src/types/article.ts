export interface Article {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImageId: number;
  thumbnailUrl?: string;
  categoryId: number;
  isPublished: boolean;
  publishedAt: string;
  createdAt: string;
  updatedAt: string | null;
  images?: ArticleImageLink[];
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  coverImage?: {
    id: number;
    url: string;
    altText: string;
    caption: string;
  };
}

export interface ArticlesResponse {
  code: number;
  message: string;
  total: number;
  page: number;
  pageSize: number;
  data: Article[];
}

export interface ArticlesParams {
  page?: number;
  pageSize?: number;
  search?: string;
  categoryId?: number;
}

export interface ArticleImageLink {
  linkId: number;
  mediaId: number;
  isCover: boolean;
  position: number;
  url: string;
  altText: string;
  caption: string;
}

export interface ArticleDetail extends Article {
  images: ArticleImageLink[];
}

export interface ArticleDetailResponse {
  code: number;
  message: string;
  data: ArticleDetail;
}

export interface ArticleImage {
  url: string;
  altText: string;
  caption: string;
  position: number;
  isCover: boolean;
}

export interface CreateArticleRequest {
  title: string;
  slug: string;
  summary: string;
  content: string;
  categoryId: number;
  isPublished: boolean;
  publishedAt: string;
  images: ArticleImage[];
}

export interface UpdateArticleImage {
  url: string;
  altText?: string;
  caption?: string;
  position: number;
  isCover: boolean;
}

export interface UpdateArticleRequest {
  title: string;
  slug: string;
  summary?: string;
  content?: string;
  categoryId?: number;
  isPublished: boolean;
  publishedAt?: string;
  addImages: UpdateArticleImage[];
  attachMediaIds: number[];
  removeLinkIds: number[];
  coverImageId?: number;
}
