// app/(main)/[lang]/mdx-components.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import type { ComponentProps } from "react";
import type { MDXComponents } from "mdx/types";

function A(props: ComponentProps<"a">) {
  const { href = "", ...rest } = props;
  const isInternal = href.startsWith("/") || href.startsWith("#");
  if (isInternal) return <Link href={href} {...rest} />;
  return <a target="_blank" rel="noopener noreferrer" {...props} />;
}

function Img(props: ComponentProps<"img">) {
  // MDX often gives <img src="..."> without types. Guard strictly.
  const { src, alt, width, height, ...rest } = props;

  // If we don't have a string src, bail out gracefully.
  if (typeof src !== "string" || src.length === 0) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt={alt ?? ""} {...rest} />;
  }

  // If we have explicit dimensions, use proper <Image> for best perf.
  if (width && height) {
    const w = Number(width);
    const h = Number(height);
    if (!Number.isNaN(w) && !Number.isNaN(h)) {
      return (
        <Image
          src={src}
          alt={alt ?? ""}
          width={w}
          height={h}
          sizes="(max-width: 768px) 100vw, 800px"
          {...rest}
        />
      );
    }
  }

  // Fallback: keep an <img>. We keep the warning suppressed only here.
  // If you want to force next/image, we can wrap in a relative container and use `fill`.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt ?? ""} loading="lazy" decoding="async" {...rest} />;
}

function Pre(props: ComponentProps<"pre">) {
  return (
    <pre
      className="rounded-lg bg-black/90 text-white p-4 overflow-auto"
      {...props}
    />
  );
}

function Code(props: ComponentProps<"code">) {
  return <code className="font-mono text-[0.925em]" {...props} />;
}

// No `any` — use MDXComponents
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    a: A,
    img: Img,
    pre: Pre,
    code: Code,
    ...components,
  };
}