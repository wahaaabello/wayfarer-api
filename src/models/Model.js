export default (table, fields) => class Model {
  static async create(values = {}) {
    const {
      rows: [record],
    } = await db.query(
      `INSERT INTO "${table}"(${fields.join(', ')}) VALUES(${Array.from(
        { length: fields.length },
        (v, i) => `$${i + 1}`,
      )
        .join(', ')}) RETURNING *;`,
      fields.map(field => values[field]),
    );
    return record;
  }

  static async findOneById(id) {
    return Model.findOne('id', id);
  }

  static async findOne(field, value) {
    const { rows } = await db.query(`SELECT * from "${table}" WHERE "${field}"=$1`,
      [value]);
    if (rows.length < 1) {
      return null;
    }
    return rows[0];
  }

  static async findAll(field = null, value = null) {
    const values = [];
    if (value) {
      values.push(value);
    }
    const { rows } = await db.query(
      `SELECT * from "${table}" ${field && value
        ? `WHERE ${field} = $1`
        : ''}`, values,
    );
    return rows;
  }

  static async update(id, field, value) {
    const { rows } = await db.query(
      `UPDATE "${table}" SET ${field} = $1 WHERE id = $2 RETURNING *`, [value, id],
    );
    return rows[0];
  }

  static async delete(id) {
    const { rows } = await db.query(
      `DELETE from "${table}" WHERE id = $1 RETURNING *`, [id],
    );
    return rows[0];
  }

  // static async count() {
  //   const { rows: [{ count }] } = await db.query(`SELECT COUNT(*) FROM "${table}"`);
  //   return count;
  // }
};
