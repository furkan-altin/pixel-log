import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; 
import useGameStore from '../store/useGameStore';

// Yardımcı Fonksiyon: Karıştırıcı
const shuffleArray = (array) => {
  let shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const GameDetails = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const { t } = useTranslation(); 
  const { libraryGames, addToLibrary } = useGameStore(); 

  const [game, setGame] = useState(null);
  const [trailer, setTrailer] = useState(null);
  const [screenshots, setScreenshots] = useState([]); 
  const [similarGames, setSimilarGames] = useState([]); 
  const [storeLinks, setStoreLinks] = useState([]); // YENİ: Tam linkleri tutacak state
  const [loading, setLoading] = useState(true);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const isAdded = libraryGames.some(g => g.id === parseInt(id));
  
  // Carousel Kontrolleri
  const carouselRef = useRef(null);
  const scrollInterval = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0); 

    const fetchGameDetails = async () => {
      setLoading(true);
      try {
        const apiKey = import.meta.env.VITE_RAWG_API_KEY;
        
        // 1. Oyunun ana detaylarını çekiyoruz
        const detailRes = await fetch(`https://api.rawg.io/api/games/${id}?key=${apiKey}`);
        const detailData = await detailRes.json();
        setGame(detailData);

        // 2. Fragman, Ekran Görüntüleri ve TAM MAĞAZA LİNKLERİ'ni eşzamanlı çekiyoruz
        const [movieRes, ssRes, storesRes] = await Promise.all([
          fetch(`https://api.rawg.io/api/games/${id}/movies?key=${apiKey}`),
          fetch(`https://api.rawg.io/api/games/${id}/screenshots?key=${apiKey}`),
          fetch(`https://api.rawg.io/api/games/${id}/stores?key=${apiKey}`) // YENİ EKLENDİ
        ]);
        
        const movieData = await movieRes.json();
        const ssData = await ssRes.json();
        const storesData = await storesRes.json(); // YENİ EKLENDİ
        
        if (movieData.results?.length > 0) setTrailer(movieData.results[0]);
        setScreenshots(ssData.results || []);
        setStoreLinks(storesData.results || []); // Linkleri state'e kaydettik

        // 3. Benzer Oyunları Çekiyoruz
        if (detailData.genres?.length > 0) {
          const genreSlugs = detailData.genres.map(g => g.slug).join(',');
          const randomPage = Math.floor(Math.random() * 2) + 1;
          const similarRes = await fetch(`https://api.rawg.io/api/games?key=${apiKey}&genres=${genreSlugs}&ordering=-rating&page=${randomPage}&page_size=20`);
          const similarData = await similarRes.json();
          
          if (similarData.results) {
            const filtered = similarData.results.filter(g => g.id !== parseInt(id));
            setSimilarGames(shuffleArray(filtered).slice(0, 12));
          }
        }
      } catch (error) {
        console.error("Hata:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGameDetails();
  }, [id]);

  // --- OTOMATİK KAYDIRMA MOTORU ---
  useEffect(() => {
    const startAutoScroll = () => {
      if (carouselRef.current && similarGames.length > 0) {
        if (scrollInterval.current) clearInterval(scrollInterval.current);
        scrollInterval.current = setInterval(() => {
          if (carouselRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
            if (scrollLeft + clientWidth >= scrollWidth - 1) {
              carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
              carouselRef.current.scrollLeft += 1;
            }
          }
        }, 30);
      }
    };
    startAutoScroll();
    return () => { if (scrollInterval.current) clearInterval(scrollInterval.current); };
  }, [similarGames]);

  const handleMouseEnter = () => { if (scrollInterval.current) clearInterval(scrollInterval.current); };
  const handleMouseLeave = () => {
    scrollInterval.current = setInterval(() => {
      if (carouselRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 1) carouselRef.current.scrollLeft = 0;
        else carouselRef.current.scrollLeft += 1;
      }
    }, 30);
  };

  const getPcRequirements = () => {
    const pc = game?.platforms?.find(p => p.platform.slug === "pc");
    return pc?.requirements_en || pc?.requirements || null;
  };

  const openGallery = (i) => { setCurrentImageIndex(i); setIsGalleryOpen(true); document.body.style.overflow = 'hidden'; };
  const closeGallery = () => { setIsGalleryOpen(false); document.body.style.overflow = 'auto'; };

  if (loading) return (
    <div className="flex justify-center items-center h-[70vh]">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-500"></div>
    </div>
  );

  if (!game) return <div className="text-center mt-20 text-2xl font-bold">{t('GameNotFound')}</div>;

  const pcRequirements = getPcRequirements();

  return (
    <div className="relative min-h-screen pb-20">
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Geri Butonu */}
      <button onClick={() => navigate(-1)} className="absolute top-4 left-4 z-50 bg-white/50 dark:bg-black/30 hover:bg-yellow-500 text-gray-900 dark:text-white px-4 py-2 rounded-xl backdrop-blur-md transition-all flex items-center gap-2 font-bold group">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 group-hover:-translate-x-1 transition-transform"><path d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
        {t('Back')}
      </button>

      {/* Hero Banner */}
      <div className="relative w-full h-[50vh] md:h-[65vh] rounded-3xl overflow-hidden shadow-2xl">
        <img src={game.background_image} alt={game.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#f0f0f5] via-transparent dark:from-[#0a0a0a] to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 z-10">
          <div className="flex flex-wrap gap-2 mb-4">
            {game.genres?.map(g => (
              <span key={g.id} className="bg-yellow-500 text-black text-xs font-black uppercase px-3 py-1.5 rounded-lg">{t(g.name, g.name)}</span>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between w-full gap-6">
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white">{game.name}</h1>
            <button onClick={() => !isAdded && addToLibrary(game)} className={`px-8 py-3.5 rounded-2xl font-black ${isAdded ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500 text-black shadow-xl'}`}>
              {isAdded ? t('InVault') : t('AddToVault')}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8 px-4">
        <div className="lg:col-span-2 space-y-10">
          <section>
            <h2 className="text-3xl font-black mb-6 flex items-center gap-3"><span className="w-2 h-8 bg-yellow-500 rounded-full"></span>{t('AboutGame')}</h2>
            <div className="text-gray-700 dark:text-gray-300 leading-relaxed bg-white/10 p-8 rounded-3xl backdrop-blur-md" dangerouslySetInnerHTML={{ __html: game.description }} />
          </section>

          {pcRequirements && (
            <section>
              <h3 className="text-3xl font-black mb-6 flex items-center gap-3"><span className="w-2 h-8 bg-blue-500 rounded-full"></span>{t('SystemRequirements')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {['minimum', 'recommended'].map(type => pcRequirements[type] && (
                  <div key={type} className="bg-white/5 p-6 rounded-2xl border border-white/10">
                    <h4 className={`${type === 'minimum' ? 'text-yellow-500' : 'text-emerald-500'} font-black mb-3 uppercase italic`}>{t(type.charAt(0).toUpperCase() + type.slice(1))}</h4>
                    <div className="text-gray-400 text-sm whitespace-pre-line">{pcRequirements[type].replace(/Minimum:|Recommended:/, '')}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {screenshots.length > 0 && (
            <section>
              <h3 className="text-2xl font-black mb-6 flex items-center gap-3"><span className="w-2 h-6 bg-yellow-500 rounded-full"></span>{t('Screenshots')}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {screenshots.slice(0, 6).map((shot, index) => (
                  <div key={shot.id} onClick={() => openGallery(index)} className="aspect-video rounded-2xl overflow-hidden cursor-pointer group shadow-lg border border-white/5">
                    <img src={shot.image} alt="SS" className="w-full h-full object-cover transition-transform group-hover:scale-110"/>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-8">
          {/* --- FRAGMAN KONTROLÜ VE YOUTUBE YÖNLENDİRMESİ --- */}
          {trailer ? (
            <div className="bg-black/40 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
              <video controls poster={trailer.preview} className="w-full aspect-video"><source src={trailer.data.max} type="video/mp4" /></video>
            </div>
          ) : (
            <div className="bg-white/5 p-8 rounded-3xl border border-white/10 text-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-500">📺</div>
              <h3 className="text-xl font-black text-white mb-2">{t('NoTrailerFound')}</h3>
              <p className="text-gray-400 text-xs mb-6 leading-relaxed">
                {t('TrailerRedirectDesc')}
              </p>
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(game?.name + ' official trailer')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full bg-[#FF0000] hover:bg-[#CC0000] text-white font-black py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(255,0,0,0.3)] items-center justify-center gap-3"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                {t('WatchOnYouTube')}
              </a>
            </div>
          )}

          {/* SİBER PAZAR - SATIŞ MAĞAZALARI YÖNLENDİRMESİ */}
          {game.stores && game.stores.length > 0 && (
            <div className="bg-white/5 p-8 rounded-3xl border border-white/10 shadow-2xl">
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <span className="w-2 h-6 bg-yellow-500 rounded-full"></span>
                {t('Stores', 'Mağazalar')}
              </h3>
              <div className="flex flex-col gap-3">
                {game.stores.map((s) => {
                  // YENİ: İkinci fetch'ten gelen tam url'yi store_id ile eşleştiriyoruz
                  const exactLink = storeLinks.find(link => link.store_id === s.store.id)?.url || `https://${s.store.domain}`;

                  return (
                    <a
                      key={s.id || s.store.id}
                      href={exactLink} // Artık direkt oyunun satış sayfasına gidiyor
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between bg-black/5 dark:bg-black/40 hover:bg-yellow-500/10 text-gray-700 dark:text-gray-300 hover:text-yellow-500 border border-black/5 dark:border-white/5 hover:border-yellow-500/50 px-5 py-4 rounded-xl transition-all group"
                    >
                      <span className="font-bold tracking-wide">{s.store.name}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* GELİŞTİRİCİ VE YAYINCI BİLGİSİ */}
          <div className="bg-white/5 p-8 rounded-3xl border border-white/10 shadow-2xl">
            <div className="mb-8"><span className="text-gray-500 text-xs font-bold uppercase">{t('Developer')}</span><div className="text-gray-900 dark:text-white font-black text-xl">{game.developers?.map(d => d.name).join(', ')}</div></div>
            <div><span className="text-gray-500 text-xs font-bold uppercase">{t('Publisher')}</span><div className="text-gray-900 dark:text-white font-black text-xl">{game.publishers?.map(p => p.name).join(', ')}</div></div>
          </div>
        </aside>
      </div>

      {/* BENZER OYUNLAR */}
      {similarGames.length > 0 && (
        <section className="max-w-7xl mx-auto mt-16 pt-10 px-4 overflow-hidden">
          <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-8 flex items-center gap-3"><span className="w-2 h-8 bg-yellow-500 rounded-full"></span>{t('SimilarGames')}</h3>
          <div ref={carouselRef} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="flex overflow-x-auto no-scrollbar gap-6 pb-8 snap-none cursor-grab active:cursor-grabbing">
            {similarGames.map((g) => (
              <div key={g.id} onClick={() => navigate(`/game/${g.id}`)} className="w-[280px] md:w-[340px] shrink-0 bg-white/5 backdrop-blur-xl rounded-3xl overflow-hidden border border-black/5 dark:border-white/10 group hover:-translate-y-2 transition-all duration-500 shadow-xl">
                <div className="relative pt-[56%] overflow-hidden">
                  <img src={g.background_image} alt={g.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-3 right-3 bg-black/60 px-2 py-1 rounded-lg text-yellow-500 font-black text-xs">★ {g.rating}</div>
                </div>
                <div className="p-6">
                  <h4 className="text-xl font-black text-gray-900 dark:text-white truncate">{g.name}</h4>
                  <p className="text-gray-500 text-sm mt-1">{g.released?.substring(0, 4)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* GALERİ */}
      {isGalleryOpen && (
        <div className="fixed inset-0 z-[150] bg-black/95 flex items-center justify-center p-4" onClick={closeGallery}>
          <img src={screenshots[currentImageIndex]?.image} alt="Full" className="max-w-full max-h-full object-contain rounded-xl shadow-3xl" />
        </div>
      )}
    </div>
  );
};

export default GameDetails;