const express = require("express");
const router = express.Router();
const { compareIntelWithDatabase } = require("../service/intelservice");
const {
  insertData,
  getTxByHash,
  getAllData,
  getTxByTxHash
} = require("../db/intelModel");
const verifyIntel = require("../service/verifyrecord");
const verifyrecord = require("../service/verifyrecord");

// 保存数据：先比对，再决定是否上链+入库
router.post("/saveIntel", async (req, res) => {
  const {
    content,
    attack_type,
    severity,
    source_ip,
    hash,
    tx_hash,
    sender,
    status
  } = req.body;
  if (!content || !hash || !tx_hash || !sender) {
    return res.status(400).json({ error: "参数不完整" });
  }

  try {
    await insertData(
      content,
      attack_type || null,
      severity || null,
      source_ip || null,
      hash,
      sender,
      tx_hash,
      status || "pending"
    );
    console.log("存储数据成功,后端hash：",hash);
    res.json({ message: "保存成功" });
  } catch (err) {
    res.status(500).json({ error: "数据库错误" });
  }
});

router.get("/getByHash", async (req, res) => {
  try {
    const { hash } = req.query;

    if (!hash) {
      return res.status(400).json({ error: "hash不能为空" });
    }

    const result = await getTxByHash(hash);

    if (!result || result.length === 0) {
      return res.status(404).json({ error: "未找到数据" });
    }
    console.log(result);
    const verifiedResult =await verifyIntel(result[0]);
    if (!verifiedResult.valid){
      console.log(verifiedResult.reason);
      if (verifiedResult.error){
        console.log(verifiedResult.error);
      }
      return res.status(400).json({error:verifiedResult.reason});
    }
    return res.json({
      message: "ok",
      data: result[0]
    });
  } catch (err) {
    console.error("getTxByHash error:", err);
    return res.status(500).json({ error: "数据库错误" });
  }
});

//先获取所有数据存储在data里，通过for循环来一条一条检验
router.get("/getAllData", async (req, res) => {
  try {
    const data = await getAllData();
    //使用promise把返回的每个记录都调用verifyrecord，在原本记录的基础上增加两个字段
    //一个是检验是否成功，还有一个是失败的原因
    const result = await Promise.all(
      data.map(async (record)=>{
        const verifyRes = await verifyrecord(record);

        return{
          ...record,
          verify:verifyRes.valid,
          reason:verifyRes.reason || ""
        };
      })
    )
    return res.json({
      message: "ok",
      data: result
    });
  } catch (err) {
    console.error("getAllData error:", err);
    return res.status(500).json({ error: "数据库错误" });
  }
});

router.get("/getByTxHash", async (req, res) => {
  try {
    const { tx_hash } = req.query;

    if (!tx_hash) {
      return res.status(400).json({ error: "tx_hash不能为空" });
    }

    const result = await getTxByTxHash(tx_hash);

    if (!result || result.length === 0) {
      return res.status(404).json({ error: "未找到数据" });
    }
    if(!(await verifyrecord(result[0])).valid){
      return res.status(400).json({error:"该记录与区块链上数据不匹配"});
    }
    return res.json({
      message: "ok",
      data: result[0]
    });
  } catch (err) {
    console.error("getTxByTxHash error:", err);
    return res.status(500).json({ error: "数据库错误" });
  }
});

module.exports = router;