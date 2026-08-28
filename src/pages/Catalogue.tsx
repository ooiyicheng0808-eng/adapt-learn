import { useState, useEffect } from 'react';
import { ProductGrid } from '../components/ProductGrid';
import { TodaySales } from '../components/TodaySales';
import { LearnerFeedback } from '../components/LearnerFeedback';
import { LearnerProgress } from '../components/LearnerProgress';
import { Growth } from '../components/Growth';
import { useProductFilters } from '../hooks/useProductFilters';
import { products } from '../data/products';
import { Button } from '../components/ui/button';
import { useSettings } from '../contexts/SettingsContext';
import { useUser } from '../contexts/UserContext';
import { ProfileMenu } from '../components/ProfileMenu';
import { TopSearchBar } from '../components/TopSearchBar';
import { api } from '../lib/api';

import { WithdrawModal } from '../components/WithdrawModal';
import { RechargeModal } from '../components/RechargeModal';
import { LearnerChatPopup } from '../components/LearnerChatPopup';
import { SellerInbox } from '../components/SellerInbox';
import { SellerFAB } from '../components/SellerFAB';

export function Catalogue() {
  const { t } = useSettings();
  const { diamonds, hasUnlocked, userProfile } = useUser();
  const isSeller = userProfile?.role === 'seller';
  
  const [dbCourses, setDbCourses] = useState<any[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await api.get('/course/all');
        const formatted = data.map((c: any) => ({
          id: c.id,
          name: c.name?.toUpperCase() || 'UNTITLED COURSE',
          brand: c.seller?.username?.toUpperCase() || 'COMMUNITY',
          price: c.price,
          // Since they are manually uploading random files/videos, we will use a default image for DB courses
          image: products[0].image 
        }));
        setDbCourses(formatted);
      } catch (err) {
        console.error("Failed to load DB courses", err);
      }
    };
    fetchCourses();
  }, []);

  const allProducts = [...products, ...dbCourses];
  const displayProducts = isSeller ? allProducts : allProducts.filter(p => !hasUnlocked(p.id));
  
  const [activeTab, setActiveTab] = useState<'products' | 'sales' | 'progress' | 'growth' | 'feedback' | 'inbox'>('products');
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);

  const {
    filters,
    setFilters,
    filteredProducts,
    brandCounts,
  } = useProductFilters(displayProducts);

  return (
    <div className="min-h-screen bg-background flex flex-col w-full">
      {/* Top Header */}
      <header className="h-16 border-b flex items-center px-4 bg-card shrink-0 gap-4">
        <div className="flex items-center gap-3">
          <ProfileMenu />
          <h1 className="text-xl font-bold tracking-tight">EsEdu</h1>
        </div>
        
        {userProfile?.role !== 'seller' ? (
          <>
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
          </>
        ) : (
          <div className="ml-auto flex items-center">
            <Button 
              onClick={() => setIsWithdrawModalOpen(true)}
              className="bg-foreground text-background hover:bg-foreground/90 rounded-md font-medium px-6 h-9"
            >
              Withdraw
            </Button>
          </div>
        )}
      </header>
      
      {/* Seller Navigation */}
      {userProfile?.role === 'seller' && (
        <div className="h-14 border-b flex items-center px-4 md:px-8 bg-card shrink-0 gap-6 md:gap-8 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <button 
            onClick={() => setActiveTab('products')}
            className={`text-base font-bold h-full px-2 transition-colors ${activeTab === 'products' ? 'text-foreground border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground hover:border-b-2 hover:border-muted-foreground/30 font-medium'}`}
          >
            Courses
          </button>
          <button 
            onClick={() => setActiveTab('sales')}
            className={`text-base font-bold h-full px-2 transition-colors ${activeTab === 'sales' ? 'text-foreground border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground hover:border-b-2 hover:border-muted-foreground/30 font-medium'}`}
          >
            Today's sales
          </button>
          <button 
            onClick={() => setActiveTab('progress')}
            className={`text-base font-bold h-full px-2 transition-colors ${activeTab === 'progress' ? 'text-foreground border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground hover:border-b-2 hover:border-muted-foreground/30 font-medium'}`}
          >
            Learner Progress
          </button>
          <button 
            onClick={() => setActiveTab('growth')}
            className={`text-base font-bold h-full px-2 transition-colors ${activeTab === 'growth' ? 'text-foreground border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground hover:border-b-2 hover:border-muted-foreground/30 font-medium'}`}
          >
            Growth
          </button>
          <button 
            onClick={() => setActiveTab('feedback')}
            className={`text-base font-bold h-full px-2 transition-colors ${activeTab === 'feedback' ? 'text-foreground border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground hover:border-b-2 hover:border-muted-foreground/30 font-medium'}`}
          >
            Learner Feedback
          </button>
          <button 
            onClick={() => setActiveTab('inbox')}
            className={`text-base font-bold h-full px-2 transition-colors ${activeTab === 'inbox' ? 'text-foreground border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground hover:border-b-2 hover:border-muted-foreground/30 font-medium'}`}
          >
            Inbox
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 p-6 max-w-7xl mx-auto w-full">
        {(!isSeller || activeTab === 'products') && (
          <ProductGrid products={filteredProducts} />
        )}
        {isSeller && activeTab === 'sales' && (
          <TodaySales />
        )}
        {isSeller && activeTab === 'progress' && (
          <LearnerProgress />
        )}
        {isSeller && activeTab === 'growth' && (
          <Growth />
        )}
        {isSeller && activeTab === 'feedback' && (
          <LearnerFeedback />
        )}
        {isSeller && activeTab === 'inbox' && (
          <SellerInbox />
        )}
        {isSeller && activeTab !== 'products' && activeTab !== 'sales' && activeTab !== 'progress' && activeTab !== 'growth' && activeTab !== 'feedback' && activeTab !== 'inbox' && (
          <div className="flex flex-1 items-center justify-center min-h-[400px]">
            <p className="text-xl text-muted-foreground font-medium">Coming soon</p>
          </div>
        )}
      </div>

      {isSeller && (
        <>
          <WithdrawModal 
            isOpen={isWithdrawModalOpen} 
            onClose={() => setIsWithdrawModalOpen(false)} 
          />
          <SellerFAB />
        </>
      )}

      {userProfile?.role !== 'seller' && (
        <>
          <RechargeModal
            isOpen={isRechargeModalOpen}
            onClose={() => setIsRechargeModalOpen(false)}
          />
          <LearnerChatPopup />
        </>
      )}
    </div>
  );
}
