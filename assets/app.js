/* =========================================================================
   你的名字 · 个人主页 — 交互
   主题 / 滚动高亮 / 信息源检索 / 作品筛选 / 入场动画
   无依赖，无外部请求。
   ========================================================================= */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = false;
  try { reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  /* ------------------------------ 主题 ------------------------------ */
  var themeBtn = document.getElementById('theme-toggle');

  function syncThemeButton(theme) {
    if (!themeBtn) return;
    var dark = theme === 'dark';
    themeBtn.setAttribute('aria-pressed', dark ? 'true' : 'false');
    themeBtn.setAttribute('aria-label', dark ? '切换到浅色模式' : '切换到深色模式');
    themeBtn.title = dark ? '切换到浅色模式' : '切换到深色模式';
  }

  function storedTheme() {
    try {
      var v = localStorage.getItem('theme');
      return (v === 'dark' || v === 'light') ? v : null;
    } catch (e) { return null; }
  }

  function applyTheme(theme, persist) {
    root.setAttribute('data-theme', theme);
    syncThemeButton(theme);
    if (persist) {
      try { localStorage.setItem('theme', theme); } catch (e) {}
    }
  }

  if (themeBtn) {
    syncThemeButton(root.getAttribute('data-theme') || 'light');
    themeBtn.addEventListener('click', function () {
      var next = (root.getAttribute('data-theme') === 'dark') ? 'light' : 'dark';
      applyTheme(next, true);
    });
  }

  // 没有手动选择时跟随系统
  try {
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    var onScheme = function (e) {
      if (!storedTheme()) applyTheme(e.matches ? 'dark' : 'light', false);
    };
    if (mq.addEventListener) mq.addEventListener('change', onScheme);
    else if (mq.addListener) mq.addListener(onScheme);
  } catch (e) {}

  /* --------------------------- 滚动高亮 --------------------------- */
  (function scrollspy() {
    var links = Array.prototype.slice.call(document.querySelectorAll('#menu a'));
    if (!links.length) return;

    var byId = {};
    links.forEach(function (a) {
      var href = a.getAttribute('href') || '';
      if (href.charAt(0) === '#') byId[href.slice(1)] = a;
    });

    var sections = Object.keys(byId)
      .map(function (id) { return document.getElementById(id); })
      .filter(Boolean);

    function setActive(id) {
      links.forEach(function (a) {
        var on = a === byId[id];
        if (on) {
          a.classList.add('active');
          a.setAttribute('aria-current', 'true');
        } else {
          a.classList.remove('active');
          a.removeAttribute('aria-current');
        }
      });
    }

    if (!('IntersectionObserver' in window) || !sections.length) return;

    var inBand = Object.create(null);

    var spy = new IntersectionObserver(function (entries) {
      var best = null;
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          inBand[en.target.id] = en.intersectionRatio;
          if (!best || en.intersectionRatio > best.ratio) {
            best = { id: en.target.id, ratio: en.intersectionRatio };
          }
        } else {
          delete inBand[en.target.id];
        }
      });

      if (best) { setActive(best.id); return; }

      // 阅读线（视口 40%–45%）落在没有区块的位置：hero、页脚、或区块之间的空隙
      var rest = Object.keys(inBand);
      if (rest.length) setActive(rest[0]);
      else setActive(null);
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

    sections.forEach(function (s) { spy.observe(s); });
  })();

  /* --------------------------- 入场动画 --------------------------- */
  (function reveal() {
    var items = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
    if (!items.length) return;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('in'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.04 });

    items.forEach(function (el) { io.observe(el); });
  })();

  /* ---------------------------- 信息源 ---------------------------- */
  (function sources() {
    var listEl = document.getElementById('src-list');
    if (!listEl) return;

    var chipsEl = document.getElementById('src-chips');
    var countEl = document.getElementById('src-count');
    var inputEl = document.getElementById('src-q');
    var clearEl = document.getElementById('src-clear');
    var skelEl = document.getElementById('src-skel');
    var emptyEl = document.getElementById('src-empty');
    var errorEl = document.getElementById('src-error');
    var retryEl = document.getElementById('src-retry');

    var state = { q: '', group: '全部' };
    var data = null;
    var rows = [];

    function hostOf(url) {
      try {
        return new URL(url).hostname.replace(/^www\./, '');
      } catch (e) {
        return String(url || '').replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '');
      }
    }

    function pad(n) { return (n < 10 ? '0' : '') + n; }

    function haystack(item) {
      var tags = Array.isArray(item.tags) ? item.tags : [];
      return [item.name, item.note, tags.join(' '), item.url].join(' \u0001 ').toLowerCase();
    }

    function buildRows(items) {
      var frag = document.createDocumentFragment();
      var index = [];

      items.forEach(function (item) {
        var li = document.createElement('li');
        li.className = 'src-item';

        var row = document.createElement('a');
        row.className = 'src-row';
        row.href = item.url;
        row.target = '_blank';
        row.rel = 'noopener noreferrer';

        var num = document.createElement('span');
        num.className = 'src-num';

        var main = document.createElement('span');
        main.className = 'src-main';

        var name = document.createElement('span');
        name.className = 'src-name';
        name.textContent = item.name;

        var note = document.createElement('span');
        note.className = 'src-note';
        note.textContent = item.note;

        main.appendChild(name);
        main.appendChild(note);

        var host = document.createElement('span');
        host.className = 'src-host';
        host.textContent = hostOf(item.url);

        row.appendChild(num);
        row.appendChild(main);
        row.appendChild(host);
        li.appendChild(row);
        frag.appendChild(li);

        index.push({ item: item, num: num, hay: haystack(item) });
      });

      rows = index;
      return frag;
    }

    function renderChips(groups) {
      if (!chipsEl) return;
      chipsEl.textContent = '';
      ['全部'].concat(groups).forEach(function (g) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'chip';
        b.textContent = g;
        b.setAttribute('aria-pressed', g === state.group ? 'true' : 'false');
        b.addEventListener('click', function () {
          state.group = g;
          Array.prototype.forEach.call(chipsEl.children, function (c) {
            c.setAttribute('aria-pressed', c === b ? 'true' : 'false');
          });
          apply();
        });
        chipsEl.appendChild(b);
      });
    }

    function apply() {
      var q = state.q.trim().toLowerCase();
      var group = state.group;
      var shown = 0;

      rows.forEach(function (rec, i) {
        var okGroup = (group === '全部') || (rec.item.group === group);
        var okText = !q || rec.hay.indexOf(q) !== -1;
        var on = okGroup && okText;
        var li = rec.num.parentNode.parentNode;
        li.hidden = !on;
        if (on) {
          shown += 1;
          rec.num.textContent = pad(shown);
        }
      });

      if (emptyEl) emptyEl.hidden = shown !== 0;
      if (countEl) {
        var stamp = (data && data.updated) ? ' · 数据更新于 ' + data.updated : '';
        countEl.textContent = (shown === rows.length && !q && group === '全部')
          ? '显示 ' + shown + ' / ' + rows.length + ' 条' + stamp
          : '筛选出 ' + shown + ' / ' + rows.length + ' 条' + stamp;
      }
      if (clearEl) clearEl.hidden = !state.q;
    }

    function fail(hint, countText) {
      if (skelEl) skelEl.hidden = true;
      if (errorEl) errorEl.hidden = false;
      var el = document.getElementById('src-error-hint');
      if (el && hint) el.textContent = hint;
      if (countEl) countEl.textContent = countText || '信息源载入失败';
    }

    function boot(payload) {
      var rows = payload && (Array.isArray(payload.items) ? payload.items
        : (Array.isArray(payload.sources) ? payload.sources : null));
      if (!rows || !rows.length) {
        fail();
        return;
      }
      data = payload;

      listEl.textContent = '';
      listEl.appendChild(buildRows(rows));

      var groups = [];
      rows.forEach(function (it) {
        if (it.group && groups.indexOf(it.group) === -1) groups.push(it.group);
      });

      renderChips(groups);
      if (skelEl) skelEl.hidden = true;
      if (errorEl) errorEl.hidden = true;
      apply();
    }

    function load() {
      if (skelEl) skelEl.hidden = false;
      if (errorEl) errorEl.hidden = true;
      if (countEl) countEl.textContent = '正在载入信息源…';

      if (!window.fetch || location.protocol === 'file:') {
        fail('直接双击打开时，浏览器不允许网页读取本地 JSON 文件。在这个目录运行 python -m http.server 8000，再访问 http://localhost:8000 就能看到 22 条。', '本地预览需启动服务器');
        return;
      }

      fetch('data/sources.json', { cache: 'no-store' })
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.json();
        })
        .then(boot)
        .catch(function () {
          fail('检查 data/sources.json 是否存在、JSON 是否合法；用浏览器直接打开这个文件会显示具体错误。');
        });
    }

    if (inputEl) {
      inputEl.addEventListener('input', function () {
        state.q = inputEl.value;
        apply();
      });
      inputEl.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          e.preventDefault();
          inputEl.value = '';
          state.q = '';
          apply();
          inputEl.blur();
        }
      });
    }

    if (clearEl) {
      clearEl.addEventListener('click', function () {
        if (!inputEl) return;
        inputEl.value = '';
        state.q = '';
        apply();
        inputEl.focus();
      });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
      var t = e.target;
      var tag = t && t.tagName ? t.tagName : '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (t && t.isContentEditable)) return;
      if (!inputEl) return;
      e.preventDefault();
      inputEl.focus();
      inputEl.select();
    });

    if (retryEl) retryEl.addEventListener('click', load);

    load();
  })();

  /* ---------------------------- 作品筛选 ---------------------------- */
  (function works() {
    var tabs = Array.prototype.slice.call(document.querySelectorAll('#tabs button'));
    if (!tabs.length) return;

    var cards = Array.prototype.slice.call(document.querySelectorAll('#proj-grid .project'));

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var f = tab.getAttribute('data-filter') || 'all';
        tabs.forEach(function (t) { t.setAttribute('aria-pressed', t === tab ? 'true' : 'false'); });
        cards.forEach(function (c) {
          var show = (f === 'all') || (c.getAttribute('data-cat') === f);
          c.hidden = !show;
          if (show) c.classList.add('in');
        });
      });
    });
  })();

  /* ---------------------------- 平滑滚动 ---------------------------- */
  // CSS 的 scroll-behavior 已处理，reduced-motion 下由样式表关闭；
  // 这里只兜底老浏览器里的 hash 跳转偏移。
  if (!('scrollBehavior' in document.documentElement.style)) {
    document.addEventListener('click', function (e) {
      var a = e.target && e.target.closest ? e.target.closest('a[href^="#"]') : null;
      if (!a) return;
      var id = a.getAttribute('href').slice(1);
      var target = id ? document.getElementById(id) : null;
      if (!target) return;
      e.preventDefault();
      window.scrollTo(0, target.getBoundingClientRect().top + window.pageYOffset - 84);
    });
  }

  /* --------------------- 联系邮箱：运行期拼装 --------------------- */
  // 源码里不出现完整地址，字符码在浏览器里还原，避免被静态抓取。
  (function mail(){
    var CODE = [50,48,54,55,48,48,50,54,55,49,64,113,113,46,99,111,109];
    var addr = String.fromCharCode.apply(null, CODE);
    var nodes = Array.prototype.slice.call(document.querySelectorAll('[data-mail]'));
    if (!nodes.length) return;

    function copyText(text, done){
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function(){ done(true); }, function(){ done(false); });
        return;
      }
      var t = document.createElement('textarea');
      t.value = text;
      t.setAttribute('readonly', '');
      t.style.position = 'fixed';
      t.style.top = '-1000px';
      document.body.appendChild(t);
      t.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      document.body.removeChild(t);
      done(ok);
    }

    nodes.forEach(function(el){
      var mode = el.getAttribute('data-mail');

      if (mode === 'link') {
        el.setAttribute('href', 'mailto:' + addr);
        return;
      }

      if (mode === 'reveal') {
        el.addEventListener('click', function(){
          if (el.getAttribute('data-state') === 'shown') {
            copyText(addr, function(ok){ flash(el, ok ? '已复制' : addr); });
            return;
          }
          el.textContent = addr;
          el.setAttribute('data-state', 'shown');
          el.setAttribute('title', '再点一次复制');
        });
        return;
      }

      if (mode === 'copy') {
        el.addEventListener('click', function(){
          copyText(addr, function(ok){ flash(el, ok ? '已复制' : '复制失败'); });
        });
      }
    });

    function flash(el, text){
      var label = el.getAttribute('data-label') || el.textContent;
      el.textContent = text;
      el.classList.add('ok');
      window.setTimeout(function(){
        el.textContent = label;
        el.classList.remove('ok');
      }, 1800);
    }
  })();
})();
