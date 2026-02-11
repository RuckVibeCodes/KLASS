"use client";

import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import { mdxComponents } from "./index";

interface MDXContentProps {
  source: MDXRemoteSerializeResult;
}

export function MDXContent({ source }: MDXContentProps) {
  return (
    <div className="mdx-content prose prose-invert max-w-none">
      <MDXRemote {...source} components={mdxComponents} />
    </div>
  );
}
