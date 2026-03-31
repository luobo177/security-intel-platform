const db = require('./db');

function initDB() {
  const createDB = `CREATE DATABASE IF NOT EXISTS s_p`;
  db.query(createDB, (err) => {
    if (err) {
      console.error('创建数据库失败:', err);
      return;
    }
    console.log('创建数据库成功');
    })
    db.end();
}
initDB();