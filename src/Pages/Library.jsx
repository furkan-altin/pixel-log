import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; 
import useGameStore from '../store/useGameStore';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, Text } from 'recharts';
import toast from 'react-hot-toast'; 
import { motion, AnimatePresence } from 'framer-motion';

// --- DND KIT IMPORTS ---
import { 
  DndContext, 
  closestCorners, 
  PointerSensor, 
  useSensor, 
  useSensors,
  useDroppable,
  useDraggable
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

// ==========================================
// 1. SÜRÜKLENEBİLİR KART BİLEŞENİ (MOBİL DROPDOWN İÇİNDE)
// ==========================================
const DraggableGameCard = ({ game, onClick, onRemove, onRate, onStatusChange, t }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: game.id,
    data: { status: game.status }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...listeners} 
      {...attributes}
      className="bg-white dark:bg-[#1a1a1a] rounded-2xl overflow-hidden shadow-lg border border-black/5 dark:border-white/10 flex flex-col cursor-grab active:cursor-grabbing group hover:border-yellow-500/50 transition-colors"
    >
      <div className="relative pt-[60%] overflow-hidden pointer-events-none"> 
        <img src={game.image} alt={game.title} className="absolute top-0 left-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
      </div>
      
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 leading-tight pointer-events-none">{game.title}</h3>
          
          {/* MOBİL DROPDOWN - SADECE MOBİLDE GÖRÜNÜR */}
          <div className="md:hidden mt-1 mb-3 border-t border-gray-700 pt-2" onPointerDown={(e) => e.stopPropagation()}>
            <label className="text-[9px] text-gray-500 uppercase tracking-widest block mb-1 font-black">Durum Değiştir</label>
            <select 
              value={game.status} 
              onChange={(e) => onStatusChange(game.id, e.target.value)}
              className="w-full bg-black/40 text-yellow-500 text-[11px] py-1.5 px-2 rounded-lg border border-yellow-500/20 focus:outline-none focus:border-yellow-500 font-bold"
            >
              <option value="Backlog">⏳ {t('Backlog')}</option>
              <option value="Playing">🕹️ {t('Playing')}</option>
              <option value="Completed">🏆 {t('Completed')}</option>
              <option value="Dropped">🛑 {t('Dropped')}</option>
            </select>
          </div>

          {/* YILDIZLAR */}
          <div className="flex items-center gap-1 mb-4" onPointerDown={(e) => e.stopPropagation()}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button 
                key={star} 
                onClick={(e) => { e.stopPropagation(); onRate(game.id, star); }} 
                className={`transition-colors ${(game.rating || 0) >= star ? 'text-yellow-500 drop-shadow-[0_0_5px_rgba(234,179,8,0.6)]' : 'text-gray-300 dark:text-gray-700'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" /></svg>
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex gap-2" onPointerDown={(e) => e.stopPropagation()}>
            <button onClick={(e) => { e.stopPropagation(); onClick(); }} className="flex-1 bg-blue-500/10 hover:bg-blue-500 text-blue-600 dark:text-blue-400 hover:text-white text-xs font-bold py-2 rounded-xl transition-all">
              {t('Details')}
            </button>
            <button onClick={(e) => { e.stopPropagation(); onRemove(game.id); }} className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-3 rounded-xl transition-all flex justify-center items-center">
              ✕
            </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. KANBAN SÜTUNU BİLEŞENİ
// ==========================================
const KanbanColumn = ({ id, title, games, onGameClick, onRemove, onRate, onStatusChange, t }) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div 
      ref={setNodeRef} 
      className={`flex flex-col min-w-[280px] sm:min-w-[320px] flex-1 bg-black/5 dark:bg-white/5 backdrop-blur-md rounded-[32px] p-5 border-2 transition-all duration-300 ${isOver ? 'border-yellow-500 bg-yellow-500/10 shadow-[0_0_30px_rgba(234,179,8,0.2)]' : 'border-transparent'}`}
    >
      <div className="flex items-center justify-between mb-6 px-2">
        <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-wider">{title}</h3>
        <span className="bg-black/10 dark:bg-black/40 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-xs font-bold border border-black/5 dark:border-white/10">
          {games.length}
        </span>
      </div>
      
      <div className="flex flex-col gap-4 flex-1 min-h-[150px]">
        {games.map(game => (
          <DraggableGameCard 
            key={game.id} 
            game={game} 
            onClick={() => onGameClick(game.id)}
            onRemove={onRemove}
            onRate={onRate}
            onStatusChange={onStatusChange}
            t={t}
          />
        ))}
      </div>
    </div>
  );
};

// ==========================================
// ANA BİLEŞEN (LIBRARY)
// ==========================================
const Library = () => {
  const { t } = useTranslation(); 
  const { 
    libraryGames, 
    removeFromLibrary, 
    updateGameStatus, 
    updateGameRating, 
    getAchievements,
    getRankName, 
    xp = 0,    
    level = 1  
  } = useGameStore();
  
  const navigate = useNavigate();

  const [randomGame, setRandomGame] = useState(null);
  const [isRolling, setIsRolling] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [showChart, setShowChart] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowChart(true), 150);
    return () => clearTimeout(timer);
  }, []);

  const rankKey = getRankName();

  const pickRandomGame = () => {
    const backlog = libraryGames.filter(g => g.status === 'Backlog');
    if (backlog.length === 0) {
      toast.error(t('NoBacklog')); 
      return;
    }
    
    setIsRolling(true);
    setTimeout(() => {
      const winner = backlog[Math.floor(Math.random() * backlog.length)];
      setRandomGame(winner);
      setIsRolling(false);
    }, 1500);
  };

  const allAchievements = getAchievements ? getAchievements() : [];
  const nextLevelXp = level * 1000;
  const xpPercentage = Math.min((xp / nextLevelXp) * 100, 100);

  const sortedAndFilteredGames = [...libraryGames]
    .filter(game => game.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'title-asc') return a.title.localeCompare(b.title);
      if (sortBy === 'title-desc') return b.title.localeCompare(a.title);
      if (sortBy === 'rating-desc') return (b.rating || 0) - (a.rating || 0);
      return 0;
    });

  const chartData = [
    { name: t('Playing'), value: libraryGames.filter(g => g.status === 'Playing').length, color: '#22d3ee' },
    { name: t('Completed'), value: libraryGames.filter(g => g.status === 'Completed').length, color: '#34d399' },
    { name: t('Backlog'), value: libraryGames.filter(g => g.status === 'Backlog').length, color: '#e879f9' },
    { name: t('Dropped'), value: libraryGames.filter(g => g.status === 'Dropped').length, color: '#f87171' },
  ].filter(item => item.value > 0);

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, fill }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <Text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="font-black text-xl" style={{ filter: `drop-shadow(0 0 5px ${fill})` }}>
        {value}
      </Text>
    );
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;
    updateGameStatus(active.id, over.id);
  };

  return (
    <div className="py-4 space-y-8 overflow-hidden">
      
      {/* --- LEVEL & XP HEADER + THE ORACLE --- */}
      <section className="bg-black/5 dark:bg-white/5 backdrop-blur-2xl p-6 rounded-3xl border border-black/5 dark:border-white/10 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <motion.div initial={{ scale: 0.5, rotate: 0 }} animate={{ scale: 1, rotate: 45 }} className="relative shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-yellow-500 flex items-center justify-center shadow-[0_0_30px_rgba(234,179,8,0.4)]">
              <span className="text-3xl font-black text-black -rotate-45">{level}</span>
            </div>
          </motion.div>
          <div className="flex-1 w-full space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{t(rankKey)}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-yellow-500 font-black text-lg">{xp}</span>
                  <span className="text-gray-500 font-bold text-xs">/ {nextLevelXp} XP</span>
                </div>
              </div>
              <motion.button 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }} 
                onClick={pickRandomGame} 
                className="group relative bg-black dark:bg-white/10 hover:bg-yellow-500 p-3 rounded-2xl transition-all shadow-lg border border-white/5"
              >
                <div className="flex items-center gap-3">
                  <motion.span animate={{ rotate: isRolling ? 360 : 0 }} transition={{ repeat: isRolling ? Infinity : 0, duration: 0.5 }} className="text-2xl">🎲</motion.span>
                  <div className="text-left hidden sm:block">
                    <p className="text-[9px] font-black text-yellow-500 group-hover:text-black uppercase leading-none italic">{t('TheOracle')}</p>
                    <p className="text-gray-400 group-hover:text-black font-black text-xs">{t('FateRoll')}</p>
                  </div>
                </div>
              </motion.button>
            </div>
            <div className="h-3 w-full bg-black/20 dark:bg-white/10 rounded-full overflow-hidden p-0.5">
              <motion.div initial={{ width: 0 }} animate={{ width: `${xpPercentage}%` }} className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.5)]"></motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* SEARCH & SORT */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{t('MyLibrary')}</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">{t('ManageCollection')}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <input type="text" placeholder={t('SearchVault')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-black/5 dark:bg-white/5 backdrop-blur-md text-gray-900 dark:text-gray-100 px-5 py-3 rounded-xl border border-black/5 dark:border-white/10 outline-none" />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-[#f0f0f5] dark:bg-[#0a0a0a] text-gray-900 dark:text-white px-4 py-3 rounded-xl border border-black/5 dark:border-white/10 outline-none cursor-pointer">
            <option value="default">{t('DateAdded')}</option>
            <option value="title-asc">{t('AZ')}</option>
            <option value="title-desc">{t('ZA')}</option>
            <option value="rating-desc">{t('HighestRated')}</option>
          </select>
        </div>
      </header>

      {/* STATS & ACHIEVEMENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white/50 dark:bg-black/40 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-black/5 dark:border-white/10">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3"><span className="w-2 h-6 bg-yellow-500 rounded-full shadow-[0_0_10px_rgba(234,179,8,0.5)]"></span>{t('Achievements')}</h3>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {allAchievements.map((ach, index) => (
              <motion.div key={ach.id} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: index * 0.03 }} whileHover={{ scale: 1.15, zIndex: 50 }} className="relative group cursor-help">
                <div className={`aspect-square rounded-2xl border transition-all duration-500 flex items-center justify-center text-2xl ${ach.isUnlocked ? 'bg-yellow-500/10 border-yellow-500/40' : 'bg-black/5 dark:bg-white/5 grayscale opacity-20'}`}>
                  {ach.icon}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-4 bg-white/50 dark:bg-black/40 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-black/5 dark:border-white/10">
          <div className="w-full flex items-center justify-center min-h-[250px]">
            {showChart && (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none" label={renderCustomizedLabel} labelLine={false}>
                    {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* --- KANBAN BOARD --- */}
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div className="flex overflow-x-auto pb-8 pt-4 gap-6 snap-x hide-scrollbar">
          {['Backlog', 'Playing', 'Completed', 'Dropped'].map(status => (
            <KanbanColumn 
              key={status}
              id={status}
              title={t(status)}
              games={sortedAndFilteredGames.filter(g => g.status === status)}
              onGameClick={(id) => navigate(`/game/${id}`)}
              onRemove={removeFromLibrary}
              onRate={updateGameRating}
              onStatusChange={updateGameStatus}
              t={t}
            />
          ))}
        </div>
      </DndContext>

      {/* MODALS (RESTORED COOL ORACLE) */}
      <AnimatePresence>
        {randomGame && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, opacity: 0 }} transition={{ type: "spring", damping: 15 }} className="bg-white/5 border border-yellow-500/50 p-8 rounded-[40px] max-w-md w-full text-center shadow-[0_0_50px_rgba(234,179,8,0.2)]">
              <h2 className="text-yellow-500 font-black text-xs uppercase tracking-[0.3em] mb-6">{t('FateSealed')}</h2>
              <div className="relative w-48 h-48 mx-auto mb-6 rounded-3xl overflow-hidden border-4 border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.4)]">
                <img src={randomGame.image} className="w-full h-full object-cover" alt="Oracle Selection" />
              </div>
              <h3 className="text-2xl font-black text-white mb-8">{randomGame.title}</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => {
                    updateGameStatus(randomGame.id, 'Playing');
                    setRandomGame(null);
                    toast.success(`${t('FateAccepted')} (+30 XP)`);
                  }}
                  className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black py-4 rounded-2xl transition-all shadow-xl"
                >
                  {t('AcceptFate')}
                </button>
                <button onClick={() => setRandomGame(null)} className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-2xl transition-all">
                  {t('Close')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isRolling && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center">
            <motion.div animate={{ rotate: 360, scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.8 }} className="text-7xl mb-6">🎲</motion.div>
            <p className="text-yellow-500 font-black tracking-[0.5em] animate-pulse">{t('OracleChoosing')}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Library;