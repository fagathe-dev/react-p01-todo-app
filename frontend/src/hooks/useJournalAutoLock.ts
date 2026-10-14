import { useJournalStore } from '@/stores/journal.store';
import { useEffect, useRef } from 'react';

/**
 * Verrouille le journal uniquement lorsque l'utilisateur change d'onglet ou réduit la fenêtre,
 * sans vider le sessionStorage lors d'un rafraîchissement (Ctrl + R / F5).
 */
export const useJournalAutoLock = () => {
  const lock = useJournalStore((state) => state.lock);
  const isUnlocked = useJournalStore((state) => state.isUnlocked);
  const isReloadingRef = useRef(false);

  useEffect(() => {
    if (!isUnlocked) return;

    // Se déclenche uniquement lors d'un rechargement (Ctrl+R) ou d'une navigation,
    // mais jamais lors d'un changement d'onglet.
    const handleBeforeUnload = () => {
      isReloadingRef.current = true;
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && !isReloadingRef.current) {
        lock();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isUnlocked, lock]);
};
