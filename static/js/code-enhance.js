/* 给 Chroma 生成的代码块补一个语言标签 + 复制按钮（原主题靠 Prism 的 toolbar 插件实现，
   Chroma 是构建期高亮，没有这个 JS 插件，这里用原生 JS 补上，样式见 css/code-enhance.css） */
document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.post-content .highlight pre').forEach(function (pre) {
        var wrapper = pre.parentElement;
        if (!wrapper || wrapper.querySelector('.toolbar')) return;
        wrapper.classList.add('code-toolbar');

        var codeEl = pre.querySelector('code');
        var lang = codeEl ? codeEl.getAttribute('data-lang') : '';

        var toolbar = document.createElement('div');
        toolbar.className = 'toolbar';

        if (lang) {
            var langSpan = document.createElement('span');
            langSpan.className = 'toolbar-item';
            langSpan.textContent = lang;
            toolbar.appendChild(langSpan);
        }

        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'toolbar-item toolbar-item--copy';
        btn.textContent = '复制';
        toolbar.appendChild(btn);

        wrapper.appendChild(toolbar);
    });

    /* 委托到 document 上一个监听，而不是给每个代码块的复制按钮各注册一个 */
    document.addEventListener('click', function (e) {
        var btn = e.target.closest('.toolbar-item--copy');
        if (!btn) return;
        var pre = btn.closest('.code-toolbar').querySelector('pre');
        var codeEl = pre ? pre.querySelector('code') : null;
        var text = codeEl ? codeEl.innerText : (pre ? pre.innerText : '');
        navigator.clipboard.writeText(text).then(function () {
            btn.textContent = '已复制';
            setTimeout(function () { btn.textContent = '复制'; }, 1500);
        });
    });
});
