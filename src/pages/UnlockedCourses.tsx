import { ProductGrid } from '../components/ProductGrid';
import { useProductFilters } from '../hooks/useProductFilters';
import { products } from '../data/products';
import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { useUser } from '../contexts/UserContext';
import { ProfileMenu } from '../components/ProfileMenu';
import { TopSearchBar } from '../components/TopSearchBar';
import { useNavigate } from 'react-router';
import { useState } from 'react';
import { RechargeModal } from '../components/RechargeModal';

export function UnlockedCourses() {
  const { t } = useSettings();
  const { diamonds, hasUnlocked } = useUser();
  const navigate = useNavigate();
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
  
  const unlockedProducts = products.filter(p => hasUnlocked(p.id));
  
  const {
    filters,
    setFilters,
    filteredProducts,
    brandCounts,
  } = useProductFilters(unlockedProducts);

  return (
    <div className="min-h-screen bg-background flex flex-col w-full">
      {/* Top Header */}
      <header className="h-16 border-b flex items-center px-4 bg-card shrink-0 gap-4">
        <div className="flex items-center gap-3">
          <ProfileMenu />
          <h1 className="text-xl font-bold tracking-tight">EsEdu</h1>
        </div>
        
        <div className="flex-1 max-w-2xl mx-auto flex justify-center">
          <TopSearchBar 
            filters={filters} 
            onFiltersChange={setFilters} 
            brandCounts={brandCounts} 
          />
        </div>
        
        <div className="ml-auto flex items-center">
          <Button 
            onClick={() => setIsRechargeModalOpen(true)}
            className="rounded-full h-9 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold flex items-center gap-1.5 shadow-sm border-0"
          >
            <span className="text-sm">{diamonds}</span>
            <span className="text-[#F59E0B] text-base drop-shadow-sm leading-none ml-0.5">♦</span>
            <span className="text-lg font-bold leading-none ml-1">+</span>
          </Button>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="flex flex-col flex-1 p-6 max-w-7xl mx-auto w-full">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/catalogue')} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-2xl font-bold">My Unlocked Courses</h2>
        </div>
        
        {unlockedProducts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center min-h-96">
            <div className="text-center space-y-4">
              <div className="text-6xl">📚</div>
              <h2 className="text-xl font-medium">No unlocked courses yet</h2>
              <p className="text-muted-foreground max-w-sm">
                Head back to the catalogue and unlock some courses using your diamonds!
              </p>
              <Button onClick={() => navigate('/catalogue')} className="mt-4">
                Explore Catalogue
              </Button>
            </div>
          </div>
        ) : (
          <ProductGrid products={filteredProducts} />
        )}
      </div>

      <RechargeModal
        isOpen={isRechargeModalOpen}
        onClose={() => setIsRechargeModalOpen(false)}
      />
    </div>
  );
}
