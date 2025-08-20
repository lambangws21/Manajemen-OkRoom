'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import LoadingScreen from '@/components/ui/LoadingScreen';

export default function PageLoader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Setiap kali path berubah, kita anggap loading selesai.
    setLoading(false);

    const handleStart = (url: string) => {
      // Hanya tampilkan loading jika URL tujuannya berbeda.
      if (url !== window.location.pathname) {
        setLoading(true);
      }
    };
    
    // Kita perlu "monkey-patch" history.pushState untuk mendeteksi navigasi
    const originalPushState = history.pushState;
    history.pushState = function(...args) {
      handleStart(args[2] as string);
      originalPushState.apply(history, args);
    };

    // Listener untuk tombol back/forward browser
    const handlePopState = () => {
        setLoading(true);
    }
    window.addEventListener('popstate', handlePopState);

    // Cleanup
    return () => {
      history.pushState = originalPushState;
      window.removeEventListener('popstate', handlePopState);
    };
  }, [pathname]); // Bergantung pada pathname untuk mematikan loading

  return loading ? <LoadingScreen /> : null;
}