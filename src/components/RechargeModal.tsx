import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { ChevronRight, ChevronDown, FileText, MapPin } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import visaImg from '../assets/payment/visa.png';
import fpxImg from '../assets/payment/fpx.png';
import googleImg from '../assets/payment/google.png';
import paypalImg from '../assets/payment/paypal.png';
import banktransferImg from '../assets/payment/banktransfer.png';
interface RechargeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PAYMENT_METHODS = [
  {
    id: 'paypal',
    name: 'PayPal',
    img: paypalImg,
    rate: '1♦ ≈ 0.10 MYR',
    bonus: '+1',
    border: true
  },
  {
    id: 'bank_transfer',
    name: 'Bank Transfer',
    img: banktransferImg,
    rate: '1♦ ≈ 0.08 MYR',
    bonus: '+1',
    border: true
  },
  {
    id: 'visa_mastercard',
    name: 'VISA/Master Card',
    img: visaImg,
    rate: '1♦ ≈ 0.091 MYR',
    bonus: '+1',
    border: false,
    subtext: 'VISA/MASTERCARD/Diners'
  },
  {
    id: 'fpx',
    name: 'FPX',
    img: fpxImg,
    rate: '1♦ ≈ 0.077 MYR',
    bonus: '+1',
    border: true
  },
  {
    id: 'google',
    name: 'Google Wallet',
    img: googleImg,
    rate: '1♦ ≈ 0.12 MYR',
    bonus: '+1',
    border: true
  },
  {
    id: 'tng',
    name: "Touch 'n Go eWallet",
    icon: '💳', 
    rate: '1♦ ≈ 0.078 MYR',
    bonus: '+1',
    border: true
  },
  {
    id: 'duitnow',
    name: 'Duitnow',
    icon: '🟣', 
    rate: '1♦ ≈ 0.079 MYR',
    bonus: '+1',
    border: true
  },
  {
    id: 'umobile',
    name: 'U Mobile',
    icon: '🟠', 
    rate: '1♦ ≈ 0.11 MYR',
    bonus: null,
    border: true
  },
  {
    id: 'shopeepay',
    name: 'Shopeepay wallet',
    icon: '🛍️', 
    rate: '1♦ ≈ 0.077 MYR',
    bonus: '+1',
    border: true
  },
  {
    id: 'digi',
    name: 'digi',
    icon: '🟡', 
    rate: '1♦ ≈ 0.11 MYR',
    bonus: '+1',
    border: true
  },
  {
    id: 'grabpay',
    name: 'Grabpay',
    icon: '🟢', 
    rate: '1♦ ≈ 0.077 MYR',
    bonus: '+1',
    border: true
  },
  {
    id: 'celcom',
    name: 'celcom',
    icon: '🔵', 
    rate: '1♦ ≈ 0.11 MYR',
    bonus: null,
    border: true
  },
  {
    id: 'boost',
    name: 'Boost eWallet',
    icon: '🔴', 
    rate: '1♦ ≈ 0.077 MYR',
    bonus: '+1',
    border: true
  },
  {
    id: 'atome',
    name: 'ATOME',
    icon: '🅰️', 
    rate: '1♦ ≈ 0.085 MYR',
    bonus: '+1',
    border: true
  }
];

