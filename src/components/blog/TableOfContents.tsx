"use client";

import React, { useEffect, useState } from "react";
import { ListCollapse, ChevronRight } from "lucide-react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      {
        rootMargin: "-80px 0px -60% 0px",
        threshold: 0.1,
      }
    );

    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-[#E8D9CD] p-5 shadow-xs sticky top-28 space-y-3">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1F4D3A] pb-2 border-b border-[#E8D9CD]/70">
        <ListCollapse className="w-4 h-4" />
        <span>Table of Contents</span>
      </div>

      <nav className="space-y-1 max-h-[70vh] overflow-y-auto pr-1 text-xs">
        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`block py-1.5 transition-colors rounded-lg px-2 leading-snug ${
                item.level === 3 ? "pl-5 text-[11px]" : "font-medium"
              } ${
                isActive
                  ? "bg-[#1F4D3A]/10 text-[#1F4D3A] font-bold"
                  : "text-[#6B6560] hover:text-[#2B2622] hover:bg-[#FFF8F0]"
              }`}
            >
              {item.text}
            </a>
          );
        })}
      </nav>
    </div>
  );
}
