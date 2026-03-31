async function calculateHash(dataObj) {
  const normalized = JSON.stringify({
    content: dataObj.content || "",
    attack_type: dataObj.attack_type || "",
    severity: dataObj.severity || "",
    source_ip: dataObj.source_ip || ""
  });

  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);

  const hashBuffer = await crypto.subtle.digest("SHA-256", data);

  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");

  return hashHex;
}

export default calculateHash;