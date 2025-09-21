import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Collection, SavedDesign, CreateCollectionData, AddDesignData } from '@/types/collections';

const STORAGE_KEY = 'muse-sketch-collections';
const RECENT_COLLECTIONS_KEY = 'muse-sketch-recent-collections';
const FAVORITES_COLLECTION_ID = 'favorites-collection';

interface CollectionsContextType {
  collections: Collection[];
  isLoading: boolean;
  createCollection: (data: CreateCollectionData) => string;
  addDesignToCollection: (collectionId: string, design: AddDesignData) => void;
  removeDesignFromCollection: (collectionId: string, designId: string) => void;
  updateCollection: (collectionId: string, updates: Partial<Collection>) => void;
  deleteCollection: (collectionId: string) => void;
  duplicateCollection: (collectionId: string) => string;
  toggleDesignFavorite: (collectionId: string, designId: string) => void;
  getFavoriteDesigns: () => (SavedDesign & { collectionId: string; collectionName: string })[];
  addToRecentCollections: (collectionId: string) => void;
  getRecentCollections: () => Collection[];
  getCollection: (collectionId: string) => Collection | undefined;
  getAllDesigns: () => (SavedDesign & { collectionId: string; collectionName: string })[];
}

const CollectionsContext = createContext<CollectionsContextType | undefined>(undefined);

