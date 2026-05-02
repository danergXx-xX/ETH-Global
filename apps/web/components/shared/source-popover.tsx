"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Source, SourceType } from "@/lib/types";

interface SourcePopoverProps {
  source: Source;
  index: number;
}

const SOURCE_ICONS: Record<SourceType, string> = {
  defillama: "DL",
  coingecko: "CG",
  rss: "RSS",
  perplexity: "PX",
  aixbt: "AI",
};

function confidenceColor(conf: number): string {
  if (conf >= 0.9) return "text-vote-for";
  if (conf >= 0.8) return "text-amber";
  return "text-muted-foreground";
}

export function SourcePopover({ source, index }: SourcePopoverProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          className="ml-0.5 inline-flex items-center justify-center rounded bg-secondary px-1 text-[10px] font-mono text-amber hover:bg-accent transition-colors"
          aria-label={`Source ${index}: ${source.title}`}
        >
          [{index}]
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="max-w-xs border-border bg-card p-3 text-xs"
      >
        <div className="mb-1 flex items-center gap-2">
          <span className="rounded bg-secondary px-1 py-0.5 font-mono text-[10px] text-muted-foreground">
            {SOURCE_ICONS[source.type]}
          </span>
          <span className="font-medium text-card-foreground line-clamp-1">
            {source.title}
          </span>
        </div>
        <p className="mb-1 text-muted-foreground">{source.snippet}</p>
        <div className="flex items-center justify-between">
          <span className={confidenceColor(source.confidence)}>
            {Math.round(source.confidence * 100)}% confidence
          </span>
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber hover:underline"
          >
            View source
          </a>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
