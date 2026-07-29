import fs from "node:fs";
import path from "node:path";
import { ReferenceInteractions } from "@/components/reference-interactions";

const routeMap: Record<string, string> = {
  "index.html": "/",
  "merchants.html": "/for-merchants",
  "contact.html": "/contact",
  "privacy-policy.html": "/privacy-policy",
  "terms-of-service.html": "/terms-of-service",
};

export function ReferencePage({ file }: { file: "index.html" | "merchants.html" | "contact.html" }) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const source = fs.readFileSync(path.join(process.cwd(), "src", "reference", file), "utf8");
  const body = source.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? "";
  let html = body.replace(/<script[^>]*src=["']script\.js["'][^>]*><\/script>/gi, "");
  html = html.replace(
    /<span class="logo-mark"><svg[\s\S]*?<\/svg><\/span>/gi,
    `<span class="logo-mark logo-image"><img src="${basePath}/brand/offsay-icon.png" alt="" /></span>`,
  );
  html = html.replaceAll("font-family:'Space Grotesk',sans-serif", "font-family:'Poppins',sans-serif");

  for (const [from, to] of Object.entries(routeMap)) {
    const target = to === "/" ? `${basePath}/` : `${basePath}${to}`;
    html = html.replaceAll(`${from}#`, `${target}#`).replaceAll(`href="${from}"`, `href="${target}"`);
  }

  return <><div dangerouslySetInnerHTML={{ __html: html }} /><ReferenceInteractions /></>;
}