export function CollectionsProvider({ children }: { children: React.ReactNode }) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load collections from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      let parsedCollections: Collection[] = [];
      
      if (stored) {
        parsedCollections = JSON.parse(stored).map((collection: any) => ({
          ...collection,
          createdAt: new Date(collection.createdAt),
          updatedAt: new Date(collection.updatedAt),
          designs: collection.designs.map((design: any) => ({
            ...design,
            savedAt: new Date(design.savedAt)
          }))
        }));
      } else {
        // Create some sample collections if none exist
        parsedCollections = [
          {
            id: 'sample-1',
            name: 'Summer Collection',
            description: 'Bright and colorful summer designs',
            createdAt: new Date(),
            updatedAt: new Date(),
            designs: []
          },
          {
            id: 'sample-2',
            name: 'Winter Elegance',
            description: 'Sophisticated winter fashion pieces',
            createdAt: new Date(),
            updatedAt: new Date(),
            designs: []
          }
        ];
      }

      // Ensure Favorites collection always exists
      const favoritesCollection: Collection = {
        id: FAVORITES_COLLECTION_ID,
        name: 'Favorites',
        description: 'All your favorite designs',
        createdAt: new Date(),
        updatedAt: new Date(),
        designs: []
      };

      // Check if Favorites collection exists, if not add it
      const hasFavorites = parsedCollections.some(c => c.id === FAVORITES_COLLECTION_ID);
      if (!hasFavorites) {
        parsedCollections.unshift(favoritesCollection); // Add at the beginning
      }

      setCollections(parsedCollections);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsedCollections));
    } catch (error) {
      console.error('Error loading collections:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save collections to localStorage whenever collections change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(collections));
    }
  }, [collections, isLoading]);

  // Create a new collection
  const createCollection = useCallback((data: CreateCollectionData): string => {
    const newCollection: Collection = {
      id: `collection-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: data.name,
      description: data.description || '',
      createdAt: new Date(),
      updatedAt: new Date(),
      designs: []
    };
    
    setCollections(prev => [...prev, newCollection]);
    return newCollection.id;
  }, []);

  // Add a design to a collection
  const addDesignToCollection = useCallback((collectionId: string, design: AddDesignData) => {
    const newDesign: SavedDesign = {
      id: `design-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...design,
      savedAt: new Date()
    };

    setCollections(prev => 
      prev.map(collection => 
        collection.id === collectionId 
          ? {
              ...collection,
              designs: [...collection.designs, newDesign],
              updatedAt: new Date()
            }
          : collection
      )
    );
  }, []);

  // Remove a design from a collection
  const removeDesignFromCollection = useCallback((collectionId: string, designId: string) => {
    setCollections(prev => 
      prev.map(collection => 
        collection.id === collectionId 
          ? {
              ...collection,
              designs: collection.designs.filter(design => design.id !== designId),
              updatedAt: new Date()
            }
          : collection
      )
    );
  }, []);

  // Update a collection
  const updateCollection = useCallback((collectionId: string, updates: Partial<Collection>) => {
    setCollections(prev => 
      prev.map(collection => 
        collection.id === collectionId 
          ? {
              ...collection,
              ...updates,
              updatedAt: new Date()
            }
          : collection
      )
    );
  }, []);

  // Delete a collection
  const deleteCollection = useCallback((collectionId: string) => {
    // Prevent deletion of the Favorites collection
    if (collectionId === FAVORITES_COLLECTION_ID) {
      console.warn('Cannot delete the Favorites collection');
      return;
    }
    setCollections(prev => prev.filter(collection => collection.id !== collectionId));
  }, []);

  // Get a specific collection
  const getCollection = useCallback((collectionId: string) => {
    return collections.find(collection => collection.id === collectionId);
  }, [collections]);

  // Duplicate a collection
  const duplicateCollection = useCallback((collectionId: string) => {
    const originalCollection = collections.find(c => c.id === collectionId);
    if (!originalCollection) {
      throw new Error('Collection not found');
    }

    const newId = `collection-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const duplicatedCollection: Collection = {
      ...originalCollection,
      id: newId,
      name: `${originalCollection.name} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
      designs: originalCollection.designs.map(design => ({
        ...design,
        id: `design-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        savedAt: new Date()
      }))
    };

    setCollections(prev => [...prev, duplicatedCollection]);
    return newId;
  }, [collections]);

  // Toggle design favorite status
  const toggleDesignFavorite = useCallback((collectionId: string, designId: string) => {
    setCollections(prev => {
      let updatedCollections = [...prev];
      let targetDesign: SavedDesign | null = null;

      // Find the design in any collection to get its current state
      for (const collection of updatedCollections) {
        const design = collection.designs.find(d => d.id === designId);
        if (design) {
          targetDesign = design;
          break;
        }
      }

      if (!targetDesign) return prev;

      const newFavoriteStatus = !targetDesign.isFavorite;
      const updatedDesign = { ...targetDesign, isFavorite: newFavoriteStatus };

      // Update the design in ALL collections where it exists
      updatedCollections = updatedCollections.map(collection => {
        const hasDesign = collection.designs.some(d => d.id === designId);
        if (hasDesign) {
          return {
            ...collection,
            designs: collection.designs.map(design => 
              design.id === designId ? updatedDesign : design
            ),
            updatedAt: new Date()
          };
        }
        return collection;
      });

      // Add or remove from Favorites collection
      const favoritesCollection = updatedCollections.find(c => c.id === FAVORITES_COLLECTION_ID);
      if (favoritesCollection) {
        if (newFavoriteStatus) {
          // Add to Favorites collection
          updatedCollections = updatedCollections.map(collection => {
            if (collection.id === FAVORITES_COLLECTION_ID) {
              // Check if design already exists in favorites
              const existsInFavorites = collection.designs.some(d => d.id === designId);
              if (!existsInFavorites) {
                return {
                  ...collection,
                  designs: [...collection.designs, updatedDesign],
                  updatedAt: new Date()
                };
              }
            }
            return collection;
          });
        } else {
          // Remove from Favorites collection
          updatedCollections = updatedCollections.map(collection => {
            if (collection.id === FAVORITES_COLLECTION_ID) {
              return {
                ...collection,
                designs: collection.designs.filter(d => d.id !== designId),
                updatedAt: new Date()
              };
            }
            return collection;
          });
        }
      }

      return updatedCollections;
    });
  }, []);

  // Get all favorite designs (from the Favorites collection)
  const getFavoriteDesigns = useCallback(() => {
    const favoritesCollection = collections.find(c => c.id === FAVORITES_COLLECTION_ID);
    if (!favoritesCollection) return [];
    
    return favoritesCollection.designs.map(design => ({
      ...design,
      collectionId: favoritesCollection.id,
      collectionName: favoritesCollection.name
    }));
  }, [collections]);

  // Add collection to recent collections
  const addToRecentCollections = useCallback((collectionId: string) => {
    try {
      const recentIds = JSON.parse(localStorage.getItem(RECENT_COLLECTIONS_KEY) || '[]');
      const updatedRecentIds = [collectionId, ...recentIds.filter((id: string) => id !== collectionId)].slice(0, 10); // Keep only 10 most recent
      localStorage.setItem(RECENT_COLLECTIONS_KEY, JSON.stringify(updatedRecentIds));
    } catch (error) {
      console.error('Failed to update recent collections:', error);
    }
  }, []);

  // Get recent collections
  const getRecentCollections = useCallback(() => {
    try {
      const recentIds = JSON.parse(localStorage.getItem(RECENT_COLLECTIONS_KEY) || '[]');
      return recentIds
        .map((id: string) => collections.find(c => c.id === id))
        .filter(Boolean) as Collection[];
    } catch (error) {
      console.error('Failed to get recent collections:', error);
      return [];
    }
  }, [collections]);

  // Get all designs across all collections
  const getAllDesigns = useCallback(() => {
    return collections.flatMap(collection => 
      collection.designs.map(design => ({
        ...design,
        collectionId: collection.id,
        collectionName: collection.name
      }))
    );
  }, [collections]);

  const value: CollectionsContextType = {
    collections,
    isLoading,
    createCollection,
    addDesignToCollection,
    removeDesignFromCollection,
    updateCollection,
    deleteCollection,
    duplicateCollection,
    toggleDesignFavorite,
    getFavoriteDesigns,
    addToRecentCollections,
    getRecentCollections,
    getCollection,
    getAllDesigns
  };

  return (
    <CollectionsContext.Provider value={value}>
      {children}
    </CollectionsContext.Provider>
  );
}

export function useCollections() {
  const context = useContext(CollectionsContext);
  if (context === undefined) {
    throw new Error('useCollections must be used within a CollectionsProvider');
  }
  return context;
}
