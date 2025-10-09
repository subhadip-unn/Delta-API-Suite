'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useClipboard } from '@/hooks';
import { Check, Copy, Edit2, X } from 'lucide-react';

interface URLEditorProps {
  url: string;
  urlKey: string;
  label: string;
  editingURL: string | null;
  editedURL: string;
  onEdit: (url: string, key: string) => void;
  onSave: (key: string) => void;
  onCancel: () => void;
  onEditedURLChange: (url: string) => void;
  getDisplayURL: (originalURL: string, key: string) => string;
}

/**
 * Reusable URL Editor Component
 * Provides inline editing and copying functionality for URLs
 */
export function URLEditor({
  url,
  urlKey,
  label,
  editingURL,
  editedURL,
  onEdit,
  onSave,
  onCancel,
  onEditedURLChange,
  getDisplayURL,
}: URLEditorProps) {
  const { copy, copied } = useClipboard();
  const displayURL = getDisplayURL(url, urlKey);
  const isEditing = editingURL === urlKey;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <div className="flex gap-2">
          {!isEditing && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copy(displayURL)}
                className="h-8 px-2"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(displayURL, urlKey)}
                className="h-8 px-2"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
      {isEditing ? (
        <div className="flex gap-2">
          <Input
            value={editedURL}
            onChange={(e) => onEditedURLChange(e.target.value)}
            className="flex-1"
            autoFocus
          />
          <Button
            variant="default"
            size="sm"
            onClick={() => onSave(urlKey)}
            className="h-10 px-3"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onCancel} className="h-10 px-3">
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="rounded-md bg-muted/50 p-3">
          <code className="text-xs break-all">{displayURL}</code>
        </div>
      )}
      {copied && (
        <span className="text-xs text-green-600 dark:text-green-400">Copied to clipboard!</span>
      )}
    </div>
  );
}

