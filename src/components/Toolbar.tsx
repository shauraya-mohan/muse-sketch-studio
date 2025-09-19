import { Button } from "@/components/ui/button";
import { Download, RotateCcw, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolbarProps {
  onGenerate?: () => void;
  onUndo?: () => void;
  onDownload?: () => void;
  className?: string;
}

export function Toolbar({ onGenerate, onUndo, onDownload, className }: ToolbarProps) {
  return (
    <div className={cn(
      "flex items-center gap-2 px-4 py-3 border-b border-border-subtle bg-surface-primary",
      className
    )}>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onGenerate}
          className="h-8 px-3 text-text-primary hover:bg-surface-tertiary border border-border-subtle hover:border-border-default transition-colors"
        >
          <Sparkles className="h-4 w-4 mr-1.5" />
          Generate
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onUndo}
          className="h-8 w-8 p-0 text-text-secondary hover:text-text-primary hover:bg-surface-tertiary border border-border-subtle hover:border-border-default transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onDownload}
          className="h-8 w-8 p-0 text-text-secondary hover:text-text-primary hover:bg-surface-tertiary border border-border-subtle hover:border-border-default transition-colors"
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}