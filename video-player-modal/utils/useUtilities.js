 // HTML 轉義（防止 XSS）
 export function escapeHtml(text) {
  if (!text) return '';
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}

// 解析 HTML 布林屬性
// export function getBooleanAttribute(element, name, fallback) {
//   if (!element.hasAttribute(name)) return fallback;
//   const value = element.getAttribute(name);
//   if (value === null || value === '') return true;
//   return !/^(false|0|no|off)$/i.test(value.trim());
// }