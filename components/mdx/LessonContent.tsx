"use client";

import { Component, type ReactNode } from "react";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import { mdxComponents } from "./index";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

class MDXErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("MDX render error:", error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

interface LessonContentProps {
  content: string;
  mdxSource: MDXRemoteSerializeResult | null;
}

export function LessonContent({ content, mdxSource }: LessonContentProps) {
  const markdownFallback = (
    <div className="prose prose-neutral dark:prose-invert max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );

  // If we have a valid MDX source, use MDX renderer with error boundary
  if (mdxSource) {
    return (
      <MDXErrorBoundary fallback={markdownFallback}>
        <div className="mdx-content">
          <MDXRemote {...mdxSource} components={mdxComponents} />
        </div>
      </MDXErrorBoundary>
    );
  }

  // Fall back to regular Markdown
  return markdownFallback;
}
