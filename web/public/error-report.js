// Gửi lỗi phía trình duyệt về máy chủ để soát và sửa (tối đa 10 lần mỗi lần mở trang, không gửi mật khẩu hay dữ liệu nhập).
(function () {
  var sent = 0, seen = {};
  function report(info) {
    try {
      var key = (info.message || '') + '|' + (info.source || '');
      if (sent >= 10 || seen[key]) return;
      seen[key] = 1; sent++;
      var body = JSON.stringify({
        page: location.pathname + location.hash.slice(0, 40),
        message: String(info.message || '').slice(0, 400),
        source: String(info.source || '').slice(0, 300),
        line: info.line, col: info.col,
        stack: String(info.stack || '').slice(0, 2000),
        ua: navigator.userAgent.slice(0, 200)
      });
      if (_fetch) _fetch('/api/client-error', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body, keepalive: true, credentials: 'same-origin' }).catch(function () {});
    } catch (e) {}
  }
  var _fetch = window.fetch && window.fetch.bind(window);
  window.addEventListener('error', function (e) {
    var t = e.target;
    if (t && t !== window && (t.src || t.href)) report({ message: 'Không tải được ' + (t.tagName || '').toLowerCase(), source: t.src || t.href });
    else report({ message: e.message, source: e.filename, line: e.lineno, col: e.colno, stack: e.error && e.error.stack });
  }, true);
  window.addEventListener('unhandledrejection', function (e) {
    var r = e.reason || {};
    report({ message: 'Promise: ' + (r.message || String(r)), stack: r.stack });
  });
  if (_fetch) window.fetch = function (input, init) {
    var url = typeof input === 'string' ? input : (input && input.url) || '';
    return _fetch(input, init).then(function (res) {
      if (res.status >= 500 && url.indexOf('/api/client-error') < 0) report({ message: 'API ' + res.status, source: url.split('?')[0] });
      return res;
    });
  };
})();
