import axios from 'axios';

const HA_HOST = process.env.HA_HOST || 'http://localhost:8123';
const HA_TOKEN = process.env.HA_TOKEN || '';

const headers = () => ({ Authorization: `Bearer ${HA_TOKEN}` });

const getState = async (req, res) => {
  try {
    const entityId = String(req.query.entityId || '').trim();
    if (!entityId) return res.status(400).json({ success: false, message: 'Missing entityId' });
    const r = await axios.get(`${HA_HOST}/api/states/${encodeURIComponent(entityId)}`, { headers: headers() });
    const state = r?.data?.state ?? null;
    return res.status(200).json({ success: true, entityId, state, raw: r.data });
  } catch (e) {
    console.error('ha.getState error', e?.response?.data || e.message);
    return res.status(500).json({ success: false, message: 'HA get state failed' });
  }
};

const callService = async (req, res) => {
  try {
    const { domain, service, entity_id } = req.body || {};
    if (!domain || !service || !entity_id) {
      return res.status(400).json({ success: false, message: 'Missing domain/service/entity_id' });
    }
    const r = await axios.post(
      `${HA_HOST}/api/services/${encodeURIComponent(domain)}/${encodeURIComponent(service)}`,
      { entity_id },
      { headers: { ...headers(), 'Content-Type': 'application/json' } }
    );
    return res.status(200).json({ success: true, data: r.data });
  } catch (e) {
    console.error('ha.callService error', e?.response?.data || e.message);
    return res.status(500).json({ success: false, message: 'HA call service failed' });
  }
};

const getSensors = async (req, res) => {
  try {
    const temperatureId = String(req.query.temperatureId || '').trim();
    const humidityId = String(req.query.humidityId || '').trim();
    if (!temperatureId || !humidityId) return res.status(400).json({ success: false, message: 'Missing temperatureId/humidityId' });

    const [tRes, hRes] = await Promise.all([
      axios.get(`${HA_HOST}/api/states/${encodeURIComponent(temperatureId)}`, { headers: headers() }),
      axios.get(`${HA_HOST}/api/states/${encodeURIComponent(humidityId)}`, { headers: headers() }),
    ]);
    const temperature = parseFloat(tRes?.data?.state);
    const humidity = parseFloat(hRes?.data?.state);
    const atTime = new Date().toISOString();

    return res.status(200).json({ success: true, data: { temperature: Number.isFinite(temperature) ? temperature : null, humidity: Number.isFinite(humidity) ? humidity : null, atTime } });
  } catch (e) {
    console.error('ha.getSensors error', e?.response?.data || e.message);
    return res.status(500).json({ success: false, message: 'HA sensors read failed' });
  }
};

const getConfig = async (req, res) => {
  try {
    // Hỗ trợ tên biến cũ để tránh lỗi cấu hình
    const SWITCH_CH1 = process.env.SWITCH_CH1 || process.env.REACT_APP_SWITCH_CH1 || null;
    const SWITCH_CH2 = process.env.SWITCH_CH2 || process.env.REACT_APP_SWITCH_CH2 || null;
    const SWITCH_CH3 = process.env.SWITCH_CH3 || process.env.REACT_APP_SWITCH_CH3 || null;

    const TEMP_ENTITY = process.env.TEMP_ENTITY || process.env.HA_TEMPERATURE_ENTITY_ID || null;
    const HUMI_ENTITY = process.env.HUMI_ENTITY || process.env.HA_HUMIDITY_ENTITY_ID || null;

    const sensorWsFromPort = process.env.SENSOR_WS_PORT ? `ws://localhost:${process.env.SENSOR_WS_PORT}` : null;
    const SENSOR_WS = process.env.SENSOR_WS || sensorWsFromPort || null;

    return res.status(200).json({
      success: true,
      data: {
        SWITCH_CH1,
        SWITCH_CH2,
        SWITCH_CH3,
        TEMP_ENTITY,
        HUMI_ENTITY,
        SENSOR_WS,
      }
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'HA get config failed' });
  }
};

export default { getState, callService, getSensors, getConfig };
