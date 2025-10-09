// Simple cURL parser without external dependencies
export async function POST(req: Request) {
  try {
    const { curlCommand } = await req.json();
    
    if (!curlCommand || typeof curlCommand !== 'string') {
      return Response.json({ error: 'Invalid cURL command' }, { status: 400 });
    }

    // Simple regex-based cURL parsing
    const methodMatch = curlCommand.match(/-X\s+(\w+)/i);
    const urlMatch = curlCommand.match(/curl\s+['"]?([^'"\s]+)['"]?/i);
    const headerMatches = curlCommand.match(/-H\s+['"]([^'"]+)['"]/gi);
    const dataMatch = curlCommand.match(/--data[^'"]*['"]([^'"]+)['"]/i) || 
                     curlCommand.match(/-d\s+['"]([^'"]+)['"]/i);

    const method = methodMatch?.[1]?.toUpperCase() || 'GET';
    const url = urlMatch?.[1] || '';
    
    const headers: Record<string, string> = {};
    if (headerMatches) {
      headerMatches.forEach(header => {
        const match = header.match(/-H\s+['"]([^'"]+)['"]/i);
        if (match?.[1]) {
          const [key, value] = match[1].split(':').map(s => s.trim());
          if (key && value) {
            headers[key] = value;
          }
        }
      });
    }

    const body = dataMatch?.[1];

    return Response.json({
      method,
      url,
      headers,
      body
    });
  } catch (_error) {
    return Response.json({ error: 'Failed to parse cURL command' }, { status: 500 });
  }
}
