import sanitizeHtml from "sanitize-html";

export function sanitizeRichText(html: string): string {
  if (!html) return "";

  return sanitizeHtml(html, {
    allowedTags: [
      "h1", "h2", "h3", "h4", "h5", "h6",
      "p", "a", "b", "strong", "i", "em", "u", "s", "strike",
      "ul", "ol", "li",
      "blockquote", "hr", "br",
      "table", "thead", "tbody", "tr", "th", "td",
      "img",
      "div", "span",
    ],
    allowedAttributes: {
      a: ["href", "name", "target", "rel", "title"],
      img: ["src", "alt", "title", "width", "height", "loading"],
      div: ["class", "data-callout-type"],
      span: ["class"],
      th: ["colspan", "rowspan", "style"],
      td: ["colspan", "rowspan", "style"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    transformTags: {
      a: (tagName, attribs) => {
        const href = attribs.href || "";
        // External links get rel="noopener noreferrer"
        if (href.startsWith("http://") || href.startsWith("https://")) {
          return {
            tagName: "a",
            attribs: {
              ...attribs,
              target: "_blank",
              rel: "noopener noreferrer",
            },
          };
        }
        return { tagName: "a", attribs };
      },
    },
  });
}
