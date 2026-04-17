import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import toast from 'react-hot-toast';

export const useGameStore = create(
  persist(
    (set, get) => ({
      // --- 1. STATE ---
      libraryGames: [],
      xp: 0,
      level: 1,
      userName: 'CYBER-USER', 
      joinDate: new Date().toLocaleDateString('tr-TR'), 
      profilePhoto: null, 
      darkMode: localStorage.getItem('theme') === 'dark',
      appTheme: 'cyber', 
      profileUpdates: { nameChanged: false, photoChanged: false },

      // --- YENİ: VERİ İÇE AKTARMA (SİSTEM GERİ YÜKLEME) ---
      importData: (importedData) => {
        try {
          // Basit bir güvenlik kontrolü (Dosya gerçekten bizim sistemin dosyası mı?)
          if (!importedData || typeof importedData.level !== 'number' || !Array.isArray(importedData.libraryGames)) {
            toast.error('Bozuk veya geçersiz veri dosyası!');
            return false;
          }
          
          set({
            libraryGames: importedData.libraryGames,
            xp: importedData.xp,
            level: importedData.level,
            userName: importedData.userName,
            joinDate: importedData.joinDate,
            profilePhoto: importedData.profilePhoto,
            appTheme: importedData.appTheme || 'cyber',
            profileUpdates: importedData.profileUpdates || { nameChanged: false, photoChanged: false }
          });

          // Temayı da anında uygula
          document.documentElement.setAttribute('data-theme', importedData.appTheme || 'cyber');
          toast.success('Sistem Başarıyla Geri Yüklendi!', { icon: '💾' });
          return true;
        } catch (error) {
          toast.error('Veri yüklenirken bir hata oluştu.');
          return false;
        }
      },

      // --- 2. TEMA VE PROFİL AKSİYONLARI ---
      initTheme: () => {
        const { appTheme, darkMode } = get();
        document.documentElement.setAttribute('data-theme', appTheme);
        if (darkMode) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
      },

      setAppTheme: (themeName) => {
        document.documentElement.setAttribute('data-theme', themeName);
        set({ appTheme: themeName });
        toast.success('Siber-Deri Güncellendi!', { 
          icon: '🎨',
          style: { borderRadius: '12px', background: '#111', color: '#fff', border: '1px solid #333' }
        });
      },

      toggleDarkMode: () => set((state) => {
        const newMode = !state.darkMode;
        localStorage.setItem('theme', newMode ? 'dark' : 'light');
        const html = document.documentElement;
        if (newMode) html.classList.add('dark');
        else html.classList.remove('dark');
        return { darkMode: newMode };
      }),

      setUserName: (name) => {
        const formattedName = name.trim().toUpperCase() || 'CYBER-USER';
        set((state) => ({ 
          userName: formattedName,
          profileUpdates: { ...state.profileUpdates, nameChanged: true }
        }));
      },

      setProfilePhoto: (photoBase64) => {
        set((state) => ({ 
          profilePhoto: photoBase64,
          profileUpdates: { ...state.profileUpdates, photoChanged: true }
        }));
      },

      removeProfilePhoto: () => {
        set({ profilePhoto: null });
        toast.error('Profil fotoğrafı kaldırıldı.');
      },

      // --- KÜRESEL RÜTBE MOTORU ---
      getRankName: () => {
        const currentLevel = get().level;
        if (currentLevel >= 50) return "Ghost"; 
        if (currentLevel >= 35) return "Legend";   
        if (currentLevel >= 20) return "Technomancer";        
        if (currentLevel >= 10) return "Netrunner";           
        if (currentLevel >= 5)  return "CyberScout";         
        return "CyberRookie";                        
      },

      // --- 3. XP MOTORU ---
      addXp: (amount) => {
        const { xp, level } = get();
        let newXp = xp + amount;
        let newLevel = level;
        const xpToNextLevel = level * 1000;

        if (newXp >= xpToNextLevel) {
          newXp -= xpToNextLevel;
          newLevel += 1;
          toast.success(`LEVEL UP! Artık Seviye ${newLevel}!`, {
            icon: '🚀',
            duration: 5000,
            style: { 
              borderRadius: '12px', background: '#eab308', color: '#000', fontWeight: '900', border: '2px solid #000' 
            },
          });
        }
        set({ xp: newXp, level: newLevel });
      },

      // --- 4. BAŞARIMLAR ---
      getAchievements: () => {
        const games = get().libraryGames;
        const { level, profileUpdates } = get();
        
        const statusCounts = {
          playing: games.filter(g => g.status === 'Playing').length,
          completed: games.filter(g => g.status === 'Completed').length,
          dropped: games.filter(g => g.status === 'Dropped').length,
        };

        const uniqueGenres = new Set(
          games.flatMap(g => g.genres?.map(gn => gn.name || gn) || [])
        ).size;

        return [
          { id: 'a1', title: 'Enter the Matrix', description: 'İlk oyun eklendi!', icon: '🔌', isUnlocked: games.length >= 1 },
          { id: 'a2', title: 'Collector', description: '10 oyun koleksiyonda.', icon: '📦', isUnlocked: games.length >= 10 },
          { id: 'a3', title: 'Digital Hoarder', description: '25 oyun koleksiyonda.', icon: '💾', isUnlocked: games.length >= 25 },
          { id: 'a4', title: 'Keeper of Knowledge', description: '50 oyun koleksiyonda.', icon: '🏛️', isUnlocked: games.length >= 50 },
          { id: 'a5', title: 'Newbie Finisher', description: 'İlk oyun bitti.', icon: '🏁', isUnlocked: statusCounts.completed >= 1 },
          { id: 'a6', title: 'Marathoner', description: '5 oyun bitti.', icon: '🏃', isUnlocked: statusCounts.completed >= 5 },
          { id: 'a7', title: 'Legendary Finisher', description: '15 oyun bitti.', icon: '🏆', isUnlocked: statusCounts.completed >= 15 },
          { id: 'a8', title: 'Multi-Tasker', description: 'Aynı anda 5 oyun.', icon: '🔥', isUnlocked: statusCounts.playing >= 5 },
          { id: 'a9', title: 'Master Critic', description: '3 oyuna 5 yıldız.', icon: '⭐', isUnlocked: games.filter(g => g.rating === 5).length >= 3 },
          { id: 'a10', title: 'Tastemaker', description: '10 oyun puanlandı.', icon: '🗣️', isUnlocked: games.filter(g => g.rating !== null).length >= 10 },
          { id: 'a11', title: 'Peace Out', description: '5 bırakılan oyun.', icon: '✌️', isUnlocked: statusCounts.dropped >= 5 },
          { id: 'a12', title: 'The Specialist', description: 'Her statüde en az 1 oyun var.', icon: '🧘', isUnlocked: games.length > 0 && ['Playing', 'Completed', 'Backlog', 'Dropped'].every(s => games.some(g => g.status === s)) },
          { id: 'a13', title: 'Shapeshifter', description: 'Profil fotoğrafını güncelledin.', icon: '🖼️', isUnlocked: profileUpdates.photoChanged },
          { id: 'a14', title: 'Identity Shift', description: 'Kullanıcı adını değiştirdin.', icon: '🆔', isUnlocked: profileUpdates.nameChanged },
          { id: 'a15', title: 'High Roller', description: '10. seviyeye ulaştın.', icon: '💎', isUnlocked: level >= 10 },
          { id: 'a16', title: 'Elite Operative', description: '25. seviyeye ulaştın.', icon: '🎖️', isUnlocked: level >= 25 },
          { id: 'a17', title: 'Perfect Score', description: '5 oyuna 5 yıldız verdin.', icon: '🌟', isUnlocked: games.filter(g => g.rating === 5).length >= 5 },
          { id: 'a18', title: 'Genre Master', description: 'Kütüphanende 5 farklı türden oyun var.', icon: '🎭', isUnlocked: uniqueGenres >= 5 },
          { id: 'a19', title: 'Completionist', description: 'Hiç oyun bırakmadın ve en az 5 oyun bitirdin.', icon: '💯', isUnlocked: statusCounts.completed >= 5 && statusCounts.dropped === 0 },
          { id: 'a20', title: 'Night City Legend', description: '50. seviyeye ulaştın.', icon: '🌃', isUnlocked: level >= 50 }
        ];
      },

      // --- 5. OYUN YÖNETİMİ ---
      addToLibrary: (gameFromApi) => {
        if (!gameFromApi) return;
        const currentGames = get().libraryGames;
        if (currentGames.some(g => g.id === gameFromApi.id)) {
          toast.error('Bu oyun zaten kütüphanende!');
          return;
        }

        const newGame = {
          id: gameFromApi.id,
          title: gameFromApi.name || gameFromApi.title,
          image: gameFromApi.background_image || gameFromApi.image,
          genres: gameFromApi.genres || [], 
          status: "Backlog",
          rating: null,
          addedAt: new Date().toISOString(),
          completedAwarded: false,
          playingAwarded: false,
          ratingAwarded: false
        };

        set({ libraryGames: [newGame, ...currentGames] });
        get().addXp(50);
        toast.success(`${newGame.title} eklendi! (+50 XP)`);
      },

      removeFromLibrary: (idToRemove) => {
        set((state) => ({ 
          libraryGames: state.libraryGames.filter(game => game.id !== idToRemove) 
        }));
        toast.error('Oyun kütüphaneden silindi.');
      },

      // --- 6. GÜNCELLEMELER ---
      updateGameStatus: (gameId, newStatus) => {
        const games = get().libraryGames;
        const gameIndex = games.findIndex(g => g.id === gameId);
        if (gameIndex === -1) return;

        const targetGame = games[gameIndex];
        let xpToAdd = 0;
        let flags = {};

        if (newStatus === 'Completed' && !targetGame.completedAwarded) {
          xpToAdd += 250;
          flags.completedAwarded = true;
          toast.success('BÜYÜK BAŞARI! (+250 XP)', { icon: '🏆' });
        } 
        
        if (newStatus === 'Playing' && !targetGame.playingAwarded) {
          xpToAdd += 30;
          flags.playingAwarded = true;
          toast.success('MACERA BAŞLIYOR! (+30 XP)', { icon: '🎮' });
        }

        set((state) => ({
          libraryGames: state.libraryGames.map(game =>
            game.id === gameId ? { ...game, status: newStatus, ...flags } : game
          )
        }));

        if (xpToAdd > 0) get().addXp(xpToAdd);
      },

      updateGameRating: (gameId, newRating) => {
        const games = get().libraryGames;
        const targetGame = games.find(g => g.id === gameId);
        if (!targetGame) return;

        let xpToAdd = 0;
        let flags = {};

        if (newRating !== null && !targetGame.ratingAwarded) {
          xpToAdd = 20;
          flags.ratingAwarded = true;
        }

        set((state) => ({
          libraryGames: state.libraryGames.map(game =>
            game.id === gameId 
              ? { ...game, rating: game.rating === newRating ? null : newRating, ...flags } 
              : game
          )
        }));

        if (xpToAdd > 0) get().addXp(xpToAdd);
      }
    }),
    { name: 'pixer-vault-storage' }
  )
);

export default useGameStore;