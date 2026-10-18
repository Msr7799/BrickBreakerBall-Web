import fs from "node:fs";
import path from "node:path";
import React from "react";
import type { Lang } from "@/lib/site";

function inline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

function assetUrl(raw: string) {
  if (raw.startsWith("assets/")) return `/game/${raw}`;
  return raw;
}

export default function RulesMarkdown({ lang }: { lang: Lang }) {
  const fileName = lang === "ar" ? "volley-rules-ar.md" : "volley-rules-en.md";
  const markdown = fs.readFileSync(path.join(process.cwd(), "content", fileName), "utf8");
  const lines = markdown.split(/\r?\n/);
  const nodes: React.ReactNode[] = [];
  let bullets: string[] = [];

  const flushBullets = () => {
    if (!bullets.length) return;
    const items = bullets;
    bullets = [];
    nodes.push(
      <ul key={`ul-${nodes.length}`}>
        {items.map((item, i) => <li key={i}>{inline(item)}</li>)}
      </ul>
    );
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushBullets();
      continue;
    }
    if (line.startsWith("- ")) {
      bullets.push(line.slice(2));
      continue;
    }
    flushBullets();

    const image = line.match(/^!\[(.*?)\]\((.*?)\)$/);
    if (image) {
      nodes.push(<img key={`img-${nodes.length}`} src={assetUrl(image[2])} alt={image[1]} loading="lazy" />);
      continue;
    }

    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      const level = heading[1].length;
      const text = heading[2];
      if (level === 1) nodes.push(<h1 key={`h-${nodes.length}`}>{inline(text)}</h1>);
      else if (level === 2) nodes.push(<h2 key={`h-${nodes.length}`}>{inline(text)}</h2>);
      else if (level === 3) nodes.push(<h3 key={`h-${nodes.length}`}>{inline(text)}</h3>);
      else nodes.push(<h4 key={`h-${nodes.length}`}>{inline(text)}</h4>);
      continue;
    }

    nodes.push(<p key={`p-${nodes.length}`}>{inline(line)}</p>);
  }
  flushBullets();

  return <article className={`prose-game ${lang === "ar" ? "rtl-prose" : ""}`}>{nodes}</article>;
}
