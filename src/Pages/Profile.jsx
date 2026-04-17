import { useMemo, useRef, useState, useEffect } from 'react'; // useEffect EKLENDİ
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import useGameStore from '../store/useGameStore';
import { useNavigate } from 'react-router-dom'; 
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { 
  Shield, Target, Zap, Award, Share2, BarChart3, 
  Edit3, Check, Camera, X, Lock, CheckCircle2, Palette, Database, DownloadCloud, UploadCloud,
  Fingerprint, ScanLine, Copy, Radio 
} from 'lucide-react';
import { toPng } from 'html-to-image';
import toast from 'react-hot-toast';
import HoloCardWrapper from '../Components/HoloCardWrapper';

const Profile = () => {
  const { t } = useTranslation();
  const navigate = useNavigate(); 
  const { 
    libraryGames, level, userName, joinDate, profilePhoto, 
    setUserName, setProfilePhoto, removeProfilePhoto, getAchievements,
    getRankName, appTheme, setAppTheme, importData 
  } = useGameStore();
  
  const reportRef = useRef(null);
  const fileInputRef = useRef(null);
  const dataImportRef = useRef(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(userName);

  const [myHoloCode, setMyHoloCode] = useState("");
  const [scanInput, setScanInput] = useState("");
  const [scannedFriend, setScannedFriend] = useState(null);
  
  // --- RECHARTS "HAYALET" HATASI İÇİN ÇÖZÜM ---
  const [showChart, setShowChart] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setShowChart(true), 150); // Animasyon sonrası çiz
    return () => clearTimeout(timer);
  }, []);

  const rankKey = getRankName();

  const allRanks = [
    { lvl: 1, key: "CyberRookie", icon: "👶" },
    { lvl: 5, key: "CyberScout", icon: "🛰️" },
    { lvl: 10, key: "Netrunner", icon: "⌨️" },
    { lvl: 20, key: "Technomancer", icon: "🔮" },
    { lvl: 35, key: "Legend", icon: "🌃" },
    { lvl: 50, key: "Ghost", icon: "👻" },
  ];

  const skinThemes = [
    { id: 'cyber', name: 'Cyber', hex: '#eab308' },
    { id: 'neon', name: 'Neon', hex: '#ec4899' },
    { id: 'toxic', name: 'Toxic', hex: '#22c55e' },
    { id: 'blood', name: 'Blood', hex: '#ef4444' },
    { id: 'orange', name: 'Orange', hex: '#f97316' }
  ];

  const allAchievements = getAchievements ? getAchievements() : [];

  const handleNameSave = () => {
    setUserName(newName);
    setIsEditingName(false);
    toast.success(t('NameUpdated', 'İsim güncellendi!'));
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file && (file.type.startsWith('image/'))) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result);
        toast.success(t('PhotoUpdated', 'Fotoğraf güncellendi!'));
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadFullReport = () => {
    if (reportRef.current === null) return;
    const loadingToast = toast.loading(t('Downloading', 'İndiriliyor...'));
    toPng(reportRef.current, { cacheBust: true, backgroundColor: '#0a0a0a', style: { padding: '20px' } })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `${userName}-profile.png`;
        link.href = dataUrl;
        link.click();
        toast.success(t('DownloadSuccess', 'İndirme tamam!'), { id: loadingToast });
      })
      .catch(() => toast.error('Hata!', { id: loadingToast }));
  };

  const handleExportData = () => {
    const state = useGameStore.getState();
    const dataToExport = {
      libraryGames: state.libraryGames,
      xp: state.xp,
      level: state.level,
      userName: state.userName,
      joinDate: state.joinDate,
      profilePhoto: state.profilePhoto,
      appTheme: state.appTheme,
      profileUpdates: state.profileUpdates
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataToExport));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `pixerlog_backup_${new Date().toISOString().split('T')[0]}.cyber`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    toast.success(t('DataExported', 'Sistem yedeklemesi indirildi!'));
  };

  const handleImportData = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsedData = JSON.parse(e.target.result);
        importData(parsedData);
      } catch (error) {
        toast.error(t('DataImportError', 'Dosya okuma hatası!'));
      }
    };
    reader.readAsText(file);
    event.target.value = null; 
  };

  const generateHoloDNA = () => {
    const topGames = libraryGames
      .filter(g => g.rating)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5) 
      .map(g => ({ id: g.id, title: g.title, rating: g.rating })); 

    const payload = {
      n: userName,
      l: level,
      r: rankKey,
      g: topGames
    };

    const base64Str = btoa(encodeURIComponent(JSON.stringify(payload)));
    setMyHoloCode(base64Str);
  };

  const scanHoloDNA = () => {
    if (!scanInput.trim()) return;
    try {
      const decodedStr = decodeURIComponent(atob(scanInput));
      const parsedData = JSON.parse(decodedStr);
      
      if (parsedData.n && typeof parsedData.l === 'number') {
        setScannedFriend(parsedData);
        setScanInput("");
        toast.success(t('HoloScanSuccess', 'Hologram sinyali yakalandı!'), { icon: '📡' });
      } else {
        throw new Error("Invalid format");
      }
    } catch (error) {
      toast.error(t('HoloScanError', 'Bozuk veya geçersiz Holo-DNA!'), { icon: '❌' });
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(myHoloCode);
    toast.success(t('Copied', 'Panoya Kopyalandı!'), { icon: '📋' });
  };

  const stats = useMemo(() => {
    const genreCount = {};
    libraryGames.forEach(game => {
      game.genres?.forEach(g => {
        const name = typeof g === 'string' ? g : g.name;
        if (name) genreCount[name] = (genreCount[name] || 0) + 1;
      });
    });
    const radarData = Object.keys(genreCount).map(key => ({
      subject: key, A: genreCount[key], fullMark: Math.max(...Object.values(genreCount), 5),
    })).sort((a, b) => b.A - a.A).slice(0, 6);
    return { radarData, completed: libraryGames.filter(g => g.status === 'Completed').length, total: libraryGames.length };
  }, [libraryGames]);

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 space-y-12">
      
      <div ref={reportRef} className="space-y-8 p-2 bg-transparent">
        
        {/* --- 1. CYBER ID CARD --- */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-black text-white rounded-[3rem] p-8 md:p-12 overflow-hidden border-2 border-yellow-500/30 shadow-2xl"
        >
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row gap-12 items-center">
            <div className="relative group">
              <div className="w-40 h-40 rounded-full border-4 border-yellow-500 shadow-[0_0_40px_rgba(234,179,8,0.3)] bg-gray-900 overflow-hidden relative flex items-center justify-center">
                {profilePhoto ? (
                  <img src={profilePhoto} className="w-full h-full object-cover" alt="" />
                ) : (
                  <div className="w-full h-full bg-yellow-500 flex items-center justify-center select-none">
                    <span className="text-black font-black text-[110px] leading-none mb-2 tracking-tighter">
                      {userName?.charAt(0) || 'P'}
                    </span>
                  </div>
                )}
                <div 
                  onClick={() => fileInputRef.current.click()}
                  className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10 backdrop-blur-[2px]"
                >
                  <Camera className="text-yellow-500" size={32} />
                </div>
              </div>
              <AnimatePresence>
                {profilePhoto && (
                  <motion.button
                    initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    onClick={(e) => { e.stopPropagation(); removeProfilePhoto(); }}
                    className="absolute top-1 right-1 bg-red-500 text-white p-2 rounded-full shadow-lg z-20 border-2 border-black"
                  >
                    <X size={14} strokeWidth={4} />
                  </motion.button>
                )}
              </AnimatePresence>
              <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} className="hidden" accept="image/*" />
              <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-black font-black px-4 py-1 rounded-lg text-xl shadow-xl z-20">
                LVL {level}
              </div>
            </div>

            <div className="flex-1 text-center lg:text-left space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <input 
                      autoFocus
                      className="bg-white/10 border-2 border-yellow-500 rounded-xl px-4 py-2 text-2xl font-black uppercase text-yellow-500 outline-none w-full max-w-xs"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
                    />
                    <button onClick={handleNameSave} className="bg-yellow-500 p-3 rounded-xl text-black"><Check size={24} /></button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 group">
                    <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-none truncate max-w-md">{userName}</h1>
                    <button onClick={() => setIsEditingName(true)} className="p-2 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-all text-yellow-500 hover:bg-yellow-500/20"><Edit3 size={20} /></button>
                  </div>
                )}
              </div>
              
              <p className="text-yellow-500/60 font-black uppercase tracking-[0.3em] text-sm">
                {t(rankKey)} <span className="text-white/40 font-bold ml-2">{t('MemberSince', 'Üyelik')}: {joinDate}</span>
              </p>

              <div className="flex flex-wrap justify-center lg:justify-start gap-3 text-yellow-500 font-bold uppercase tracking-widest text-[10px]">
                 <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg border border-white/10"><Shield size={12}/> {stats.total} {t('TotalGames', 'Oyun')}</span>
                 <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg border border-white/10"><Target size={12}/> %{Math.round((stats.completed / stats.total) * 100 || 0)} {t('CompletionRate', 'Bitirme')}</span>
                 <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg border border-white/10"><Award size={12}/> {allAchievements.filter(a => a.isUnlocked).length} {t('Achievements', 'Başarım')}</span>
              </div>
            </div>
          </div>
        </motion.section>

        {/* --- KONTROL PANELLERİ --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="flex flex-col sm:flex-row items-center justify-between bg-[#111] border border-white/10 rounded-3xl p-6 shadow-xl gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-500/10 rounded-2xl flex items-center justify-center border border-yellow-500/20">
                <Palette className="text-yellow-500" size={24} />
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest leading-none">Cyber-Skin</h3>
                <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">Arayüz rengini seç.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-black/50 p-2 rounded-2xl border border-white/5 flex-wrap justify-center">
              {skinThemes.map((theme) => (
                <motion.button
                  key={theme.id}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setAppTheme(theme.id)}
                  className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all ${appTheme === theme.id ? 'border-2 border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'border border-transparent opacity-50 hover:opacity-100 grayscale-[0.3]'}`}
                  style={{ backgroundColor: theme.hex }}
                >
                  {appTheme === theme.id && <CheckCircle2 size={16} className="text-white drop-shadow-md" />}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between bg-[#111] border border-white/10 rounded-3xl p-6 shadow-xl gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
                <Database className="text-blue-500" size={24} />
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest leading-none">Data Terminal</h3>
                <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">Sistemi Yedekle / Yükle</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button onClick={handleExportData} title={t('ExportData', 'Yedek İndir')} className="bg-white/5 hover:bg-blue-500/20 text-blue-500 border border-white/10 p-3 rounded-xl transition-all">
                <DownloadCloud size={20} />
              </button>
              <input type="file" accept=".cyber,.json" ref={dataImportRef} onChange={handleImportData} className="hidden" />
              <button onClick={() => dataImportRef.current.click()} title={t('ImportData', 'Yedek Yükle')} className="bg-white/5 hover:bg-green-500/20 text-green-500 border border-white/10 p-3 rounded-xl transition-all">
                <UploadCloud size={20} />
              </button>
            </div>
          </div>

          {/* --- HOLO-NET BAĞLANTISI --- */}
          <div className="lg:col-span-2 bg-[#111] border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row gap-6 items-stretch">
            
            <div className="flex-1 bg-white/5 border border-white/5 rounded-2xl p-6 flex flex-col justify-center items-center text-center group transition-all hover:bg-white/10">
              <Fingerprint className="text-purple-500 mb-4 group-hover:scale-110 transition-transform" size={32} />
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-2">My Holo-DNA</h3>
              <p className="text-[10px] text-gray-400 mb-4 max-w-xs">Profilini bir koda dönüştür ve arkadaşlarınla paylaş.</p>
              
              {!myHoloCode ? (
                <button onClick={generateHoloDNA} className="bg-purple-500/20 text-purple-400 hover:bg-purple-500 hover:text-white border border-purple-500/30 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                  Oluştur
                </button>
              ) : (
                <div className="flex items-center gap-2 w-full max-w-sm">
                  <input type="text" readOnly value={myHoloCode} className="flex-1 bg-black/50 border border-purple-500/30 rounded-lg px-3 py-2 text-xs text-purple-400 outline-none truncate" />
                  <button onClick={copyToClipboard} className="bg-purple-500 text-white p-2 rounded-lg hover:bg-purple-400 transition-all"><Copy size={16}/></button>
                </div>
              )}
            </div>

            <div className="flex-1 bg-white/5 border border-white/5 rounded-2xl p-6 flex flex-col justify-center items-center text-center group transition-all hover:bg-white/10">
              <ScanLine className="text-cyan-500 mb-4 group-hover:scale-110 transition-transform" size={32} />
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-2">Holo-Scanner</h3>
              <p className="text-[10px] text-gray-400 mb-4 max-w-xs">Arkadaşının kodunu yapıştır ve profilini görüntüle.</p>
              
              <div className="flex items-center gap-2 w-full max-w-sm">
                <input 
                  type="text" 
                  placeholder="Kodu buraya yapıştır..." 
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  className="flex-1 bg-black/50 border border-cyan-500/30 rounded-lg px-3 py-2 text-xs text-cyan-400 outline-none placeholder:text-cyan-900/50" 
                />
                <button onClick={scanHoloDNA} disabled={!scanInput} className="bg-cyan-500 disabled:bg-cyan-900 text-white p-2 rounded-lg hover:bg-cyan-400 transition-all"><Radio size={16}/></button>
              </div>
            </div>
          </div>
        </div>

        {/* --- 2. ANALİZ & RÜTBE YOL HARİTASI & BAŞARIMLAR --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-[#111] rounded-[2.5rem] p-8 border border-white/10 shadow-xl flex flex-col min-h-[450px]">
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
               <Zap size={18} className="text-yellow-500" /> {t('GenreStats', 'Tür Analizi')}
            </h3>
            <div className="flex-1 w-full text-white">
              {stats.radarData.length > 0 ? (
                /* --- BURAYA showChart EKLENDİ --- */
                showChart && (
                  <ResponsiveContainer width="100%" height={250}>
                     <RadarChart cx="50%" cy="50%" outerRadius="70%" data={stats.radarData}>
                     <PolarGrid stroke="#333" />
                     <PolarAngleAxis dataKey="subject" tick={{ fill: '#666', fontSize: 10, fontWeight: 'bold' }} />
                     <Radar name="Gamer" dataKey="A" stroke="#eab308" fill="#eab308" fillOpacity={0.5} />
                     </RadarChart>
                  </ResponsiveContainer>
                )
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-2 text-center">
                  <BarChart3 size={40} className="opacity-20" />
                  <p className="italic text-xs">{t('NoGenreData', 'Veri Yok')}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#111] rounded-[2.5rem] p-8 border border-white/10 shadow-xl min-h-[450px]">
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
               <Target size={18} className="text-yellow-500" /> {t('RankPath', 'Rütbe Yolu')}
            </h3>
            <div className="space-y-4 relative">
              <div className="absolute left-[21px] top-2 bottom-2 w-0.5 bg-white/5" />
              {allRanks.map((rank, index) => {
                const isUnlocked = level >= rank.lvl;
                const isCurrent = (level >= rank.lvl) && (index === allRanks.length - 1 || level < allRanks[index+1].lvl);
                
                return (
                  <motion.div 
                    key={rank.lvl}
                    className={`relative z-10 flex items-center gap-4 p-2 rounded-2xl transition-all ${isCurrent ? 'bg-yellow-500/10 border border-yellow-500/20 shadow-lg' : ''}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border-2 ${isUnlocked ? 'bg-yellow-500 border-yellow-400 text-black shadow-[0_0_15px_rgba(234,179,8,0.3)]' : 'bg-black border-white/10 text-gray-700'}`}>
                      {isUnlocked ? <CheckCircle2 size={18} /> : <Lock size={16} />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-[10px] font-black uppercase tracking-widest ${isUnlocked ? 'text-white' : 'text-gray-700'}`}>
                          {t(rank.key)}
                        </h4>
                        <span className={`text-[9px] font-bold ${isUnlocked ? 'text-yellow-500' : 'text-gray-800'}`}>LVL {rank.lvl}</span>
                      </div>
                      {isCurrent && <span className="text-[8px] bg-yellow-500 text-black px-2 py-0.5 rounded-full font-black uppercase mt-1 inline-block">{t('Active', 'Aktif')}</span>}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="bg-[#111] rounded-[2.5rem] p-8 border border-white/10 shadow-xl min-h-[450px]">
            <h3 className="text-sm font-black text-gray-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
               <Award size={18} className="text-yellow-500" /> {t('Achievements', 'Başarımlar')}
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
               {allAchievements.map((ach) => (
                 <motion.div 
                   key={ach.id}
                   whileHover={{ scale: 1.1 }}
                   className="relative group cursor-help"
                 >
                   <div className={`aspect-square rounded-xl flex items-center justify-center text-xl border transition-all duration-500 ${
                     ach.isUnlocked 
                       ? 'bg-yellow-500/10 border-yellow-500/30 text-white' 
                       : 'bg-white/5 border-white/5 opacity-10 grayscale'
                   }`}>
                     {ach.icon}
                   </div>

                   <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-36 p-3 bg-black/95 backdrop-blur-xl border border-yellow-500/40 rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 z-50 shadow-[0_0_20px_rgba(0,0,0,0.9)]">
                      <div className="text-center">
                        <p className="text-[9px] font-black text-yellow-500 uppercase tracking-tighter mb-1 leading-none">
                          {t(`ach_${ach.id}_title`)}
                        </p>
                        <p className="text-[8px] text-white/70 leading-tight">
                          {ach.isUnlocked ? t(`ach_${ach.id}_desc`) : "???"}
                        </p>
                      </div>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-yellow-500/40"></div>
                   </div>
                 </motion.div>
               ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-6">
         <motion.button 
           whileHover={{ scale: 1.05 }}
           whileTap={{ scale: 0.95 }}
           onClick={downloadFullReport}
           className="bg-yellow-500 hover:bg-yellow-400 text-black font-black px-12 py-5 rounded-2xl shadow-xl shadow-yellow-500/20 flex items-center gap-3 uppercase tracking-tighter transition-all"
         >
           <Share2 size={20} /> {t('DownloadID', 'ID Kartı İndir')}
         </motion.button>
      </div>

      {/* --- GÜNCELLENMİŞ İŞLEVSEL HOLOGRAM MODAL --- */}
      <AnimatePresence>
        {scannedFriend && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setScannedFriend(null)}
          >
            <motion.div 
              initial={{ scale: 0.8, y: 50, opacity: 0 }} 
              animate={{ scale: 1, y: 0, opacity: 1 }} 
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 20 }}
              onClick={(e) => e.stopPropagation()} 
              className="w-full max-w-sm"
            >
              <HoloCardWrapper borderRadius="2rem">
                <div className="relative w-full min-h-[520px] bg-[#050f1a] rounded-[2rem] border-2 border-cyan-500/50 p-6 flex flex-col justify-between shadow-[0_0_50px_rgba(6,182,212,0.4)] overflow-hidden group">
                  
                  <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(6,182,212,0.1)_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px]" />
                  <div className="absolute top-[-20%] left-[-20%] w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl group-hover:bg-cyan-400/30 transition-colors" />
                  
                  <div className="relative z-10 flex justify-between items-start">
                    <div className="flex items-center gap-2 text-cyan-500 font-black text-[10px] tracking-widest uppercase">
                      <Radio className="animate-pulse" size={14} /> Sinyal Aktif
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-cyan-600 font-black uppercase tracking-widest">Seviye</div>
                      <div className="text-4xl font-black text-white leading-none drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">
                        {scannedFriend.l}
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 text-center space-y-2 mt-4">
                    <div className="w-24 h-24 mx-auto rounded-full border-4 border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.6)] flex items-center justify-center bg-black/50 backdrop-blur-md mb-6 relative group-hover:scale-105 transition-transform">
                      <span className="text-cyan-400 text-5xl font-black">{scannedFriend.n.charAt(0)}</span>
                    </div>
                    <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter truncate px-2">
                      {scannedFriend.n}
                    </h3>
                    <p className="inline-block bg-cyan-950/50 border border-cyan-500/30 text-cyan-400 font-bold text-xs uppercase tracking-widest px-4 py-1.5 rounded-full">
                      {t(scannedFriend.r)}
                    </p>
                  </div>

                  {/* 5 OYUN LİSTESİ VE YÖNLENDİRME ÖZELLİĞİ */}
                  <div className="relative z-10 mt-6 flex-1 flex flex-col">
                    {scannedFriend.g && scannedFriend.g.length > 0 ? (
                      <div className="bg-black/60 rounded-xl p-4 border border-cyan-900/50 backdrop-blur-sm flex-1">
                        <p className="text-[9px] text-cyan-600 font-black uppercase tracking-widest mb-3 border-b border-cyan-900/50 pb-1">Top {scannedFriend.g.length} Kayıt</p>
                        <ul className="space-y-1">
                          {scannedFriend.g.map((game, idx) => (
                            <li 
                              key={idx} 
                              onClick={() => {
                                if (game.id) {
                                  setScannedFriend(null); 
                                  navigate(`/game/${game.id}`); 
                                } else {
                                  toast(t('OldDNA', 'Eski DNA sürümü! Oyun sayfası açılamıyor.'), { icon: '⚠️' });
                                }
                              }}
                              className={`flex justify-between items-center text-xs group/item rounded px-2 py-1.5 transition-all border ${
                                game.id 
                                  ? 'cursor-pointer hover:bg-cyan-500/20 border-transparent hover:border-cyan-500/30' 
                                  : 'border-transparent hover:bg-white/5 opacity-80'
                              }`}
                            >
                              <span className={`truncate pr-2 font-medium ${game.id ? 'text-white' : 'text-gray-400'}`}>{game.title}</span>
                              <span className="text-yellow-500 font-black shrink-0 group-hover/item:scale-110 transition-transform">★ {game.rating}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="text-center py-6 border border-dashed border-cyan-900/50 rounded-xl">
                        <span className="text-cyan-900 text-xs font-bold uppercase tracking-widest">Kayıt Bulunamadı</span>
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={() => setScannedFriend(null)} 
                    className="relative z-10 mt-6 w-full bg-transparent hover:bg-cyan-500/10 text-cyan-500 border border-cyan-500/50 font-black py-3 rounded-xl uppercase tracking-widest transition-all text-xs"
                  >
                    Bağlantıyı Kes
                  </button>
                </div>
              </HoloCardWrapper>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Profile;