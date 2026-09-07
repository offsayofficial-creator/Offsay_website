import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const readSource = (relativePath: string) =>
  fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");

describe("public website content", () => {
  it("removes download buttons from every website header", () => {
    const homepage = readSource("src/reference/index.html");
    const contact = readSource("src/reference/contact.html");
    const legalPage = readSource("src/components/legal-page.tsx");

    expect(homepage.match(/<header[\s\S]*?<\/header>/i)?.[0]).not.toContain("Download App");
    expect(contact.match(/<header[\s\S]*?<\/header>/i)?.[0]).not.toContain("Download App");
    expect(legalPage.match(/<header[\s\S]*?<\/header>/i)?.[0]).not.toContain("Download App");
  });

  it("publishes the new clickable contact number", () => {
    const contact = readSource("src/reference/contact.html");
    expect(contact).toContain('href="tel:+918891709012"');
    expect(contact).toContain("+91 8891709012");
    expect(contact).not.toContain("+91 8907279012");
  });

  it("keeps App Store unavailable and Google Play externally linked", () => {
    const homepage = readSource("src/reference/index.html");
    expect(homepage).toContain("data-coming-soon");
    expect(homepage).toContain('href="{{PLAY_STORE_URL}}"');
    expect(homepage).toContain('target="_blank" rel="noopener noreferrer"');
  });
});
