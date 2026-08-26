import { useState, useMemo, useEffect } from 'react';
import { Product } from '../types/product';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Button } from './ui/button';
import { toast } from 'sonner@2.0.3';
import { useSettings } from '../contexts/SettingsContext';
import { useUser } from '../contexts/UserContext';
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from './ui/dialog';
import { products } from '../data/products';
import { ArrowLeft, CheckCircle2, User, MessageCircle } from 'lucide-react';
import { api } from '../lib/api';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { t } = useSettings();
  const { unlockCourse, hasUnlocked, userProfile } = useUser();
  const [open, setOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState<Product>(product);
  
  const isSeller = userProfile?.role === 'seller';
  
  const [courseSeller, setCourseSeller] = useState<{username: string, profilePic?: string, id: string} | null>(null);

  useEffect(() => {
    if (!isSeller) {
      api.get('/messages/sellers').then(sellers => {
        if (sellers && sellers.length > 0) {
          const index = parseInt(product.id) % sellers.length;
          setCourseSeller(sellers[index]);
        }
      }).catch(console.error);
    }
  }, [product.id, isSeller]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setTimeout(() => setActiveProduct(product), 300);
    }
  };

  const recommendations = useMemo(() => {
    const available = products.filter(p => p.id !== activeProduct.id);
    const shuffled = [...available].sort(() => 0.5 - Math.random());
    return shuffled;
  }, [activeProduct.id]);

  const handleUnlock = (p: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    if (isSeller) {
      toast.success(`Started selling ${p.name}!`);
      return;
    }

    if (hasUnlocked(p.id)) {
      toast.success(`You have already unlocked ${p.name}!`);
      return;
    }

    if (unlockCourse(p.id, p.price)) {
      toast.success(`Unlocked ${p.name} for ♦${p.price}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full">
        {isSeller ? (
          <div className="aspect-square overflow-hidden relative">
            <ImageWithFallback
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <DialogTrigger asChild>
            <div className="aspect-square overflow-hidden cursor-pointer relative group">
              <ImageWithFallback
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </div>
          </DialogTrigger>
        )}
        <CardContent className="p-4 flex flex-col flex-1 space-y-3">
          <div className="flex items-start justify-between flex-1">
            <div className="space-y-1 w-full">
              <Badge variant="outline" className="text-xs mb-1">
                {product.brand}
              </Badge>
              <h3 className="font-medium leading-tight">{product.name}</h3>
            </div>
          </div>
          <div className="pt-2 mt-auto">
            {isSeller ? (
              <div 
                className="w-full font-semibold bg-muted text-muted-foreground px-4 py-2 rounded-md text-center text-sm"
              >
                Sell ♦{product.price}
              </div>
            ) : hasUnlocked(product.id) ? (
              <Button 
                onClick={(e) => handleUnlock(product, e)} 
                variant="outline"
                className="w-full font-semibold border-green-500 text-green-600 hover:bg-green-500/10 hover:text-green-600 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-400/10"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Unlocked
              </Button>
            ) : (
              <Button 
                onClick={(e) => handleUnlock(product, e)} 
                className="w-full font-semibold"
              >
                {t('unlock')} ♦{product.price}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <DialogContent className="max-w-6xl p-0 overflow-hidden bg-[#1E2532] border-white/10 gap-0 md:h-[85vh] flex flex-col text-white">
        <DialogTitle className="sr-only">{activeProduct.name}</DialogTitle>
        <DialogDescription className="sr-only">{isSeller ? 'Sell' : 'Unlock'} {activeProduct.name} course</DialogDescription>
        
        <div className="flex flex-col md:flex-row flex-1 min-h-0 w-full h-full">
          {/* Left Side: Main Course */}
          <div className="flex-1 p-6 md:p-10 flex flex-col items-center justify-center relative overflow-y-auto min-h-0">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-6 left-6 text-white/70 hover:text-white hover:bg-white/10 z-50 rounded-full h-10 w-10"
              onClick={() => setOpen(false)}
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            
            <div className="w-full max-w-[540px] flex flex-col items-start h-full max-h-[800px] justify-center pb-8 pt-4">
              {/* Image Container with Button inside */}
              <div className="w-full aspect-[4/3] mb-6 rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black/20 relative group shrink-0">
                <ImageWithFallback 
                  src={activeProduct.image} 
                  alt={activeProduct.name} 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute bottom-6 left-0 right-0 px-6 flex justify-center">
                  {isSeller ? (
                    <Button 
                      onClick={() => handleUnlock(activeProduct)} 
                      className="font-bold shadow-xl h-12 text-[15px] px-8 rounded-full hover:scale-105 transition-transform bg-[#2563EB] hover:bg-[#2563EB]/90 text-white border-none" 
                    >
                      Sell ♦{activeProduct.price}
                    </Button>
                  ) : hasUnlocked(activeProduct.id) ? (
                    <Button 
                      onClick={() => handleUnlock(activeProduct)} 
                      className="font-bold shadow-xl h-12 text-[15px] px-8 rounded-full hover:scale-105 transition-transform bg-green-500 hover:bg-green-600 text-white border-none gap-2" 
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      Start Learning
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => handleUnlock(activeProduct)} 
                      className="font-bold shadow-xl h-12 text-[15px] px-8 rounded-full hover:scale-105 transition-transform bg-[#2563EB] hover:bg-[#2563EB]/90 text-white border-none" 
                    >
                      Unlock ♦{activeProduct.price}
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Text Content below Image */}
              <div className="w-full text-left px-2 shrink-0">
                <p className="text-white/70 uppercase text-sm font-bold tracking-widest mb-2">
                  {activeProduct.brand}
                </p>
                <h2 className="text-3xl md:text-4xl font-extrabold leading-tight tracking-tight text-white mb-6">
                  {activeProduct.name}
                </h2>
                
                {/* Seller Profile Section */}
                <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl hover:bg-white/10 transition-colors cursor-pointer w-fit border border-white/10 group/seller">
                  <div className="w-10 h-10 rounded-full bg-[#2563EB]/20 flex items-center justify-center shrink-0 border border-[#2563EB]/30 group-hover/seller:border-[#2563EB]/50 transition-colors overflow-hidden">
                    {courseSeller?.profilePic ? (
                      <img src={courseSeller.profilePic} alt={courseSeller.username} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-[#2563EB]" />
                    )}
                  </div>
                  <div className="flex flex-col pr-2">
                    <span className="text-sm font-bold text-white leading-tight">{courseSeller?.username || 'Course Seller'}</span>
                    <span className="text-[11px] font-medium text-white/50">Instructor</span>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => {
                      if (courseSeller) {
                        setOpen(false);
                        window.dispatchEvent(new CustomEvent('open-chat', { detail: { seller: courseSeller } }));
                      }
                    }}
                    className="rounded-full bg-[#2563EB]/20 hover:bg-[#2563EB] text-[#2563EB] hover:text-white border-none ml-2 gap-1.5 h-8 text-[11px] px-3 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    Message
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Recommendations */}
          <div className="w-full md:w-[400px] lg:w-[440px] border-t md:border-t-0 md:border-l border-white/10 bg-[#1E2532] flex flex-col min-h-0 md:h-full">
            <div className="px-6 py-5 pb-3 z-10 sticky top-0 bg-[#1E2532]">
              <h3 className="font-bold text-[22px] tracking-tight text-white">Up Next</h3>
            </div>
            
            <div className="overflow-y-auto px-6 pb-6 flex flex-col gap-6 flex-1 min-h-0">
              {recommendations.map(rec => (
                <div 
                  key={rec.id} 
                  className="flex gap-4 group cursor-pointer hover:bg-white/5 p-2 -mx-2 rounded-xl transition-colors"
                  onClick={() => setActiveProduct(rec)}
                >
                  <div className="w-[140px] aspect-[4/3] shrink-0 rounded-xl overflow-hidden bg-black/30 border border-white/10 shadow-sm relative">
                    <ImageWithFallback 
                      src={rec.image} 
                      alt={rec.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0 py-1 justify-between">
                    <div>
                      <p className="text-[11px] font-bold text-white/60 uppercase tracking-widest mb-1 truncate">
                        {rec.brand}
                      </p>
                      <h4 className="font-bold text-[13px] leading-snug line-clamp-2 uppercase text-white mb-2">
                        {rec.name}
                      </h4>
                    </div>
                    <div>
                      {isSeller ? (
                        <Button 
                          onClick={(e) => handleUnlock(rec, e)} 
                          size="sm" 
                          className="h-8 text-[11px] font-semibold px-4 rounded-full bg-[#2563EB] hover:bg-[#2563EB]/90 text-white border-none transition-colors"
                        >
                          Sell ♦{rec.price}
                        </Button>
                      ) : hasUnlocked(rec.id) ? (
                        <Button 
                          onClick={(e) => handleUnlock(rec, e)} 
                          size="sm" 
                          className="h-8 text-[11px] font-semibold px-4 rounded-full bg-green-500 hover:bg-green-600 text-white border-none transition-colors gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Unlocked
                        </Button>
                      ) : (
                        <Button 
                          onClick={(e) => handleUnlock(rec, e)} 
                          size="sm" 
                          className="h-8 text-[11px] font-semibold px-4 rounded-full bg-[#2563EB] hover:bg-[#2563EB]/90 text-white border-none transition-colors"
                        >
                          Unlock ♦{rec.price}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}