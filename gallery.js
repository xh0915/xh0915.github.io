(function () {
  'use strict';

  if (window.__guideReady) return;
  window.__guideReady = true;

  var ARROW =
    '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5.5 10.5 10.5 5.5M6.5 5.5h4v4"/></svg>';

  var FALLBACK = {
    label: '作品图鉴',
    title_lead: '四款插件，',
    title_highlight: '逐段看清。',
    count: '04 IN DEPTH · 2026',
    aside: '大图、做法、适用场景一次讲全。四款都开源，仓库里有完整说明和真实测试。',
    footer: 'ALL SOURCE ON GITHUB',
    footer_cta: { label: '去 GitHub 看全部源码', href: 'https://github.com/xh0915' }
  };

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  function pad(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function assetUrl(path) {
    if (!path) return '';
    return path.charAt(0) === '/' ? path : '/' + path;
  }

  function actionLink(href, label, cls) {
    var a = el('a', cls);
    a.href = href;
    a.target = '_blank';
    a.rel = 'noopener';
    a.appendChild(el('span', '', label));
    var icon = el('span');
    icon.style.display = 'inline-flex';
    icon.innerHTML = ARROW;
    a.appendChild(icon);
    return a;
  }

  function buildFigure(project, index, total) {
    var figure = el('figure', 'guide-figure');
    var frame = el('div', 'guide-frame');
    var img = document.createElement('img');
    img.src = assetUrl(project.preview);
    img.alt = (project.title || '') + '的界面预览';
    img.width = 2880;
    img.height = 1800;
    img.loading = 'lazy';
    img.decoding = 'async';
    frame.appendChild(img);
    figure.appendChild(frame);

    var caption = el('figcaption');
    caption.appendChild(el('span', '', pad(index + 1) + ' / ' + pad(total)));
    caption.appendChild(el('span', '', project.preview_note || ''));
    figure.appendChild(caption);
    return figure;
  }

  function buildPair(project) {
    if (!project.audience && !project.usage) return null;
    var pair = el('div', 'guide-pair');
    if (project.audience) {
      var who = el('div');
      who.appendChild(el('h4', '', '适合谁'));
      who.appendChild(el('p', '', project.audience));
      pair.appendChild(who);
    }
    if (project.usage) {
      var how = el('div');
      how.appendChild(el('h4', '', '怎么开始'));
      how.appendChild(el('p', '', project.usage));
      pair.appendChild(how);
    }
    return pair;
  }

  function buildProject(project, index, total) {
    var item = el('article', 'guide-item');
    if (project.slug) item.id = 'guide-' + project.slug;

    var copy = el('div', 'guide-copy');
    var top = el('div', 'guide-top');
    top.appendChild(el('span', 'guide-index', pad(index + 1)));
    top.appendChild(el('span', 'guide-eyebrow', project.en || 'DSH PLUGIN'));
    copy.appendChild(top);

    copy.appendChild(el('h3', '', project.title || ''));
    if (project.tagline) copy.appendChild(el('p', 'guide-lead', project.tagline));
    if (project.description) copy.appendChild(el('p', 'guide-body', project.description));

    var pair = buildPair(project);
    if (pair) copy.appendChild(pair);

    if (project.points && project.points.length) {
      var list = el('ul', 'guide-points');
      project.points.forEach(function (point) {
        list.appendChild(el('li', '', point));
      });
      copy.appendChild(list);
    }

    var meta = el('div', 'guide-meta');
    if (project.tags && project.tags.length) {
      var tags = el('ul', 'guide-tags');
      project.tags.forEach(function (tag) {
        tags.appendChild(el('li', '', tag));
      });
      meta.appendChild(tags);
    }

    var status = [project.status_label, project.year].filter(Boolean).join(' · ');
    if (status) meta.appendChild(el('span', 'guide-status', status));

    var links = project.links || [];
    if (links.length) {
      var primary = links.filter(function (link) {
        return /GitHub/i.test(link.label || '');
      })[0] || links[0];
      meta.appendChild(actionLink(primary.href, primary.label || '查看仓库', 'guide-link'));
    }
    copy.appendChild(meta);

    item.appendChild(buildFigure(project, index, total));
    item.appendChild(copy);
    return item;
  }

  function build(site) {
    var projects = Array.isArray(site.projects) ? site.projects : [];
    if (!projects.length) return null;

    var copy = site.guide || {};
    var text = {
      label: copy.label || FALLBACK.label,
      title_lead: copy.title_lead || FALLBACK.title_lead,
      title_highlight: copy.title_highlight || FALLBACK.title_highlight,
      count: copy.count || FALLBACK.count,
      aside: copy.aside || FALLBACK.aside,
      footer: copy.footer || FALLBACK.footer,
      footer_cta: copy.footer_cta || { label: FALLBACK.footer_cta.label, href: site.github || FALLBACK.footer_cta.href }
    };

    var section = el('section');
    section.id = 'guide';
    section.setAttribute('aria-labelledby', 'guide-title');

    var shell = el('div', 'shell');
    var head = el('header', 'guide-head');

    var headMain = el('div', 'guide-head-main');
    var kicker = el('div', 'guide-kicker');
    kicker.appendChild(el('b', '', 'GUIDE'));
    kicker.appendChild(document.createTextNode(' / ' + text.label));
    headMain.appendChild(kicker);
    var title = el('h2');
    title.id = 'guide-title';
    title.appendChild(document.createTextNode(text.title_lead));
    title.appendChild(el('span', 'soft', text.title_highlight));
    headMain.appendChild(title);
    head.appendChild(headMain);

    var aside = el('aside', 'guide-aside');
    aside.appendChild(el('span', 'count', text.count));
    aside.appendChild(el('p', '', text.aside));
    head.appendChild(aside);
    shell.appendChild(head);

    var items = el('div', 'guide-items');
    projects.forEach(function (project, index) {
      items.appendChild(buildProject(project, index, projects.length));
    });
    shell.appendChild(items);

    var foot = el('div', 'guide-foot');
    foot.appendChild(el('span', '', text.footer));
    foot.appendChild(actionLink(text.footer_cta.href, text.footer_cta.label, 'guide-link'));
    shell.appendChild(foot);

    section.appendChild(shell);
    return section;
  }

  function mount(section) {
    if (document.getElementById('guide')) return true;
    var work = document.getElementById('work');
    if (!work || !work.parentNode) return false;
    work.parentNode.insertBefore(section, work.nextSibling);
    return true;
  }

  function boot() {
    fetch('site.json', { cache: 'no-cache' })
      .then(function (response) {
        if (!response.ok) throw new Error('site.json ' + response.status);
        return response.json();
      })
      .then(function (site) {
        var section = build(site);
        if (!section || mount(section)) return;
        var tries = 0;
        var timer = setInterval(function () {
          tries += 1;
          if (mount(section) || tries > 160) clearInterval(timer);
        }, 250);
      })
      .catch(function () {});
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
