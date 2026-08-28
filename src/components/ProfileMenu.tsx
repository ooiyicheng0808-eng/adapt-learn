import { LogOut, Phone, Mail, User, BookOpen, Bot, MessageCircle, Settings as SettingsIcon, Camera, Crown, Check, X } from 'lucide-react';
import { Button } from './ui/button';
import { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { SettingsDialog } from './SettingsDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { useNavigate } from 'react-router';
import { useSettings } from '../contexts/SettingsContext';
import { useUser } from '../contexts/UserContext';
import defaultPic from '../imports/image-1.png';

export function ProfileMenu() {
  const navigate = useNavigate();
  const { t } = useSettings();
  const { userProfile, logout, updateProfilePic, isVip, buyVip } = useUser();
  const [showSettings, setShowSettings] = useState(false);
  const [showVipModal, setShowVipModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fallbacks if no userProfile is set yet
  const username = userProfile?.username || 'John Doe';
  const phone = userProfile?.phone || '+1 234 567 8900';
  const email = userProfile?.email || 'john.doe@example.com';
  const initial = username.charAt(0).toUpperCase();
  const currentPic = userProfile?.profilePic || defaultPic;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateProfilePic(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 overflow-hidden border border-border/50 shadow-sm">
          <Avatar className="h-full w-full">
            <AvatarImage src={currentPic} alt="Profile" className="object-cover" />
            <AvatarFallback>{initial}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 p-2" align="start">
        <DropdownMenuLabel className="font-normal py-3">
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="relative group mb-1 h-16 w-16 rounded-full overflow-hidden shadow-sm ring-2 ring-primary/20">
              <Avatar className="h-full w-full">
                <AvatarImage src={currentPic} alt="Profile" className="object-cover" />
                <AvatarFallback>{initial}</AvatarFallback>
              </Avatar>
              <div 
                className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity z-10"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="w-5 h-5 text-white" />
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageChange}
            />
            <p className="text-sm font-bold leading-none tracking-wider text-center">{username}</p>
            <div className="flex flex-col space-y-2 w-full mt-2 bg-muted/30 p-2 rounded-md">
              <div className="flex items-center text-xs text-muted-foreground w-full">
                <Phone className="w-3 h-3 mr-2 shrink-0" />
                <span className="uppercase font-semibold mr-1">PHONE:</span>
                <span className="truncate">{phone}</span>
              </div>
              <div className="flex items-center text-xs text-muted-foreground w-full">
                <Mail className="w-3 h-3 mr-2 shrink-0" />
                <span className="uppercase font-semibold mr-1">EMAIL:</span>
                <span className="truncate">{email}</span>
              </div>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {userProfile?.role !== 'seller' && (
          <>
            <DropdownMenuGroup>
              <DropdownMenuItem 
                className="uppercase cursor-pointer text-xs font-medium"
                onClick={() => navigate('/unlocked-courses')}
              >
                <BookOpen className="mr-2 h-4 w-4" />
                <span>UNLOCKED COURSES</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuGroup>
          {userProfile?.role !== 'seller' && (
            <DropdownMenuItem 
              className="uppercase cursor-pointer text-xs font-bold text-yellow-600 dark:text-yellow-500"
              onSelect={() => setShowVipModal(true)}
            >
              <Crown className="mr-2 h-4 w-4 text-yellow-500" />
              <span>{isVip ? 'VIP MEMBERSHIP (ACTIVE)' : 'UPGRADE TO VIP (150 ♦)'}</span>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem 
            className="uppercase cursor-pointer text-xs font-medium"
            onSelect={() => setShowSettings(true)}
          >
            <SettingsIcon className="mr-2 h-4 w-4" />
            <span>{t('settings').toUpperCase()}</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="uppercase cursor-pointer text-xs font-medium"
            onSelect={() => navigate('/customer-service')}
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            <span>{t('customerService').toUpperCase()}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="uppercase cursor-pointer text-xs font-medium text-destructive focus:text-destructive"
          onClick={() => {
            logout();
            navigate('/');
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t('logout').toUpperCase()}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    <SettingsDialog open={showSettings} onOpenChange={setShowSettings} />
    <Dialog open={showVipModal} onOpenChange={setShowVipModal}>
      <DialogContent className="sm:max-w-[500px] p-6 bg-background rounded-3xl">
        <DialogHeader className="flex flex-col items-center text-center space-y-2">
          <div className="h-12 w-12 rounded-full bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
            <Crown className="w-6 h-6 text-yellow-500 animate-bounce" />
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight">Upgrade to VIP Membership</DialogTitle>
          <p className="text-sm text-muted-foreground">Get premium perks and unlimited access for 150 Diamonds / Month</p>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 py-4 mt-2">
          {/* Standard Tier */}
          <div className="border border-border/50 rounded-2xl p-4 flex flex-col justify-between bg-muted/20">
            <div>
              <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-2">Standard</h4>
              <p className="text-2xl font-extrabold text-foreground mb-4">FREE</p>
              <ul className="space-y-2.5 text-xs text-muted-foreground">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-green-500 shrink-0" />
                  <span>3 Planner uses / month</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-green-500 shrink-0" />
                  <span>Tutor & Examiner access</span>
                </li>
                <li className="flex items-center gap-1.5 opacity-50">
                  <X className="w-3.5 h-3.5 text-destructive shrink-0" />
                  <span>No special discounts</span>
                </li>
                <li className="flex items-center gap-1.5 opacity-50">
                  <X className="w-3.5 h-3.5 text-destructive shrink-0" />
                  <span>No lucky draw entries</span>
                </li>
              </ul>
            </div>
            <span className="text-[10px] text-center text-muted-foreground mt-6 font-semibold uppercase tracking-wider">Current Tier</span>
          </div>

          {/* VIP Tier */}
          <div className="border-2 border-yellow-500/30 rounded-2xl p-4 flex flex-col justify-between bg-yellow-500/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-yellow-500 text-yellow-950 text-[9px] font-bold px-2 py-0.5 rounded-bl-lg uppercase tracking-wider">
              Popular
            </div>
            <div>
              <h4 className="font-bold text-sm text-yellow-500 uppercase tracking-wider mb-2">VIP member</h4>
              <p className="text-2xl font-extrabold text-foreground mb-4">
                150 <span className="text-xs font-semibold text-muted-foreground">♦ / month</span>
              </p>
              <ul className="space-y-2.5 text-xs text-foreground">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
                  <span className="font-medium">Unlimited AI Agent calls</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
                  <span className="font-medium">Special promotional discounts</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
                  <span className="font-medium">Reduced diamond costs</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
                  <span className="font-medium">Lucky draws (&gt;1000♦ purchase)</span>
                </li>
              </ul>
            </div>
            
            {isVip ? (
              <Button disabled className="w-full mt-6 bg-yellow-600/20 text-yellow-500 hover:bg-yellow-600/20 border border-yellow-500/20 font-bold text-xs uppercase tracking-wider rounded-xl">
                VIP Active
              </Button>
            ) : (
              <Button 
                onClick={() => {
                  if (buyVip()) {
                    setShowVipModal(false);
                  }
                }}
                className="w-full mt-6 bg-yellow-500 text-yellow-950 hover:bg-yellow-600 hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all duration-300"
              >
                Buy VIP for 150 ♦
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
