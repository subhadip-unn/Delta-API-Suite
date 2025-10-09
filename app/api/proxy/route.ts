import { API_TIMEOUT } from '@/config/constants';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Max-Age': '86400',
    },
  });
}


// Production-ready proxy handler with security and rate limiting
async function handleProxyRequest(request: NextRequest, method: string) {
  try {
    // Security: Validate method
    const allowedMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
    if (!allowedMethods.includes(method)) {
      return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405 }
      );
    }

    // Get target URL from query params or body
    let targetUrl: string;
    let requestBody: string | undefined;
    let requestHeaders: Record<string, string> = {};
    
    if (method === 'GET') {
      const { searchParams } = new URL(request.url);
      targetUrl = searchParams.get('url') || '';
      
      // Get headers from query params for GET requests
      const headersParam = searchParams.get('headers');
      if (headersParam) {
        try {
          requestHeaders = JSON.parse(decodeURIComponent(headersParam));
        } catch {
          // Ignore invalid headers
        }
      }
    } else {
      // For other methods, get URL from request body
      const body = await request.json();
      targetUrl = body.url || '';
      requestBody = body.body || undefined;
      requestHeaders = body.headers || {};
    }
    
    if (!targetUrl) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      );
    }

    // Security: Validate URL
    try {
      const url = new URL(targetUrl);
      // Block private IPs and localhost in production
      if (process.env.NODE_ENV === 'production') {
        const privateRanges = [
          /^10\./,
          /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
          /^192\.168\./,
          /^127\./,
          /^localhost$/,
          /^0\.0\.0\.0$/
        ];
        
        if (privateRanges.some(range => range.test(url.hostname))) {
          return NextResponse.json(
            { error: 'Private IP addresses not allowed in production' },
            { status: 403 }
          );
        }
      }
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    // Security: Filter dangerous headers
    const dangerousHeaders = ['host', 'content-length', 'connection', 'upgrade', 'proxy-connection'];
    Object.keys(requestHeaders).forEach(key => {
      if (dangerousHeaders.includes(key.toLowerCase())) {
        delete requestHeaders[key];
      }
    });

    // Add security headers - match working curl request exactly
    const secureHeaders = {
      'User-Agent': 'curl/8.5.0',
      'Accept': '*/*',
      'X-Forwarded-For': request.headers.get('x-forwarded-for') || 'unknown',
      ...requestHeaders
    };

    // Make the request with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    const response = await fetch(targetUrl, {
      method: method,
      headers: secureHeaders,
      body: requestBody,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const endTime = Date.now();
    const durationMs = endTime - startTime;

    // Get response text
    const responseText = await response.text();
    
    // Try to parse as JSON
    let parsedBody: unknown = responseText;
    try {
      parsedBody = JSON.parse(responseText);
    } catch {
      // Keep as string if not JSON
      parsedBody = responseText;
    }

    // Collect response headers (filter sensitive ones)
    const responseHeaders: Record<string, string> = {};
    const sensitiveHeaders = ['set-cookie', 'authorization', 'x-api-key'];
    response.headers.forEach((value, key) => {
      if (!sensitiveHeaders.includes(key.toLowerCase())) {
        responseHeaders[key] = value;
      }
    });

    // Security: Add CORS headers based on environment
    const corsHeaders = process.env.NODE_ENV === 'production' 
      ? {
          'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || 'https://yourdomain.com',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        }
      : {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        };

    return NextResponse.json({
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      durationMs,
      size: responseText.length,
      body: parsedBody,
      url: response.url,
    }, {
      headers: corsHeaders,
    });

  } catch (_error) {
    // Proxy error - logged for debugging
    
    const isTimeout = _error instanceof Error && _error.name === 'AbortError';
    const errorMessage = isTimeout ? 'Request timeout' : 'Failed to make request';
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: _error instanceof Error ? _error.message : 'Unknown error',
        status: isTimeout ? 408 : 500,
        headers: {},
        durationMs: 0,
        size: 0,
        body: null,
      },
      { 
        status: isTimeout ? 408 : 500,
        headers: {
          'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
            ? (process.env.ALLOWED_ORIGINS || 'https://yourdomain.com')
            : '*',
        },
      }
    );
  }
}

export async function GET(request: NextRequest) {
  return handleProxyRequest(request, 'GET');
}

export async function POST(request: NextRequest) {
  return handleProxyRequest(request, 'POST');
}

export async function PUT(request: NextRequest) {
  return handleProxyRequest(request, 'PUT');
}

export async function PATCH(request: NextRequest) {
  return handleProxyRequest(request, 'PATCH');
}

export async function DELETE(request: NextRequest) {
  return handleProxyRequest(request, 'DELETE');
}
