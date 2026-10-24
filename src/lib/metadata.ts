import type { Metadata } from "next";
import { site } from "./site";
export function pageMetadata(
  title: string,
  description: string,
  path: string,
  image?: string,
): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} · ${site.name}`,
      description,
      url: path,
      type: "website",
      images: [{ url: image || "/opengraph-image", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image || "/opengraph-image"],
    },
  };
}
