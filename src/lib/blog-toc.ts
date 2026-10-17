export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function extractTocAndInjectIds(html: string): {
  contentWithIds: string;
  toc: TocItem[];
} {
  const toc: TocItem[] = [];
  const slugCounts: Record<string, number> = {};

  const contentWithIds = html.replace(
    /<h([23])(.*?)>(.*?)<\/h\1>/gi,
    (match, levelStr, attrs, innerText) => {
      const level = parseInt(levelStr, 10);
      const cleanText = innerText.replace(/<[^>]+>/g, "").trim();
      if (!cleanText) return match;

      let baseSlug = cleanText
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");

      if (!baseSlug) baseSlug = `section-${toc.length + 1}`;

      let slug = baseSlug;
      if (slugCounts[slug]) {
        slugCounts[slug]++;
        slug = `${baseSlug}-${slugCounts[slug]}`;
      } else {
        slugCounts[slug] = 1;
      }

      toc.push({
        id: slug,
        text: cleanText,
        level,
      });

      // Preserve existing attributes except id
      const cleanedAttrs = attrs.replace(/\bid="[^"]*"/gi, "").trim();
      const attrString = cleanedAttrs ? ` ${cleanedAttrs}` : "";

      return `<h${level}${attrString} id="${slug}">${innerText}</h${level}>`;
    }
  );

  return { contentWithIds, toc };
}
