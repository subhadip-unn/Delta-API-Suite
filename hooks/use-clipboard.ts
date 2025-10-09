import { useState, useCallback } from 'react';
import { copyToClipboard } from '@/utils/clipboard';

/**
 * Hook for managing clipboard operations with feedback
 * @returns Object with copy function and copied state
 */
export function useClipboard(timeout = 2000) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    async (text: string) => {
      const success = await copyToClipboard(text);
      
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), timeout);
      }
      
      return success;
    },
    [timeout]
  );

  return { copy, copied };
}

