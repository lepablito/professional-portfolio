import type { Metadata } from "next";

// Shared metadata builder for the two article-style routes (project case
// studies and blog posts), so title/OG/Twitter stay consistent and
// publishedTime is emitted by both.
export function buildArticleMetadata(options: {
  title: string;
  description: string;
  url: string;
  publishedTime: string;
}): Metadata {
  const { title, description, url, publishedTime } = options;
  return {
    title,
    description,
    openGraph: {
      type: "article",
      title,
      description,
      url,
      publishedTime,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}
