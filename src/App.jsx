import PixelAI from './Components/PixelAI';
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useGameStore from './store/useGameStore'; 
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './Components/Navbar';
import Home from './Pages/Home';
import Library from './Pages/Library';
import GameDetails from './Pages/GameDetails'; 
import Calendar from './Pages/Calendar';
import Quiz from './Pages/Quiz';
import Profile from './Pages/Profile';

// --- GİRİŞ ANİMASYONU (SPLASH SCREEN) ---
const SplashScreen = () => (
  <motion.div
    initial={{ opacity: 1 }}
    exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
    className="fixed inset-0 z-[9999] bg-[#0a0a0a] flex flex-col items-center justify-center overflow-hidden"
  >
    {/* Parlayan Arka Plan Efekti */}
    <div className="absolute w-[500px] h-[500px] bg-yellow-500/10 rounded-full blur-[120px]" />

    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: [0.5, 1.2, 1], opacity: 1 }}
      transition={{ duration: 1, times: [0, 0.6, 1], ease: "anticipate" }}
      // YENİ: Gölge artık CSS değişkeninden (seçili temadan) besleniyor
      className="relative z-10 w-24 h-24 bg-yellow-500 rounded-[2rem] flex items-center justify-center shadow-[0_0_50px_rgb(var(--color-accent)/0.5)]"
    >
      <span className="text-black font-black text-6xl leading-none">P</span>
    </motion.div>

    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="mt-8 flex flex-col items-center gap-2"
    >
      <h1 className="text-white font-black text-2xl tracking-[0.5em] uppercase italic">
        PIXEL<span className="text-yellow-500">LOG</span>
      </h1>
      <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden relative">
        <motion.div 
          initial={{ left: "-100%" }}
          animate={{ left: "100%" }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          // YENİ: Kayan çubuğun gölgesi temaya bağlandı
          className="absolute inset-y-0 w-24 bg-yellow-500 shadow-[0_0_15px_rgb(var(--color-accent))]"
        />
      </div>
      <p className="text-yellow-500/50 text-[10px] font-bold uppercase tracking-widest mt-2 animate-pulse">
        Initializing Neural Vault...
      </p>
    </motion.div>
  </motion.div>
);

// --- SAYFA GEÇİŞ ANİMASYONU ---
const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/library" element={<PageWrapper><Library /></PageWrapper>} />
        <Route path="/calendar" element={<PageWrapper><Calendar /></PageWrapper>} />
        <Route path="/quiz" element={<PageWrapper><Quiz /></PageWrapper>} />
        <Route path="/profile" element={<PageWrapper><Profile /></PageWrapper>} />
        <Route path="/game/:id" element={<PageWrapper><GameDetails /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  // Store'dan verileri çekiyoruz
  const darkMode = useGameStore((state) => state.darkMode);
  const initTheme = useGameStore((state) => state.initTheme);
  
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [isLoading, setIsLoading] = useState(true);

  // YENİ VE DÜZELTİLMİŞ: Sonsuz döngüyü kıracak useEffect ayarı
  useEffect(() => {
    initTheme();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Bağımlılık dizisi boş = Sadece uygulama ilk açıldığında çalışır!

  useEffect(() => {
    // 1. Sekme Başlığı ve Favicon Ayarı
    document.title = "PixelLog";
    
    const faviconValue = `
      <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
        <rect width='100' height='100' rx='25' fill='#eab308'/>
        <text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-weight='900' font-size='70' fill='black'>P</text>
      </svg>
    `;
    const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/svg+xml';
    link.rel = 'icon';
    link.href = `data:image/svg+xml,${encodeURIComponent(faviconValue)}`;
    document.getElementsByTagName('head')[0].appendChild(link);

    // 2. Giriş Animasyonu Süresi
    const timer = setTimeout(() => setIsLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  // Sadece Dark Mode değiştiğinde çalışır
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    document.documentElement.style.colorScheme = darkMode ? 'dark' : 'light';
  }, [darkMode]);

  useEffect(() => {
    const handleMouseMove = (event) => {
      setMousePos({ x: event.clientX, y: event.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <Router>
      <AnimatePresence>
        {isLoading && <SplashScreen key="splash" />}
      </AnimatePresence>

      <div className="relative min-h-screen w-full bg-[#f0f0f5] dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 font-sans transition-colors duration-500 overflow-x-hidden">
        
        {/* CYBERPUNK AURA (Fare İmleci Parlaması) - ARTIK TEMAYA DUYARLI */}
        <div 
          className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
          style={{
            background: darkMode 
              ? `radial-gradient(1000px circle at ${mousePos.x}px ${mousePos.y}px, rgb(var(--color-accent) / 0.45) 0%, rgb(var(--color-accent) / 0.15) 30%, transparent 60%)`
              : `radial-gradient(900px circle at ${mousePos.x}px ${mousePos.y}px, rgb(var(--color-accent) / 1) 0%, rgb(var(--color-accent) / 0.5) 20%, rgb(var(--color-accent) / 0.15) 50%, transparent 80%)`,
              mixBlendMode: darkMode ? 'normal' : 'multiply'
          }}
        />

        <Toaster 
          position="bottom-right" 
          toastOptions={{
            style: {
              borderRadius: '12px',
              background: darkMode ? '#1a1a1a' : '#fff',
              color: darkMode ? '#fff' : '#000',
              border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
            },
          }}
        />
        
        {!isLoading && (
          <div className="relative z-10 flex flex-col min-h-screen">
            <Navbar /> 
            <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-10 pb-10 flex-1">
              <main className="w-full mt-4">
                <AnimatedRoutes />
              </main>
            </div>
          </div>
        )}
      </div>
      <PixelAI />
    </Router>
  );
}

export default App;