export function formatDate(time) {
  let date = new Date(time);
  var y = date.getFullYear(),
    m = date.getMonth() + 1,
    d = date.getDate(),
    h = date.getHours(),
    mm = date.getMinutes(),
    s = date.getSeconds();
  return y + '-' + timeFormatter(m) + '-' + timeFormatter(d) + ' ' + timeFormatter(h) + ':' + timeFormatter(mm) + ':' + timeFormatter(s);
}
export function formatDateBysdf(time, fmt) {
  fmt = _.isEmpty(fmt) ? "yyyy-MM-dd" : fmt
  let date = new Date(time);
  var o = {
    "M+": date.getMonth() + 1,
    "d+": date.getDate(),
    "h+": date.getHours(),
    "m+": date.getMinutes(),
    "s+": date.getSeconds(),
    "q+": Math.floor(date.getMonth() + 3),
    "S": date.getMilliseconds
  }
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
}

function timeFormatter(m) {
  return m < 10 ? '0' + m : m;
}

//时间组件默认值
export function initDate() {
  let endDate = new Date().getTime();
  let startDate = new Date(endDate - 7 * 24 * 60 * 60 * 1000);
  return [startDate, new Date()];
}
