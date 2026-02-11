"use client";

import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import { mdxComponents } from "./index";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface LessonContentProps {
  content: string;
  mdxSource: MDXRemoteSerializeResult | null;
}

export function LessonContent({ content, mdxSource }: LessonContentProps) {
  // If we have a valid MDX source, use MDX renderer
  if (mdxSource) {
    return (
      <div className="mdx-content">
        <MDXRemote {...mdxSource} components={mdxComponents} />
      </div>
    );
  }

  // Fall back to regular Markdown
  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
