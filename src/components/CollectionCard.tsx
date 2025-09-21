import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Calendar, Image as ImageIcon, Copy, Heart } from "lucide-react";
import { Collection } from "@/types/collections";

interface CollectionCardProps {
  collection: Collection;
  onClick?: () => void;
  onDuplicate?: (collectionId: string) => void;
  className?: string;
  viewMode?: "grid" | "list";
}

export function CollectionCard({ collection, onClick, onDuplicate, className, viewMode = "grid" }: CollectionCardProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const isFavoritesCollection = collection.id === 'favorites-collection';

  const getThumbnails = () => {
    // Get up to 4 designs for the 2x2 grid
    const designs = collection.designs.slice(0, 4);
    
    // Fill empty slots with placeholder
    const thumbnails = [...designs];
    while (thumbnails.length < 4) {
      thumbnails.push(null);
    }
    
    return thumbnails;
  };

  const thumbnails = getThumbnails();
  const hasDesigns = collection.designs.length > 0;

  return (
    <div
      className={cn(
        "group relative bg-surface-secondary rounded-lg border border-border-subtle overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] hover:border-border-default",
        viewMode === "grid" 
          ? "aspect-[3/4] w-full max-w-sm" // Tall rectangle aspect ratio for grid
          : "w-full h-48 flex", // Horizontal layout for list
        className
      )}
      onClick={onClick}
    >
      {viewMode === "grid" ? (
        <>
          {/* Header */}
          <div className="p-4 pb-3">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-dancing text-lg font-semibold text-text-primary line-clamp-2 group-hover:text-accent transition-colors flex items-center gap-2">
                {isFavoritesCollection && <Heart className="h-4 w-4 text-red-500 fill-current" />}
                {collection.name}
              </h3>
              <Badge variant="secondary" className="text-xs shrink-0 ml-2">
                {collection.designs.length} designs
              </Badge>
            </div>
            
            {collection.description && (
              <p className="text-sm text-text-secondary line-clamp-2 mb-3">
                {collection.description}
              </p>
            )}
            
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <Calendar className="h-3 w-3" />
              <span>Created {formatDate(collection.createdAt)}</span>
            </div>
          </div>

          {/* Image Grid */}
          <div className="px-4 pb-4 flex-1">
            {hasDesigns ? (
              <div className="grid grid-cols-2 gap-2 h-32">
                {thumbnails.map((design, index) => (
                  <div
                    key={design?.id || `empty-${index}`}
                    className={cn(
                      "relative rounded-md overflow-hidden bg-surface-tertiary",
                      "group-hover:ring-2 group-hover:ring-accent/20 transition-all duration-200"
                    )}
                  >
                    {design ? (
                      <>
                        <img
                          src={design.imageUrl}
                          alt={design.prompt}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        {/* Design type badge */}
                        <div className="absolute top-1 right-1">
                          <Badge 
                            variant="secondary" 
                            className="text-xs px-1 py-0.5 bg-black/50 text-white border-0"
                          >
                            {design.type}
                          </Badge>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-text-muted" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-32 flex flex-col items-center justify-center bg-surface-tertiary rounded-md">
                <ImageIcon className="h-8 w-8 text-text-muted mb-2" />
                <p className="text-sm text-text-muted text-center">
                  No designs yet
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 pb-4 space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full group-hover:bg-accent group-hover:text-accent-foreground transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onClick?.();
              }}
            >
              <Eye className="h-4 w-4 mr-2" />
              View Collection
            </Button>
            {onDuplicate && !isFavoritesCollection && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-text-muted hover:text-text-primary transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate(collection.id);
                }}
              >
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </Button>
            )}
          </div>
        </>
      ) : (
        <>
          {/* List View Layout */}
          {/* Images Section */}
          <div className="w-48 h-full flex-shrink-0">
            {hasDesigns ? (
              <div className="h-full flex gap-2 p-4">
                {collection.designs.slice(0, 3).map((design, index) => (
                  <div
                    key={design.id}
                    className={cn(
                      "relative rounded-md overflow-hidden bg-surface-tertiary flex-1",
                      "group-hover:ring-2 group-hover:ring-accent/20 transition-all duration-200"
                    )}
                  >
                    <img
                      src={design.imageUrl}
                      alt={design.prompt}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {/* Design type badge */}
                    <div className="absolute top-1 right-1">
                      <Badge 
                        variant="secondary" 
                        className="text-xs px-1 py-0.5 bg-black/50 text-white border-0"
                      >
                        {design.type}
                      </Badge>
                    </div>
                  </div>
                ))}
                {collection.designs.length > 3 && (
                  <div className="flex-1 flex items-center justify-center bg-surface-tertiary rounded-md">
                    <span className="text-sm text-text-muted">+{collection.designs.length - 3}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center bg-surface-tertiary m-4 rounded-md">
                <div className="text-center">
                  <ImageIcon className="h-8 w-8 text-text-muted mb-2 mx-auto" />
                  <p className="text-sm text-text-muted">No designs yet</p>
                </div>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="flex-1 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-dancing text-xl font-semibold text-text-primary group-hover:text-accent transition-colors flex items-center gap-2">
                  {isFavoritesCollection && <Heart className="h-5 w-5 text-red-500 fill-current" />}
                  {collection.name}
                </h3>
                <Badge variant="secondary" className="text-sm shrink-0 ml-2">
                  {collection.designs.length} designs
                </Badge>
              </div>
              
              {collection.description && (
                <p className="text-text-secondary mb-3 line-clamp-2">
                  {collection.description}
                </p>
              )}
              
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <Calendar className="h-4 w-4" />
                <span>Created {formatDate(collection.createdAt)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="group-hover:bg-accent group-hover:text-accent-foreground transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onClick?.();
                }}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Collection
              </Button>
              {onDuplicate && !isFavoritesCollection && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-text-muted hover:text-text-primary transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicate(collection.id);
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </Button>
              )}
            </div>
          </div>
        </>
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
    </div>
  );
}