export function RechargeModal({ isOpen, onClose }: RechargeModalProps) {
  const { diamonds } = useUser();
  const [isExpanded, setIsExpanded] = useState(false);
  const visibleMethods = isExpanded ? PAYMENT_METHODS : PAYMENT_METHODS.slice(0, 3);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] p-0 bg-background border-none rounded-[1.5rem] overflow-hidden gap-0 flex flex-col h-[85vh] sm:h-auto sm:max-h-[85vh]">
        <DialogTitle className="sr-only">Recharge Diamonds</DialogTitle>
        <DialogDescription className="sr-only">Recharge your account balance</DialogDescription>
        
        {/* Header Tabs */}
        <div className="flex px-6 pt-6 gap-6 bg-background">
          <button className={`text-lg font-bold pb-2 relative text-foreground`}>
            Diamonds
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-1 bg-foreground rounded-full" />
          </button>
        </div>

        <div className="overflow-y-auto px-4 pb-6 custom-scrollbar">
          {/* Balance Card */}
          <div className="mt-4 rounded-2xl bg-gradient-to-br from-[#FFF5Ed] to-[#FFE8D6] p-5 relative shadow-sm">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <span className="text-[#F59E0B] text-2xl drop-shadow-sm leading-none">♦</span>
                <span className="text-3xl font-bold text-black">{diamonds}</span>
              </div>
              <div className="flex gap-2">
                <button className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center text-orange-500 hover:bg-white/70 transition-colors">
                  <FileText className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center text-orange-500 hover:bg-white/70 transition-colors">
                  <FileText className="w-4 h-4" />
                </button>
              </div>
            </div>
            <button className="mt-4 flex items-center text-orange-500 text-sm font-medium hover:text-orange-600 transition-colors">
              Account Balance <ChevronRight className="w-4 h-4 ml-0.5" />
            </button>
          </div>



          {/* Recharge Methods Header */}
          <div className="flex justify-between items-center mt-6 mb-4 px-1">
            <h3 className="font-medium text-muted-foreground text-[15px]">Recharge by</h3>
            <div className="flex items-center text-muted-foreground text-[13px] bg-muted/30 px-2 py-1 rounded-full">
              <MapPin className="w-3.5 h-3.5 mr-1" />
              Malaysia
            </div>
          </div>

          {/* Payment Methods List */}
          <div className="bg-card rounded-2xl border flex flex-col overflow-hidden">
            {visibleMethods.map((method, idx) => (
              <button 
                key={method.id}
                className={`flex items-center p-4 hover:bg-muted/30 transition-colors w-full text-left ${
                  (idx !== visibleMethods.length - 1 || (!isExpanded && PAYMENT_METHODS.length > 3)) ? 'border-b border-border/50' : ''
                }`}
              >
                <div className="w-12 h-8 rounded bg-white flex items-center justify-center mr-4 border text-sm overflow-hidden shrink-0">
                  {(method as any).img ? (
                    <img src={(method as any).img} alt={method.name} className="w-full h-full object-contain" />
                  ) : (
                    method.icon
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="font-medium text-[15px]">{method.name}</div>
                  {method.rate && (
                    <div className="flex flex-col mt-0.5">
                      <div className="flex items-center text-xs space-x-1">
                        <span className="text-muted-foreground">{method.rate}</span>
                        {method.bonus && (
                          <span className="text-[#F59E0B] font-medium flex items-center ml-1">
                            <span className="mr-0.5 text-[10px]">♦</span>{method.bonus}
                          </span>
                        )}
                      </div>
                      {(method as any).subtext && (
                        <span className="text-[10px] text-muted-foreground/70 mt-0.5">{(method as any).subtext}</span>
                      )}
                    </div>
                  )}
                </div>
                
                <ChevronRight className="w-5 h-5 text-muted-foreground/30" />
              </button>
            ))}
            {!isExpanded && PAYMENT_METHODS.length > 3 && (
              <button 
                onClick={() => setIsExpanded(true)}
                className="w-full py-3 flex items-center justify-center text-sm font-medium text-muted-foreground hover:bg-muted/30 transition-colors gap-1.5"
              >
                Show More
                <ChevronDown className="w-4 h-4" />
              </button>
            )}
            {isExpanded && PAYMENT_METHODS.length > 3 && (
              <button 
                onClick={() => setIsExpanded(false)}
                className="w-full py-3 flex items-center justify-center text-sm font-medium text-muted-foreground hover:bg-muted/30 transition-colors gap-1.5"
              >
                Show Less
                <ChevronDown className="w-4 h-4 rotate-180" />
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
