"use client";

import React, { useState } from "react";
import { Share2, Link as LinkIcon, Check } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface BlogShareRowProps {
  title: string;
  url: string;
}

export function BlogShareRow({ title, url }: BlogShareRowProps) {
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Article link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy link to clipboard.");
    }
  };

  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(`Check out this pet care guide on PetsWorld: ${title}\n${url}`);
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}`;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-4 px-6 rounded-2xl bg-[#FFF8F0] border border-[#E8D9CD]">
      <div className="flex items-center gap-2 text-xs font-bold text-[#2B2622]">
        <Share2 className="w-4 h-4 text-[#1F4D3A]" />
        <span>Share this pet care guide:</span>
      </div>

      <div className="flex items-center gap-2">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#25D366] text-white text-xs font-bold hover:bg-[#1EBE5D] transition-colors shadow-xs"
        >
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.969.584 1.961.949 2.796.949h.005c3.181 0 5.767-2.586 5.768-5.766 0-1.542-.602-2.99-1.693-4.08-1.09-1.091-2.54-1.656-4.079-1.656zm6.812 9.845c-.287.808-1.427 1.48-1.974 1.574-.52.091-1.2.13-3.879-.982-3.424-1.424-5.632-4.9-5.803-5.127-.171-.227-1.393-1.854-1.393-3.536 0-1.682.883-2.511 1.196-2.855.313-.344.685-.43 0.913-.43.228 0 .456.002.656.012.213.011.498-.081.779.593.287.689.974 2.378 1.058 2.551.085.172.142.374.029.602-.113.228-.171.37-.342.57-.171.2-.36.446-.514.599-.171.171-.35.358-.15.703.199.344.887 1.464 1.902 2.368 1.304 1.162 2.404 1.521 2.748 1.693.344.172.544.143.744-.086.2-.229.856-.998 1.084-1.341.228-.344.456-.287.77-.171.314.114 1.996.94 2.339 1.112.343.172.571.258.656.402.086.144.086.832-.201 1.64z" />
          </svg>
          <span>WhatsApp</span>
        </a>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E8D9CD] text-[#2B2622] text-xs font-bold hover:bg-[#FFF8F0] transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-[#1F4D3A]" /> : <LinkIcon className="w-3.5 h-3.5 text-[#6B6560]" />}
          <span>{copied ? "Copied!" : "Copy Link"}</span>
        </button>
      </div>
    </div>
  );
}
