import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from './ui/input';
import { FilterState, BrandCount } from '../types/product';
import { Popover, PopoverContent, PopoverAnchor } from './ui/popover';
import { cn } from './ui/utils';

interface TopSearchBarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  brandCounts: BrandCount[];
}

export function TopSearchBar({ filters, onFiltersChange, brandCounts }: TopSearchBarProps) {
  const [open, setOpen] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      searchQuery: e.target.value
    });
  };

  const toggleBrand = (brand: string) => {
    const isSelected = filters.selectedBrands.includes(brand);
    
    onFiltersChange({
      ...filters,
      selectedBrands: isSelected ? [] : [brand]
    });
    
    // Optionally close the popover after selecting a category
    setOpen(false);
  };

  return (
    <div className="w-full max-w-2xl px-4 flex items-center justify-center">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverAnchor asChild>
          <div className="relative w-full max-w-md mx-auto cursor-text group" onClick={() => setOpen(true)}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            <Input 
              type="text" 
              placeholder="Search course..." 
              value={filters.searchQuery || ''}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 h-10 rounded-full border-2 focus-visible:ring-0 focus-visible:border-primary bg-background shadow-sm uppercase font-medium placeholder:font-normal placeholder:normal-case"
              onFocus={() => setOpen(true)}
            />
          </div>
        </PopoverAnchor>
        <PopoverContent 
          className="w-[calc(100vw-2rem)] sm:w-[450px] p-4 rounded-xl mt-2 border-2 bg-background shadow-lg outline-none" 
          align="center"
          onOpenAutoFocus={(e) => e.preventDefault()} 
        >
          <div className="flex flex-wrap gap-2">
            {brandCounts.map((bc) => {
              const isSelected = filters.selectedBrands.includes(bc.brand);
              return (
                <button
                  key={bc.brand}
                  onClick={() => toggleBrand(bc.brand)}
                  className={cn(
                    "px-4 py-2 text-sm font-bold rounded-md border-2 transition-all active:scale-95 whitespace-nowrap tracking-wide uppercase",
                    isSelected 
                      ? "border-primary bg-primary text-primary-foreground shadow-sm" 
                      : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-accent"
                  )}
                >
                  {bc.brand}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
