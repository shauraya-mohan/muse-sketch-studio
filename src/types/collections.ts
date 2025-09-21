export interface SavedDesign {
  id: string;
  type: 'sketch' | 'colored' | 'model' | 'runway';
  imageUrl: string;
  prompt: string;
  garmentType: string;
  savedAt: Date;
  isFavorite?: boolean;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  designs: SavedDesign[];
}

export interface CreateCollectionData {
  name: string;
  description: string;
}

export interface AddDesignData {
  type: 'sketch' | 'colored' | 'model' | 'runway';
  imageUrl: string;
  prompt: string;
  garmentType: string;
}
