import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Loader2 } from "lucide-react";
import { useCollections } from "@/contexts/CollectionsContext";
import { AddDesignData } from "@/types/collections";

interface SaveToCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  designData: AddDesignData | null;
  onSuccess?: () => void;
}

export function SaveToCollectionModal({ 
  isOpen, 
  onClose, 
  designData, 
  onSuccess 
}: SaveToCollectionModalProps) {
  const { collections, createCollection, addDesignToCollection } = useCollections();
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>("");
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionDescription, setNewCollectionDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Reset form when modal opens/closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedCollectionId("");
      setIsCreatingNew(false);
      setNewCollectionName("");
      setNewCollectionDescription("");
      setIsSaving(false);
    }
    onClose();
  };

  const handleSave = async () => {
    if (!designData) return;

    setIsSaving(true);

    try {
      let targetCollectionId = selectedCollectionId;

      // If creating new collection, create it first
      if (isCreatingNew) {
        if (!newCollectionName.trim()) {
          alert("Please enter a collection name");
          return;
        }

        const newCollection = createCollection({
          name: newCollectionName.trim(),
          description: newCollectionDescription.trim()
        });
        targetCollectionId = newCollection.id;
      }

      // Add design to collection
      if (targetCollectionId) {
        addDesignToCollection(targetCollectionId, designData);
        
        // Show success feedback
        onSuccess?.();
        
        // Close modal
        handleOpenChange(false);
      }
    } catch (error) {
      console.error("Error saving design:", error);
      alert("Failed to save design. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const canSave = () => {
    if (isCreatingNew) {
      return newCollectionName.trim().length > 0;
    }
    return selectedCollectionId.length > 0;
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg w-full max-h-[90vh] overflow-y-auto bg-surface-primary border-border-subtle">
        <DialogHeader>
          <DialogTitle className="font-dancing text-xl">
            Save to Collection
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Design Preview */}
          {designData && (
            <div className="flex items-center gap-3 p-3 bg-surface-tertiary rounded-lg">
              <img 
                src={designData.imageUrl} 
                alt="Design preview" 
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-text-primary line-clamp-2">
                  {designData.prompt}
                </div>
                <div className="text-xs text-text-muted mt-1">
                  {designData.garmentType} • {designData.type}
                </div>
              </div>
            </div>
          )}

          {/* Collection Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-text-primary">
              Choose Collection
            </Label>

            <div className="max-h-48 overflow-y-auto border border-border-subtle rounded-lg p-3 bg-surface-secondary">
              <RadioGroup 
                value={selectedCollectionId} 
                onValueChange={(value) => {
                  setSelectedCollectionId(value);
                  setIsCreatingNew(value === "new");
                }}
                className="space-y-2"
              >
                {collections.map((collection) => (
                  <div key={collection.id} className="flex items-center space-x-3 p-2 hover:bg-surface-tertiary rounded transition-colors">
                    <RadioGroupItem value={collection.id} id={collection.id} />
                    <Label 
                      htmlFor={collection.id} 
                      className="flex-1 cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-text-primary truncate">
                            {collection.name}
                          </div>
                          <div className="text-xs text-text-muted truncate">
                            {collection.description || "No description"}
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs ml-2 shrink-0">
                          {collection.designs.length}
                        </Badge>
                      </div>
                    </Label>
                  </div>
                ))}

                {/* Create New Collection Option */}
                <div className="flex items-center space-x-3 p-2 hover:bg-surface-tertiary rounded transition-colors">
                  <RadioGroupItem value="new" id="new" />
                  <Label htmlFor="new" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Plus className="h-4 w-4 text-text-muted" />
                      <span className="text-sm font-medium text-text-primary">
                        Create New Collection
                      </span>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* New Collection Form */}
          {isCreatingNew && (
            <div className="space-y-3 p-4 bg-surface-tertiary rounded-lg border border-border-subtle">
              <div className="space-y-2">
                <Label htmlFor="collection-name" className="text-sm font-medium">
                  Collection Name
                </Label>
                <Input
                  id="collection-name"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="e.g., Summer 2024, Evening Wear"
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="collection-description" className="text-sm font-medium">
                  Description (Optional)
                </Label>
                <Textarea
                  id="collection-description"
                  value={newCollectionDescription}
                  onChange={(e) => setNewCollectionDescription(e.target.value)}
                  placeholder="Describe this collection..."
                  className="w-full min-h-[50px] resize-none"
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-3 pt-4 border-t border-border-subtle">
          <Button 
            variant="outline" 
            onClick={() => handleOpenChange(false)}
            disabled={isSaving}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!canSave() || isSaving}
            className="flex-1 min-w-[140px]"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save to Collection"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
