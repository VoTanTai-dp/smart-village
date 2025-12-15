import React, { useEffect, useState } from 'react';
import { NavLink, useParams, useHistory } from 'react-router-dom';
import './Database.scss';
import { getTables, getTablePage } from '../../services/databaseService';
import { toast } from 'react-toastify';

const PAGE_SIZE = 10;

// Map tên cột sang nhãn hiển thị thân thiện (tiếng Việt)
const FIELD_LABELS = {
  id: 'Mã số',
  email: 'Email',
  username: 'Tên đăng nhập',
  name: 'Họ và tên',
  firstName: 'Tên',
  lastName: 'Họ',
  phone: 'Số điện thoại',
  address: 'Địa chỉ',
  avatar: 'Ảnh đại diện',
  password: 'Mật khẩu',
  role: 'Vai trò',
  camera: 'Camera',
  model: 'Model',
  createdAt: 'Ngày tạo',
  updatedAt: 'Ngày cập nhật',
};

const labelize = (field) => {
  if (!field) return '';
  const key = String(field).trim();
  if (FIELD_LABELS[key]) return FIELD_LABELS[key];
  // Chuyển snake_case, camelCase thành dạng có khoảng trắng, viết hoa chữ cái đầu
  const spaced = key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};

const Database = () => {
  const { table: routeTable } = useParams();
  const history = useHistory();
  const [tables, setTables] = useState([]);
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0, primaryKey: 'id' });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [error, setError] = useState('');
  // Sử dụng react-toastify giống Login/Register/ChangePassword
  // Ensure <ToastContainer /> được render ở App.js một lần


  const showToast = (message, type = 'success') => {
    if (type === 'success') toast.success(message);
    else if (type === 'warning') toast.warn(message);
    else toast.error(message);
  };

  useEffect(() => {
    const loadTables = async () => {
      try {
        const res = await getTables();
        const list = res?.data || [];
        setTables(list);
        if (!routeTable && list.length > 0) {
          history.replace(`/database/${list[0]}`);
        }
      } catch (e) {
        setError('Không tải được danh sách bảng.');
      }
    };
    loadTables();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPage = async (table, page, { showLoading = true } = {}) => {
    if (!table) return;
    if (showLoading) setLoading(true); else setRefreshing(true);
    setError('');
    try {
      const res = await getTablePage(table, page, PAGE_SIZE);
      setRows(Array.isArray(res?.data) ? res.data : []);
      const m = res?.meta || { page: page, totalPages: 1, total: 0 };
      setMeta({
        page: m.page || page,
        totalPages: Math.max(1, m.totalPages || 1),
        total: m.total ?? 0,
        primaryKey: m.primaryKey || 'id',
      });
      const cols = Array.isArray(m.columns) ? m.columns : (rows[0] ? Object.keys(rows[0]) : []);
      const filteredCols = cols.filter((c) => !['createdAt', 'updatedAt', 'deletedAt'].includes(c) && c.toLowerCase() !== 'password');
      setColumns(filteredCols);
    } catch (e) {
      console.error(e);
      setError('Không tải được dữ liệu.');
    } finally {
      if (showLoading) setLoading(false); else setRefreshing(false);
    }
  };

  useEffect(() => {
    setMeta({ page: 1, totalPages: 1, total: 0 });
    if (routeTable) {
      loadPage(routeTable, 1, { showLoading: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeTable]);

  // Auto refresh, pause while modals open
  useEffect(() => {
    if (!routeTable || showCreate || showEdit) return;
    const intervalMs = 3000;
    const intervalId = setInterval(() => {
      loadPage(routeTable, meta.page || 1, { showLoading: false });
    }, intervalMs);
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeTable, meta.page, showCreate, showEdit]);

  const handlePageClick = (p) => {
    if (p !== meta.page) {
      loadPage(routeTable, p);
    }
  };

  const handleDeleteRow = async (row) => {
    try {
      if (!routeTable) return;
      const idKey = meta.primaryKey || 'id';
      const id = row?.[idKey] ?? row?.id ?? row?.Id ?? row?.ID;
      if (id == null) return alert('Không xác định được khóa chính để xóa');
      if (!window.confirm('Bạn có chắc muốn xóa bản ghi này?')) return;
      const svc = await import('../../services/databaseService');
      await svc.deleteRow(routeTable, id);
      showToast('Xóa thành công', 'success');
      loadPage(routeTable, meta.page, { showLoading: true });
    } catch (e) {
      console.error(e);
      showToast('Xóa thất bại', 'danger');
    }
  };

  return (
    <div className="database-container container-fluid py-4">
      <div className="row">
        {/* Sidebar with table NavLinks */}
        <div className="col-12 col-md-3 col-lg-2 mb-3">
          <div className="tables-card p-3">
            <div className="fw-bold text-uppercase small text-muted mb-2">Tables</div>
            <div className="nav flex-column">
              {tables.map((t) => (
                <NavLink key={t} to={`/database/${t}`} className="table-link" activeClassName="active">
                  {t}
                </NavLink>
              ))}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="col-12 col-md-9 col-lg-10">
          <div className="content-card p-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0 text-primary">{routeTable || 'Database'}</h5>
              <div className="d-flex align-items-center gap-2">
                {refreshing && <span className="live-dot" title="Đang cập nhật"></span>}
                {meta?.total !== undefined && (
                  <span className="text-muted small">Total: {meta.total}</span>
                )}
              </div>
            </div>

            {error && <div className="alert alert-danger py-2">{error}</div>}

            <div className="table-responsive">
              <table className="table table-hover custom-table">
                <thead>
                  <tr>
                    {columns.map((c) => (
                      <th key={c} scope="col">{c}</th>
                    ))}
                    <th scope="col" className="text-end" style={{ width: '160px' }}>
                      Operation
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={columns.length}>
                        <div className="d-flex align-items-center gap-2">
                          <div className="spinner-border spinner-border-sm text-primary" role="status" />
                          <span>Đang tải...</span>
                        </div>
                      </td>
                    </tr>
                  ) : rows.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length} className="text-muted">No data</td>
                      <td className="text-end">
                        <div className="action-buttons d-flex justify-content-end align-items-center gap-2">
                          <button className="btn btn-sm btn-outline-success" disabled={!routeTable} onClick={() => { setEditingRow(null); setShowCreate(true); }} title="Add">
                            <i className="bi bi-plus-lg"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    rows.map((row, idx) => (
                      <tr key={idx}>
                        {columns.map((c) => (
                          <td key={c}>
                            {(() => {
                              const val = row[c];
                              if (String(c).toLowerCase() === 'avatar' && val) {
                                const url = typeof val === 'string' && /^https?:\/\//i.test(val)
                                  ? val
                                  : `http://localhost:8080${String(val).startsWith('/') ? '' : '/'}${val || ''}`;
                                return <img src={url} alt="avatar" className="avatar-thumb" />
                              }
                              return String(val ?? '');
                            })()}
                          </td>
                        ))}
                        <td className="text-end">
                          <div className="action-buttons d-flex justify-content-end align-items-center gap-2">
                            <button className="btn btn-sm btn-outline-success" disabled={!routeTable} onClick={() => { setEditingRow(null); setShowCreate(true); }} title="Add">
                              <i className="bi bi-plus-lg"></i>
                            </button>
                            <button className="btn btn-sm btn-outline-primary" onClick={() => { setEditingRow(row); setShowEdit(true); }} title="Edit">
                              <i className="bi bi-pencil-square"></i>
                            </button>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteRow(row)} title="Delete">
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Numbered pagination */}
            <nav className="mt-3" aria-label="Table pagination">
              <ul className="pagination pagination-sm mb-0">
                {Array.from({ length: meta.totalPages || 1 }, (_, i) => i + 1).map((p) => (
                  <li key={p} className={`page-item ${p === meta.page ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => handlePageClick(p)}>{p}</button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </div>

      {/* Create Modal (React-controlled) */}
      {showCreate && (
        <div className="modal-backdrop-custom" onClick={() => setShowCreate(false)}>
          <div className="modal-card animate-in" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-custom d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <div className="badge-icon"><i className="bi bi-plus-lg"></i></div>
                <h5 className="page-title mb-0">Thêm bản ghi</h5>
              </div>
              <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={() => setShowCreate(false)}></button>
            </div>
            <div className="modal-body-custom">
              <FormEditor
                key={`create-${routeTable}`}
                table={routeTable}
                columns={columns}
                primaryKey={meta.primaryKey}
                onSaved={() => { setShowCreate(false); loadPage(routeTable, 1, { showLoading: true }); }}
                onClose={() => setShowCreate(false)}
                onNotify={showToast}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal (React-controlled) */}
      {showEdit && (
        <div className="modal-backdrop-custom" onClick={() => setShowEdit(false)}>
          <div className="modal-card animate-in" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-custom d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <div className="badge-icon"><i className="bi bi-pencil-square"></i></div>
                <h5 className="page-title mb-0">Sửa bản ghi</h5>
              </div>
              <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={() => setShowEdit(false)}></button>
            </div>
            <div className="modal-body-custom">
              <FormEditor
                key={`edit-${routeTable}`}
                table={routeTable}
                columns={columns}
                primaryKey={meta.primaryKey}
                row={editingRow}
                onSaved={() => { setShowEdit(false); loadPage(routeTable, meta.page, { showLoading: true }); }}
                onClose={() => setShowEdit(false)}
                onNotify={showToast}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

const FormEditor = ({ table, columns, primaryKey = 'id', row, onSaved, onClose, onNotify }) => {
  const [form, setForm] = useState(() => {
    const initial = {};
    (columns || []).forEach((c) => {
      initial[c] = row ? row[c] ?? '' : '';
    });
    return initial;
  });
  const [errors, setErrors] = useState({});

  // Cập nhật form khi mở modal Sửa hoặc đổi bảng
  useEffect(() => {
    const initial = {};
    (columns || []).forEach((c) => {
      initial[c] = row ? row[c] ?? '' : '';
    });
    setForm(initial);
    setErrors({});
  }, [row, columns]);

  const optionalFields = ['avatar', 'description', 'note', 'address', 'createdAt', 'updatedAt'];
  const isEmailField = (name) => /email/i.test(name);
  const isNumberField = (name) => /(id|count|number|age|price|quantity|total|phone)/i.test(name) && name.toLowerCase() !== (primaryKey || 'id').toLowerCase();

  const validateField = (name, value) => {
    let err = '';
    const val = (value ?? '').toString().trim();
    const required = !optionalFields.includes(name);
    if (required && val.length === 0) err = 'Bắt buộc';
    if (!err && isEmailField(name)) {
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (val && !emailRe.test(val)) err = 'Email không hợp lệ';
    }
    if (!err && isNumberField(name)) {
      if (val && isNaN(Number(val))) err = 'Phải là số';
    }
    return err;
  };

  const handleChange = (c, v) => {
    setForm((prev) => ({ ...prev, [c]: v }));
    setErrors((prev) => ({ ...prev, [c]: '' }));
  };

  const handleSubmit = async () => {
    try {
      if (!table) return;
      // Validate tất cả field (trừ primaryKey)
      const newErrors = {};
      (columns || []).forEach((c) => {
        if (c.toLowerCase() === (primaryKey || 'id').toLowerCase()) return;
        const e = validateField(c, form[c]);
        if (e) newErrors[c] = e;
      });
      setErrors(newErrors);
      if (Object.keys(newErrors).length > 0) {
        const firstErrField = Object.keys(newErrors)[0];
        const friendly = labelize(firstErrField);
        onNotify && onNotify(`${friendly}: ${newErrors[firstErrField]}`, 'danger');
        return;
      }

      // chuẩn hóa payload và upload avatar nếu có
      const makeFormDataIfNeeded = async (payload) => {
        if (payload.__file_avatar) {
          const fd = new FormData();
          Object.keys(payload).forEach((k) => {
            if (k === '__file_avatar') return;
            fd.append(k, payload[k] ?? '');
          });
          fd.append('avatar', payload.__file_avatar);
          return fd;
        }
        return payload;
      };

      if (row) {
        // update
        const id = row?.[primaryKey] ?? row?.id ?? row?.Id ?? row?.ID ?? row?.[Object.keys(row)[0]];
        const payload = { ...form };
        delete payload[primaryKey];
        const body = await makeFormDataIfNeeded(payload);
        await import('../../services/databaseService').then(({ updateRow }) => updateRow(table, id, body));
      } else {
        // create
        const payload = { ...form };
        delete payload[primaryKey];
        const body = await makeFormDataIfNeeded(payload);
        await import('../../services/databaseService').then(({ createRow }) => createRow(table, body));
      }
      onSaved && onSaved();
      onClose && onClose();
      onNotify && onNotify('Lưu thành công', 'success');
    } catch (e) {
      console.error(e);
      onNotify && onNotify('Lưu dữ liệu thất bại', 'danger');
    }
  };

  return (
    <div className="container-fluid">
      <div className="row g-3">
        {(columns || []).map((c) => {
          const isPK = c.toLowerCase() === (primaryKey || 'id').toLowerCase();
          if (isPK) {
            // Ẩn input id. Nếu đang sửa (row có id), hiển thị giá trị dưới dạng chỉ đọc.
            if (row && (row[primaryKey] !== undefined && row[primaryKey] !== null)) {
              return (
                <div key={c} className="col-12">
                  <label className="form-label text-capitalize">{labelize(c)}</label>
                  <div className="form-control-plaintext text-white-50 small">
                    {String(row[primaryKey])}
                  </div>
                </div>
              );
            }
            return null; // Tạo mới: không hiển thị ô id
          }
          return (
            <div key={c} className="col-12">
              <label className="form-label text-capitalize">{labelize(c)}</label>
              {/* Avatar: chọn file từ máy */}
              {c.toLowerCase() === 'avatar' ? (
                row ? (
                  // Modal Sửa: hiển thị tên file hiện tại, không render ảnh lớn
                  <div className="d-flex align-items-center gap-3">
                    <div className="form-control-plaintext text-white-50 small">
                      {(() => {
                        const val = form[c] ?? row[c] ?? '';
                        if (!val) return 'No file';
                        const parts = String(val).split(/[\\/]/);
                        return parts[parts.length - 1];
                      })()}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className={`form-control form-control-sm bg-dark text-white border-secondary ${errors[c] ? 'is-invalid' : ''}`}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        // Không preview ảnh lớn, chỉ lưu file và tên file sẽ cập nhật theo file mới
                        setForm((prev) => ({ ...prev, __file_avatar: file, [c]: file.name }));
                      }}
                    />
                  </div>
                ) : (
                  // Modal Thêm: cho phép preview nhỏ
                  <div className="d-flex align-items-center gap-3">
                    {form[c] ? (
                      <img src={/^https?:\/\//i.test(form[c]) ? form[c] : `http://localhost:8080${String(form[c]).startsWith('/') ? '' : '/'}${form[c]}`} alt="preview" className="avatar-thumb" />
                    ) : (
                      <div className="avatar-thumb" style={{ background: '#223' }} />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className={`form-control form-control-sm bg-dark text-white border-secondary ${errors[c] ? 'is-invalid' : ''}`}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        // hiển thị preview tạm bằng object URL
                        const url = URL.createObjectURL(file);
                        handleChange(c, url);
                        // lưu file thật vào form tạm bằng key đặc biệt
                        setForm((prev) => ({ ...prev, __file_avatar: file }));
                      }}
                    />
                  </div>
                )
              ) : (
                <input
                  className={`form-control form-control-sm bg-dark text-white border-secondary ${errors[c] ? 'is-invalid' : ''}`}
                  value={form[c] ?? ''}
                  onChange={(e) => handleChange(c, e.target.value)}
                  placeholder={c}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="d-flex justify-content-end gap-2 mt-3">
        <button className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" onClick={handleSubmit}>Save</button>
      </div>
    </div>
  );
};

export default Database;
