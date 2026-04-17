import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useGameStore from '../store/useGameStore';
import { motion, AnimatePresence } from 'framer-motion';
import HoloCardWrapper from '../Components/HoloCardWrapper';

const Calendar = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { addToLibrary, libraryGames } = useGameStore();
  const [upcomingGames, setUpcomingGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  // --- OYUNLARI FİLTRELE VE GRUPLA (SİHİRLİ DOKUNUŞ) ---
  const groupedGames = useMemo(() => {
    // 1. ADIM: Görseli olmayan oyunları sistemden tamamen siliyoruz
    const filtered = upcomingGames.filter(game => game.background_image && game.background_image !== "");

    // 2. ADIM: Kalan oyunları tarihe göre grupluyoruz
    const groups = filtered.reduce((acc, game) => {
      const date = game.released || 'TBA';
      if (!acc[date]) acc[date] = [];
      acc[date].push(game);
      return acc;
    }, {});

    return Object.entries(groups).sort((a, b) => new Date(a[0]) - new Date(b[0]));
  }, [upcomingGames]);

  useEffect(() => {
    const fetchUpcomingGames = async () => {
      if (page === 1) setLoading(true);
      try {
        const apiKey = import.meta.env.VITE_RAWG_API_KEY;
        const now = new Date();
        const future = new Date();
        future.setMonth(now.getMonth() + 6);
        const iso = (d) => d.toISOString().split('T')[0];
        const dateRange = `${iso(now)},${iso(future)}`;
        
        const url = `https://api.rawg.io/api/games?key=${apiKey}&dates=${dateRange}&ordering=released&page_size=40&page=${page}`; // Page size'ı artırdık çünkü filtrelemede elenenler olacak
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.results) {
          setUpcomingGames(prev => page === 1 ? data.results : [...prev, ...data.results]);
        }
      } catch (error) {
        console.error("Takvim hatası:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUpcomingGames();
  }, [page]);

  const formatDateGX = (dateStr) => {
    if (dateStr === 'TBA') return { day: '?', month: 'TBA' };
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.toLocaleString(i18n.language, { month: 'short' }).toUpperCase();
    return { day, month };
  };

  return (
    <div className="py-6 space-y-12">
      {/* --- HEADER --- */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-black/10 dark:border-white/10 pb-8"
      >
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-12 bg-yellow-500 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.4)]"></div>
          <div>
            <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic">
              {t('UpcomingGames')}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em]">
              {t('CalendarDesc')}
            </p>
          </div>
        </div>
      </motion.header>

      {loading && page === 1 ? (
        <div className="flex justify-center items-center h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-yellow-500" />
        </div>
      ) : (
        <div className="space-y-20">
          {groupedGames.map(([date, games]) => {
            const { day, month } = formatDateGX(date);
            
            return (
              <section key={date} className="relative">
                {/* ARKA PLANI KALDIRILMIŞ STICKY BAŞLIK */}
                <div className="flex items-center gap-6 mb-10 sticky top-20 z-30 py-4 pointer-events-none">
                  <div className="flex items-baseline gap-2 min-w-[110px] drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                    <span className="text-5xl font-black text-gray-900 dark:text-white pointer-events-auto">{day}</span>
                    <span className="text-2xl font-light text-gray-400">|</span>
                    <span className="text-2xl font-bold text-yellow-500 tracking-widest pointer-events-auto">{month}</span>
                  </div>
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-gray-300 dark:from-white/20 to-transparent"></div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-8">
                  {games.map((game, index) => {
                    const isAdded = libraryGames.some(g => g.id === game.id);
                    return (
                      <motion.div 
                        key={game.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                      >
                        <HoloCardWrapper borderRadius="0.75rem">
                          <div 
                            onClick={() => navigate(`/game/${game.id}`)}
                            className="bg-black/5 dark:bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden shadow-2xl border border-black/5 dark:border-white/10 flex flex-col h-full cursor-pointer group relative"
                          >
                            <div className="relative pt-[145%] overflow-hidden"> 
                              <img 
                                src={game.background_image} 
                                className="absolute top-0 left-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                alt={game.name}
                                loading="lazy"
                              />
                              <div className="absolute inset-0 border-0 group-hover:border-[3px] border-yellow-500/50 transition-all duration-300 pointer-events-none z-20"></div>
                            </div>
                            
                            <div className="p-4 flex-1 flex flex-col justify-between bg-white dark:bg-[#0f0f0f] transition-colors">
                              <h3 className="text-[11px] font-black text-gray-900 dark:text-white mb-3 line-clamp-2 uppercase tracking-tight leading-tight group-hover:text-yellow-500 transition-colors">
                                {game.name}
                              </h3>
                              <button 
                                onClick={(e) => { e.stopPropagation(); if (!isAdded) addToLibrary(game); }}
                                className={`w-full py-2.5 rounded-lg font-black text-[9px] transition-all uppercase tracking-widest ${
                                  isAdded 
                                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                                  : 'bg-yellow-500 text-black hover:bg-yellow-400 shadow-lg shadow-yellow-500/10'
                                }`}
                              >
                                {isAdded ? `✓ ${t('InLibrary')}` : `+ ${t('AddToBacklog')}`}
                              </button>
                            </div>
                          </div>
                        </HoloCardWrapper>
                      </motion.div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* LOAD MORE BUTONU */}
      <div className="flex justify-center pt-24 pb-20">
        <button 
          onClick={() => setPage(prev => prev + 1)}
          className="group relative px-16 py-5 bg-transparent border-2 border-black/10 dark:border-white/10 text-gray-900 dark:text-white font-black hover:border-yellow-500 transition-all uppercase text-xs tracking-[0.4em] rounded-full overflow-hidden"
        >
          <span className="relative z-10">{loading ? t('Loading') : t('LoadMore')}</span>
          <div className="absolute inset-0 bg-yellow-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
        </button>
      </div>
    </div>
  );
};

export default Calendar;