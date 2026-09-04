(function () {
  var form = document.getElementById('search-page-form');
  var input = document.getElementById('search-page-input');
  var statusEl = document.getElementById('search-status');
  var resultsEl = document.getElementById('search-results');
  var pagefind = null;

  var PAGE_SIZE = 10; // 跟站内文章列表的 paginate: 10 保持一致
  var currentResults = []; // pagefind 原始搜索结果（未 resolve），翻页时才按需 resolve 当前页那几条
  var resultCache = []; // 跟 currentResults 平行的 r.data() 缓存，避免同一条结果被重复 resolve
  var currentQuery = '';
  var currentPage = 1;

  // 跟 pagination.html 用同一份 data/icons.yaml，从 search.html 里的隐藏 <template> 取 markup，
  // 而不是在 JS 里再内联一份 SVG（图标改了要同步改两处的重复源）
  var ICON_LEFT = document.getElementById('search-icon-left').innerHTML;
  var ICON_RIGHT = document.getElementById('search-icon-right').innerHTML;

  // search-status 卡片图标：loading 用跟图片懒加载占位一致的 waxy-diamond-loader 转圈动画，
  // 其余状态复用 search.html 里的隐藏 <template>
  var LOADER_HTML = '<div class="waxy-diamond-loader"><span></span><span></span><span></span><span></span></div>';
  var STATE_ICONS = {
    empty: document.getElementById('search-icon-empty').innerHTML,
    error: document.getElementById('search-icon-error').innerHTML,
    unavailable: document.getElementById('search-icon-unavailable').innerHTML
  };

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // kind 为空时是结果列表上方的一行提示（比如"共找到 N 篇文章"），
  // 传 'loading'/'empty'/'error'/'unavailable' 时渲染成 card + svg + 文案，视觉上不那么空
  function setStatus(text, kind) {
    statusEl.innerHTML = '';
    if (!text) {
      statusEl.hidden = true;
      statusEl.className = '';
      return;
    }
    statusEl.hidden = false;
    if (!kind) {
      statusEl.className = 'archive-tip';
      statusEl.textContent = text;
      return;
    }
    statusEl.className = 'search-status search-status--' + kind;
    var icon = document.createElement('div');
    icon.className = 'search-status__icon';
    icon.innerHTML = kind === 'loading' ? LOADER_HTML : (STATE_ICONS[kind] || '');
    var p = document.createElement('p');
    p.className = 'search-status__text';
    p.textContent = text;
    statusEl.appendChild(icon);
    statusEl.appendChild(p);
  }

  // 把标题里命中搜索词的部分也包上 <mark>，跟 pagefind 自带的正文摘要高亮保持一致
  // （pagefind 只给正文摘要做高亮，标题是纯文本，这段是补的）
  function highlightTitle(title, query) {
    var escaped = escapeHtml(title);
    var terms = query.trim().split(/\s+/).filter(Boolean).map(function (t) {
      return t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    });
    if (!terms.length) return escaped;
    var re = new RegExp('(' + terms.join('|') + ')', 'gi');
    return escaped.replace(re, '<mark>$1</mark>');
  }

  function renderCard(r, query) {
    var item = document.createElement('article');
    item.className = 'search-result-card';
    var title = (r.meta && r.meta.title) || r.url;
    var date = r.meta && r.meta.date
      ? '<time class="search-result-card__date">' + escapeHtml(r.meta.date) + '</time>'
      : '';
    item.innerHTML =
      '<a class="search-result-card__title" href="' + r.url + '">' + highlightTitle(title, query) + '</a>' +
      date +
      '<p class="search-result-card__excerpt">' + r.excerpt + '</p>';
    return item;
  }

  // 复用站内文章列表分页条的 class（pagination/__prev/__info/__next），视觉上跟其它分页一致，
  // 但这里是纯前端分页——所有结果早已经一次性从 pagefind 拿回来了，翻页只是换一屏渲染，不重新查询
  function renderPagination(totalPages) {
    if (totalPages <= 1) return null;
    var nav = document.createElement('nav');
    nav.className = 'pagination';
    nav.setAttribute('role', 'navigation');

    if (currentPage > 1) {
      var prev = document.createElement('a');
      prev.href = 'javascript:void(0)';
      prev.className = 'pagination__prev';
      prev.setAttribute('aria-label', 'Previous');
      prev.innerHTML = ICON_LEFT;
      prev.addEventListener('click', function () {
        currentPage -= 1;
        renderPage();
      });
      nav.appendChild(prev);
    }

    var info = document.createElement('span');
    info.className = 'pagination__info';
    info.textContent = '第 ' + currentPage + ' 页 / 共 ' + totalPages + ' 页';
    nav.appendChild(info);

    if (currentPage < totalPages) {
      var next = document.createElement('a');
      next.href = 'javascript:void(0)';
      next.className = 'pagination__next';
      next.setAttribute('aria-label', 'Next');
      next.innerHTML = ICON_RIGHT;
      next.addEventListener('click', function () {
        currentPage += 1;
        renderPage();
      });
      nav.appendChild(next);
    }

    return nav;
  }

  async function renderPage() {
    resultsEl.innerHTML = '';
    if (!currentResults.length) {
      setStatus('没有找到匹配的文章', 'empty');
      return;
    }
    var totalPages = Math.ceil(currentResults.length / PAGE_SIZE);
    setStatus('共找到 ' + currentResults.length + ' 篇文章');

    // 只 resolve 当前页要展示的那几条，而不是一次性拉取全部命中结果的 data()
    var start = (currentPage - 1) * PAGE_SIZE;
    var pageData = await Promise.all(currentResults.slice(start, start + PAGE_SIZE).map(function (r, i) {
      var idx = start + i;
      if (!resultCache[idx]) resultCache[idx] = r.data();
      return resultCache[idx];
    }));

    pageData.forEach(function (d) {
      resultsEl.appendChild(renderCard(d, currentQuery));
    });

    var pagination = renderPagination(totalPages);
    if (pagination) resultsEl.appendChild(pagination);
  }

  async function ensurePagefind() {
    if (pagefind) return pagefind;
    pagefind = await import(/* webpackIgnore: true */ window.PAGEFIND_BASE + 'pagefind.js');
    await pagefind.init();
    return pagefind;
  }

  async function runSearch(query) {
    currentQuery = query;
    currentPage = 1;
    if (!query) {
      currentResults = [];
      resultCache = [];
      resultsEl.innerHTML = '';
      setStatus(null);
      return;
    }
    setStatus('搜索中…', 'loading');
    var pf;
    try {
      pf = await ensurePagefind();
    } catch (e) {
      setStatus('搜索功能暂不可用，请稍后再试', 'unavailable');
      return;
    }
    try {
      var search = await pf.search(query);
      currentResults = search.results;
      resultCache = [];
      await renderPage();
    } catch (e) {
      setStatus('搜索出错了，请重新尝试', 'error');
    }
  }

  function updateUrl(query) {
    var url = new URL(window.location.href);
    if (query) {
      url.searchParams.set('q', query);
    } else {
      url.searchParams.delete('q');
    }
    window.history.replaceState(null, '', url);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var query = input.value.trim();
    updateUrl(query);
    runSearch(query);
  });

  var initialQuery = new URL(window.location.href).searchParams.get('q') || '';
  if (initialQuery) {
    input.value = initialQuery;
    runSearch(initialQuery);
  }
})();
