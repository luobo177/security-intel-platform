import config from "@/config/config";

async function request(url, options = {}) {
  const res = await fetch(`${config.baseUrl}${url}`, options);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || data.message || "请求失败");
  }

  return data;
}

function getAllData() {
  return request("/getAllData").then(res => res.data || res)
}

function getByHash(hash) {
  if (!hash || !hash.trim()) {
    throw new Error("请先输入 hash");
  }

  return request(`/getByHash?hash=${encodeURIComponent(hash.trim())}`);
}

function getByTxHash(txHash) {
  if (!txHash || !txHash.trim()) {
    throw new Error("请先输入 tx_hash");
  }

  return request(`/getByTxHash?tx_hash=${encodeURIComponent(txHash.trim())}`);
}

export {
  request,
  getAllData,
  getByHash,
  getByTxHash
};