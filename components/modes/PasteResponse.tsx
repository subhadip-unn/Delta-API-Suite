'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GuidedTour } from '@/components/ui/guided-tour';
import { Label } from '@/components/ui/label';
import type { ApiResponse } from '@/types';
import {
  AlertCircle,
  CheckCircle,
  Copy,
  Download,
  FileText,
  RefreshCw
} from 'lucide-react';
import { useState } from 'react';

interface PasteResponseProps {
  onResponsePaste: (side: 'source' | 'target', response: ApiResponse) => void;
  sourceResponse: ApiResponse | null;
  targetResponse: ApiResponse | null;
}

export default function PasteResponse({ onResponsePaste, sourceResponse, targetResponse }: PasteResponseProps) {
  const [sourceText, setSourceText] = useState('');
  const [targetText, setTargetText] = useState('');
  const [sourceError, setSourceError] = useState<string | null>(null);
  const [targetError, setTargetError] = useState<string | null>(null);
  const [showTour, setShowTour] = useState(false);

  // Parse JSON text
  const parseJSON = (text: string) => {
    try {
      return JSON.parse(text);
    } catch (_error) {
      return null;
    }
  };

  // Format JSON
  const formatJSON = (obj: unknown) => {
    try {
      return JSON.stringify(obj, null, 2);
    } catch (_error) {
      return String(obj);
    }
  };

  // Handle text change
  const handleTextChange = (side: 'source' | 'target', text: string) => {
    if (side === 'source') {
      setSourceText(text);
      setSourceError(null);
    } else {
      setTargetText(text);
      setTargetError(null);
    }
  };

  // Handle paste response
  const handlePasteResponse = (side: 'source' | 'target') => {
    const text = side === 'source' ? sourceText : targetText;
    const parsed = parseJSON(text);
    
    // If JSON is invalid, surface error but still allow text-based comparison by passing raw text
    const isJsonValid = parsed !== null;
    if (!isJsonValid) {
      if (side === 'source') {
        setSourceError('Invalid JSON format');
      } else {
        setTargetError('Invalid JSON format');
      }
    }

    // Create mock response object
    const mockResponse = {
      status: 200,
      statusText: 'OK',
      headers: {
        'Content-Type': isJsonValid ? 'application/json' : 'text/plain',
        'Content-Length': text.length.toString()
      },
      durationMs: 0,
      size: text.length,
      body: isJsonValid ? parsed : text,
      url: 'pasted-response'
    };

    onResponsePaste(side, mockResponse);
  };

  // Clear response
  const clearResponse = (side: 'source' | 'target') => {
    if (side === 'source') {
      setSourceText('');
      setSourceError(null);
    } else {
      setTargetText('');
      setTargetError(null);
    }
  };

  // Copy to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (_error) {
      // Failed to copy - handled by UI feedback
    }
  };

  // Download as file
  const downloadAsFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleTourComplete = () => {
    setShowTour(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Response */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Source Response</span>
              </div>
              <div className="flex items-center space-x-2">
                {sourceResponse && (
                  <Badge variant="outline" className="text-xs">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Ready
                  </Badge>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => clearResponse('source')}
                >
                  <RefreshCw className="w-3 h-3" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Paste JSON Response</Label>
              <textarea
                value={sourceText}
                onChange={(e) => handleTextChange('source', e.target.value)}
                placeholder='Paste your JSON response here...'
                className="w-full h-64 p-3 border rounded font-mono text-sm mt-1"
              />
            </div>

            {sourceError && (
              <div className="p-2 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded text-xs text-red-700 dark:text-red-300">
                <div className="flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{sourceError}</span>
                </div>
              </div>
            )}

            <div className="flex space-x-2">
              <Button
                onClick={() => handlePasteResponse('source')}
                disabled={!sourceText.trim()}
                className="flex-1"
              >
                <FileText className="w-4 h-4 mr-2" />
                Use as Source Response
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(sourceText)}
                disabled={!sourceText.trim()}
              >
                <Copy className="w-3 h-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadAsFile(sourceText, 'source-response.json')}
                disabled={!sourceText.trim()}
              >
                <Download className="w-3 h-3" />
              </Button>
            </div>

            {sourceResponse && (
              <div className="p-3 bg-muted rounded text-xs">
                <div className="font-medium mb-2">Response Preview:</div>
                <div className="font-mono text-xs overflow-auto max-h-32">
                  {formatJSON(sourceResponse.body)}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Target Response */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Target Response</span>
              </div>
              <div className="flex items-center space-x-2">
                {targetResponse && (
                  <Badge variant="outline" className="text-xs">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Ready
                  </Badge>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => clearResponse('target')}
                >
                  <RefreshCw className="w-3 h-3" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Paste JSON Response</Label>
              <textarea
                value={targetText}
                onChange={(e) => handleTextChange('target', e.target.value)}
                placeholder='Paste your JSON response here...'
                className="w-full h-64 p-3 border rounded font-mono text-sm mt-1"
              />
            </div>

            {targetError && (
              <div className="p-2 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded text-xs text-red-700 dark:text-red-300">
                <div className="flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{targetError}</span>
                </div>
              </div>
            )}

            <div className="flex space-x-2">
              <Button
                onClick={() => handlePasteResponse('target')}
                disabled={!targetText.trim()}
                className="flex-1"
              >
                <FileText className="w-4 h-4 mr-2" />
                Use as Target Response
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(targetText)}
                disabled={!targetText.trim()}
              >
                <Copy className="w-3 h-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadAsFile(targetText, 'target-response.json')}
                disabled={!targetText.trim()}
              >
                <Download className="w-3 h-3" />
              </Button>
            </div>

            {targetResponse && (
              <div className="p-3 bg-muted rounded text-xs">
                <div className="font-medium mb-2">Response Preview:</div>
                <div className="font-mono text-xs overflow-auto max-h-32">
                  {formatJSON(targetResponse.body)}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modern Help Section */}
      <Card className="border-dashed border-2 border-muted">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-3 rounded-full bg-primary/10">
                <FileText className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Ready to Compare?</h3>
              <p className="text-muted-foreground">
                Paste your JSON responses above and click "Use as Response" to start comparing
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guided Tour Modal */}
      {showTour && (
        <GuidedTour
          onComplete={handleTourComplete}
          onSkip={handleTourComplete}
        />
      )}
    </div>
  );
}
