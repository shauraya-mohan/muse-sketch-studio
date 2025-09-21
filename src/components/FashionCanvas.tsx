import { useState } from "react";
import { cn } from "@/lib/utils";
import { Sparkles, Loader2, Download, Play, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SaveToCollectionModal } from "@/components/SaveToCollectionModal";
import { AddDesignData } from "@/types/collections";
import { useToast } from "@/hooks/use-toast";

type DesignStep = 'prompt' | 'sketch' | 'colors' | 'model' | 'runway';

interface DesignState {
  prompt: string;
  garmentType: string;
  sketchUrl: string | null;
  coloredUrl: string | null;
  modelUrl: string | null;
  runwayUrl: string | null;
  selectedColors: string[];
  currentStep: DesignStep;
}

interface FashionCanvasProps {
  designState: DesignState;
  isGenerating?: boolean;
  currentOperation?: string;
  className?: string;
}

export function FashionCanvas({ designState, isGenerating, currentOperation, className }: FashionCanvasProps) {
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [currentDesignData, setCurrentDesignData] = useState<AddDesignData | null>(null);
  const { toast } = useToast();
  
  const downloadImage = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveToCollection = (designData: AddDesignData) => {
    setCurrentDesignData(designData);
    setShowSaveModal(true);
  };

  const handleSaveSuccess = () => {
    toast({
      title: "Design saved!",
      description: "Your design has been added to the collection.",
    });
  };

  const renderContent = () => {
    // Loading state
    if (isGenerating) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="w-16 h-16 rounded-full bg-surface-tertiary flex items-center justify-center mb-4">
            <Loader2 className="h-8 w-8 text-text-muted animate-spin" />
          </div>
          <h3 className="text-lg font-dancing font-semibold text-text-primary mb-2">
            {currentOperation || "Processing..."}
          </h3>
          <p className="text-text-secondary text-center max-w-xs font-roboto text-sm leading-relaxed">
            Please wait while AI works its magic
          </p>
        </div>
      );
    }

    // Show final runway video if available
    if (designState.runwayUrl) {
      return (
        <div className="h-full flex flex-col">
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="w-full max-w-lg">
              <video 
                controls 
                className="w-full rounded-lg shadow-lg"
                poster={designState.modelUrl || undefined}
              >
                <source src={designState.runwayUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
          <div className="p-4 border-t border-border-subtle bg-surface-secondary">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-dancing text-lg font-semibold text-text-primary">
                  Runway Show Complete! 🎉
                </h3>
                <p className="text-sm text-text-secondary">
                  Your fashion design is ready for the world
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleSaveToCollection({
                    type: 'runway',
                    imageUrl: designState.runwayUrl!,
                    prompt: designState.prompt,
                    garmentType: designState.garmentType
                  })}
                  size="sm"
                  variant="outline"
                >
                  <Bookmark className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button
                  onClick={() => downloadImage(designState.runwayUrl!, 'runway-video.mp4')}
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Show model photo if available
    if (designState.modelUrl) {
      return (
        <div className="h-full flex flex-col">
          <div className="flex-1 flex items-center justify-center p-4">
            <img 
              src={designState.modelUrl} 
              alt="Model wearing the design" 
              className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
            />
          </div>
          <div className="p-4 border-t border-border-subtle bg-surface-secondary">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-dancing text-lg font-semibold text-text-primary">
                  Model Photo Ready!
                </h3>
                <p className="text-sm text-text-secondary">
                  Click "Create Runway Video" to continue
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleSaveToCollection({
                    type: 'model',
                    imageUrl: designState.modelUrl!,
                    prompt: designState.prompt,
                    garmentType: designState.garmentType
                  })}
                  size="sm"
                  variant="outline"
                >
                  <Bookmark className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button
                  onClick={() => downloadImage(designState.modelUrl!, 'model-photo.png')}
                  size="sm"
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Show colored design if available
    if (designState.coloredUrl) {
      return (
        <div className="h-full flex flex-col">
          <div className="flex-1 flex items-center justify-center p-4">
            <img 
              src={designState.coloredUrl} 
              alt="Colored fashion design" 
              className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
            />
          </div>
          <div className="p-4 border-t border-border-subtle bg-surface-secondary">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-dancing text-lg font-semibold text-text-primary">
                  Colored Design Ready!
                </h3>
                <p className="text-sm text-text-secondary">
                  Click "Generate Model Photo" to continue
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleSaveToCollection({
                    type: 'colored',
                    imageUrl: designState.coloredUrl!,
                    prompt: designState.prompt,
                    garmentType: designState.garmentType
                  })}
                  size="sm"
                  variant="outline"
                >
                  <Bookmark className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button
                  onClick={() => downloadImage(designState.coloredUrl!, 'colored-design.png')}
                  size="sm"
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Show sketch if available
    if (designState.sketchUrl) {
      return (
        <div className="h-full flex flex-col">
          <div className="flex-1 flex items-center justify-center p-4">
            <img 
              src={designState.sketchUrl} 
              alt="Fashion sketch" 
              className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
            />
          </div>
          <div className="p-4 border-t border-border-subtle bg-surface-secondary">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-dancing text-lg font-semibold text-text-primary">
                  Sketch Generated!
                </h3>
                <p className="text-sm text-text-secondary">
                  Choose colors in the sidebar to continue
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleSaveToCollection({
                    type: 'sketch',
                    imageUrl: designState.sketchUrl!,
                    prompt: designState.prompt,
                    garmentType: designState.garmentType
                  })}
                  size="sm"
                  variant="outline"
                >
                  <Bookmark className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button
                  onClick={() => downloadImage(designState.sketchUrl!, 'fashion-sketch.png')}
                  size="sm"
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Initial state - no content yet
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="w-16 h-16 rounded-full bg-surface-tertiary flex items-center justify-center mb-4">
          <Sparkles className="h-8 w-8 text-text-muted" />
        </div>
        <h3 className="text-lg font-dancing font-semibold text-text-primary mb-2">
          Fashion Design Canvas
        </h3>
        <p className="text-text-secondary text-center max-w-xs font-roboto text-sm leading-relaxed mb-6">
          Start by entering a design prompt in the sidebar and clicking "Generate Sketch"
        </p>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-4 rounded-lg bg-surface-tertiary">
            <Sparkles className="h-6 w-6 mx-auto mb-2 text-text-muted" />
            <div className="text-sm font-medium text-text-primary">AI Sketch</div>
            <div className="text-xs text-text-muted">Generate from prompt</div>
          </div>
          <div className="p-4 rounded-lg bg-surface-tertiary">
            <Play className="h-6 w-6 mx-auto mb-2 text-text-muted" />
            <div className="text-sm font-medium text-text-primary">Runway Video</div>
            <div className="text-xs text-text-muted">Complete pipeline</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className={cn(
        "flex-1 bg-surface-primary",
        className
      )}>
        <div className="w-full h-full">
          {renderContent()}
        </div>
      </div>
      
      <SaveToCollectionModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        designData={currentDesignData}
        onSuccess={handleSaveSuccess}
      />
    </>
  );
}
