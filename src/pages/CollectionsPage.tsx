import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CollectionCard } from "@/components/CollectionCard";
import { CreateCollectionModal } from "@/components/CreateCollectionModal";
import { useCollections } from "@/contexts/CollectionsContext";
import { Plus, Search, Grid, List, ArrowLeft, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CollectionsPage() {
  const navigate = useNavigate();
  const { collections, isLoading, createCollection, duplicateCollection, getRecentCollections } = useCollections();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showRecent, setShowRecent] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filter collections based on search query
  const filteredCollections = collections.filter(collection =>
    collection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    collection.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get recent collections
  const recentCollections = getRecentCollections();
  const displayCollections = showRecent ? recentCollections : filteredCollections;

  const handleCreateCollection = async (data: { name: string; description: string }) => {
    try {
      createCollection(data);
    } catch (error) {
      console.error('Failed to create collection:', error);
      throw error; // Re-throw to let the modal handle the error state
    }
  };

  const handleViewCollection = (collectionId: string) => {
    navigate(`/collections/${collectionId}`);
  };

  const handleDuplicateCollection = (collectionId: string) => {
    try {
      duplicateCollection(collectionId);
    } catch (error) {
      console.error('Failed to duplicate collection:', error);
      alert('Failed to duplicate collection. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading collections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-primary">
      {/* Header */}
      <div className="border-b border-border-subtle bg-surface-secondary">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="text-text-secondary hover:text-text-primary"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Design Tool
              </Button>
              <div>
                <h1 className="font-dancing text-3xl font-bold text-text-primary mb-2">
                  My Collections
                </h1>
                <p className="text-text-secondary">
                  {collections.length} collection{collections.length !== 1 ? 's' : ''} • {collections.reduce((total, c) => total + c.designs.length, 0)} designs
                </p>
              </div>
            </div>
            <Button onClick={() => setShowCreateModal(true)} className="font-dancing">
              <Plus className="h-4 w-4 mr-2" />
              New Collection
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-muted" />
              <Input
                placeholder="Search collections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={showRecent ? "default" : "outline"}
                size="sm"
                onClick={() => setShowRecent(!showRecent)}
                disabled={recentCollections.length === 0}
              >
                Recent
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Collections Grid/List */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {displayCollections.length === 0 ? (
          <div className="text-center py-16">
            {showRecent ? (
              <div>
                <Calendar className="h-12 w-12 text-text-muted mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  No recent collections
                </h3>
                <p className="text-text-secondary mb-6">
                  View some collections to see them here
                </p>
                <Button variant="outline" onClick={() => setShowRecent(false)}>
                  View All Collections
                </Button>
              </div>
            ) : searchQuery ? (
              <div>
                <Search className="h-12 w-12 text-text-muted mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  No collections found
                </h3>
                <p className="text-text-secondary mb-6">
                  No collections match your search for "{searchQuery}"
                </p>
                <Button variant="outline" onClick={() => setSearchQuery("")}>
                  Clear search
                </Button>
              </div>
            ) : (
              <div>
                <div className="w-16 h-16 bg-surface-tertiary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="h-8 w-8 text-text-muted" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  No collections yet
                </h3>
                <p className="text-text-secondary mb-6 max-w-md mx-auto">
                  Start creating fashion designs and save them to collections to organize your work.
                </p>
                <Button onClick={() => setShowCreateModal(true)} className="font-dancing">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Collection
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className={cn(
            "grid gap-6",
            viewMode === "grid" 
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
              : "grid-cols-1 max-w-4xl mx-auto"
          )}>
            {displayCollections.map((collection) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                onClick={() => handleViewCollection(collection.id)}
                onDuplicate={handleDuplicateCollection}
                className={viewMode === "list" ? "max-w-none" : ""}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Collection Modal */}
      <CreateCollectionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateCollection={handleCreateCollection}
      />
    </div>
  );
}
