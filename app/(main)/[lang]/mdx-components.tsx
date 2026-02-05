// app/(main)/[lang]/mdx-components.tsx
"use client";

/* eslint-disable @next/next/no-img-element */

import Image, { type ImageProps } from "next/image";
import Link from "next/link";
import type { ComponentProps } from "react";

export type MDXComponents = Record<string, unknown>;

/* ---------- <a> ---------- */

function A(props: ComponentProps<"a">) {
  const {
    href = "",
    className,
    children,
    title,
    id,
    style,
    target,
    rel,
    ref: _ref,
    ...rest
  } = props;

  const isInternal =
    typeof href === "string" && (href.startsWith("/") || href.startsWith("#"));

  if (isInternal) {
    return (
      <Link href={href} className={className} title={title} id={id} style={style}>
        {children}
      </Link>
    );
  }

  return (
    <a
      href={href}
      className={className}
      title={title}
      id={id}
      style={style}
      target={target ?? "_blank"}
      rel={rel ?? "noopener noreferrer"}
      {...rest}
    >
      {children}
    </a>
  );
}

/* ---------- <img> ---------- */

function Img(props: ComponentProps<"img">) {
  const { src, alt, width, height, className, style, ...rest } = props;

  if (typeof src !== "string" || src.length === 0) {
    return <img alt={alt ?? ""} className={className} style={style} {...rest} />;
  }

  if (width && height) {
    const w = Number(width);
    const h = Number(height);

    if (!Number.isNaN(w) && !Number.isNaN(h)) {
      const imgProps: Omit<ImageProps, "src" | "alt" | "width" | "height"> = {
        className,
        style,
        sizes: "(max-width: 768px) 100vw, 800px",
      };

      return (
        <Image
          src={src}
          alt={alt ?? ""}
          width={w}
          height={h}
          {...imgProps}
        />
      );
    }
  }

  return (
    <img
      src={src}
      alt={alt ?? ""}
      className={className}
      style={style}
      loading="lazy"
      decoding="async"
      {...rest}
    />
  );
}

/* ---------- <pre> & <code> ---------- */

function Pre(props: ComponentProps<"pre">) {
  const { className, ...rest } = props;
  return (
    <pre
      className={[
        "rounded-lg bg-black/90 text-white p-4 overflow-auto",
        className ?? "",
      ].join(" ")}
      {...rest}
    />
  );
}

function Code(props: ComponentProps<"code">) {
  const { className, ...rest } = props;
  return (
    <code
      className={["font-mono text-[0.925em]", className ?? ""].join(" ")}
      {...rest}
    />
  );
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    a: A,
    img: Img,
    pre: Pre,
    code: Code,
    ...components,
  };
}