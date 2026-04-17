import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';
import { useTranslation } from 'react-i18next'; // YENİ EKLENDİ
import useGameStore from '../store/useGameStore';
import { Bot, X, Send, Sparkles, User, Terminal } from 'lucide-react';

const PixelAI = () => {
  const { userName, libraryGames, appTheme } = useGameStore();
  const { t, i18n } = useTranslation(); // YENİ EKLENDİ
  
  // Sitenin anlık dilini yakalayalım ('tr' veya 'en')
  const currentLanguage = i18n.language === 'tr' ? 'Türkçe' : 'İngilizce';

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  
  // AÇILIŞ MESAJI DİNAMİKLEŞTİRİLDİ
  const [messages, setMessages] = useState([
    { 
      role: 'ai', 
      text: i18n.language === 'en' 
        ? `Hello **${userName}**! I'm Pixel-AI. I've analyzed your vault. What do you want to play or where are you stuck?` 
        : `Selam **${userName}**! Ben Pixel-AI. Kütüphaneni inceledim. Ne oynamak istersin veya hangi oyunda takıldın?` 
    }
  ]);
  
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Dil değiştiğinde açılış mesajını güncellemek için (Eğer bot henüz konuşmadıysa)
  useEffect(() => {
    if (messages.length === 1) {
      setMessages([
        { 
          role: 'ai', 
          text: i18n.language === 'en' 
            ? `Hello **${userName}**! I'm Pixel-AI. I've analyzed your vault. What do you want to play or where are you stuck?` 
            : `Selam **${userName}**! Ben Pixel-AI. Kütüphaneni inceledim. Ne oynamak istersin veya hangi oyunda takıldın?` 
        }
      ]);
    }
  }, [i18n.language, userName]);

  // Otomatik aşağı kaydırma
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => { scrollToBottom(); }, [messages, isLoading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setIsLoading(true);

    try {
      // 1. Gemini API'yi başlat
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      // 2. Yapay zekaya kim olduğunu ve kullanıcının kütüphanesini gizlice anlatıyoruz (Sistem Promptu)
      const libraryContext = libraryGames.length > 0 
        ? libraryGames.map(g => `${g.title} (${g.status}, Puan: ${g.rating || 'Yok'})`).join(', ')
        : "Kullanıcının henüz kütüphanesinde oyun yok.";

      // SİSTEM PROMPTU DİL BİLGİSİ İLE GÜNCELLENDİ
      const systemPrompt = `Sen PixelLog adında bir siber-oyuncu kütüphanesinin resmi yapay zeka asistanı Pixel-AI'sın. 
      Kullanıcının adı: ${userName}. 
      Kullanıcının oyun kütüphanesi: ${libraryContext}.
      Kullanıcının anlık sistem dili: ${currentLanguage}.
      
      Görevin:
      1. KESİNLİKLE kullanıcının seçtiği sistem dili olan ${currentLanguage} dilinde cevap ver. Başka bir dil kullanma!
      2. Kullanıcı oyun önerisi isterse kütüphanesindeki sevdiği (yüksek puanlı) oyunlara benzer oyunlar öner. Kütüphanesinde zaten olan bir oyunu önerme.
      3. Bir oyunda takıldığını söylerse ona spoilersız taktikler ver.
      4. Tarzın: Biraz cyberpunk, arkadaş canlısı ve oyuncu argosuna hakim (boss, loot, XP, grind vb. kelimeler kullanabilirsin).
      5. Cevapların çok uzun olmasın, okunabilir ve net olsun. Markdown kullan (kalın yazılar, maddeler vb.).`;

      // 3. Sohbet geçmişini formatla ve API'ye gönder
      const chat = model.startChat({
        history: [
          { role: "user", parts: [{ text: systemPrompt }] },
          { role: "model", parts: [{ text: "Anlaşıldı, sistemlere giriş yapıldı. Oyuncuya yardım etmeye hazırım." }] },
          // Önceki mesajları ekle
          ...messages.slice(1).map(m => ({
            role: m.role === 'ai' ? 'model' : 'user',
            parts: [{ text: m.text }]
          }))
        ]
      });

      const result = await chat.sendMessage(userMessage);
      const aiResponse = result.response.text();

      setMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);

    } catch (error) {
      console.error("AI Hatası:", error);
      // Hata mesajı da dile göre
      const errorMsg = i18n.language === 'en' 
        ? "System error! Connection lost. Please check your API key or try again. 🔌" 
        : "Sistem hatası! Bağlantı koptu. Lütfen API anahtarını kontrol et veya tekrar dene. 🔌";
      setMessages(prev => [...prev, { role: 'ai', text: errorMsg }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* SAĞ ALTTAKİ TETİKLEYİCİ BUTON */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-[100] w-14 h-14 rounded-full shadow-[0_0_20px_rgba(234,179,8,0.4)] flex items-center justify-center transition-all ${isOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'} bg-yellow-500 hover:bg-yellow-400 text-black border-2 border-black`}
      >
        <Bot size={28} />
      </motion.button>

      {/* SOHBET PENCERESİ */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-[150] w-[350px] sm:w-[400px] h-[500px] bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#111] p-4 border-b border-white/5 flex justify-between items-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(234,179,8,0.1)_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] pointer-events-none" />
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center border border-yellow-500/50">
                  <Sparkles size={16} className="text-yellow-500" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest leading-none">Pixel-AI</h3>
                  <span className="text-[9px] text-yellow-500 font-bold uppercase tracking-widest flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></span> Online
                  </span>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white transition-colors relative z-10"><X size={20} /></button>
            </div>

            {/* Mesaj Alanı */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth bg-black/50">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center border ${msg.role === 'user' ? 'bg-white/10 border-white/20' : 'bg-yellow-500/10 border-yellow-500/30'}`}>
                    {msg.role === 'user' ? <User size={16} className="text-white" /> : <Bot size={16} className="text-yellow-500" />}
                  </div>
                  <div className={`max-w-[75%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-white/10 text-white rounded-tr-none' : 'bg-black border border-white/10 text-gray-300 rounded-tl-none'}`}>
                    {msg.role === 'ai' ? (
                      <div className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10 prose-strong:text-yellow-500 prose-sm max-w-none">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>
                    ) : (
                      msg.text
                    )}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center shrink-0">
                    <Terminal size={14} className="text-yellow-500 animate-pulse" />
                  </div>
                  <div className="bg-black border border-white/10 p-3 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* İnput Alanı */}
            <form onSubmit={handleSend} className="p-3 bg-[#111] border-t border-white/5">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                  placeholder={i18n.language === 'en' ? "Ask the AI..." : "Yapay zekaya sor..."}
                  className="w-full bg-black/50 border border-white/10 text-white placeholder:text-gray-600 px-4 py-3 rounded-xl pr-12 outline-none focus:border-yellow-500/50 transition-colors text-sm disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 w-8 h-8 bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-700 disabled:text-gray-500 text-black rounded-lg flex items-center justify-center transition-colors"
                >
                  <Send size={14} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PixelAI;