const db = require('./db');

function clearTable() {
    const sql = `TRUNCATE TABLE intel`;

    db.query(sql, (err) => {
        if (err) {
            console.error("清空失败:", err);
        } else {
            console.log("表已清空（自增已重置）");
        }
        db.end();
    });
}

clearTable();