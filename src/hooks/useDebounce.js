import { useState, useEffect } from 'react';

// YENİ: Kendi yazdığımız performans (Debounce) Hook'umuz!
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Kullanıcı yazmayı bıraktıktan "delay" (örn: 500ms) süre sonra değeri güncelle
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Eğer kullanıcı 500ms dolmadan yeni bir harf yazarsa, eski sayacı iptal et (Sihir burada!)
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;