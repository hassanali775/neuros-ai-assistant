"use client";

import { useChatStore } from "@/store/chatStore";
import { ChevronDown, Cpu } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

export function ModelSelector() {
  const { ollamaModels, selectedModel, setSelectedModel } = useChatStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName = selectedModel.split(":")[0];

  if (ollamaModels.length === 0) {
    return (
      <div className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5">
        <Cpu className="h-3 w-3 text-neutral-600" />
        <span className="font-mono text-[10px] text-neutral-600">NO MODELS</span>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 transition-all",
          "font-mono text-[10px] font-medium tracking-wider",
          open
            ? "border-violet-500/40 bg-violet-500/10 text-violet-300"
            : "border-white/[0.06] bg-white/[0.03] text-neutral-400 hover:border-white/[0.1] hover:text-neutral-300",
        )}
      >
        <Cpu className="h-3 w-3" />
        <span className="uppercase">{displayName}</span>
        <ChevronDown
          className={cn(
            "h-3 w-3 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-1.5 min-w-[10rem] overflow-hidden rounded-xl border border-white/[0.08] bg-[#0f0f18] shadow-2xl shadow-black/60">
          <div className="border-b border-white/[0.04] px-3 py-2">
            <p className="font-mono text-[9px] tracking-[0.2em] text-neutral-700">
              OLLAMA MODELS
            </p>
          </div>
          <ul className="p-1">
            {ollamaModels.map((model) => {
              const isSelected = model.name === selectedModel;
              return (
                <li key={model.name}>
                  <button
                    onClick={() => {
                      setSelectedModel(model.name);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors",
                      isSelected
                        ? "bg-violet-500/15 text-violet-300"
                        : "text-neutral-400 hover:bg-white/[0.04] hover:text-neutral-200",
                    )}
                  >
                    {isSelected && (
                      <div className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                    )}
                    <span className="font-mono text-[11px]">
                      {model.name}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
