import { useCallback, useState } from 'react';

interface UseURLEditorReturn {
  editingURL: string | null;
  editedURL: string;
  customURLs: Record<string, string>;
  handleEditURL: (url: string, key: string) => void;
  handleSaveURL: (key: string) => void;
  handleCancelEdit: () => void;
  getDisplayURL: (originalURL: string, key: string) => string;
  setEditedURL: (url: string) => void;
}

/**
 * Hook for managing URL editing state
 * @returns Object with URL editing functions and state
 */
export function useURLEditor(): UseURLEditorReturn {
  const [editingURL, setEditingURL] = useState<string | null>(null);
  const [editedURL, setEditedURL] = useState<string>('');
  const [customURLs, setCustomURLs] = useState<Record<string, string>>({});

  const handleEditURL = useCallback((url: string, key: string) => {
    setEditingURL(key);
    setEditedURL(url);
  }, []);

  const handleSaveURL = useCallback((key: string) => {
    setCustomURLs((prev) => ({ ...prev, [key]: editedURL }));
    setEditingURL(null);
    setEditedURL('');
  }, [editedURL]);

  const handleCancelEdit = useCallback(() => {
    setEditingURL(null);
    setEditedURL('');
  }, []);

  const getDisplayURL = useCallback(
    (originalURL: string, key: string) => {
      return customURLs[key] || originalURL;
    },
    [customURLs]
  );

  return {
    editingURL,
    editedURL,
    customURLs,
    handleEditURL,
    handleSaveURL,
    handleCancelEdit,
    getDisplayURL,
    setEditedURL,
  };
}

