const calculateHash = require("../utils/hash")
const contract = require("./contract")

//function verifyrecord(record){}
//根据传入的record，record就是完整的记录，相当于前端传入的json
//record里的
//content
//attack_type
//severity
//source_ip
//四个字段得到hash值，通过hash值直接查链上是否有这数据
//有的话则说明没问题，验证成功，失败则被修改或者根本不存在此条记录
//有可能hash碰撞
async function verifyrecord(record){
    if (!record) {
        return { valid:false, reason:"传入记录为空, from verifyrecord" };
    }

    if (!record.content) {
        return { valid:false, reason:"传入content为空, from verifyrecord" };
    }

    if (!record.hash) {
        return { valid:false, reason:"传入hash为空, from verifyrecord" };
    }
    const recalculatedHash = calculateHash({
        content: record.content,
        attack_type: record.attack_type,
        severity: record.severity,
        source_ip: record.source_ip
    });
    //返回的结果是valid（false or true）
    //reason（失败的原因）
    //当出错时会返回err
    if(recalculatedHash!=record.hash){
        return{valid:false,reason:"内容hash不一致，数据可能被篡改"};
    }
    try{
        const result = await contract.getIntel(record.hash);
        const timestamp = Number(result[1]);
        if(timestamp === 0){
            return{valid:false,reason:"链上不存在该条记录"}
        }
        return{
            valid:true
        };
    }catch(err){
        return{
            valid:false,
            reason:"something went wrong,from verifyrecord",
            error:err.message
        }
    }
}
module.exports = verifyrecord;