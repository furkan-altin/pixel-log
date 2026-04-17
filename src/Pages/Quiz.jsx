import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import useGameStore from '../store/useGameStore';
import toast from 'react-hot-toast';

const Quiz = () => {
  const { t } = useTranslation();
  const { addXp } = useGameStore(); 
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState([]);
  const [targetGame, setTargetGame] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  
  // --- SÜRE STATE'LERİ ---
  const [timeLeft, setTimeLeft] = useState(15);
  const [timerActive, setTimerActive] = useState(false);

  const fetchQuizData = async () => {
    setLoading(true);
    setIsAnswered(false);
    setSelectedId(null);
    setTimeLeft(15); // Süreyi sıfırla
    
    try {
      const apiKey = import.meta.env.VITE_RAWG_API_KEY;
      const randomPage = Math.floor(Math.random() * 120) + 1; 
      const res = await fetch(`https://api.rawg.io/api/games?key=${apiKey}&page=${randomPage}&page_size=4&ordering=-rating`);
      const data = await res.json();
      
      if (data.results && data.results.length === 4) {
        const shuffled = [...data.results].sort(() => Math.random() - 0.5);
        setOptions(shuffled);
        setTargetGame(shuffled[Math.floor(Math.random() * 4)]);
        setTimerActive(true); // Veri gelince süreyi başlat
      }
    } catch (error) {
      toast.error("Quiz yüklenemedi!");
    } finally {
      setLoading(false);
    }
  };

  // --- ZAMANLAYICI MOTORU ---
  useEffect(() => {
    let interval = null;
    if (timerActive && timeLeft > 0 && !isAnswered) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !isAnswered) {
      handleGuess(null); // Süre biterse yanlış say
      toast.error(t('TimeUp', 'Süre Doldu!'), { icon: '⏰' });
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft, isAnswered]);

  useEffect(() => {
    fetchQuizData();
  }, []);

  const handleGuess = (gameId) => {
    if (isAnswered) return;
    
    setIsAnswered(true);
    setTimerActive(false);
    setSelectedId(gameId);

    if (gameId === targetGame.id) {
      toast.success(`${t('Correct')} (+50 XP)`, { icon: '🎯' });
      addXp(50);
    } else if (gameId !== null) {
      toast.error(t('Wrong'), { icon: '❌' });
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="text-5xl">🎲</motion.div>
      <p className="text-yellow-500 font-black animate-pulse uppercase tracking-widest">{t('LoadingQuiz')}</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6"
      >
        <header className="relative">
          <h2 className="text-4xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter">
            {t('DailyQuiz')}
          </h2>
          <p className="text-gray-500 font-bold uppercase text-xs tracking-widest mt-2">{t('GuessDesc')}</p>
          
          {/* --- SÜRE GÖSTERGESİ --- */}
          <div className="mt-6 flex justify-center items-center gap-4">
             <div className="w-full max-w-xs h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden p-0.5">
                <motion.div 
                  initial={{ width: '100%' }}
                  animate={{ 
                    width: `${(timeLeft / 15) * 100}%`,
                    backgroundColor: timeLeft < 5 ? '#ef4444' : '#eab308' 
                  }}
                  className="h-full rounded-full"
                />
             </div>
             <span className={`font-black text-xl w-8 ${timeLeft < 5 ? 'text-red-500 animate-bounce' : 'text-yellow-500'}`}>
                {timeLeft}
             </span>
          </div>
        </header>

        {/* --- OYUN GÖRSELİ (BLUR: 10px) --- */}
        <div className="relative w-full max-w-2xl mx-auto aspect-video rounded-[2.5rem] overflow-hidden border-4 border-white/10 shadow-2xl bg-black/20">
          <motion.img 
            initial={{ filter: 'blur(10px)' }} 
            animate={{ 
              filter: isAnswered ? 'blur(0px)' : 'blur(10px)',
              scale: isAnswered ? 1.05 : 1
            }}
            transition={{ duration: 0.8 }}
            src={targetGame?.background_image} 
            className="w-full h-full object-cover"
            alt="Guess"
          />
          
          <AnimatePresence>
            {isAnswered && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
              >
                <div className="bg-yellow-500 text-black px-8 py-4 rounded-2xl shadow-2xl border-2 border-white">
                  <h3 className="text-xl md:text-3xl font-black uppercase text-center">
                    {targetGame.name}
                  </h3>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* --- ŞIKLAR --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {options.map((game) => (
            <motion.button
              key={game.id}
              whileHover={!isAnswered ? { scale: 1.02 } : {}}
              whileTap={!isAnswered ? { scale: 0.98 } : {}}
              onClick={() => handleGuess(game.id)}
              disabled={isAnswered}
              className={`p-5 rounded-2xl font-black text-sm uppercase tracking-wider transition-all border-2 text-left flex items-center justify-between
                ${!isAnswered 
                  ? 'bg-white/5 border-white/10 text-gray-500 dark:text-gray-400 hover:border-yellow-500 hover:text-yellow-500' 
                  : game.id === targetGame.id 
                    ? 'bg-emerald-500 border-emerald-400 text-black shadow-[0_0_30px_rgba(52,211,153,0.5)]'
                    : selectedId === game.id 
                      ? 'bg-red-500 border-red-400 text-white'
                      : 'bg-white/5 border-white/5 text-gray-600 opacity-30'
                }`}
            >
              <span className="line-clamp-1">{game.name}</span>
              {isAnswered && game.id === targetGame.id && <span>🎯</span>}
              {isAnswered && selectedId === game.id && game.id !== targetGame.id && <span>❌</span>}
            </motion.button>
          ))}
        </div>

        {/* --- SONRAKİ BUTONU --- */}
        <AnimatePresence>
          {isAnswered && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchQuizData}
                className="bg-yellow-500 hover:bg-yellow-400 text-black font-black px-12 py-4 rounded-2xl shadow-xl shadow-yellow-500/20 transition-all uppercase tracking-widest"
              >
                {t('NextQuestion')} 🚀
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Quiz;