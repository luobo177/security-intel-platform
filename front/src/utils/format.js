function shortMiddle(str, left = 8, right = 6) {
  if (!str) return "-"
  if (str.length <= left + right) return str
  return `${str.slice(0, left)}...${str.slice(-right)}`
}

function formatTime(timeStr) {
  if (!timeStr) return "-"
  const date = new Date(timeStr)
  if (Number.isNaN(date.getTime())) return timeStr

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hour = String(date.getHours()).padStart(2, "0")
  const minute = String(date.getMinutes()).padStart(2, "0")

  return `${year}-${month}-${day} ${hour}:${minute}`
}

export {
  shortMiddle,
  formatTime
}