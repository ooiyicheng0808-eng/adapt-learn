import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { ChevronDown, X } from 'lucide-react';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  balance?: number;
}

const BANKS = [
  "PayPal",
  "Bank Transfer",
  "VISA/Master Card",
  "FPX",
  "Google Wallet",
  "Touch 'n Go eWallet",
  "Duitnow",
  "U Mobile",
  "Shopeepay wallet",
  "digi",
  "Grabpay",
  "celcom",
  "Boost eWallet",
  "ATOME"
];

export function WithdrawModal({ isOpen, onClose, balance = 1200 }: WithdrawModalProps) {
  const [amount, setAmount] = useState<string>('500.00');
  const [selectedBank, setSelectedBank] = useState<string>(BANKS[0]);
  const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsBankDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleWithdraw = () => {
    // Implement withdrawal logic here
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] p-6 sm:p-8 bg-card border rounded-[2rem] gap-0">
        <div className="flex items-center justify-between mb-8">
          <DialogTitle className="text-2xl font-bold tracking-tight">Withdrawal</DialogTitle>
        </div>

        <DialogDescription className="sr-only">
          Withdraw funds to your bank account
        </DialogDescription>

        <div className="space-y-6">
          {/* Amount Input */}
          <div className="space-y-3">
            <label className="text-[15px] font-semibold text-foreground">Amount</label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-foreground font-semibold">RM</span>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-[3.25rem] pr-4 py-3.5 bg-transparent border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-foreground font-medium text-[15px]"
              />
            </div>
            <p className="text-[13px] text-muted-foreground font-medium">
              Current balance: RM 1,200.00
            </p>
          </div>

          {/* Transfer To Select */}
          <div className="space-y-3">
            <label className="text-[15px] font-semibold text-foreground">Transfer to</label>
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsBankDropdownOpen(!isBankDropdownOpen)}
                className="w-full flex items-center justify-between px-4 py-3.5 bg-transparent border border-input rounded-xl hover:bg-muted/30 transition-colors text-left font-medium text-[15px]"
              >
                <span>{selectedBank}</span>
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              </button>
              
              {isBankDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-card border rounded-2xl z-50 overflow-y-auto max-h-[280px] py-2 shadow-lg custom-scrollbar">
                  {BANKS.map((bank) => (
                    <button
                      key={bank}
                      type="button"
                      className={`w-full text-left px-5 py-3 transition-colors font-medium text-[15px] ${
                        selectedBank === bank 
                          ? 'bg-muted/50 text-foreground' 
                          : 'hover:bg-muted/30 text-muted-foreground hover:text-foreground'
                      }`}
                      onClick={() => {
                        setSelectedBank(bank);
                        setIsBankDropdownOpen(false);
                      }}
                    >
                      {bank}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>


        </div>

        <div className="mt-8 pt-2">
          <Button 
            onClick={handleWithdraw}
            className="w-full rounded-full py-6 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={!amount}
          >
            Withdraw
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}