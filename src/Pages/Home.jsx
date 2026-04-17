import { useState, useEffect, useRef } from 'react'; 
import { useNavigate, useSearchParams } from 'react-router-dom'; 
import { useTranslation } from 'react-i18next'; 
import useGameStore from '../store/useGameStore';
import useDebounce from '../hooks/useDebounce'; 
import { motion, AnimatePresence } from 'framer-motion';
import HoloCardWrapper from '../Components/HoloCardWrapper';

// --- ANİMASYON VARİANTLARI ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 } 
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

const Home = () => {
  const { t } = useTranslation(); 
  const navigate = useNavigate();
  const addToLibrary = useGameStore(state => state.addToLibrary);
  
  const [searchParams, setSearchParams] = useSearchParams();

  const initialSearch = searchParams.get('q') || '';
  const initialTab = searchParams.get('tab') || 'popular';
  const initialGenre = searchParams.get('genre') || '';
  const initialPlatform = searchParams.get('platform') || '';
  const initialScore = searchParams.get('score') || '';
  const initialYear = searchParams.get('year') || ''; 
  const initialOrdering = searchParams.get('ordering') || '-rating';

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [submittedSearch, setSubmittedSearch] = useState(initialSearch);
  const [activeTab, setActiveTab] = useState(initialSearch ? 'search' : initialTab);
  
  const [selectedGenre, setSelectedGenre] = useState(initialGenre);
  const [selectedPlatform, setSelectedPlatform] = useState(initialPlatform);
  const [selectedRating, setSelectedRating] = useState(initialScore);
  const [selectedYear, setSelectedYear] = useState(initialYear); 
  const [selectedOrdering, setSelectedOrdering] = useState(initialOrdering);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);

  const observerTarget = useRef(null);
  const years = Array.from(new Array(37), (val, index) => 2026 - index);

  // Arama terimi değişince tab yönetimini daha akıllı yapalım
  useEffect(() => {
    const cleanSearch = debouncedSearchTerm.trim();
    if (cleanSearch !== submittedSearch) {
      setSubmittedSearch(cleanSearch);
      if (cleanSearch !== '') {
        setActiveTab('search');
      } else if (activeTab === 'search') {
        setActiveTab('popular');
      }
    }
  }, [debouncedSearchTerm]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (submittedSearch) params.set('q', submittedSearch);
    if (activeTab !== 'popular' && activeTab !== 'search') params.set('tab', activeTab);
    if (selectedGenre) params.set('genre', selectedGenre);
    if (selectedPlatform) params.set('platform', selectedPlatform);
    if (selectedRating) params.set('score', selectedRating);
    if (selectedYear) params.set('year', selectedYear); 
    if (selectedOrdering) params.set('ordering', selectedOrdering);
    setSearchParams(params, { replace: true });
  }, [submittedSearch, activeTab, selectedGenre, selectedPlatform, selectedRating, selectedYear, selectedOrdering]);

  const getDates = () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const sixMonthsAgo = new Date(today);
    sixMonthsAgo.setMonth(today.getMonth() - 6);
    const sixMonthsAgoStr = sixMonthsAgo.toISOString().split('T')[0];
    const nextYear = new Date(today);
    nextYear.setFullYear(today.getFullYear() + 1);
    const nextYearStr = nextYear.toISOString().split('T')[0];
    return { todayStr, sixMonthsAgoStr, nextYearStr };
  };

  // --- MERKEZİ FETCH MOTORU (KUSURSUZ HALE GETİRİLDİ) ---
  const fetchGames = async (query = '', tab = activeTab, pageNum = 1) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const apiKey = import.meta.env.VITE_RAWG_API_KEY;
      const { todayStr, sixMonthsAgoStr, nextYearStr } = getDates();
      
      // Temel URL
      let url = `https://api.rawg.io/api/games?key=${apiKey}&page_size=24&page=${pageNum}`;
      
      // KRİTİK DÜZELTME: Arama varsa TÜM diğer filtreleri baypas et!
      if (query && query.length > 0) {
        url += `&search=${encodeURIComponent(query)}`;
        // Arama sırasında ordering, dates veya metacritic eklemek RAWG'ı bozabiliyor.
        // O yüzden burada duruyoruz.
      } else {
        // Arama yoksa tüm filtreler devreye girsin
        if (selectedGenre) url += `&genres=${selectedGenre}`;
        if (selectedPlatform) url += `&platforms=${selectedPlatform}`;
        if (selectedRating) url += `&metacritic=${selectedRating},100`;
        
        if (selectedYear) {
          url += `&dates=${selectedYear}-01-01,${selectedYear}-12-31`; 
        } else if (tab === 'new') {
          url += `&dates=${sixMonthsAgoStr},${todayStr}`;
        } else if (tab === 'upcoming') {
          url += `&dates=${todayStr},${nextYearStr}`;
        }

        if (selectedOrdering) {
          url += `&ordering=${selectedOrdering}`;
        }
      }

      const response = await fetch(url);
      const data = await response.json();
      
      if (pageNum === 1) setGames(data.results || []);
      else setGames(prev => [...prev, ...(data.results || [])]);
      
      setHasNextPage(data.next !== null); 
    } catch (error) {
      console.error("Oyunlar çekilirken hata:", error);
      setGames([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchGames(submittedSearch, activeTab, 1);
  }, [activeTab, submittedSearch, selectedGenre, selectedPlatform, selectedRating, selectedYear, selectedOrdering]);

  useEffect(() => {
    if (page > 1) fetchGames(submittedSearch, activeTab, page);
  }, [page]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !loading && !loadingMore && hasNextPage) {
          setPage(prevPage => prevPage + 1);
        }
      },
      { threshold: 0.1 } 
    );
    const currentTarget = observerTarget.current;
    if (currentTarget) observer.observe(currentTarget);
    return () => { if (currentTarget) observer.unobserve(currentTarget); };
  }, [loading, loadingMore, hasNextPage]);

  const handleSearch = (e) => {
    e.preventDefault();
    const cleanSearch = searchTerm.trim();
    setSubmittedSearch(cleanSearch);
    if (cleanSearch !== '') setActiveTab('search');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSubmittedSearch('');
    setSelectedGenre('');
    setSelectedPlatform('');
    setSelectedRating('');
    setSelectedYear('');
    setSelectedOrdering('-rating');
    setActiveTab('popular');
  };

  return (
    <div className="py-4">
      {/* HEADER */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-10 flex flex-col items-center justify-center gap-6 text-center"
      >
        <div>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter">{t('Discover')}</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm md:text-base font-medium">{t('Explore')}</p>
        </div>

        <form onSubmit={handleSearch} className="relative w-full md:w-[500px] lg:w-[600px] flex shadow-2xl">
          <input 
            type="text" 
            placeholder={t('SearchGames')} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/5 dark:bg-white/5 backdrop-blur-md text-gray-900 dark:text-gray-100 px-6 py-4 rounded-l-2xl border border-black/5 dark:border-white/10 focus:ring-2 focus:ring-yellow-500 outline-none transition-all shadow-inner text-lg" 
          />
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit" 
            className="bg-yellow-500 hover:bg-yellow-400 text-[#0a0a0a] px-8 rounded-r-2xl transition-colors font-black text-lg shadow-[0_0_20px_rgba(234,179,8,0.2)]"
          >
            {t('SearchBtn')}
          </motion.button>
        </form>
      </motion.header>

      {/* TABS */}
      <AnimatePresence mode="wait">
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-wrap items-center gap-3 mb-6 border-b border-gray-300 dark:border-white/10 pb-6 transition-all"
        >
          {['popular', 'new', 'upcoming'].map((tab) => (
            <motion.button 
              key={tab}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { 
                setActiveTab(tab); 
                setSubmittedSearch(''); 
                setSearchTerm('');
              }}
              className={`px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg border ${
                activeTab === tab && !submittedSearch
                  ? 'bg-yellow-500 text-[#0a0a0a] border-yellow-600 shadow-yellow-500/30' 
                  : 'bg-black/5 dark:bg-white/5 backdrop-blur-md text-gray-700 dark:text-gray-400 border-black/5 dark:border-white/10 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {t(tab === 'popular' ? 'AllTime' : tab === 'new' ? 'NewReleases' : 'Upcoming')}
            </motion.button>
          ))}
          {submittedSearch && (
            <div className="px-5 py-2.5 rounded-xl font-black bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 italic uppercase text-xs">
              🔍 {t('SearchResults')}: "{submittedSearch}"
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* GELİŞMİŞ FİLTRELEME MOTORU - TÜM SEÇENEKLER KORUNDU */}
      <motion.div 
        layout
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8 bg-black/5 dark:bg-white/5 backdrop-blur-xl p-5 rounded-3xl border border-black/5 dark:border-white/10 shadow-2xl"
      >
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-gray-500 ml-1 tracking-widest">{t('Genre')}</label>
          <select value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)} className="w-full bg-[#f0f0f5] dark:bg-[#0a0a0a] text-gray-900 dark:text-white px-3 py-2.5 rounded-xl border border-black/5 dark:border-white/10 outline-none cursor-pointer text-sm">
            <option value="">{t('AllGenres')}</option>
            {['action', 'adventure', 'role-playing-games-rpg', 'shooter', 'strategy', 'indie', 'puzzle', 'racing', 'sports'].map(g => (
              <option key={g} value={g}>{t(g.toUpperCase())}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-gray-500 ml-1 tracking-widest">{t('Platform')}</label>
          <select value={selectedPlatform} onChange={(e) => setSelectedPlatform(e.target.value)} className="w-full bg-[#f0f0f5] dark:bg-[#0a0a0a] text-gray-900 dark:text-white px-3 py-2.5 rounded-xl border border-black/5 dark:border-white/10 outline-none cursor-pointer text-sm">
            <option value="">{t('AllPlatforms')}</option>
            <option value="4">PC</option>
            <option value="187">PS5</option>
            <option value="186">Xbox Series S/X</option>
            <option value="7">Nintendo Switch</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-gray-500 ml-1 tracking-widest">{t('Year')}</label>
          <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="w-full bg-[#f0f0f5] dark:bg-[#0a0a0a] text-gray-900 dark:text-white px-3 py-2.5 rounded-xl border border-black/5 dark:border-white/10 outline-none cursor-pointer text-sm">
            <option value="">{t('AllYears')}</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-gray-500 ml-1 tracking-widest">Metacritic</label>
          <select value={selectedRating} onChange={(e) => setSelectedRating(e.target.value)} className="w-full bg-[#f0f0f5] dark:bg-[#0a0a0a] text-gray-900 dark:text-white px-3 py-2.5 rounded-xl border border-black/5 dark:border-white/10 outline-none cursor-pointer text-sm">
            <option value="">{t('AllScores')}</option>
            <option value="90">90+</option>
            <option value="80">80+</option>
            <option value="70">70+</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-gray-500 ml-1 tracking-widest">{t('Sort')}</label>
          <select value={selectedOrdering} onChange={(e) => setSelectedOrdering(e.target.value)} className="w-full bg-[#f0f0f5] dark:bg-[#0a0a0a] text-gray-900 dark:text-white px-3 py-2.5 rounded-xl border border-black/5 dark:border-white/10 outline-none cursor-pointer text-sm font-bold text-yellow-500">
            <option value="-rating">{t('Popularity')}</option>
            <option value="-released">{t('ReleaseDate')}</option>
            <option value="-metacritic">Metacritic</option>
            <option value="name">{t('Name')}</option>
          </select>
        </div>

        <AnimatePresence>
          {(selectedGenre || selectedPlatform || selectedRating || selectedYear || selectedOrdering !== '-rating') && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="col-span-full">
              <button onClick={clearFilters} className="w-full py-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 text-xs font-black uppercase tracking-tighter rounded-xl border border-yellow-500/20 transition-all">
                {t('ClearAllFilters')}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* GAMES GRID */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
          {[...Array(12)].map((_, i) => <div key={i} className="bg-black/5 dark:bg-white/5 rounded-2xl h-80 animate-pulse" />)}
        </div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6"
        >
          {games.length > 0 ? games.map((game) => (
            <motion.div key={game.id} variants={itemVariants} whileHover={{ y: -8 }} className="h-full">
              <HoloCardWrapper borderRadius="1rem">
                <div onClick={() => navigate(`/game/${game.id}`)} className="bg-black/5 dark:bg-white/5 backdrop-blur-xl rounded-2xl overflow-hidden shadow-xl border border-black/5 dark:border-white/10 flex flex-col h-full cursor-pointer group relative transition-all duration-500">
                  <div className="relative pt-[120%] overflow-hidden"> 
                    <img src={game.background_image || "https://via.placeholder.com/400x300"} alt={game.name} className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                    {game.metacritic && (
                      <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10">
                        <span className={`text-xs font-black ${game.metacritic >= 75 ? 'text-green-500' : 'text-yellow-500'}`}>{game.metacritic}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between relative z-10 bg-white/95 dark:bg-black/40 transition-colors">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1 line-clamp-2 leading-tight">{game.name}</h3>
                      <div className="flex justify-between items-center text-[10px] text-gray-500 dark:text-gray-400 mb-3">
                        <span>{game.released?.substring(0, 4) || 'TBA'}</span>
                        <span className="text-yellow-500 font-bold">★ {game.rating || 'N/A'}</span>
                      </div>
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.02, backgroundColor: '#eab308', color: '#0a0a0a' }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => { e.stopPropagation(); addToLibrary(game); }}
                      className="w-full bg-[#374151] dark:bg-white/10 text-gray-100 dark:text-white text-[10px] font-black py-2 rounded-xl transition-all"
                    >
                      + {t('AddToLibrary')}
                    </motion.button>
                  </div>
                </div>
              </HoloCardWrapper>
            </motion.div>
          )) : (
            <div className="col-span-full py-20 text-center text-gray-500 font-bold">{t('NoGamesFound')}</div>
          )}
        </motion.div>
      )}

      {/* INFINITE SCROLL TARGET */}
      <div ref={observerTarget} className="h-10 w-full" />
      {loadingMore && <div className="text-center py-8 animate-pulse text-yellow-500 font-black tracking-widest text-xs">L O A D I N G . . .</div>}
    </div>
  );
};

export default Home;