const crypto = require("crypto");

function calculateHash(dataObj) {
  const normalized = JSON.stringify({
    content: dataObj.content || "",
    attack_type: dataObj.attack_type || "",
    severity: dataObj.severity || "",
    source_ip: dataObj.source_ip || ""
  });

  return crypto
    .createHash("sha256")
    .update(normalized)
    .digest("hex");
}

module.exports = calculateHash;