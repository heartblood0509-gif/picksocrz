import { Timestamp } from 'firebase/firestore';

export interface Product {
  id: string;
  name: string;
  nameKo: string;
  slug: string;
  description: string;
  descriptionKo: string;
  price: number;
  originalPrice?: number | null;
  currency: 'KRW';
  duration: {
    nights: number;
    days: number;
  };
  features: string[];
  featuresKo: string[];
  category: 'explorer' | 'voyager' | 'royal' | 'custom';
  tags: string[];
  images: {
    main: string;
    gallery: string[];
  };
  isActive: boolean;
  isFeatured: boolean;
  destinations: string[];
  ship: string;
  availableFrom?: Timestamp;
  availableTo?: Timestamp;
  maxCapacity?: number;
  currentBookings?: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  createdBy?: string;
}

export interface ProductFormData {
  name: string;
  nameKo: string;
  description: string;
  descriptionKo: string;
  price: number;
  originalPrice?: number;
  duration: {
    nights: number;
    days: number;
  };
  features: string[];
  featuresKo: string[];
  category: 'explorer' | 'voyager' | 'royal' | 'custom';
  tags: string[];
  images: {
    main: string;
    gallery: string[];
  };
  isActive: boolean;
  isFeatured: boolean;
}
