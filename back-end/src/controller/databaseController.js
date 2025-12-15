import db from '../models';

const listTables = async (req, res) => {
  try {
    const tables = Object.keys(db)
      .filter((k) => !['sequelize', 'Sequelize'].includes(k))
      .sort();

    return res.status(200).json({ success: true, data: tables });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getTableData = async (req, res) => {
  try {
    const rawTable = req.params.table;
    let page = parseInt(req.query.page, 10);
    let limit = parseInt(req.query.limit, 10);
    if (!page || page <= 0) page = 1;
    if (!limit || limit <= 0) limit = 10;

    // Map case-insensitively to a model name
    const modelName = Object.keys(db).find(
      (k) => !['sequelize', 'Sequelize'].includes(k) && k.toLowerCase() === String(rawTable).toLowerCase()
    );

    if (!modelName) {
      return res.status(404).json({ success: false, message: 'Table not found' });
    }

    const Model = db[modelName];
    const offset = (page - 1) * limit;

    // Prefer ordering by id if exists, else createdAt, else first attribute
    const attrs = Object.keys(Model.rawAttributes || {});
    let orderField = 'id';
    if (!attrs.includes('id')) {
      if (attrs.includes('createdAt')) orderField = 'createdAt';
      else if (attrs.length > 0) orderField = attrs[0];
    }

    const primaryKey = Model.primaryKeyAttributes?.[0] || 'id';

    const { rows, count } = await Model.findAndCountAll({
      offset,
      limit,
      order: [[orderField, 'ASC']],
      raw: true,
    });

    // Columns from model attributes (stable even when no rows)
    let columns = attrs.slice();
    // Hide sensitive columns
    columns = columns.filter((c) => c.toLowerCase() !== 'password');

    // Sanitize data to hide sensitive fields
    const safeRows = rows.map((r) => {
      const copy = { ...r };
      Object.keys(copy).forEach((k) => {
        if (k.toLowerCase() === 'password') delete copy[k];
      });
      return copy;
    });

    return res.status(200).json({
      success: true,
      data: safeRows,
      meta: { page, limit, total: count, totalPages: Math.ceil(count / limit), table: modelName, columns, primaryKey },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getModelByParam = (rawTable) => {
  const modelName = Object.keys(db).find(
    (k) => !['sequelize', 'Sequelize'].includes(k) && k.toLowerCase() === String(rawTable).toLowerCase()
  );
  if (!modelName) return null;
  return { Model: db[modelName], modelName };
};

const sanitizePayload = (payload) => {
  if (!payload || typeof payload !== 'object') return {};
  const copy = { ...payload };
  // Remove sensitive and system fields
  ['password', 'createdAt', 'updatedAt', 'deletedAt'].forEach((f) => {
    Object.keys(copy).forEach((k) => {
      if (k.toLowerCase() === f.toLowerCase()) delete copy[k];
    });
  });
  return copy;
};

const createRow = async (req, res) => {
  try {
    const ctx = getModelByParam(req.params.table);
    if (!ctx) return res.status(404).json({ success: false, message: 'Table not found' });
    const { Model, modelName } = ctx;

    const attrs = Object.keys(Model.rawAttributes || {});
    const primaryKey = Model.primaryKeyAttributes?.[0] || 'id';

    const payload = sanitizePayload(req.body);
    // file upload (avatar)
    if (req.file && req.file.filename) {
      payload.avatar = `/uploads/${req.file.filename}`;
    }
    // Avoid setting PK explicitly unless provided intentionally
    if (primaryKey in payload && Model.rawAttributes[primaryKey]?.autoIncrement) {
      delete payload[primaryKey];
    }

    const created = await Model.create(payload);
    return res.status(201).json({ success: true, data: created, meta: { table: modelName, primaryKey } });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updateRow = async (req, res) => {
  try {
    const ctx = getModelByParam(req.params.table);
    if (!ctx) return res.status(404).json({ success: false, message: 'Table not found' });
    const { Model, modelName } = ctx;

    const primaryKey = Model.primaryKeyAttributes?.[0] || 'id';
    const id = req.params.id;
    const payload = sanitizePayload(req.body);
    // file upload (avatar)
    if (req.file && req.file.filename) {
      payload.avatar = `/uploads/${req.file.filename}`;
    }
    delete payload[primaryKey];

    const [affected] = await Model.update(payload, { where: { [primaryKey]: id } });
    if (!affected) return res.status(404).json({ success: false, message: 'Row not found' });

    const updated = await Model.findOne({ where: { [primaryKey]: id }, raw: true });
    if (updated && 'password' in updated) delete updated.password;
    return res.status(200).json({ success: true, data: updated, meta: { table: modelName, primaryKey } });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const deleteRow = async (req, res) => {
  try {
    const ctx = getModelByParam(req.params.table);
    if (!ctx) return res.status(404).json({ success: false, message: 'Table not found' });
    const { Model } = ctx;
    const primaryKey = Model.primaryKeyAttributes?.[0] || 'id';
    const id = req.params.id;

    const affected = await Model.destroy({ where: { [primaryKey]: id } });
    if (!affected) return res.status(404).json({ success: false, message: 'Row not found' });

    return res.status(200).json({ success: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export default { listTables, getTableData, createRow, updateRow, deleteRow };
