const http = require('http');

// Parse CLI flags
const args = process.argv.slice(2);
function getArg(flag, defaultValue) {
  const index = args.indexOf(flag);
  if (index !== -1 && index + 1 < args.length) {
    return args[index + 1];
  }
  return defaultValue;
}

const hasFlag = (flag) => args.includes(flag);

const PORT = parseInt(process.env.PORT || getArg('--port', '8080'), 10);
const startTime = Date.now();

let state = {
  device_id: getArg('--device', 'roomi-mock-node'),
  temperature: parseFloat(getArg('--temp', '24.5')),
  humidity: parseFloat(getArg('--humidity', '55.0')),
  light_raw: hasFlag('--light') ? parseInt(getArg('--light', '500'), 10) : null,
  sound_raw: hasFlag('--sound') ? parseInt(getArg('--sound', '300'), 10) : null,
  sensor_status: hasFlag('--fail') ? 'error' : 'online',
  drift: hasFlag('--drift')
};

function getUptimeSeconds() {
  return Math.floor((Date.now() - startTime) / 1000);
}

// Gentle random drift every 3 seconds if enabled
setInterval(() => {
  if (state.drift && state.sensor_status === 'online') {
    const tempDelta = (Math.random() - 0.5) * 0.4;
    const humDelta = (Math.random() - 0.5) * 1.0;
    state.temperature = Math.round((state.temperature + tempDelta) * 10) / 10;
    state.humidity = Math.max(0, Math.min(100, Math.round((state.humidity + humDelta) * 10) / 10));
  }
}, 3000);

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1e6) {
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

function updateStateFromParams(params) {
  if (params.temp !== undefined) state.temperature = parseFloat(params.temp);
  if (params.temperature !== undefined) state.temperature = parseFloat(params.temperature);
  if (params.humidity !== undefined) state.humidity = parseFloat(params.humidity);
  if (params.hum !== undefined) state.humidity = parseFloat(params.hum);
  if (params.light_raw !== undefined) {
    state.light_raw = params.light_raw === null || params.light_raw === 'null' ? null : parseInt(params.light_raw, 10);
  }
  if (params.sound_raw !== undefined) {
    state.sound_raw = params.sound_raw === null || params.sound_raw === 'null' ? null : parseInt(params.sound_raw, 10);
  }
  if (params.status !== undefined) state.sensor_status = params.status;
  if (params.sensor_status !== undefined) state.sensor_status = params.sensor_status;
  if (params.drift !== undefined) state.drift = params.drift === 'true' || params.drift === true;
}

const server = http.createServer(async (req, res) => {
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

  if (pathname === '/control') {
    const queryParams = Object.fromEntries(parsedUrl.searchParams.entries());
    updateStateFromParams(queryParams);

    if (req.method === 'POST') {
      try {
        const body = await parseBody(req);
        updateStateFromParams(body);
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
        return;
      }
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      message: 'State updated',
      state: {
        ...state,
        uptime_s: getUptimeSeconds()
      }
    }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

if (require.main === module) {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[ROOMI Mock Server] Listening on http://0.0.0.0:${PORT}`);
    console.log(`Initial state: Temp=${state.temperature}°C, Hum=${state.humidity}%, Status=${state.sensor_status}`);
  });
}

module.exports = { server, state, updateStateFromParams };
