import { useState } from 'react';
import { products } from '../data/products';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { cn } from './ui/utils';

// Mock learners data
const MOCK_LEARNERS = [
  { id: '1', name: 'Alena', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150' },
  { id: '2', name: 'Marcus', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=150' },
  { id: '3', name: 'Sarah', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150' },
  { id: '4', name: 'David', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150' },
  { id: '5', name: 'Emma', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150' },
  { id: '6', name: 'James', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150' },
  { id: '7', name: 'Sophia', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150' },
  { id: '8', name: 'Tyson', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150' },
];

export function TodaySales() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Generate mock sales for each product
  const salesData = products.map((product, index) => {
    // Pseudo-randomly pick some learners for each product
    const numLearners = (index % 4) + 1; // 1 to 4 learners
    // To make it deterministic but varied
    const startIndex = (index * 3) % MOCK_LEARNERS.length;
    const learners = [];
    for (let i = 0; i < numLearners; i++) {
      learners.push(MOCK_LEARNERS[(startIndex + i) % MOCK_LEARNERS.length]);
    }
    
    return {
      product,
      learners
    };
  });

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Today's sales</h2>
      
      <div className="border rounded-2xl bg-card overflow-hidden shadow-sm">
        {salesData.map((sale, index) => {
          const isExpanded = expandedId === sale.product.id;
          const isLast = index === salesData.length - 1;
          
          return (
            <div key={sale.product.id} className={cn("flex flex-col transition-colors", !isLast && "border-b")}>
              <button
                onClick={() => setExpandedId(isExpanded ? null : sale.product.id)}
                className={cn(
                  "w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-colors text-left outline-none",
                  isExpanded && "bg-muted/10"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className="w-6 h-6 flex items-center justify-center text-muted-foreground shrink-0 bg-muted/20 rounded-full">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </div>
                  <span className="font-semibold text-base">{sale.product.name}</span>
                </div>
                <div className="text-sm font-semibold text-muted-foreground bg-muted/30 px-3 py-1 rounded-full">
                  {sale.learners.length} {sale.learners.length === 1 ? 'Learner' : 'Learners'}
                </div>
              </button>
              
              {isExpanded && (
                <div className="px-5 pb-5 pt-1 pl-[60px] animate-in fade-in slide-in-from-top-2 duration-200 bg-muted/5">
                  <div className="space-y-3 mt-2">
                    {sale.learners.map((learner, i) => (
                      <div key={`${learner.id}-${i}`} className="flex items-center gap-3 p-2 hover:bg-muted/20 rounded-xl transition-colors">
                        <Avatar className="h-10 w-10 border shadow-sm">
                          <AvatarImage src={learner.avatar} alt={learner.name} />
                          <AvatarFallback className="font-semibold">{learner.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-semibold text-sm">{learner.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
