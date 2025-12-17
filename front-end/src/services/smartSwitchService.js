import axios from 'axios';
const API_BASE = 'http://localhost:8080/api/v1';
const STORAGE_KEY = 'smartSwitch_mock_states';

const readStore = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
};

const writeStore = (obj) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(obj)); } catch { }
};

// Lấy trạng thái entity (ON/OFF)
export async function getEntityState(entityId) {
  if (!entityId) throw new Error('Missing entityId');
  try {
    const r = await axios.get(`${API_BASE}/ha/state`, { params: { entityId } });
    const state = r?.data?.state ?? r?.data?.raw?.state ?? 'off';
    const store = readStore();
    store[entityId] = state;
    writeStore(store);
    return { entityId, state };
  } catch (e) {
    throw e;
  }
}

// Bật/tắt công tắc
export async function setSwitchState(entityId, turnOn) {
  try {
    const service = turnOn ? 'turn_on' : 'turn_off';
    await axios.post(`${API_BASE}/ha/service`, { domain: 'switch', service, entity_id: entityId });
    const store = readStore();
    store[entityId] = turnOn ? 'on' : 'off';
    writeStore(store);
    return { ok: true };
  } catch (e) {
    return { ok: false };
  }
}

// Lấy giá trị cảm biến (nhiệt độ/độ ẩm)
export async function getSensors(temperatureEntityId, humidityEntityId) {
  if (!temperatureEntityId || !humidityEntityId) throw new Error('Missing temperatureId/humidityId');
  const r = await axios.get(`${API_BASE}/ha/sensors`, { params: { temperatureId: temperatureEntityId, humidityId: humidityEntityId } });
  const d = r?.data?.data || {};
  return { temperature: d.temperature ?? null, humidity: d.humidity ?? null, atTime: d.atTime || new Date().toISOString() };
}

// Helper lưu cài đặt UI
const SETTINGS_KEY = 'smartSwitch_settings';
export function loadSettings() {
  try { return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}'); } catch { return {}; }
}
export function saveSettings(settings) {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings || {})); } catch { }
}
