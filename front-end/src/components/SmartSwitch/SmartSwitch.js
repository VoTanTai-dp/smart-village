import React, { useEffect, useRef, useState } from 'react';
import './SmartSwitch.scss';
import { toast } from 'react-toastify';
import { getEntityState, setSwitchState, getSensors, loadSettings, saveSettings } from '../../services/smartSwitchService';


// Entity IDs tích hợp HA (có thể chuyển sang cấu hình/DB sau)
const SWITCH_CH1 = process.env.REACT_APP_SWITCH_CH1 || 'switch.sonoff_10015bcd46_1'; // Đèn
const SWITCH_CH2 = process.env.REACT_APP_SWITCH_CH2 || 'switch.sonoff_10015bcd46_2'; // Nguồn cảm biến (khóa ON)
const SWITCH_CH3 = process.env.REACT_APP_SWITCH_CH3 || 'switch.sonoff_10015bcd46_3'; // Máy bơm
const TEMP_ENTITY = process.env.REACT_APP_TEMP_ENTITY || 'sensor.sonoff_100170f83e_temperature';
const HUMI_ENTITY = process.env.REACT_APP_HUMI_ENTITY || 'sensor.sonoff_100170f83e_humidity';

// Helpers thời gian và so sánh khoảng
const parseTime = (t) => {
  if (!/^\d{1,2}:\d{2}$/.test(t || '')) return { h: 0, m: 0 };
  const [h, m] = t.split(':').map(Number);
  return { h: Math.max(0, Math.min(23, h || 0)), m: Math.max(0, Math.min(59, m || 0)) };
};
const inRange = (now, start, end) => {
  const toMin = ({ h, m }) => h * 60 + m;
  const n = toMin(now), s = toMin(start), e = toMin(end);
  if (s === e) return false;
  if (s < e) return n >= s && n < e;
  return n >= s || n < e; // qua ngày
};
const fmt = (v, unit) => (v == null ? 'N/A' : `${Number(v).toFixed(1)}${unit}`);

