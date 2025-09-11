'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Copy, 
  Download,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface PasteResponseProps {
  onResponsePaste: (side: 'left' | 'right', response: any) => void;
  leftResponse: any;
  rightResponse: any;
}

export default function PasteResponse({ onResponsePaste, leftResponse, rightResponse }: PasteResponseProps) {
  const [leftText, setLeftText] = useState('');
  const [rightText, setRightText] = useState('');
  const [leftError, setLeftError] = useState<string | null>(null);
  const [rightError, setRightError] = useState<string | null>(null);

  // Parse JSON text
  const parseJSON = (text: string) => {
    try {
      return JSON.parse(text);
    } catch (error) {
      return null;
    }
  };

  // Format JSON
  const formatJSON = (obj: any) => {
    try {
      return JSON.stringify(obj, null, 2);
    } catch (error) {
      return String(obj);
    }
  };

  // Handle text change
  const handleTextChange = (side: 'left' | 'right', text: string) => {
    if (side === 'left') {
      setLeftText(text);
      setLeftError(null);
    } else {
      setRightText(text);
      setRightError(null);
    }
  };

  // Handle paste response
  const handlePasteResponse = (side: 'left' | 'right') => {
    const text = side === 'left' ? leftText : rightText;
    const parsed = parseJSON(text);
    
    if (parsed === null) {
      if (side === 'left') {
        setLeftError('Invalid JSON format');
      } else {
        setRightError('Invalid JSON format');
      }
      return;
    }

    // Create mock response object
    const mockResponse = {
      status: 200,
      statusText: 'OK',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': text.length.toString()
      },
      durationMs: 0,
      size: text.length,
      body: parsed,
      url: 'pasted-response'
    };

    onResponsePaste(side, mockResponse);
  };

  // Clear response
  const clearResponse = (side: 'left' | 'right') => {
    if (side === 'left') {
      setLeftText('');
      setLeftError(null);
    } else {
      setRightText('');
      setRightError(null);
    }
  };

  // Copy to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to copy:', error);
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Response */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Left Response</span>
              </div>
              <div className="flex items-center space-x-2">
                {leftResponse && (
                  <Badge variant="outline" className="text-xs">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Ready
                  </Badge>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => clearResponse('left')}
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
                value={leftText}
                onChange={(e) => handleTextChange('left', e.target.value)}
                placeholder='Paste your JSON response here...'
                className="w-full h-64 p-3 border rounded font-mono text-sm mt-1"
              />
            </div>

            {leftError && (
              <div className="p-2 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded text-xs text-red-700 dark:text-red-300">
                <div className="flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{leftError}</span>
                </div>
              </div>
            )}

            <div className="flex space-x-2">
              <Button
                onClick={() => handlePasteResponse('left')}
                disabled={!leftText.trim()}
                className="flex-1"
              >
                <FileText className="w-4 h-4 mr-2" />
                Use as Left Response
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(leftText)}
                disabled={!leftText.trim()}
              >
                <Copy className="w-3 h-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadAsFile(leftText, 'left-response.json')}
                disabled={!leftText.trim()}
              >
                <Download className="w-3 h-3" />
              </Button>
            </div>

            {leftResponse && (
              <div className="p-3 bg-muted rounded text-xs">
                <div className="font-medium mb-2">Response Preview:</div>
                <div className="font-mono text-xs overflow-auto max-h-32">
                  {formatJSON(leftResponse.body)}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Response */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Right Response</span>
              </div>
              <div className="flex items-center space-x-2">
                {rightResponse && (
                  <Badge variant="outline" className="text-xs">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Ready
                  </Badge>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => clearResponse('right')}
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
                value={rightText}
                onChange={(e) => handleTextChange('right', e.target.value)}
                placeholder='Paste your JSON response here...'
                className="w-full h-64 p-3 border rounded font-mono text-sm mt-1"
              />
            </div>

            {rightError && (
              <div className="p-2 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded text-xs text-red-700 dark:text-red-300">
                <div className="flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{rightError}</span>
                </div>
              </div>
            )}

            <div className="flex space-x-2">
              <Button
                onClick={() => handlePasteResponse('right')}
                disabled={!rightText.trim()}
                className="flex-1"
              >
                <FileText className="w-4 h-4 mr-2" />
                Use as Right Response
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(rightText)}
                disabled={!rightText.trim()}
              >
                <Copy className="w-3 h-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadAsFile(rightText, 'right-response.json')}
                disabled={!rightText.trim()}
              >
                <Download className="w-3 h-3" />
              </Button>
            </div>

            {rightResponse && (
              <div className="p-3 bg-muted rounded text-xs">
                <div className="font-medium mb-2">Response Preview:</div>
                <div className="font-mono text-xs overflow-auto max-h-32">
                  {formatJSON(rightResponse.body)}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Instructions</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>• Paste JSON responses directly into the text areas above</p>
          <p>• The tool will automatically validate JSON format</p>
          <p>• Use the "Use as Response" buttons to set the responses for comparison</p>
          <p>• You can copy or download the pasted content using the action buttons</p>
          <p>• Invalid JSON will show an error message</p>
        </CardContent>
      </Card>
    </div>
  );
}
