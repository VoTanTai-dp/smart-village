const countService = require('./countService');
const sensorService = require('./sensorService');

let activeCounters = new Map(); // sessionId -> { isRunning, stopFn, cameraId, counts }

/**
 * Broadcast count update via the existing sensor WebSocket server (port 9998)
 */
const broadcastCountUpdate = (payload) => {
  // Reuse sensorService's WS server; it will be initialized already by server.js
  try {
    // sensorService exposes init; we can send via its internal wss by adding a small send here
    // Since sensorService doesn't export a broadcast, we emulate by creating our own message
    // However to avoid duplicate servers, we will lazily create a lightweight broadcaster
    // by opening a loop over clients if sensorService has a hidden wss. As we cannot access it,
    // we open a temporary client broadcast via a singleton server reference kept here.
  } catch {}
};

// We can't access internal wss from sensorService; create our own reference to the same port
// To avoid port conflicts, we will not create another server. Instead, we will let sensorService handle WS server
// and use its broadcast by importing here. So we add a helper to send using sensorService's internal broadcaster.
// Implement a small internal broadcaster in sensorService (exported) and call it here.

/**
 * Start Dahua cross-line detection counting for a session/camera.
 * - sessionId: active session id
 * - camera: camera row with credentials decrypted accessible via cameraService.getCameraCredentials
 */
const startCounterJobForCamera = async ({ sessionId, camera }) => {
  if (!sessionId || !camera) return;
  if (activeCounters.has(sessionId)) return; // already running

  // Lazy import digest-fetch
  const DigestFetch = require('digest-fetch');

  const username = camera.username;
  const password = camera.password;
  const ip = camera.ip;
  if (!username || !password || !ip) return;

  let counts = { Human: 0, Vehicle: 0 };
  let shouldReconnect = true;
  let readerAbort = null;

  const client = new DigestFetch(username, password);
  const urlPath = `/cgi-bin/eventManager.cgi?action=attach&codes=[CrossLineDetection]`;

  const protocol = (process.env.COUNTER_CAMERA_PROTOCOL || 'http').toLowerCase();
  const ignoreTls = String(process.env.COUNTER_CAMERA_IGNORE_TLS || 'false').toLowerCase() === 'true';
  const baseUrl = camera.port ? `${protocol}://${ip}:${camera.port}` : `${protocol}://${ip}`;

  let fetchOptions = {};
  if (protocol === 'https' && ignoreTls) {
    try {
      const https = require('https');
      fetchOptions.agent = new https.Agent({ rejectUnauthorized: false });
      console.warn('[counterService] HTTPS enabled with rejectUnauthorized=false (self-signed allowed)');
    } catch (e) {
      console.error('[counterService] Failed to setup HTTPS agent:', e);
    }
  }

  console.log('[counterService] Starting counter for camera', camera.id, 'ip', ip, 'port', camera.port, 'protocol', protocol, 'ignoreTls', ignoreTls);

  const connectEventStream = () => {
    if (!shouldReconnect) return;

    client
      .fetch(`${baseUrl}${urlPath}`, fetchOptions)
      .then((res) => {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        readerAbort = () => {
          try { reader.cancel(); } catch {}
        };

        const pump = () => {
          reader
            .read()
            .then(async ({ done, value }) => {
              if (done) {
                if (shouldReconnect) setTimeout(connectEventStream, 3000);
                return;
              }
              try {
                const str = decoder.decode(value);
                const parts = str.split('--myboundary');
                for (const p of parts) {
                  if (
                    p.includes('Code=CrossLineDetection') &&
                    p.includes('data=') &&
                    p.includes('action=Start')
                  ) {
                    const match = p.match(/data=({[\s\S]*})/);
                    if (match) {
                      const JSON5 = require('json5');
                      const dataObj = JSON5.parse(match[1]);
                      if (dataObj.Object?.ObjectType === 'Human') counts.Human++;
                      if (dataObj.Object?.ObjectType === 'Vehicle') counts.Vehicle++;

                      const atTime = new Date().toISOString();

                      // Save DB
                      try {
                        await countService.createCount({
                          sessionId,
                          countPeople: counts.Human,
                          countVehicle: counts.Vehicle,
                        });
                        console.log('[counterService] Saved count to DB', counts);
                      } catch (e) {
                        console.error('[counterService] Save count error:', e);
                      }

                      // Broadcast via sensorService's WS server
                      try {
                        if (sensorService && sensorService.broadcastGeneric) {
                          sensorService.broadcastGeneric({
                            type: 'count',
                            cameraId: camera.id,
                            sessionId,
                            people: counts.Human,
                            vehicle: counts.Vehicle,
                            atTime,
                          });
                          console.log('[counterService] Broadcast count', counts);
                        }
                      } catch (e) {
                        console.error('[counterService] Broadcast count error:', e);
                      }
                    }
                  }
                }
              } catch (e) {
                console.error('[counterService] Parse event chunk error:', e);
              }
              pump();
            })
            .catch((err) => {
              console.error('[counterService] Read stream error:', err);
              if (shouldReconnect) setTimeout(connectEventStream, 3000);
            });
        };
        pump();
      })
      .catch((err) => {
        console.error('[counterService] Fetch event stream failed:', err);
        if (shouldReconnect) setTimeout(connectEventStream, 3000);
      });
  };

  shouldReconnect = true;

  // Broadcast initial zero to initialize UI
  try {
    console.log('[counterService] Broadcast init count 0/0 for camera', camera.id);
    sensorService?.broadcastGeneric?.({
      type: 'count',
      cameraId: camera.id,
      sessionId,
      people: counts.Human,
      vehicle: counts.Vehicle,
      atTime: new Date().toISOString(),
    });
  } catch (e) {
    console.error('[counterService] Broadcast init error:', e);
  }

  connectEventStream();

  // Periodic broadcast of current counts to ensure UI updates even without new events
  const intervalId = setInterval(() => {
    try {
      sensorService?.broadcastGeneric?.({
        type: 'count',
        cameraId: camera.id,
        sessionId,
        people: counts.Human,
        vehicle: counts.Vehicle,
        atTime: new Date().toISOString(),
      });
      // console.log('[counterService] Periodic broadcast', counts);
    } catch (e) {
      console.error('[counterService] Periodic broadcast error:', e);
    }
  }, 5000);

  const stopFn = () => {
    shouldReconnect = false;
    try { readerAbort && readerAbort(); } catch {}
    try { clearInterval(intervalId); } catch {}
  };

  activeCounters.set(sessionId, {
    isRunning: true,
    stopFn,
    cameraId: camera.id,
    counts,
    intervalId,
  });
};

const stopCounterJobBySessionId = (sessionId) => {
  const job = activeCounters.get(sessionId);
  if (!job) return;
  try { job.stopFn && job.stopFn(); } catch {}
  activeCounters.delete(sessionId);
};

const stopAllCounterJobs = () => {
  for (const [sessionId, job] of activeCounters.entries()) {
    try { job.stopFn && job.stopFn(); } catch {}
  }
  activeCounters.clear();
};

const listActiveCounterJobs = () => {
  const items = [];
  for (const [sessionId, job] of activeCounters.entries()) {
    items.push({ sessionId, cameraId: job.cameraId, counts: job.counts });
  }
  return items;
};

module.exports = {
  startCounterJobForCamera,
  stopCounterJobBySessionId,
  stopAllCounterJobs,
  listActiveCounterJobs,
};
