import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner@2.0.3';

type Language = 'english' | 'bahasa' | 'mandarin';

interface SettingsContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  notifications: boolean;
  setNotifications: (enabled: boolean) => void;
  t: (key: string) => string;
}

const translations = {
  english: {
    settings: 'Settings',
    language: 'Language',
    darkMode: 'Dark Mode',
    notifications: 'Notifications',
    manageSettings: 'Manage your preferences.',
    notificationsEnabled: 'Notifications have been enabled',
    notificationsDisabled: 'Notifications have been disabled',
    welcomeBack: 'Welcome back',
    enterDetails: 'Enter your details to access the catalogue',
    signIn: 'Sign In',
    username: 'Username',
    email: 'Email',
    password: 'Password',
    catalogue: 'Catalogue',
    filterBy: 'Filter by',
    brand: 'Brand',
    price: 'Price',
    filters: 'Filters',
    resetFilters: 'Reset Filters',
    course: 'Course',
    customerService: 'Customer Service',
    logout: 'Logout',
    recharge: 'Recharge',
    unlock: 'Unlock'
  },
  bahasa: {
    settings: 'Tetapan',
    language: 'Bahasa',
    darkMode: 'Mod Gelap',
    notifications: 'Pemberitahuan',
    manageSettings: 'Uruskan pilihan anda.',
    notificationsEnabled: 'Pemberitahuan telah didayakan',
    notificationsDisabled: 'Pemberitahuan telah dilumpuhkan',
    welcomeBack: 'Selamat kembali',
    enterDetails: 'Masukkan butiran anda untuk mengakses katalog',
    signIn: 'Log Masuk',
    username: 'Nama Pengguna',
    email: 'E-mel',
    password: 'Kata Laluan',
    catalogue: 'Katalog',
    filterBy: 'Tapis mengikut',
    brand: 'Jenama',
    price: 'Harga',
    filters: 'Penapis',
    resetFilters: 'Tetapkan Semula Penapis',
    course: 'Kursus',
    customerService: 'Khidmat Pelanggan',
    logout: 'Log Keluar',
    recharge: 'Tambah Nilai',
    unlock: 'Buka Kunci'
  },
  mandarin: {
    settings: '设置',
    language: '语言',
    darkMode: '深色模式',
    notifications: '通知',
    manageSettings: '管理您的首选项。',
    notificationsEnabled: '通知已启用',
    notificationsDisabled: '通知已禁用',
    welcomeBack: '欢迎回来',
    enterDetails: '输入您的详细信息以访问目录',
    signIn: '登入',
    username: '用户名',
    email: '电子邮箱',
    password: '密码',
    catalogue: '目录',
    filterBy: '过滤条件',
    brand: '品牌',
    price: '价格',
    filters: '过滤器',
    resetFilters: '重置过滤器',
    course: '课程',
    customerService: '客户服务',
    logout: '登出',
    recharge: '充值',
    unlock: '解锁'
  }
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('english');
  const [darkMode, setDarkModeState] = useState(false);
  const [notifications, setNotificationsState] = useState(true);

  // Load from local storage on mount
  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang) setLanguageState(savedLang);
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkModeState(true);
      document.documentElement.classList.add('dark');
    }
    
    const savedNotifs = localStorage.getItem('notifications');
    if (savedNotifs !== null) setNotificationsState(savedNotifs === 'true');
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const setDarkMode = (dark: boolean) => {
    setDarkModeState(dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const setNotifications = (enabled: boolean) => {
    setNotificationsState(enabled);
    localStorage.setItem('notifications', String(enabled));
    if (enabled) {
      toast.success(translations[language].notificationsEnabled);
    } else {
      toast.info(translations[language].notificationsDisabled);
    }
  };

  const t = (key: string) => {
    return translations[language][key as keyof typeof translations.english] || key;
  };

  return (
    <SettingsContext.Provider value={{
      language, setLanguage,
      darkMode, setDarkMode,
      notifications, setNotifications,
      t
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
