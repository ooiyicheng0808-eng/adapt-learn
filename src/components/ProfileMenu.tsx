import { LogOut, Phone, Mail, User, BookOpen, Bot, MessageCircle, Settings as SettingsIcon, Camera } from 'lucide-react';
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
import { useNavigate } from 'react-router';
import { useSettings } from '../contexts/SettingsContext';
import { useUser } from '../contexts/UserContext';
import defaultPic from '../imports/image-1.png';

export function ProfileMenu() {
  const navigate = useNavigate();
  const { t } = useSettings();
  const { userProfile, logout, updateProfilePic } = useUser();
  const [showSettings, setShowSettings] = useState(false);
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
        {userProfile?.role === 'seller' ? (
          <>
            <DropdownMenuGroup>
              <DropdownMenuItem 
                className="uppercase cursor-pointer text-xs font-medium"
                onClick={() => navigate('/seller-copilot')}
              >
                <Bot className="mr-2 h-4 w-4" />
                <span>SELLER COPILOT</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
          </>
        ) : (
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
    </>
  );
}
