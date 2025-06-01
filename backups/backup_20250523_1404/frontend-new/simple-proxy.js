import http from 'http';
import httpProxy from 'http-proxy';

// Create a proxy server with custom settings
const proxy = httpProxy.createProxyServer({
  changeOrigin: true,
  ws: true,
  xfwd: true
});

// Add CORS headers
proxy.on('proxyRes', function(proxyRes, req, res) {
  proxyRes.headers['Access-Control-Allow-Origin'] = '*';
  proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, PUT, PATCH, POST, DELETE';
  proxyRes.headers['Access-Control-Allow-Headers'] = 'Authorization, Content-Type, apikey';
});

// Handle errors
proxy.on('error', function(err, req, res) {
  console.error('Proxy error:', err);
  res.writeHead(500, {
    'Content-Type': 'text/plain'
  });
  res.end('Proxy error: ' + err.message);
});

// Create a custom server
const server = http.createServer(function(req, res) {
  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, PATCH, POST, DELETE',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type, apikey',
      'Access-Control-Max-Age': '86400'
    });
    res.end();
    return;
  }

  // Extract the target URL from the path
  const reqUrl = req.url.slice(1); // Remove the leading '/'
  if (!reqUrl) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Target URL is required (e.g., /https://api.example.com)');
    return;
  }

  // Proxy the request
  console.log(`Proxying request to: ${reqUrl}`);
  proxy.web(req, res, { target: reqUrl });
});

// Start the server
const port = 8080;
server.listen(port, 'localhost', function() {
  console.log(`Proxy server running at http://localhost:${port}/`);
}); 