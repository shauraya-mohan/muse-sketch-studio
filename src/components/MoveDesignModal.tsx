import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useCollections } from "@/contexts/CollectionsContext";
import { Move, Loader2 } from "lucide-react";

interface MoveDesignModalProps {
  isOpen: boolean;
  onClose: () => void;
  designId: string;
  currentCollectionId: string;
  onSuccess: () => void;
}

export default function MoveDesignModal({ 
  isOpen, 
  onClose, 
  designId, 
  currentCollectionId,
  onSuccess 
}: MoveDesignModalProps) {
  const { collections, getCollection, addDesignToCollection, removeDesignFromCollection } = useCollections();
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Get the current design
  const currentCollection = getCollection(currentCollectionId);
  const design = currentCollection?.designs.find(d => d.id === designId);

  // Filter out the current collection
  const availableCollections = collections.filter(c => c.id !== currentCollectionId);

  const handleMove = async () => {
    if (!selectedCollectionId || !design) return;

    setIsLoading(true);
    try {
      // Add design to new collection
      await addDesignToCollection(selectedCollectionId, {
        type: design.type,
        imageUrl: design.imageUrl,
        prompt: design.prompt,
        garmentType: design.garmentType
      });

      // Remove design from current collection
      await removeDesignFromCollection(currentCollectionId, designId);

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to move design:', error);
      alert('Failed to move design. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedCollectionId("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Move className="h-5 w-5" />
            Move Design
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Design Preview */}
          {design && (
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <img 
                src={design.imageUrl} 
                alt={design.prompt}
                className="w-16 h-16 object-cover rounded flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 line-clamp-3 break-words">
                  {design.prompt}
                </p>
                <Badge variant="secondary" className="text-xs mt-2">
                  {design.type}
                </Badge>
              </div>
            </div>
          )}

          {/* Collection Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Move to collection:</Label>
            <RadioGroup 
              value={selectedCollectionId} 
              onValueChange={setSelectedCollectionId}
              className="space-y-2"
            >
              {availableCollections.length === 0 ? (
                <p className="text-sm text-gray-500 py-4 text-center">
                  No other collections available
                </p>
              ) : (
                availableCollections.map((collection) => (
                  <div key={collection.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={collection.id} id={collection.id} />
                    <Label 
                      htmlFor={collection.id} 
                      className="flex-1 cursor-pointer p-2 rounded hover:bg-gray-50"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{collection.name}</p>
                          {collection.description && (
                            <p className="text-sm text-gray-500">{collection.description}</p>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {collection.designs.length} designs
                        </Badge>
                      </div>
                    </Label>
                  </div>
                ))
              )}
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleMove} 
            disabled={!selectedCollectionId || isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Moving...
              </>
            ) : (
              <>
                <Move className="h-4 w-4 mr-2" />
                Move Design
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
