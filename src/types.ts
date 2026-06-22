export interface Env {
  GITHUB_TOKEN?: string;
  GITHUB_GRAPHQL_URL?: string;
  COMMENT_CACHE?: KVNamespace;
}

export interface Comment {
  id: string;
  author: string;
  avatarUrl: string;
  content: string;
  createdAt: string;
  reactionCount: number;
}

export interface DiscussionData {
  title: string;
  totalComments: number;
  comments: Comment[];
}

export interface QueryParams {
  theme: 'light' | 'dark';
  comments: number;
  compact: boolean;
  lang: string;
}

export interface GraphQLResponse {
  data?: {
    repository?: {
      discussion?: {
        title: string;
        bodyText: string;
        comments: {
          totalCount: number;
          nodes: Array<{
            id: string;
            bodyText: string;
            createdAt: string;
            author: {
              login: string;
              avatarUrl: string;
            } | null;
            reactions: {
              totalCount: number;
            };
          }>;
        };
      };
    };
  };
  errors?: Array<{ message: string }>;
}
