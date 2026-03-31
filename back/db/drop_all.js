const db = require('./db');

function drop_all() {
  const sql = "DROP DATABASE IF EXISTS s_p";

  db.query(sql, (err) => {
    if (err) {
      console.error('删除数据库失败:', err);
    } else {
      console.log('数据库 s_p 已删除');
    }
  });
  db.end();
}

drop_all();