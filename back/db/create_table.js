const db = require('./db');

function initTable() {
    const sql = `
    CREATE TABLE IF NOT EXISTS intel (
        id INT PRIMARY KEY AUTO_INCREMENT,
        content TEXT NOT NULL,
        attack_type VARCHAR(100),
        severity VARCHAR(50),
        source_ip VARCHAR(50),
        hash VARCHAR(255) NOT NULL UNIQUE,
        tx_hash VARCHAR(255),
        sender VARCHAR(100) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`;

    db.query(sql, (err) => {
        if (err) {
        console.error("建表失败:", err);
        } else {
        console.log("表已就绪");
        }
    });
    db.end();
    }

initTable();
