import { NextRequest, NextResponse } from 'next/server';

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

export async function POST(request: NextRequest) {
  try {
    const { method, url, headers = {}, body } = await request.json();
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    const startTime = Date.now();
    
    // Make the request
    const response = await fetch(url, {
      method: method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Delta-API-Suite/1.0',
        ...headers,
      },
      body: body ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
    });

    const endTime = Date.now();
    const durationMs = endTime - startTime;

    // Get response text
    const responseText = await response.text();
    
    // Try to parse as JSON
    let parsedBody: any = responseText;
    try {
      parsedBody = JSON.parse(responseText);
    } catch {
      // Keep as string if not JSON
      parsedBody = responseText;
    }

    // Collect response headers
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    return NextResponse.json({
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      durationMs,
      size: responseText.length,
      body: parsedBody,
      url: response.url,
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      },
    });

  } catch (error) {
    console.error('Proxy error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to make request',
        details: error instanceof Error ? error.message : 'Unknown error',
        status: 500,
        headers: {},
        durationMs: 0,
        size: 0,
        body: null,
      },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}
