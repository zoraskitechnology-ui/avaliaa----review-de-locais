
import React from 'react';

export interface Review {
  id: number;
  author: string;
  accessibility: number;
  infrastructure: number;
  value: number;
  comment: string;
  photos?: string[];
}

export interface Place {
  id: string;
  name: string;
  location: string;
  address?: string;
  reviews: Review[];
  aiSummary?: string;
  latitude?: number;
  longitude?: number;
  distance?: number;
}

export interface Subcategory {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  subcategories: Subcategory[];
}