const SmartSwitch = () => {
  // Channel 1 – Light
  const [ch1On, setCh1On] = useState(false);
  const [ch1Mode, setCh1Mode] = useState('Manual'); // Manual | Auto Schedule
  const [ch1Start, setCh1Start] = useState('18:30');
  const [ch1End, setCh1End] = useState('06:00');

  // Channel 2 – Sensor (always ON)
  const [temperature, setTemperature] = useState(null);
  const [humidity, setHumidity] = useState(null);
  const [sensorAt, setSensorAt] = useState(null);

  // Channel 3 – Pump
  const [ch3On, setCh3On] = useState(false);
  const [ch3Mode, setCh3Mode] = useState('Manual'); // Manual | Auto Logic
  const [tempThreshold, setTempThreshold] = useState('30');
  const [humiThreshold, setHumiThreshold] = useState('40');

  // Logs
  const [logs, setLogs] = useState([]);
  const pushLog = (text) => setLogs((prev) => [{ t: new Date().toLocaleString(), text }, ...prev].slice(0, 30));

  // Refs
  const lastSensorRef = useRef({ temperature: null, humidity: null });
  const ch1TimerRef = useRef(null);
  const ch3TimerRef = useRef(null);

  // Load settings
  useEffect(() => {
    const s = loadSettings() || {};
    if (s.ch1Mode) setCh1Mode(s.ch1Mode);
    if (s.ch3Mode) setCh3Mode(s.ch3Mode);
    if (s.ch1Start) setCh1Start(s.ch1Start);
    if (s.ch1End) setCh1End(s.ch1End);
    if (s.tempThreshold != null) setTempThreshold(String(s.tempThreshold));
    if (s.humiThreshold != null) setHumiThreshold(String(s.humiThreshold));
  }, []);
  useEffect(() => {
    saveSettings({ ch1Mode, ch3Mode, ch1Start, ch1End, tempThreshold, humiThreshold });
  }, [ch1Mode, ch3Mode, ch1Start, ch1End, tempThreshold, humiThreshold]);

  // Init states từ HA
  useEffect(() => {
    const init = async () => {
      try {
        const [s1, , s3] = await Promise.all([
          getEntityState(SWITCH_CH1),
          getEntityState(SWITCH_CH2),
          getEntityState(SWITCH_CH3),
        ]);
        setCh1On((s1.state || 'off') === 'on');
        setCh3On((s3.state || 'off') === 'on');
      } catch { }
    };
    init();
  }, []);

  // WS sensor + fallback polling
  useEffect(() => {
    let active = true;
    let ws = null;

    const apply = (d) => {
      if (!active) return;
      const t = d?.temperature; const h = d?.humidity; const at = d?.atTime || new Date().toISOString();
      if (t != null) setTemperature(t);
      if (h != null) setHumidity(h);
      setSensorAt(at);
      lastSensorRef.current = { temperature: t ?? lastSensorRef.current.temperature, humidity: h ?? lastSensorRef.current.humidity };
    };

    try {
      ws = new WebSocket('ws://localhost:9998');
      ws.onmessage = (evt) => {
        try {
          const msg = JSON.parse(evt.data);
          if (msg?.type === 'sensor') apply({ temperature: msg.temperature, humidity: msg.humidity, atTime: msg.atTime });
        } catch { }
      };
    } catch { }

    const poll = async () => { try { apply(await getSensors(TEMP_ENTITY, HUMI_ENTITY)); } catch { } };
    poll();
    const id = setInterval(poll, 10000);
    return () => { active = false; clearInterval(id); try { ws && ws.close(); } catch { } };
  }, []);

  // Auto schedule – Channel 1
  useEffect(() => {
    if (ch1TimerRef.current) { clearInterval(ch1TimerRef.current); ch1TimerRef.current = null; }
    if (ch1Mode !== 'Auto Schedule') return;

    const tick = async () => {
      const now = new Date();
      const shouldOn = inRange({ h: now.getHours(), m: now.getMinutes() }, parseTime(ch1Start), parseTime(ch1End));
      try {
        await setSwitchState(SWITCH_CH1, shouldOn);
        setCh1On(shouldOn);
        pushLog(`Auto CH1: ${shouldOn ? 'BẬT' : 'TẮT'} theo lịch ${ch1Start}→${ch1End}`);
      } catch { }
    };
    tick();
    ch1TimerRef.current = setInterval(tick, 15000);
    return () => { if (ch1TimerRef.current) clearInterval(ch1TimerRef.current); };
  }, [ch1Mode, ch1Start, ch1End]);

  // Auto logic – Channel 3
  useEffect(() => {
    if (ch3TimerRef.current) { clearInterval(ch3TimerRef.current); ch3TimerRef.current = null; }
    if (ch3Mode !== 'Auto Logic') return;

    const tThresh = Number(tempThreshold), hThresh = Number(humiThreshold);
    if (!Number.isFinite(tThresh) || !Number.isFinite(hThresh)) return;

    const tick = async () => {
      const { temperature: t, humidity: h } = lastSensorRef.current;
      if (t == null || h == null) return;
      // Quy tắc mới theo yêu cầu:
      // - Bật khi (t < tThresh) AND (h > hThresh)
      // - Tắt khi (t > tThresh) AND (h < hThresh)
      // - Trường hợp còn lại: giữ nguyên trạng thái hiện tại
      let nextState = ch3On;
      if (t < tThresh && h > hThresh) nextState = true;
      else if (t > tThresh && h < hThresh) nextState = false;
      else return; // không thay đổi, tránh gửi lệnh thừa
      try {
        await setSwitchState(SWITCH_CH3, nextState);
        setCh3On(nextState);
        pushLog(`Auto CH3: ${nextState ? 'BẬT' : 'TẮT'} (t=${t}°C vs th=${tThresh}°C; h=${h}% vs th=${hThresh}%)`);
      } catch { }
    };
    tick();
    ch3TimerRef.current = setInterval(tick, 10000);
    return () => { if (ch3TimerRef.current) clearInterval(ch3TimerRef.current); };
  }, [ch3Mode, tempThreshold, humiThreshold]);

  // Manual handlers
  const toggleCh1 = async () => {
    try {
      const next = !ch1On;
      await setSwitchState(SWITCH_CH1, next);
      setCh1On(next);
    } catch { toast.error('Không thể điều khiển Kênh 1'); }
  };
  const toggleCh3 = async () => {
    try {
      const next = !ch3On;
      await setSwitchState(SWITCH_CH3, next);
      setCh3On(next);
    } catch { toast.error('Không thể điều khiển Kênh 3'); }
  };

  // --- Card Renderers (giữ đúng layout/SCSS theo mẫu) ---
  const renderLightCard = () => (
    <div className="switch-card">
      <div className="card-header-switch d-flex justify-content-between align-items-start">
        <div className="d-flex gap-3">
          <div className="icon-wrapper"><i className="bi bi-lightbulb" /></div>
          <div>
            <h3 className="text-white font-weight-bold h5 mb-0">Perimeter Light</h3>
            <p className="text-secondary small mt-1">Channel 1</p>
          </div>
        </div>
        <span className={`status-tag ${ch1On ? 'on' : 'off'}`}>{ch1On ? 'ON' : 'OFF'}</span>
      </div>
      <div className="card-body-switch d-flex flex-column gap-4 flex-grow-1">
        <div className="mode-selector">
          <button className={ch1Mode === 'Manual' ? 'active' : ''} onClick={() => setCh1Mode('Manual')}>Manual</button>
          <button className={ch1Mode === 'Auto Schedule' ? 'active' : ''} onClick={() => setCh1Mode('Auto Schedule')}>Auto Schedule</button>
        </div>
        <div className={`manual-control-box ${ch1Mode !== 'Manual' ? 'disabled' : ''}`}>
          <span className="text-sm font-medium text-white">Manual Override</span>
          <label className="custom-toggle">
            <input type="checkbox" checked={ch1On} onChange={toggleCh1} />
            <span className="slider"></span>
          </label>
        </div>
        {ch1Mode === 'Auto Schedule' && (
          <div className="schedule-config">
            <div className="section-header">
              <i className="bi bi-calendar-event"></i>
              <span>Active Schedule</span>
            </div>
            <div className="row g-3">
              <div className="col-6">
                <label className="text-secondary small d-block mb-1">Start Time</label>
                <input type="time" className="form-control" value={ch1Start} onChange={(e) => setCh1Start(e.target.value)} />
              </div>
              <div className="col-6">
                <label className="text-secondary small d-block mb-1">End Time</label>
                <input type="time" className="form-control" value={ch1End} onChange={(e) => setCh1End(e.target.value)} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderSensorCard = () => (
    <div className="switch-card sensor-card">
      <div className="ambient-glow"></div>
      <div className="card-header-switch d-flex justify-content-between align-items-start position-relative z-1">
        <div className="d-flex gap-3">
          <div className="icon-wrapper"><i className="bi bi-broadcast"></i></div>
          <div>
            <h3 className="text-white font-weight-bold h5 mb-0">Sensor Array</h3>
            <p className="text-secondary small mt-1">Channel 2 • AM2301</p>
          </div>
        </div>
        <div className="status-tag always-on d-flex align-items-center gap-1">
          <i className="bi bi-lock"></i>
          <span>Always ON</span>
        </div>
      </div>
      <div className="card-body-switch d-flex flex-column gap-4 flex-grow-1 position-relative z-1">
        <div className="d-flex flex-column gap-3">
          <div className="reading-box">
            <div className="icon-overlay"><i className="bi bi-thermometer-half"></i></div>
            <p className="label">Temperature</p>
            <div className="value"><span className="main">{fmt(temperature, '°C')}</span></div>
            <div className="status-line"><i className="bi bi-activity text-success"></i>Real-time</div>
          </div>
          <div className="reading-box">
            <div className="icon-overlay"><i className="bi bi-droplet-half"></i></div>
            <p className="label">Humidity</p>
            <div className="value"><span className="main">{fmt(humidity, '%')}</span></div>
            <div className="status-line"><i className="bi bi-droplet text-info"></i>Real-time</div>
          </div>
        </div>
        <div className="mt-auto pt-2">
          <p className="small text-secondary text-center opacity-75">* Provides power to temperature & humidity sensors for automation logic.</p>
          <p className="small text-secondary text-center opacity-75">Updated: {sensorAt ? new Date(sensorAt).toLocaleString() : 'N/A'}</p>
        </div>
      </div>
    </div>
  );

  const renderPumpCard = () => (
    <div className="switch-card">
      <div className="card-header-switch d-flex justify-content-between align-items-start">
        <div className="d-flex gap-3">
          <div className="icon-wrapper"><i className="bi bi-water"></i></div>
          <div>
            <h3 className="text-white font-weight-bold h5 mb-0">Irrigation Pump</h3>
            <p className="text-secondary small mt-1">Channel 3</p>
          </div>
        </div>
        <span className={`status-tag ${ch3On ? 'on' : 'off'}`}>{ch3On ? 'ON' : 'OFF'}</span>
      </div>
      <div className="card-body-switch d-flex flex-column gap-4 flex-grow-1">
        <div className="mode-selector">
          <button className={ch3Mode === 'Manual' ? 'active' : ''} onClick={() => setCh3Mode('Manual')}>Manual</button>
          <button className={ch3Mode === 'Auto Logic' ? 'active' : ''} onClick={() => setCh3Mode('Auto Logic')}>Auto Logic</button>
        </div>
        <div className={`manual-control-box ${ch3Mode !== 'Manual' ? 'disabled' : ''}`}>
          <span className="text-sm font-medium text-white">Manual Override</span>
          <label className="custom-toggle">
            <input type="checkbox" checked={ch3On} onChange={toggleCh3} />
            <span className="slider"></span>
          </label>
        </div>
        {ch3Mode === 'Auto Logic' && (
          <div className="logic-config">
            <div className="section-header">
              <i className="bi bi-sliders"></i>
              <span>Automation Logic</span>
            </div>
            <div className="logic-info-box mb-3">
              <div className="d-flex align-items-start gap-2 mb-3">
                <i className="bi bi-info-circle text-primary small mt-1"></i>
                <p className="logic-text">Pump bật nếu <span>Temp &lt; Threshold</span> hoặc <span>Humidity &lt; Threshold</span>.</p>
              </div>
              <div className="row g-3">
                <div className="col-6">
                  <label className="text-secondary small font-weight-bold d-block mb-1">Temp Threshold</label>
                  <div className="input-with-suffix">
                    <input type="number" className="form-control" value={tempThreshold} onChange={(e) => setTempThreshold(e.target.value)} />
                    <span className="suffix">°C</span>
                  </div>
                </div>
                <div className="col-6">
                  <label className="text-secondary small font-weight-bold d-block mb-1">Hum Threshold</label>
                  <div className="input-with-suffix">
                    <input type="number" className="form-control" value={humiThreshold} onChange={(e) => setHumiThreshold(e.target.value)} />
                    <span className="suffix">%</span>
                  </div>
                </div>
              </div>
            </div>
            <button className="btn-update" onClick={() => toast.success('Đã cập nhật ngưỡng tự động')}>
              <i className="bi bi-save me-1"></i>
              Update Logic
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="smart-switch-container">
      <div className="container max-w-7xl">
        {/* Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
          <div className="d-flex flex-column gap-2">
            <h1 className="page-title">SmartSwitch Control</h1>
            <p className="page-subtitle">Manage Sonoff 4-Gang Switch Channels & Environmental Sensors. Monitor real-time data and configure automation logic for rural infrastructure.</p>
          </div>
          <div className="status-badge"><div className="status-dot"></div><span>System Online</span></div>
        </div>

        {/* Grid */}
        <div className="row g-4 mb-4">
          <div className="col-12 col-md-6 col-lg-4">{renderLightCard()}</div>
          <div className="col-12 col-md-6 col-lg-4">{renderSensorCard()}</div>
          <div className="col-12 col-lg-4">{renderPumpCard()}</div>
        </div>

        {/* Logs */}
        <div className="card switch-card">
          <div className="card-body-switch">
            <div className="section-header"><i className="bi bi-clipboard-data"></i><span>Automation Logs</span></div>
            {logs.length === 0 ? (
              <div className="text-secondary small">Chưa có hành động tự động nào.</div>
            ) : (
              <ul className="mb-0" style={{ maxHeight: 220, overflowY: 'auto' }}>
                {logs.map((l, i) => (
                  <li key={i} className="small text-white-50">[{l.t}] {l.text}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartSwitch;
