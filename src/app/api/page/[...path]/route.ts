import { NextResponse } from 'next/server'

const NEXT_RUNTIME_URL = process.env.NEXT_RUNTIME_URL || 'https://pagen-runtime.dustland.ai'

export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const fetchedParams = await params;
    // Get the full path from the catch-all segments
    const path = fetchedParams.path.length > 0 ? '/' + fetchedParams.path.join('/') : ''
    const targetUrl = `${NEXT_RUNTIME_URL}${path}${new URL(request.url).search}`

    console.log('Proxying request:', {
      originalUrl: request.url,
      path,
      targetUrl,
      segments: fetchedParams.path,
    })

    // Only forward essential headers
    const headers = new Headers({
      'Accept': request.headers.get('Accept') || '*/*',
      'Accept-Language': request.headers.get('Accept-Language') || 'en-US,en;q=0.5',
      'User-Agent': request.headers.get('user-agent') || '',
    })

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers,
    })
    
    if (!response.ok) {
      console.error('Runtime returned error:', {
        status: response.status,
        statusText: response.statusText,
        targetUrl,
      })
      throw new Error(`Runtime returned ${response.status}`)
    }

    // Forward the response with essential headers
    const responseHeaders = new Headers({
      'Access-Control-Allow-Origin': '*',
      'X-Content-Type-Options': 'nosniff',
    })
    
    // Copy content type and other important headers
    const contentType = response.headers.get('content-type')
    if (contentType) {
      responseHeaders.set('content-type', contentType)
    }

    // Get the response data
    let responseData = await response.text()
    
    // If this is an HTML response, rewrite relative paths to absolute proxy paths
    if (contentType?.includes('text/html')) {
      // Add script to intercept requests before any other scripts load
      const proxyScript = `
        <script>
          (function() {
            // Override __webpack_require__.p (webpack public path)
            Object.defineProperty(window, '__webpack_require__', {
              get: function() {
                return this._webpackRequire;
              },
              set: function(value) {
                // Override the public path when webpack is initialized
                if (value && value.p) {
                  value.p = value.p.replace('http://localhost:3002/', '/api/page/');
                }
                this._webpackRequire = value;
              }
            });

            // Patch fetch
            const originalFetch = window.fetch;
            window.fetch = function(url, options) {
              if (typeof url === 'string') {
                if (url.startsWith('/_next/')) {
                  url = '/api/page' + url;
                } else if (url.includes('localhost:3002')) {
                  url = url.replace('http://localhost:3002/', '/api/page/');
                }
              }
              return originalFetch.call(this, url, options);
            };

            // Patch XMLHttpRequest
            const originalOpen = XMLHttpRequest.prototype.open;
            XMLHttpRequest.prototype.open = function(method, url, ...args) {
              if (typeof url === 'string') {
                if (url.startsWith('/_next/')) {
                  url = '/api/page' + url;
                } else if (url.includes('localhost:3002')) {
                  url = url.replace('http://localhost:3002/', '/api/page/');
                }
              }
              return originalOpen.call(this, method, url, ...args);
            };

            console.log('Early request interceptors installed');
          })();
        </script>
      `;
      
      // Add the script as early as possible in the head
      // Rewrite initial URLs in HTML
      responseData = responseData.replace(
        /(href|src)="\/_next\//g,
        '$1="/api/page/_next/'
      );

      // Also handle any absolute URLs
      responseData = responseData.replace(
        /http:\/\/localhost:3002\//g,
        '/api/page/'
      );

      responseData = responseData.replace(
        '<head>',
        '<head>' + proxyScript
      );

    }
    
    return new NextResponse(responseData, {
      status: response.status,
      headers: responseHeaders,
    })
  } catch (error) {
    console.error('Runtime proxy error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to proxy runtime' },
      { status: 500 }
    )
  }
}
