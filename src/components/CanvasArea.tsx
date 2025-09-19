import { useState } from "react";
import { cn } from "@/lib/utils";
import { Sparkles, Upload } from "lucide-react";

interface CanvasAreaProps {
  className?: string;
}

export function CanvasArea({ className }: CanvasAreaProps) {
  const [hasImage, setHasImage] = useState(false);

  return (
    <div className={cn(
      "flex-1 bg-surface-primary p-8 flex items-center justify-center",
      className
    )}>
      <div className="w-full h-full max-w-2xl max-h-2xl border-2 border-dashed border-border-default rounded-lg flex flex-col items-center justify-center bg-surface-secondary">
        {!hasImage ? (
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
        ) : (
          <div className="w-full h-full rounded-lg bg-surface-primary border border-border-subtle">
            {/* Generated/uploaded image will be displayed here */}
          </div>
        )}
      </div>
    </div>
  );
}