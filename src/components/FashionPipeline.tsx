import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PanelLeftClose, PanelLeftOpen, Sparkles, Palette, User, Video, Check, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

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

interface FashionPipelineProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  designState: DesignState;
  onDesignStateChange: (state: DesignState) => void;
  onGenerateSketch: () => void;
  onAddColors: () => void;
  onGenerateModel: () => void;
  onGenerateRunway: () => void;
  isGenerating: boolean;
  className?: string;
}

const garmentTypes = [
  "dress", "shirt", "pants", "skirt", "jacket", "coat", "hoodie", "t-shirt",
  "blazer", "jumpsuit", "shorts", "sweater", "cardigan", "vest", "kimono"
];

const colorOptions = [
  "red", "blue", "green", "yellow", "purple", "pink", "orange", "black",
  "white", "gray", "brown", "navy", "emerald", "gold", "silver", "coral"
];

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

const steps = [
  { id: 'prompt', label: 'Design Prompt', icon: Sparkles, description: 'Describe your vision' },
  { id: 'sketch', label: 'Fashion Sketch', icon: Sparkles, description: 'AI-generated sketch' },
  { id: 'colors', label: 'Add Colors', icon: Palette, description: 'Choose color palette' },
  { id: 'model', label: 'Model Photo', icon: User, description: 'See it on a model' },
  { id: 'runway', label: 'Runway Video', icon: Video, description: 'Fashion show ready' }
];

export function FashionPipeline({ 
  isCollapsed, 
  onToggleCollapse, 
  designState, 
  onDesignStateChange,
  onGenerateSketch,
  onAddColors,
  onGenerateModel,
  onGenerateRunway,
  isGenerating,
  className 
}: FashionPipelineProps) {
  const navigate = useNavigate();

  const updateDesignState = (updates: Partial<DesignState>) => {
    onDesignStateChange({ ...designState, ...updates });
  };

  const toggleColor = (color: string) => {
    const newColors = designState.selectedColors.includes(color)
      ? designState.selectedColors.filter(c => c !== color)
      : [...designState.selectedColors, color];
    updateDesignState({ selectedColors: newColors });
  };

  const getStepStatus = (stepId: string) => {
    const stepIndex = steps.findIndex(s => s.id === stepId);
    const currentIndex = steps.findIndex(s => s.id === designState.currentStep);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };

  const isStepCompleted = (stepId: string) => {
    switch (stepId) {
      case 'prompt': return !!designState.prompt;
      case 'sketch': return !!designState.sketchUrl;
      case 'colors': return !!designState.coloredUrl;
      case 'model': return !!designState.modelUrl;
      case 'runway': return !!designState.runwayUrl;
      default: return false;
    }
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
      "w-96 border-r border-border-subtle bg-surface-secondary flex flex-col",
      className
    )}>
      {/* Header */}
      <div className="p-4 border-b border-border-subtle">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-dancing text-xl font-semibold text-text-primary">
            Fashion Pipeline
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
        
        {/* Collections Link */}
        <Button
          variant="outline"
          size="sm"
          className="w-full text-sm"
          onClick={() => navigate('/collections')}
        >
          <BookOpen className="h-4 w-4 mr-2" />
          View Collections
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          
          {/* Progress Steps */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-text-primary">Progress</h3>
            <div className="space-y-2">
              {steps.map((step, index) => {
                const status = getStepStatus(step.id);
                const Icon = step.icon;
                return (
                  <div key={step.id} className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      status === 'completed' && "bg-green-100 text-green-600",
                      status === 'current' && "bg-blue-100 text-blue-600",
                      status === 'pending' && "bg-gray-100 text-gray-400"
                    )}>
                      {status === 'completed' ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className={cn(
                        "text-sm font-medium",
                        status === 'current' && "text-text-primary",
                        status !== 'current' && "text-text-secondary"
                      )}>
                        {step.label}
                      </div>
                      <div className="text-xs text-text-muted">{step.description}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 1: Prompt Input */}
          {designState.currentStep === 'prompt' && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-text-primary">Step 1: Design Prompt</h3>
              
              <div>
                <label className="text-sm font-medium text-text-primary mb-2 block">
                  Garment Type
                </label>
                <Select value={designState.garmentType} onValueChange={(value) => updateDesignState({ garmentType: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {garmentTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-text-primary mb-2 block">
                  Describe your design
                </label>
                <Textarea
                  value={designState.prompt}
                  onChange={(e) => updateDesignState({ prompt: e.target.value })}
                  placeholder="Enter your fashion design description..."
                  className="min-h-[100px] resize-none"
                />
              </div>

              <Button 
                onClick={onGenerateSketch}
                disabled={!designState.prompt || isGenerating}
                className="w-full"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Sketch
              </Button>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-text-primary">Preset Examples</h4>
                <div className="space-y-2">
                  {presetPrompts.map((preset, index) => (
                    <button
                      key={index}
                      onClick={() => updateDesignState({ prompt: preset })}
                      className="w-full p-2 text-left text-sm text-text-secondary hover:text-text-primary hover:bg-surface-tertiary border border-border-subtle hover:border-border-default rounded transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Color Selection */}
          {designState.currentStep === 'colors' && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-text-primary">Step 2: Choose Colors</h3>
              
              <div className="space-y-3">
                <label className="text-sm font-medium text-text-primary">
                  Select colors for your design
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {colorOptions.map(color => (
                    <button
                      key={color}
                      onClick={() => toggleColor(color)}
                      className={cn(
                        "w-full h-8 rounded border-2 transition-all",
                        designState.selectedColors.includes(color) 
                          ? "border-gray-800 scale-95" 
                          : "border-gray-300 hover:border-gray-500"
                      )}
                      style={{ backgroundColor: color === 'white' ? '#f8f9fa' : color }}
                      title={color}
                    />
                  ))}
                </div>
                
                {designState.selectedColors.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {designState.selectedColors.map(color => (
                      <Badge key={color} variant="secondary" className="text-xs">
                        {color}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <Button 
                onClick={onAddColors}
                disabled={isGenerating}
                className="w-full"
              >
                <Palette className="h-4 w-4 mr-2" />
                Add Colors
              </Button>
            </div>
          )}

          {/* Step 3: Model Generation */}
          {designState.currentStep === 'model' && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-text-primary">Step 3: Generate Model Photo</h3>
              <p className="text-sm text-text-secondary">
                Create a professional model photo wearing your colored design.
              </p>

              <Button 
                onClick={onGenerateModel}
                disabled={isGenerating}
                className="w-full"
              >
                <User className="h-4 w-4 mr-2" />
                Generate Model Photo
              </Button>
            </div>
          )}

          {/* Step 4: Runway Video */}
          {designState.currentStep === 'runway' && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-text-primary">Step 4: Create Runway Video</h3>
              <p className="text-sm text-text-secondary">
                Generate a runway walk video with your model wearing the design.
              </p>

              <Button 
                onClick={onGenerateRunway}
                disabled={isGenerating}
                className="w-full"
              >
                <Video className="h-4 w-4 mr-2" />
                Create Runway Video
              </Button>
            </div>
          )}

        </div>
      </ScrollArea>
    </div>
  );
}
