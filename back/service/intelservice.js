const { getAllData, getTxByHash } = require("../db/intelModel");

function safeParse(content) {
  try {
    return typeof content === "string" ? JSON.parse(content) : content;
  } catch (e) {
    return null;
  }
}

function compareJsonFields(newContent, oldContent) {
  let score = 0;
  const matchedFields = [];

  if (
    newContent.attack_type &&
    oldContent.attack_type &&
    newContent.attack_type === oldContent.attack_type
  ) {
    score += 3;
    matchedFields.push("attack_type");
  }

  if (
    newContent.payload &&
    oldContent.payload &&
    newContent.payload === oldContent.payload
  ) {
    score += 3;
    matchedFields.push("payload");
  }

  if (
    newContent.source_ip &&
    oldContent.source_ip &&
    newContent.source_ip === oldContent.source_ip
  ) {
    score += 2;
    matchedFields.push("source_ip");
  }

  if (
    newContent.severity &&
    oldContent.severity &&
    newContent.severity === oldContent.severity
  ) {
    score += 1;
    matchedFields.push("severity");
  }

  let matchType = "none";
  let matched = false;

  if (score >= 7) {
    matched = true;
    matchType = "high_similarity";
  } else if (score >= 5) {
    matched = true;
    matchType = "similar";
  }

  return {
    matched,
    score,
    matchType,
    matchedFields
  };
}

async function compareIntelWithDatabase(content, hash) {
  // 第一层：先按 hash 查重
  const hashResult = await getTxByHash(hash);
  if (hashResult && hashResult.length > 0) {
    return {
      exists: true,
      duplicate: true,
      duplicateBy: "hash",
      matchType: "exact_duplicate",
      score: 100,
      matchedFields: ["hash"],
      matchedRecord: hashResult[0]
    };
  }

  // 第二层：查所有历史记录做相似比对
  const allData = await getAllData();
  const newJson = safeParse(content);

  // 如果不是 JSON，先只做字符串完全相等判断
  if (!newJson) {
    const sameContent = allData.find(item => item.content === content);
    if (sameContent) {
      return {
        exists: true,
        duplicate: true,
        duplicateBy: "content",
        matchType: "exact_content",
        score: 100,
        matchedFields: ["content"],
        matchedRecord: sameContent
      };
    }

    return {
      exists: false,
      duplicate: false,
      duplicateBy: "none",
      matchType: "none",
      score: 0,
      matchedFields: [],
      matchedRecord: null
    };
  }

  let bestMatch = null;

  for (const item of allData) {
    const oldJson = safeParse(item.content);
    if (!oldJson) continue;

    const result = compareJsonFields(newJson, oldJson);

    if (result.matched) {
      if (!bestMatch || result.score > bestMatch.score) {
        bestMatch = {
          ...result,
          matchedRecord: item
        };
      }
    }
  }

  if (bestMatch) {
    return {
      exists: true,
      duplicate: false,
      duplicateBy: "similarity",
      ...bestMatch
    };
  }

  return {
    exists: false,
    duplicate: false,
    duplicateBy: "none",
    matchType: "none",
    score: 0,
    matchedFields: [],
    matchedRecord: null
  };
}


module.exports = {
  compareIntelWithDatabase
};