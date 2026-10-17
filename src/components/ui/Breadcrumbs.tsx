import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const hasHome = items.length > 0 && (items[0].href === "/" || items[0].label.toLowerCase() === "home");
  const fullItems: BreadcrumbItem[] = hasHome ? items : [{ label: "Home", href: "/" }, ...items];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: fullItems.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: item.href ? `https://petsworld.pk${item.href}` : undefined,
    })),
  };

  return (
    <nav aria-label="Breadcrumb" className="py-3">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ol className="flex flex-wrap items-center gap-1.5 text-xs text-[#6B6560]">
        {fullItems.map((item, i) => {
          const isLast = i === fullItems.length - 1;
          return (
            <li key={i} className="flex items-center gap-1.5">
              {i > 0 && (
                <ChevronRight className="w-3.5 h-3.5 text-[#E8D9CD] shrink-0" aria-hidden="true" />
              )}
              {isLast || !item.href ? (
                <span className="font-semibold text-[#1F4D3A] truncate max-w-[200px]" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-[#1F4D3A] hover:underline transition-colors truncate max-w-[150px]"
                >
                  {i === 0 ? <span className="flex items-center gap-1"><Home className="w-3 h-3" /> Home</span> : item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
