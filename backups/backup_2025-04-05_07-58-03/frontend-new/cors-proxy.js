// Use ES modules compatible approach
import { createServer } from 'cors-anywhere';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const host = 'localhost';
const port = 8080;

createServer({
  originWhitelist: [], // Allow all origins
  requireHeaders: [], // Do not require any headers
  removeHeaders: ['cookie', 'cookie2'], // Remove cookies for security
}).listen(port, host, function() {
  console.log('CORS Anywhere proxy server running on ' + host + ':' + port);
}); 