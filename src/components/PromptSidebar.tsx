import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface PromptSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  prompt: string;
  onPromptChange: (prompt: string) => void;
  className?: string;
}

const presetPrompts = [
  "Elegant evening gown with flowing silhouette",
  "Modern streetwear hoodie with geometric patterns",  
  "Classic tailored blazer with sharp shoulders",
  "Bohemian maxi dress with floral embroidery",
  "Minimalist white button-down shirt",
  "Avant-garde structured jacket with angular cuts",
  "Vintage-inspired A-line skirt with pleats",
  "Contemporary jumpsuit with wide-leg silhouette"
];

export function PromptSidebar({ isCollapsed, onToggleCollapse, prompt, onPromptChange, className }: PromptSidebarProps) {
  const handlePresetClick = (presetPrompt: string) => {
    onPromptChange(presetPrompt);
  };

  if (isCollapsed) {
    return (
      <div className={cn(
        "w-12 border-r border-border-subtle bg-surface-secondary flex flex-col items-center py-4",
        className
      )}>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="w-8 h-8 p-0 text-text-secondary hover:text-text-primary hover:bg-surface-tertiary"
        >
          <PanelLeftOpen className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className={cn(
      "w-80 border-r border-border-subtle bg-surface-secondary flex flex-col",
      className
    )}>
      {/* Header */}
      <div className="p-4 border-b border-border-subtle flex items-center justify-between">
        <h2 className="font-dancing text-xl font-semibold text-text-primary">
          Design Prompts
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="w-8 h-8 p-0 text-text-secondary hover:text-text-primary hover:bg-surface-tertiary"
        >
          <PanelLeftClose className="h-4 w-4" />
        </Button>
      </div>

      {/* Prompt Input */}
      <div className="p-4 border-b border-border-subtle">
        <label className="text-sm font-medium text-text-primary mb-2 block font-roboto">
          Describe your design
        </label>
        <Textarea
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder="Enter your fashion design description..."
          className="min-h-[100px] resize-none border-border-default bg-surface-primary text-text-primary placeholder:text-text-muted focus:border-border-strong"
        />
      </div>

      {/* Preset Examples */}
      <div className="flex-1 p-4">
        <h3 className="text-sm font-medium text-text-primary mb-3 font-roboto">
          Preset Examples
        </h3>
        <ScrollArea className="h-full">
          <div className="space-y-2">
            {presetPrompts.map((preset, index) => (
              <button
                key={index}
                onClick={() => handlePresetClick(preset)}
                className="w-full p-3 text-left text-sm text-text-secondary hover:text-text-primary hover:bg-surface-tertiary border border-border-subtle hover:border-border-default rounded transition-colors font-roboto"
              >
                {preset}
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}