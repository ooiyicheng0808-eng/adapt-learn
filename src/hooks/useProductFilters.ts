import { useState, useMemo } from 'react';
import { Product, FilterState, BrandCount } from '../types/product';
import { luxuryBrands } from '../data/products';

const initialFilters: FilterState = {
  priceRange: [0, 9999],
  selectedBrands: [],
  searchQuery: ''
};

export function useProductFilters(products: Product[]) {
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Search query filter
      if (filters.searchQuery && !product.name.toLowerCase().includes(filters.searchQuery.toLowerCase())) {
        return false;
      }

      // Price filter
      if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
        return false;
      }

      // Brand filter
      if (filters.selectedBrands.length > 0 && !filters.selectedBrands.includes(product.brand)) {
        return false;
      }

      return true;
    });
  }, [products, filters]);

  const brandCounts = useMemo((): BrandCount[] => {
    return luxuryBrands.map(brand => {
      const count = products.filter(product => {
        // Count products that match current price filter but ignore brand filter
        const matchesPrice = product.price >= filters.priceRange[0] && 
                            product.price <= filters.priceRange[1];
        return matchesPrice && product.brand === brand;
      }).length;

      return { brand, count };
    });
  }, [products, filters.priceRange]);

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  return {
    filters,
    setFilters,
    filteredProducts,
    brandCounts,
    resetFilters
  };
}