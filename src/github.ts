import { Env, DiscussionData, GraphQLResponse } from "./types";
import { repoConfig, MAX_COMMENT_LENGTH, DEFAULT_COMMENT_COUNT } from "./config";

const DISCUSSION_QUERY = `
query($owner: String!, $repo: String!, $number: Int!, $first: Int!) {
  repository(owner: $owner, name: $repo) {
    discussion(number: $number) {
      title
      comments(first: $first) {
        totalCount
        nodes {
          id
          bodyText
          createdAt
          author {
            login
            avatarUrl
          }
          reactions(first: 0, content: THUMBS_UP) {
            totalCount
          }
        }
      }
    }
  }
}
`;

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).trimEnd() + "…";
}

export async function fetchDiscussion(
  chapterNumber: number,
  env: Env,
  limit: number = DEFAULT_COMMENT_COUNT
): Promise<DiscussionData | null> {
  const token = env.GITHUB_TOKEN;
  if (!token) {
    console.error("GITHUB_TOKEN is not set");
    return null;
  }

  const graphqlUrl = env.GITHUB_GRAPHQL_URL || "https://api.github.com/graphql";

  const response = await fetch(graphqlUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "CommentSVG/1.0",
    },
    body: JSON.stringify({
      query: DISCUSSION_QUERY,
      variables: {
        owner: repoConfig.owner,
        repo: repoConfig.name,
        number: chapterNumber,
        first: limit,
      },
    }),
  });

  if (!response.ok) {
    console.error(`GitHub API returned ${response.status}: ${await response.text()}`);
    return null;
  }

  const result: GraphQLResponse = await response.json();

  if (result.errors) {
    console.error("GraphQL errors:", JSON.stringify(result.errors));
    return null;
  }

  const discussion = result.data?.repository?.discussion;
  if (!discussion) {
    console.error("No discussion found for chapter number:", chapterNumber);
    return null;
  }

  const comments = (discussion.comments.nodes || []).map((node) => ({
    id: node.id,
    author: node.author?.login ?? "anonymous",
    avatarUrl: node.author?.avatarUrl ?? "",
    content: truncate(node.bodyText, MAX_COMMENT_LENGTH),
    createdAt: node.createdAt,
    reactionCount: node.reactions.totalCount,
  }));

  return {
    title: discussion.title,
    totalComments: discussion.comments.totalCount,
    comments,
  };
}
