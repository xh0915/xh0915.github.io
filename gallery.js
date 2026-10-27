(function () {
  'use strict';

  if (window.__guideReady) return;
  window.__guideReady = true;

  var ARROW =
    '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5.5 10.5 10.5 5.5M6.5 5.5h4v4"/></svg>';
  var CHEVRON =
    '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.5 4.5 6 8l3.5-3.5"/></svg>';
  var CROSS =
    '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M2.5 2.5l7 7M9.5 2.5l-7 7"/></svg>';
  var REFRESH =
    '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12.8 8a4.8 4.8 0 1 1-1.4-3.4"/><path d="M12.8 2.6v2.2h-2.2"/></svg>';

  var FALLBACK = {
    label: '作品图鉴',
    title_lead: '四款插件，',
    title_highlight: '逐段看清。',
    count: '04 IN DEPTH · 2026',
    aside: '点开任意一款，看大图、做法与适用场景。四款都开源，仓库里有完整说明和真实测试。',
    footer: 'ALL SOURCE ON GITHUB',
    footer_cta: { label: '去 GitHub 看全部源码', href: 'https://github.com/xh0915' }
  };

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  function icon(cls, markup) {
    var span = el('span', cls);
    span.innerHTML = markup;
    return span;
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
    a.appendChild(icon('', ARROW));
    return a;
  }

  function previewImage(project, withAlt) {
    var img = document.createElement('img');
    img.src = assetUrl(project.preview);
    img.alt = withAlt ? (project.title || '') + '的界面预览' : '';
    img.width = 2880;
    img.height = 1800;
    img.loading = 'lazy';
    img.decoding = 'async';
    return img;
  }

  function setZoomData(button, project, index, total) {
    button.setAttribute('data-src', assetUrl(project.preview));
    button.setAttribute('data-title', project.title || '');
    button.setAttribute('data-note', project.preview_note || '');
    button.setAttribute('data-index', pad(index + 1) + ' / ' + pad(total));
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

  function buildCopy(project) {
    var copy = el('div', 'guide-copy');
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
    return copy;
  }

  function buildItem(project, index, total) {
    var item = el('article', 'guide-item');
    if (project.slug) item.id = 'guide-' + project.slug;

    var row = el('div', 'guide-row');

    var thumb = el('button', 'guide-thumb');
    thumb.type = 'button';
    thumb.setAttribute('aria-label', '放大查看' + (project.title || '') + '的界面预览');
    thumb.setAttribute('data-guide-zoom', '');
    setZoomData(thumb, project, index, total);
    thumb.appendChild(previewImage(project, false));
    row.appendChild(thumb);

    var panelId = 'guide-panel-' + (project.slug || index + 1);
    var summary = el('button', 'guide-summary');
    summary.type = 'button';
    summary.setAttribute('aria-expanded', 'false');
    summary.setAttribute('aria-controls', panelId);
    summary.appendChild(el('span', 'guide-num', pad(index + 1)));

    var text = el('span', 'guide-summary-text');
    text.appendChild(el('span', 'guide-eyebrow', project.en || 'DSH PLUGIN'));
    text.appendChild(el('span', 'guide-summary-title', project.title || ''));
    if (project.tagline) text.appendChild(el('span', 'guide-summary-lead', project.tagline));
    summary.appendChild(text);

    var hint = el('span', 'guide-toggle-hint');
    hint.appendChild(el('span', 'guide-toggle-label', '展开详情'));
    hint.appendChild(icon('', CHEVRON));
    summary.appendChild(hint);
    row.appendChild(summary);
    item.appendChild(row);

    var panel = el('div', 'guide-panel');
    panel.id = panelId;
    panel.setAttribute('aria-hidden', 'true');
    var inner = el('div', 'guide-panel-inner');
    var detail = el('div', 'guide-detail');

    var figure = el('figure', 'guide-figure');
    var large = el('button', 'guide-zoom-large');
    large.type = 'button';
    large.setAttribute('aria-label', '放大查看' + (project.title || '') + '的界面预览');
    large.setAttribute('data-guide-zoom', '');
    setZoomData(large, project, index, total);
    large.appendChild(previewImage(project, true));
    figure.appendChild(large);

    var caption = el('figcaption');
    caption.appendChild(el('span', '', pad(index + 1) + ' / ' + pad(total)));
    caption.appendChild(el('span', '', project.preview_note || ''));
    figure.appendChild(caption);

    detail.appendChild(figure);
    detail.appendChild(buildCopy(project));
    inner.appendChild(detail);
    panel.appendChild(inner);
    item.appendChild(panel);

    if ('inert' in panel) panel.inert = true;
    return item;
  }

  function setOpen(item, open) {
    var summary = item.querySelector('.guide-summary');
    var panel = item.querySelector('.guide-panel');
    var label = item.querySelector('.guide-toggle-label');
    item.classList.toggle('is-open', open);
    if (summary) summary.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (label) label.textContent = open ? '收起' : '展开详情';
    if (panel) {
      panel.setAttribute('aria-hidden', open ? 'false' : 'true');
      if ('inert' in panel) panel.inert = !open;
    }
  }

  var lightbox = null;

  function ensureLightbox() {
    if (lightbox) return lightbox;
    var dialog = document.createElement('dialog');
    dialog.id = 'guide-lightbox';
    dialog.setAttribute('aria-label', '作品预览大图');

    var inner = el('div', 'guide-lightbox-inner');
    var img = document.createElement('img');
    img.alt = '';
    inner.appendChild(img);

    var bar = el('div', 'guide-lightbox-bar');
    var raw = el('a', 'guide-lightbox-raw', '查看原图');
    raw.target = '_blank';
    raw.rel = 'noopener';
    var close = el('button', 'guide-lightbox-close');
    close.type = 'button';
    close.setAttribute('aria-label', '关闭预览');
    close.appendChild(icon('', CROSS));
    bar.appendChild(raw);
    bar.appendChild(close);

    var caption = el('p', 'guide-lightbox-caption');

    dialog.appendChild(inner);
    dialog.appendChild(bar);
    dialog.appendChild(caption);
    document.body.appendChild(dialog);

    close.addEventListener('click', function () {
      dialog.close();
    });
    inner.addEventListener('click', function (event) {
      if (event.target === inner) dialog.close();
    });
    dialog.addEventListener('close', function () {
      img.removeAttribute('src');
    });

    lightbox = dialog;
    return dialog;
  }

  function openLightbox(button) {
    var dialog = ensureLightbox();
    var img = dialog.querySelector('.guide-lightbox-inner img');
    var raw = dialog.querySelector('.guide-lightbox-raw');
    var caption = dialog.querySelector('.guide-lightbox-caption');
    var src = button.getAttribute('data-src');
    img.src = src;
    img.alt = (button.getAttribute('data-title') || '') + '的界面预览';
    raw.href = src;
    caption.textContent = [
      button.getAttribute('data-index'),
      button.getAttribute('data-note')
    ].filter(Boolean).join(' · ');
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    var close = dialog.querySelector('.guide-lightbox-close');
    if (close) close.focus({ preventScroll: true });
  }

  function bindToggle(section) {
    section.addEventListener('click', function (event) {
      var zoom = event.target.closest('[data-guide-zoom]');
      if (zoom) {
        event.preventDefault();
        openLightbox(zoom);
        return;
      }
      var summary = event.target.closest('.guide-summary');
      if (!summary) return;
      var item = summary.closest('.guide-item');
      if (!item) return;
      var isOpen = item.classList.contains('is-open');
      Array.prototype.forEach.call(
        section.querySelectorAll('.guide-item.is-open'),
        function (other) {
          if (other !== item) setOpen(other, false);
        }
      );
      setOpen(item, !isOpen);
    });
  }

  function openFromHash(section) {
    var hash = window.location.hash || '';
    if (hash.indexOf('#guide-') !== 0) return;
    var target = document.getElementById(hash.slice(1));
    if (target && target.classList.contains('guide-item')) setOpen(target, true);
  }

  /* ---- sonar scan presentation ---- */

  var scanUI = null;
  var scanState = { busy: false, count: 0, trigger: null, showTimer: 0, autoTimer: 0 };

  function pad3(n) {
    return ('00' + n).slice(-3);
  }

  function prefersReduced() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  function signalsFromGuide() {
    var items = document.querySelectorAll('#guide .guide-item');
    return Array.prototype.map
      .call(items, function (item) {
        var title = item.querySelector('.guide-summary-title');
        var en = item.querySelector('.guide-eyebrow');
        return {
          slug: (item.id || '').replace(/^guide-/, ''),
          title: title ? title.textContent : '',
          en: en ? en.textContent : ''
        };
      })
      .filter(function (signal) {
        return signal.slug;
      });
  }

  function ensureScanUI() {
    if (scanUI) return scanUI;

    var scrim = el('div');
    scrim.id = 'scan-scrim';

    var report = el('div', 'scan-report');
    report.setAttribute('role', 'dialog');
    report.setAttribute('aria-modal', 'true');
    report.setAttribute('aria-labelledby', 'scan-report-title');
    report.setAttribute('aria-hidden', 'true');

    var head = el('div', 'scan-report-head');
    head.appendChild(el('span', 'scan-report-kicker', 'SONAR REPORT · 周围海域'));
    var close = el('button', 'scan-report-close');
    close.type = 'button';
    close.setAttribute('aria-label', '关闭扫描结果');
    close.appendChild(icon('', CROSS));
    head.appendChild(close);

    var title = el('h3');
    title.id = 'scan-report-title';
    var sub = el('p', 'scan-report-sub');
    var list = el('ol', 'scan-signals');
    var foot = el('div', 'scan-report-foot');
    var stamp = el('span');
    var tools = el('span', 'scan-report-tools');
    var again = el('button', 'scan-report-again');
    again.type = 'button';
    again.appendChild(icon('scan-report-again-icon', REFRESH));
    again.appendChild(document.createTextNode('再扫一次'));
    tools.appendChild(again);
    var esc = el('span', 'scan-esc');
    esc.appendChild(el('kbd', 'scan-kbd', 'ESC'));
    esc.appendChild(document.createTextNode('关闭'));
    tools.appendChild(esc);
    foot.appendChild(stamp);
    foot.appendChild(tools);

    report.appendChild(head);
    report.appendChild(title);
    report.appendChild(sub);
    report.appendChild(list);
    report.appendChild(foot);
    document.body.appendChild(scrim);
    document.body.appendChild(report);
    if ('inert' in report) report.inert = true;

    close.addEventListener('click', closeScan);
    scrim.addEventListener('click', closeScan);
    again.addEventListener('click', function () {
      var trigger = scanState.trigger;
      closeScan();
      window.setTimeout(function () {
        if (trigger && trigger.isConnected) openScan(trigger);
      }, 140);
    });

    scanUI = { scrim: scrim, report: report, close: close, title: title, sub: sub, list: list, stamp: stamp };
    return scanUI;
  }

  function fillScanReport(ui) {
    var signals = signalsFromGuide();
    var count = signals.length;

    ui.title.textContent = '';
    if (count) {
      ui.title.appendChild(document.createTextNode('捕获 '));
      ui.title.appendChild(el('b', '', pad(count)));
      ui.title.appendChild(document.createTextNode(' 个作品信号'));
      ui.sub.textContent = '每一道回波都是一款已经下水的插件。点一个，图鉴会展开它的全部细节。';
    } else {
      ui.title.appendChild(document.createTextNode('这片海域暂时安静'));
      ui.sub.textContent = '作品图鉴还没挂上浮标，稍后再扫一次。';
    }

    ui.list.textContent = '';
    signals.forEach(function (signal, index) {
      var li = el('li');
      li.style.setProperty('--scan-i', index);
      var button = el('button');
      button.type = 'button';
      button.setAttribute('data-scan-jump', signal.slug);
      button.appendChild(el('span', 'scan-signal-num', pad(index + 1)));
      var text = el('span');
      text.appendChild(el('span', 'scan-signal-title', signal.title || signal.slug));
      if (signal.en) text.appendChild(el('span', 'scan-signal-meta', signal.en));
      button.appendChild(text);
      button.appendChild(icon('scan-signal-arrow', ARROW));
      li.appendChild(button);
      ui.list.appendChild(li);
    });

    ui.stamp.textContent =
      'SWEEP ' + pad3(scanState.count) + ' · ' + pad(count) + (count === 1 ? ' SIGNAL' : ' SIGNALS');
  }

  function paintScan(cx, cy) {
    var layer = el('div');
    layer.id = 'scan-layer';
    layer.setAttribute('aria-hidden', 'true');
    layer.style.setProperty('--scan-x', cx + 'px');
    layer.style.setProperty('--scan-y', cy + 'px');

    layer.appendChild(el('span', 'scan-veil'));
    layer.appendChild(el('span', 'scan-contact'));

    var disc = el('div', 'scan-disc');
    disc.style.left = cx + 'px';
    disc.style.top = cy + 'px';
    var stage = el('div', 'scan-disc-stage');
    stage.appendChild(el('span', 'scan-disc-fill'));
    stage.appendChild(el('span', 'scan-disc-ticks'));
    stage.appendChild(el('span', 'scan-grid scan-grid--outer'));
    stage.appendChild(el('span', 'scan-grid scan-grid--mid'));
    stage.appendChild(el('span', 'scan-grid scan-grid--inner'));
    stage.appendChild(el('span', 'scan-beam'));
    stage.appendChild(el('span', 'scan-core'));

    var signals = signalsFromGuide();
    var base = (scanState.count % 4) * 16 - 24;
    var passes = [0.34, 0.64, 0.96, 1.3];
    var factors = [0.62, 0.86, 0.68, 0.46];
    Array.prototype.forEach.call(passes, function (time, index) {
      var deg = -24 + ((time - 0.06) / 1.9) * 360 + base;
      var rad = ((deg - 90) * Math.PI) / 180;
      var blip = el('span', 'scan-blip');
      blip.style.left = 50 + Math.cos(rad) * factors[index] * 50 + '%';
      blip.style.top = 50 + Math.sin(rad) * factors[index] * 50 + '%';
      blip.style.animationDelay = time + 's';
      var halo = el('span', 'scan-blip-halo');
      halo.style.animationDelay = time + 's';
      blip.appendChild(halo);
      blip.appendChild(el('span', 'scan-blip-dot'));
      var label = el('span', 'scan-blip-label');
      label.appendChild(el('b', '', 'S-' + pad(index + 1)));
      var name = signals[index] && signals[index].title ? signals[index].title : '信号 ' + pad(index + 1);
      label.appendChild(el('span', '', name));
      blip.appendChild(label);
      stage.appendChild(blip);
    });

    disc.appendChild(stage);
    layer.appendChild(disc);
    document.body.appendChild(layer);
    window.setTimeout(function () {
      if (layer.parentNode) layer.parentNode.removeChild(layer);
    }, 3400);
  }

  function openScan(trigger) {
    if (scanState.busy) return;
    scanState.busy = true;
    scanState.count += 1;
    scanState.trigger = trigger;

    var ui = ensureScanUI();
    fillScanReport(ui);
    var rect = trigger.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;
    ui.scrim.style.setProperty('--scan-x', cx + 'px');
    ui.scrim.style.setProperty('--scan-y', cy + 'px');
    if (!prefersReduced()) paintScan(cx, cy);

    window.clearTimeout(scanState.showTimer);
    scanState.showTimer = window.setTimeout(
      function () {
        lockScroll();
        if ('inert' in ui.report) ui.report.inert = false;
        ui.report.setAttribute('aria-hidden', 'false');
        ui.scrim.classList.add('is-open');
        ui.report.classList.add('is-open');
        ui.close.focus({ preventScroll: true });
        window.clearTimeout(scanState.autoTimer);
        scanState.autoTimer = window.setTimeout(closeScan, 20000);
      },
      prefersReduced() ? 0 : 880
    );
  }

  function lockScroll() {
    var root = document.documentElement;
    var width = window.innerWidth - root.clientWidth;
    root.style.setProperty('--scan-sbw', (width > 0 ? width : 0) + 'px');
    root.classList.add('scan-lock');
  }

  function unlockScroll() {
    var root = document.documentElement;
    if (!root.classList.contains('scan-lock')) return;
    root.classList.remove('scan-lock');
    root.style.removeProperty('--scan-sbw');
  }

  function closeScan() {
    window.clearTimeout(scanState.showTimer);
    window.clearTimeout(scanState.autoTimer);
    scanState.busy = false;
    unlockScroll();
    if (!scanUI) return;
    scanUI.scrim.classList.remove('is-open');
    scanUI.report.classList.remove('is-open');
    scanUI.report.setAttribute('aria-hidden', 'true');
    if ('inert' in scanUI.report) scanUI.report.inert = true;
    var trigger = scanState.trigger;
    if (trigger && trigger.isConnected && typeof trigger.focus === 'function') {
      trigger.focus({ preventScroll: true });
    }
  }

  function trapScanFocus(event) {
    if (!scanUI || !scanUI.report.classList.contains('is-open')) return;
    var focusables = scanUI.report.querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])');
    if (!focusables.length) return;
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    var active = document.activeElement;
    var inside = scanUI.report.contains(active);
    if (event.shiftKey) {
      if (!inside || active === first) {
        event.preventDefault();
        last.focus();
      }
    } else if (!inside || active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function jumpToSignal(slug) {
    var item = document.getElementById('guide-' + slug);
    closeScan();
    if (!item) {
      var section = document.getElementById('guide');
      if (section) section.scrollIntoView({ behavior: prefersReduced() ? 'auto' : 'smooth', block: 'start' });
      return;
    }
    Array.prototype.forEach.call(
      document.querySelectorAll('#guide .guide-item.is-open'),
      function (other) {
        if (other !== item) setOpen(other, false);
      }
    );
    setOpen(item, true);
    item.scrollIntoView({ behavior: prefersReduced() ? 'auto' : 'smooth', block: 'start' });
    item.classList.remove('is-flash');
    void item.offsetWidth;
    item.classList.add('is-flash');
    window.setTimeout(function () {
      item.classList.remove('is-flash');
    }, 2000);
  }

  function bindScan() {
    if (window.__scanReady) return;
    window.__scanReady = true;

    document.addEventListener(
      'click',
      function (event) {
        var target = event.target;
        if (!target || !target.closest) return;

        var jump = target.closest('[data-scan-jump]');
        if (jump) {
          event.preventDefault();
          jumpToSignal(jump.getAttribute('data-scan-jump'));
          return;
        }

        var button = target.closest('button');
        if (!button) return;
        if (button.classList.contains('dock-radar') || /扫描周围海域/.test(button.textContent || '')) {
          openScan(button);
        }
      },
      true
    );

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && scanState.busy) {
        closeScan();
        return;
      }
      if (event.key === 'Tab') trapScanFocus(event);
    });
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
      footer_cta: copy.footer_cta || {
        label: FALLBACK.footer_cta.label,
        href: site.github || FALLBACK.footer_cta.href
      }
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
      items.appendChild(buildItem(project, index, projects.length));
    });
    shell.appendChild(items);

    var foot = el('div', 'guide-foot');
    foot.appendChild(el('span', '', text.footer));
    foot.appendChild(actionLink(text.footer_cta.href, text.footer_cta.label, 'guide-link'));
    shell.appendChild(foot);

    section.appendChild(shell);
    bindToggle(section);
    return section;
  }

  function mount(section) {
    if (document.getElementById('guide')) return true;
    var work = document.getElementById('work');
    if (!work || !work.parentNode) return false;
    work.parentNode.insertBefore(section, work.nextSibling);
    openFromHash(section);
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
    document.addEventListener('DOMContentLoaded', function () {
      bindScan();
      boot();
    });
  } else {
    bindScan();
    boot();
  }
})();
