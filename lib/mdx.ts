import { serialize } from "next-mdx-remote/serialize";

export async function serializeMDX(content: string) {
  try {
    const mdxSource = await serialize(content, {
      mdxOptions: {
        development: process.env.NODE_ENV === "development",
      },
      // next-mdx-remote v6 defaults blockJS to true, which strips JSX attribute
      // expressions like options={[...]} and number={1} from custom components.
      // Content is authored by community admins, not untrusted users.
      blockJS: false,
    });
    return { source: mdxSource, error: null };
  } catch (error) {
    console.error("MDX serialization error:", error);
    // Return null source so we can fall back to plain markdown
    return { source: null, error: error instanceof Error ? error.message : "Failed to parse MDX" };
  }
}
