import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useCollections } from "@/contexts/CollectionsContext";
import { ArrowLeft, Edit, Download, Trash2, Move, Grid, List, Calendar, Filter, ChevronDown, FileImage, FileText, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import jsPDF from 'jspdf';
import MoveDesignModal from "@/components/MoveDesignModal";

type DesignType = 'all' | 'sketch' | 'colored' | 'model' | 'runway';
type SortBy = 'date' | 'type' | 'name';
type ViewMode = 'grid' | 'list';

export default function CollectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { collections, getCollection, updateCollection, deleteCollection, removeDesignFromCollection, toggleDesignFavorite, addToRecentCollections } = useCollections();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<DesignType>('all');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [selectedDesignId, setSelectedDesignId] = useState<string>("");

  const collection = getCollection(id || "");

  // Initialize edit values when collection loads
  useEffect(() => {
    if (isEditing && collection) {
      setEditName(collection.name);
      setEditDescription(collection.description);
    }
  }, [isEditing, collection]);

  // Track collection view for recent collections
  useEffect(() => {
    if (collection) {
      addToRecentCollections(collection.id);
    }
  }, [collection, addToRecentCollections]);

  // Filter and sort designs
  const filteredAndSortedDesigns = useMemo(() => {
    if (!collection) return [];
    
    let filtered = collection.designs;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(design => design.type === filterType);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(design => 
        design.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        design.garmentType.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort designs
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
        case 'type':
          return a.type.localeCompare(b.type);
        case 'name':
          return a.prompt.localeCompare(b.prompt);
        default:
          return 0;
      }
    });

    return filtered;
  }, [collection?.designs, filterType, searchQuery, sortBy]);

  if (!collection) {
    return (
      <div className="min-h-screen bg-surface-primary flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-text-primary mb-4">Collection Not Found</h1>
          <p className="text-text-secondary mb-6">The collection you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/collections')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Collections
          </Button>
        </div>
      </div>
    );
  }

  const handleEditCollection = () => {
    if (isEditing) {
      // Save changes
      updateCollection(collection.id, {
        name: editName,
        description: editDescription
      });
      setIsEditing(false);
    } else {
      // Start editing
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditName(collection.name);
    setEditDescription(collection.description);
  };

  const handleExportImages = async () => {
    try {
      // Download all images in the collection
      const downloadPromises = collection.designs.map(async (design, index) => {
        const response = await fetch(design.imageUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${collection.name}_${design.type}_${index + 1}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      });
      
      await Promise.all(downloadPromises);
      
      // Show success message
      alert(`Successfully exported ${collection.designs.length} designs from "${collection.name}"!`);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  const handleExportPDF = async () => {
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 30;
      const contentWidth = pageWidth - 2 * margin;
      
      // Helper function to add edge-to-edge frame (black and silver)
      const addEdgeFrame = () => {
        // Outer frame - black, goes to page edges
        pdf.setDrawColor(0, 0, 0);
        pdf.setLineWidth(4);
        pdf.rect(0, 0, pageWidth, pageHeight);
        
        // Inner frame - silver/grey, with margin from edges
        pdf.setDrawColor(128, 128, 128);
        pdf.setLineWidth(2);
        pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);
      };
      
      // Add designs - each on a separate page with edge-to-edge frames
      for (let i = 0; i < collection.designs.length; i++) {
        const design = collection.designs[i];
        
        // Add new page for each design (only if not the first one)
        if (i > 0) {
          pdf.addPage();
        }
        
        // Add page background
        pdf.setFillColor(250, 250, 250);
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');
        
        // Add edge-to-edge frame
        addEdgeFrame();
        
        try {
          // Fetch and add image
          const response = await fetch(design.imageUrl);
          const blob = await response.blob();
          const imageData = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
          
          // Calculate image dimensions to fit within the inner frame
          const innerMargin = 20; // Space between inner frame and image
          const maxImageWidth = pageWidth - 2 * innerMargin;
          const maxImageHeight = pageHeight - 2 * innerMargin;
          
          // Get image dimensions from the image data
          const img = new Image();
          img.src = imageData;
          await new Promise((resolve) => {
            img.onload = resolve;
          });
          
          const imageAspectRatio = img.width / img.height;
          const pageAspectRatio = maxImageWidth / maxImageHeight;
          
          let imageWidth, imageHeight;
          if (imageAspectRatio > pageAspectRatio) {
            // Image is wider than page ratio
            imageWidth = maxImageWidth;
            imageHeight = maxImageWidth / imageAspectRatio;
          } else {
            // Image is taller than page ratio
            imageHeight = maxImageHeight;
            imageWidth = maxImageHeight * imageAspectRatio;
          }
          
          // Center the image on the page
          const x = (pageWidth - imageWidth) / 2;
          const y = (pageHeight - imageHeight) / 2;
          
          // Add image
          pdf.addImage(imageData, 'JPEG', x, y, imageWidth, imageHeight);
          
          // Add design info at bottom
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold'); // Better minimalistic font
          pdf.setTextColor(100, 100, 100);
          
          // Design type badge with black outline and all caps
          const designType = design.type.toUpperCase(); // All caps
          const badgeY = pageHeight - 30;
          const badgeWidth = 80;
          const badgeHeight = 20;
          
          // Black outline rounded rectangle
          pdf.setDrawColor(0, 0, 0);
          pdf.setLineWidth(2);
          pdf.roundedRect(pageWidth / 2 - badgeWidth / 2, badgeY - badgeHeight / 2, badgeWidth, badgeHeight, 8, 8, 'S');
          
          // White background rounded rectangle
          pdf.setFillColor(255, 255, 255);
          pdf.roundedRect(pageWidth / 2 - badgeWidth / 2, badgeY - badgeHeight / 2, badgeWidth, badgeHeight, 8, 8, 'F');
          
          // Black text
          pdf.setTextColor(0, 0, 0);
          pdf.text(designType, pageWidth / 2, badgeY + 2, { align: 'center' });
          
          // Page number
          pdf.setFontSize(10);
          pdf.setTextColor(150, 150, 150);
          pdf.text(`${i + 1}`, pageWidth - 20, pageHeight - 15);
          
        } catch (error) {
          console.error(`Failed to add image ${i + 1}:`, error);
        }
      }
      
      // Save the PDF
      pdf.save(`${collection.name.replace(/[^a-z0-9]/gi, '_')}_collection.pdf`);
      
      alert(`Successfully exported "${collection.name}" as PDF!`);
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('PDF export failed. Please try again.');
    }
  };

  const handleDeleteCollection = () => {
    if (collection) {
      // Prevent deletion of Favorites collection
      if (collection.id === 'favorites-collection') {
        alert('Cannot delete the Favorites collection');
        return;
      }
      
      if (confirm(`Are you sure you want to delete "${collection.name}"? This action cannot be undone.`)) {
        deleteCollection(collection.id);
        navigate('/collections');
      }
    }
  };

  const handleDeleteDesign = (designId: string) => {
    if (confirm('Are you sure you want to remove this design from the collection?')) {
      removeDesignFromCollection(collection.id, designId);
    }
  };

  const handleDownloadDesign = async (imageUrl: string, filename: string) => {
    try {
      console.log('Starting download for:', imageUrl, filename);
      
      // Fetch the image
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      console.log('Blob created:', blob.size, 'bytes');
      
      // Create a blob URL
      const url = window.URL.createObjectURL(blob);
      console.log('Blob URL created:', url);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      
      // Trigger download
      link.click();
      console.log('Download triggered');
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        console.log('Cleanup completed');
      }, 100);
      
    } catch (error) {
      console.error('Download failed:', error);
      alert(`Download failed: ${error.message}. Please try again.`);
    }
  };

  const handleMoveDesign = (designId: string) => {
    setSelectedDesignId(designId);
    setShowMoveModal(true);
  };

  const handleMoveSuccess = () => {
    // Refresh the collection data
    // The context will automatically update
  };

  const handleToggleFavorite = (designId: string) => {
    if (collection) {
      toggleDesignFavorite(collection.id, designId);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-surface-primary">
      {/* Header */}
      <div className="border-b border-border-subtle bg-surface-secondary">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Navigation */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/collections')}
              className="text-text-secondary hover:text-text-primary"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Collections
            </Button>
          </div>

          {/* Collection Info */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <Input
                    id="edit-collection-name"
                    name="edit-collection-name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="text-2xl font-bold border-2 border-blue-200 bg-white p-3 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    placeholder="Collection name"
                  />
                  <Input
                    id="edit-collection-description"
                    name="edit-collection-description"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="text-text-secondary border-2 border-gray-200 bg-white p-3 rounded-lg focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                    placeholder="Collection description"
                  />
                </div>
              ) : (
                <div>
                  <h1 className="font-dancing text-3xl font-bold text-text-primary mb-2">
                    {collection.name}
                  </h1>
                  {collection.description && (
                    <p className="text-text-secondary text-lg mb-4">
                      {collection.description}
                    </p>
                  )}
                </div>
              )}
              
              <div className="flex items-center gap-4 text-sm text-text-muted">
                <span>{collection.designs.length} design{collection.designs.length !== 1 ? 's' : ''}</span>
                <span>•</span>
                <span>Created {formatDate(collection.createdAt)}</span>
                <span>•</span>
                <span>Updated {formatDate(collection.updatedAt)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {!isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEditCollection}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleExportImages}>
                    <FileImage className="h-4 w-4 mr-2" />
                    Download Images
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportPDF}>
                    <FileText className="h-4 w-4 mr-2" />
                    Export as PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {collection.id !== 'favorites-collection' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteCollection}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
              
              {isEditing && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelEdit}
                    className="bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEditCollection}
                    className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Input
              id="search-designs"
              name="search-designs"
              placeholder="Search designs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-muted" />
          </div>

          {/* Filter by Type */}
          <Select value={filterType} onValueChange={(value: DesignType) => setFilterType(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="sketch">Sketch</SelectItem>
              <SelectItem value="colored">Colored</SelectItem>
              <SelectItem value="model">Model</SelectItem>
              <SelectItem value="runway">Runway</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sortBy} onValueChange={(value: SortBy) => setSortBy(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="type">Type</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>

          {/* View Mode */}
          <div className="flex items-center gap-1">
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

        {/* Design Grid */}
        {filteredAndSortedDesigns.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-surface-tertiary rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="h-8 w-8 text-text-muted" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              No designs found
            </h3>
            <p className="text-text-secondary">
              {searchQuery || filterType !== 'all' 
                ? "Try adjusting your search or filter criteria."
                : "This collection doesn't have any designs yet."
              }
            </p>
          </div>
        ) : (
          <div className={cn(
            "grid gap-4",
            viewMode === "grid" 
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
              : "grid-cols-1 max-w-4xl mx-auto"
          )}>
            {filteredAndSortedDesigns.map((design) => (
              <div
                key={design.id}
                className="group relative bg-surface-secondary rounded-lg border border-border-subtle overflow-hidden hover:shadow-lg transition-all duration-200"
              >
                {/* Design Image */}
                <div className="aspect-square bg-surface-tertiary">
                  <img
                    src={design.imageUrl}
                    alt={design.prompt}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleDownloadDesign(design.imageUrl, `${design.type}-${Date.now()}.jpg`)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={design.isFavorite ? "default" : "outline"}
                      onClick={() => handleToggleFavorite(design.id)}
                      className={design.isFavorite ? "bg-red-500 hover:bg-red-600" : ""}
                    >
                      <Heart className={`h-4 w-4 ${design.isFavorite ? "fill-current" : ""}`} />
                    </Button>
                    {collection.id !== 'favorites-collection' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMoveDesign(design.id)}
                      >
                        <Move className="h-4 w-4" />
                      </Button>
                    )}
                    {collection.id !== 'favorites-collection' && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteDesign(design.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Design Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-text-primary truncate">
                        {design.prompt}
                      </h3>
                      <p className="text-xs text-text-muted mt-1">
                        {design.garmentType} • {formatDate(design.savedAt)}
                      </p>
                      {collection.id === 'favorites-collection' && (
                        <p className="text-xs text-blue-600 mt-1">
                          Click the heart to remove from favorites
                        </p>
                      )}
                    </div>
                    <Badge variant="secondary" className="text-xs shrink-0 ml-2">
                      {design.type}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Move Design Modal */}
      <MoveDesignModal
        isOpen={showMoveModal}
        onClose={() => setShowMoveModal(false)}
        designId={selectedDesignId}
        currentCollectionId={collection.id}
        onSuccess={handleMoveSuccess}
      />
    </div>
  );
}
