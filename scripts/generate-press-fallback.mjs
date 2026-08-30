import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const projectRoot = process.cwd();
const pressRoot = path.join(projectRoot, "app", "[lang]", "(main)", "press");
const outputPath = path.join(
  projectRoot,
  "lib", "content", "data", "pressFallback.generated.json",
);

function required(condition, message) {
  if (!condition) throw new Error(message);
}

function normalizeDate(value) {
  if (value instanceof Date && Number.isFinite(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  const text = typeof value === "string" ? value.trim() : "";
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : null;
}

function compileLanguage(lang) {
  const directory = path.join(pressRoot, "content", lang);
  return fs.readdirSync(directory)
    .filter((file) => file.endsWith(".mdx") || file.endsWith(".md"))
    .map((file) => {
      const parsed = matter(fs.readFileSync(path.join(directory, file), "utf8"));
      const data = parsed.data;
      const prefix = `[press fallback: ${lang}/${file}]`;

      required(data.kind === "award" || data.kind === "mention", `${prefix} invalid kind`);
      required(typeof data.id === "string" && data.id, `${prefix} missing id`);
      const publishedAt = normalizeDate(data.publishedAt);
      required(publishedAt, `${prefix} invalid publishedAt`);
      required(typeof data.issuer === "string" && data.issuer, `${prefix} missing issuer`);
      required(["olivea", "hotel", "restaurant", "cafe"].includes(data.for), `${prefix} invalid for`);
      required(typeof data.title === "string" && data.title, `${prefix} missing title`);
      required(Array.isArray(data.links) && data.links.length > 0, `${prefix} missing links`);

      const links = data.links.map((link, index) => {
        required(typeof link?.label === "string" && link.label, `${prefix} invalid link ${index}`);
        required(typeof link?.href === "string" && /^https?:\/\//i.test(link.href), `${prefix} invalid href ${index}`);
        return { label: link.label, href: link.href };
      });

      const cover = data.cover && typeof data.cover === "object" &&
        typeof data.cover.src === "string" && data.cover.src.startsWith("/")
        ? { src: data.cover.src, ...(typeof data.cover.alt === "string" ? { alt: data.cover.alt } : {}) }
        : undefined;

      return {
        kind: data.kind,
        id: data.id,
        publishedAt,
        issuer: data.issuer,
        for: data.for,
        title: data.title,
        ...(typeof data.section === "string" && data.section.trim()
          ? { section: data.section.trim() }
          : {}),
        ...(Array.isArray(data.tags)
          ? { tags: data.tags.filter((tag) => typeof tag === "string") }
          : {}),
        links,
        blurb: parsed.content.trim().replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n"),
        ...(cover ? { cover } : {}),
        ...(data.kind === "award" && data.starred === true ? { starred: true } : {}),
      };
    })
    .sort((a, b) =>
      Date.parse(`${b.publishedAt}T00:00:00Z`) - Date.parse(`${a.publishedAt}T00:00:00Z`) ||
      a.title.localeCompare(b.title)
    );
}

const appManifest = path.join(pressRoot, "manifest.json");
const publicManifest = path.join(projectRoot, "public", "press", "manifest.json");
const manifestPath = fs.existsSync(appManifest) ? appManifest : publicManifest;
required(fs.existsSync(manifestPath), "[press fallback] manifest.json not found");

const output = {
  items: { es: compileLanguage("es"), en: compileLanguage("en") },
  manifest: JSON.parse(fs.readFileSync(manifestPath, "utf8")),
};

fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(`[press-fallback] generated ${output.items.es.length + output.items.en.length} items → ${outputPath}`);
