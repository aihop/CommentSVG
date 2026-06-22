/**
 * Map each chapter identifier to a GitHub Discussion number.
 *
 * The key is the chapter slug (e.g. "01", "02"),
 * the value is the GitHub Discussion number in the repository.
 *
 * Update this map as new chapters are published.
 */
export const chapterMap: Record<string, number> = {
  "01-kicked-out-for-300": 2,
  "02-experimental-class-list":4,
  "03-four-hundred-ducks":3,
  "Refactoring-the-Self":5
};

/**
 * GitHub repository configuration.
 * Update these to match your repository.
 */
export const repoConfig = {
  owner: "aihop",
  name: "Refactoring-the-Self",
} as const;

/**
 * Maximum number of characters to show per comment.
 */
export const MAX_COMMENT_LENGTH = 140;

/**
 * Default number of comments to show.
 */
export const DEFAULT_COMMENT_COUNT = 3;
