import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useGameStore from '../store/useGameStore';
import { 
  Sun, 
  Moon, 
  Languages, 
  Download, 
  Library as LibraryIcon, 
  LayoutGrid, 
  CalendarDays, 
  Gamepad2,
  UserCircle // Yeni ikon eklendi
} from 'lucide-react';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const darkMode = useGameStore((state) => state.darkMode);
  const toggleDarkMode = useGameStore((state) => state.toggleDarkMode);

  const [installPrompt, setInstallPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstall = (e) => { 
      e.preventDefault(); 
      setInstallPrompt(e); 
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  // Aktif link kontrolü için yardımcı fonksiyon
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md border-b border-gray-200 dark:border-white/10 px-4 py-3 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
        
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0 group">
          <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-all">
            <span className="text-black font-black text-2xl leading-none">P</span>
          </div>
          <span className="text-xl font-black text-gray-900 dark:text-white tracking-tighter hidden md:block">
            PIXEL<span className="text-yellow-500">LOG</span>
          </span>
        </Link>

        {/* ORTA MENÜ: Discovery, Vault, Calendar, Quiz, Profile */}
        <div className="flex items-center gap-3 sm:gap-6 flex-1 justify-center overflow-x-auto no-scrollbar py-1">
          {/* Keşfet */}
          <Link 
            to="/" 
            className={`flex items-center gap-1.5 font-bold transition-all text-xs sm:text-sm whitespace-nowrap ${
              isActive('/') ? 'text-yellow-500 scale-105' : 'text-gray-500 dark:text-gray-400 hover:text-yellow-500'
            }`}
          >
            <LayoutGrid size={18} />
            <span className="hidden sm:inline">{t('discovery')}</span>
          </Link>

          {/* Kitaplığım */}
          <Link 
            to="/library" 
            className={`flex items-center gap-1.5 font-bold transition-all text-xs sm:text-sm whitespace-nowrap ${
              isActive('/library') ? 'text-yellow-500 scale-105' : 'text-gray-500 dark:text-gray-400 hover:text-yellow-500'
            }`}
          >
            <LibraryIcon size={18} />
            <span className="hidden sm:inline">{t('my_library')}</span>
          </Link>

          {/* Takvim */}
          <Link 
            to="/calendar" 
            className={`flex items-center gap-1.5 font-bold transition-all text-xs sm:text-sm whitespace-nowrap ${
              isActive('/calendar') ? 'text-yellow-500 scale-105' : 'text-gray-500 dark:text-gray-400 hover:text-yellow-500'
            }`}
          >
            <CalendarDays size={18} />
            <span className="hidden sm:inline">{t('ComingSoon')}</span>
          </Link>

          {/* Quiz */}
          <Link 
            to="/quiz" 
            className={`flex items-center gap-1.5 font-bold transition-all text-xs sm:text-sm whitespace-nowrap ${
              isActive('/quiz') ? 'text-yellow-500 scale-105' : 'text-gray-500 dark:text-gray-400 hover:text-yellow-500'
            }`}
          >
            <Gamepad2 size={18} />
            <span className="hidden sm:inline">{t('DailyQuiz')}</span>
          </Link>

          {/* PROFİL (CYBER ID) - YENİ EKLENDİ */}
          <Link 
            to="/profile" 
            className={`flex items-center gap-1.5 font-bold transition-all text-xs sm:text-sm whitespace-nowrap ${
              isActive('/profile') ? 'text-yellow-500 scale-105' : 'text-gray-500 dark:text-gray-400 hover:text-yellow-500'
            }`}
          >
            <UserCircle size={18} />
            <span className="hidden sm:inline">{t('CyberID')}</span>
          </Link>
        </div>

        {/* SAĞ TARAF: Kontroller */}
        <div className="flex items-center gap-2 flex-shrink-0">
          
          {/* Yükle Butonu */}
          {installPrompt && (
            <button 
              onClick={() => installPrompt.prompt()} 
              className="bg-yellow-500 hover:bg-yellow-600 text-black p-2 sm:px-4 sm:py-2 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-yellow-500/20"
            >
              <Download size={18} />
              <span className="hidden lg:block text-xs uppercase">{t('install')}</span>
            </button>
          )}

          {/* Dil Değiştirici */}
          <button 
            onClick={() => i18n.changeLanguage(i18n.language === 'tr' ? 'en' : 'tr')}
            className="p-2.5 bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 rounded-xl hover:text-yellow-500 hover:bg-yellow-500/10 transition-all"
            title="Language"
          >
            <Languages size={20} />
          </button>

          {/* Tema Değiştirici */}
          <button 
            onClick={toggleDarkMode}
            className="p-2.5 bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 rounded-xl hover:text-yellow-500 hover:bg-yellow-500/10 transition-all"
            title="Theme"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
        </div>
      </div>
    </nav>
  );
};

export default Navbar;