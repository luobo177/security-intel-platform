import config from '../config/config'


async function postDataToCenter(payload){
    const res = await fetch(`${config.baseUrl}/saveIntel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.error || result.message || "提交失败");
    }
    return result;
}

export{
  postDataToCenter
}