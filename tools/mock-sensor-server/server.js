const http = require('http');

const PORT = parseInt(process.env.PORT || '8080', 10);
const startTime = Date.now();

let state = {
  device_id: 'roomi-mock-node',
  temperature: 24.5,
  humidity: 55.0,
  light_raw: null,
  sound_raw: null,
  sensor_status: 'online'
};

function getUptimeSeconds() {
  return Math.floor((Date.now() - startTime) / 1000);
}

const server = http.createServer((req, res) => {
  // CORS support
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  if (pathname === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('ok');
    return;
  }

  if (pathname === '/data' && req.method === 'GET') {
    const isError = state.sensor_status === 'error';
    const payload = {
      device_id: state.device_id,
      temperature: isError ? null : state.temperature,
      humidity: isError ? null : state.humidity,
      light_raw: isError ? null : state.light_raw,
      sound_raw: isError ? null : state.sound_raw,
      sensor_status: state.sensor_status,
      uptime_s: getUptimeSeconds()
    };
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(payload));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

if (require.main === module) {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[ROOMI Mock Server] Listening on http://0.0.0.0:${PORT}`);
  });
}

module.exports = { server, state };
