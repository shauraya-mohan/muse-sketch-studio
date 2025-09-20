import { cn } from "@/lib/utils";
import { Sparkles, Upload, Loader2 } from "lucide-react";

interface CanvasAreaProps {
  generatedImage?: string | null;
  isGenerating?: boolean;
  className?: string;
}

export function CanvasArea({ generatedImage, isGenerating, className }: CanvasAreaProps) {

  return (
    <div className={cn(
      "flex-1 bg-surface-primary p-8 flex items-center justify-center",
      className
    )}>
      <div className="w-full h-full max-w-2xl max-h-2xl border-2 border-dashed border-border-default rounded-lg flex flex-col items-center justify-center bg-surface-secondary">
        {isGenerating ? (
          <>
            <div className="w-16 h-16 rounded-full bg-surface-tertiary flex items-center justify-center mb-4">
              <Loader2 className="h-8 w-8 text-text-muted animate-spin" />
            </div>
            <h3 className="text-lg font-dancing font-semibold text-text-primary mb-2">
              Generating Your Design...
            </h3>
            <p className="text-text-secondary text-center max-w-xs font-roboto text-sm leading-relaxed">
              This may take a few minutes. Please wait while AI creates your fashion design.
            </p>
          </>
        ) : generatedImage ? (
          <div className="w-full h-full rounded-lg bg-surface-primary border border-border-subtle p-4 flex items-center justify-center">
            <img 
              src={generatedImage} 
              alt="Generated fashion design" 
              className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
            />
          </div>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-surface-tertiary flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-text-muted" />
            </div>
            <h3 className="text-lg font-dancing font-semibold text-text-primary mb-2">
              Your Design Canvas
            </h3>
            <p className="text-text-secondary text-center max-w-xs font-roboto text-sm leading-relaxed">
              Enter a prompt in the sidebar and click Generate to create your fashion design, or upload an existing sketch to enhance
            </p>
            <div className="mt-6 flex items-center gap-3">
              <button className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary border border-border-default hover:border-border-strong rounded transition-colors font-roboto">
                <Upload className="h-4 w-4 mr-2 inline" />
                Upload Sketch
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}