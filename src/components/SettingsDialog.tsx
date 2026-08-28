import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from './ui/dialog';
import { buttonVariants } from './ui/button';
import { Settings, Globe, Moon, Bell } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { useSettings } from '../contexts/SettingsContext';

export function SettingsDialog({ 
  className,
  open,
  onOpenChange
}: { 
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const { language, setLanguage, darkMode, setDarkMode, notifications, setNotifications, t } = useSettings();

  const isControlled = open !== undefined && onOpenChange !== undefined;
  const currentOpen = isControlled ? open : internalOpen;
  const setOpen = isControlled ? onOpenChange : setInternalOpen;

  return (
    <Dialog open={currentOpen} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger className={className || buttonVariants({ variant: "ghost", className: "w-full justify-start mt-2 uppercase text-xs font-medium" })}>
          <Settings className="w-4 h-4 mr-2" />
          {t('settings').toUpperCase()}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('settings')}</DialogTitle>
          <DialogDescription className="hidden">
            {t('manageSettings')}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="flex flex-col space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm font-medium">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <span>{t('language')}</span>
              </div>
              <Select value={language} onValueChange={(v) => setLanguage(v as any)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bahasa">Bahasa Melayu</SelectItem>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="mandarin">Mandarin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm font-medium">
                <Moon className="w-4 h-4 text-muted-foreground" />
                <span>{t('darkMode')}</span>
              </div>
              <Switch checked={darkMode} onCheckedChange={setDarkMode} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm font-medium">
                <Bell className="w-4 h-4 text-muted-foreground" />
                <span>{t('notifications')}</span>
              </div>
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
