const db = require("./db");

function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, result) => {
      if (err) {
        console.error("SQL执行失败:", err);
        return reject(err);
      }
      resolve(result);
    });
  });
}

async function insertData(content, attack_type, severity, source_ip, hash, sender, tx_hash, status = "pending") {
  const sql = `
    INSERT INTO intel (content, attack_type, severity, source_ip, hash, sender, tx_hash, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  return await query(sql, [content, attack_type, severity, source_ip, hash, sender, tx_hash, status]);
}

async function getTxByHash(hash) {
  const sql = "SELECT * FROM intel WHERE hash = ?";
  return await query(sql, [hash]);
}

async function getAllData() {
  const sql = "SELECT * FROM intel ORDER BY id DESC";
  console.log("准备执行 SQL:", sql);
  const result = await query(sql);
  console.log("SQL 执行完毕");
  return result;
}

async function getTxByTxHash(tx_hash) {
  const sql = "SELECT * FROM intel WHERE tx_hash = ?";
  return await query(sql, [tx_hash]);
}

module.exports = {
  insertData,
  getTxByHash,
  getAllData,
  getTxByTxHash
};