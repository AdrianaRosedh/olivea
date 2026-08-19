// app/(main)/[lang]/mdx-components.tsx
"use client";

/* eslint-disable @next/next/no-img-element */

import Image, { type ImageProps } from "next/image";
import Link from "next/link";
import type { ComponentProps } from "react";
import type React from "react";

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

function parseAspectRatio(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  // allow "16/9" or "1.777"
  if (/^\d+(\.\d+)?\s*\/\s*\d+(\.\d+)?$/.test(s)) return s.replace(/\s+/g, "");
  const n = Number(s);
  if (Number.isFinite(n) && n > 0) return String(n);
  return null;
}

function isLocalSrc(src: string) {
  return src.startsWith("/");
}

function readAspectRatioFromStyle(style: unknown): string | null {
  if (!style) return null;
  // In React, style is usually React.CSSProperties (Record<string, string|number>)
  const s = style as React.CSSProperties;
  const ar = s.aspectRatio;
  if (typeof ar === "string") return parseAspectRatio(ar);
  if (typeof ar === "number" && Number.isFinite(ar) && ar > 0) return String(ar);
  return null;
}

type ImgExtra = {
  "data-aspect"?: string;
  "data-priority"?: string;
};

function Img(props: ComponentProps<"img">) {
  const {
    src,
    alt,
    width,
    height,
    className,
    style,
    ["data-aspect"]: dataAspect,
    ["data-priority"]: dataPriority,
    ...rest
  } = props as ComponentProps<"img"> & ImgExtra;

  if (typeof src !== "string" || src.length === 0) {
    return <img alt={alt ?? ""} className={className} style={style} {...rest} />;
  }

  const priority = dataPriority === "true";

  // Case A: explicit width/height => best path
  if (width && height) {
    const w = Number(width);
    const h = Number(height);

    if (!Number.isNaN(w) && !Number.isNaN(h) && w > 0 && h > 0) {
      const imgProps: Omit<ImageProps, "src" | "alt" | "width" | "height"> = {
        className,
        style,
        sizes: "(max-width: 768px) 100vw, 900px",
        priority,
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

  // Case B: no dimensions, but local image + aspect ratio => fill mode (still optimized)
  const ar =
    parseAspectRatio(dataAspect) ??
    readAspectRatioFromStyle(style);

  if (ar && isLocalSrc(src)) {
    return (
      <span
        className={className}
        style={{
          display: "block",
          position: "relative",
          width: "100%",
          aspectRatio: ar,
          ...(style ?? {}),
        }}
      >
        <Image
          src={src}
          alt={alt ?? ""}
          fill
          priority={priority}
          sizes="100vw"
          style={{ objectFit: "cover" }}
        />
      </span>
    );
  }

  // Case C: fallback <img> (still make it as fast as possible)
  return (
    <img
      src={src}
      alt={alt ?? ""}
      className={className}
      style={style}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
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
    <code className={["font-mono text-[0.925em]", className ?? ""].join(" ")} {...rest} />
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