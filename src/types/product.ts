export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
}

export interface FilterState {
  priceRange: [number, number];
  selectedBrands: string[];
  searchQuery: string;
}

export interface BrandCount {
  brand: string;
  count: number;
}