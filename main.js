/* ============ Ricardo · 交互 ============ */

/* ---------- 星空粒子背景（鼠标视差 + 流星）---------- */
(() => {
  const cv = document.getElementById('stars');
  const cx = cv.getContext('2d');
  let W, H, stars = [], shooting = null, mx = 0, my = 0;

  function resize() {
    W = cv.width = innerWidth * devicePixelRatio;
    H = cv.height = innerHeight * devicePixelRatio;
    cv.style.width = innerWidth + 'px';
    cv.style.height = innerHeight + 'px';
    const n = Math.min(220, Math.floor(innerWidth * innerHeight / 9000));
    stars = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      z: Math.random() * 0.8 + 0.2,            // 深度：决定视差强度与大小
      r: (Math.random() * 1.2 + 0.3) * devicePixelRatio,
      tw: Math.random() * Math.PI * 2,          // 闪烁相位
      hue: Math.random() < 0.18 ? 272 : (Math.random() < 0.3 ? 213 : 220), // 少量紫/蓝星
    }));
  }
  addEventListener('resize', resize);
  addEventListener('mousemove', e => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; });

  let t = 0;
  function frame() {
    t += 0.016;
    cx.clearRect(0, 0, W, H);
    for (const s of stars) {
      const px = s.x + mx * 60 * s.z * devicePixelRatio;
      const py = s.y + my * 60 * s.z * devicePixelRatio;
      const a = 0.35 + Math.abs(Math.sin(s.tw + t * (0.6 + s.z))) * 0.65;
      cx.globalAlpha = a * s.z;
      cx.fillStyle = `hsl(${s.hue} 85% 78%)`;
      cx.beginPath();
      cx.arc(px, py, s.r * s.z, 0, 7);
      cx.fill();
    }
    // 流星
    if (!shooting && Math.random() < 0.004) {
      shooting = { x: Math.random() * W * 0.7, y: Math.random() * H * 0.35, len: 0, sp: (9 + Math.random() * 7) * devicePixelRatio, ang: Math.PI / 5 + Math.random() * 0.2, life: 1 };
    }
    if (shooting) {
      const s = shooting;
      s.x += Math.cos(s.ang) * s.sp; s.y += Math.sin(s.ang) * s.sp;
      s.len = Math.min(s.len + s.sp * 1.6, 160 * devicePixelRatio);
      s.life -= 0.012;
      const g = cx.createLinearGradient(s.x, s.y, s.x - Math.cos(s.ang) * s.len, s.y - Math.sin(s.ang) * s.len);
      g.addColorStop(0, `rgba(190,160,255,${Math.max(s.life, 0)})`);
      g.addColorStop(1, 'rgba(190,160,255,0)');
      cx.strokeStyle = g; cx.lineWidth = 2 * devicePixelRatio;
      cx.beginPath(); cx.moveTo(s.x, s.y);
      cx.lineTo(s.x - Math.cos(s.ang) * s.len, s.y - Math.sin(s.ang) * s.len);
      cx.stroke();
      if (s.life <= 0 || s.x > W || s.y > H) shooting = null;
    }
    cx.globalAlpha = 1;
    requestAnimationFrame(frame);
  }
  resize(); frame();
})();

/* ---------- 打字机 ---------- */
(() => {
  const el = document.getElementById('typed');
  const lines = ['Software Developer', 'AI 工具与插件开发', 'Building cool stuff with code ✨'];
  let li = 0, ci = 0, del = false;
  function tick() {
    const line = lines[li];
    el.textContent = del ? line.slice(0, --ci) : line.slice(0, ++ci);
    let d = del ? 40 : 95;
    if (!del && ci === line.length) { d = 2000; del = true; }
    else if (del && ci === 0) { del = false; li = (li + 1) % lines.length; d = 350; }
    setTimeout(tick, d);
  }
  tick();
})();

/* ---------- 导航滚动态 ---------- */
addEventListener('scroll', () => {
  document.getElementById('nav').classList.toggle('scrolled', scrollY > 30);
}, { passive: true });

/* ---------- 滚动显现 ---------- */
(() => {
  const io = new IntersectionObserver(es => {
    es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach((el, i) => {
    el.style.transitionDelay = `${(i % 4) * 90}ms`;
    io.observe(el);
  });
})();

/* ---------- 项目卡片：3D 倾斜 + 跟随光晕 ---------- */
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `perspective(800px) rotateY(${x * 9}deg) rotateX(${-y * 9}deg) translateY(-4px)`;
    card.style.setProperty('--mx', `${(x + 0.5) * 100}%`);
    card.style.setProperty('--my', `${(y + 0.5) * 100}%`);
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});

/* ---------- 霓虹自定义光标 ---------- */
(() => {
  if (!matchMedia('(pointer: fine)').matches) return;
  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  let dx = 0, dy = 0, rx = 0, ry = 0;
  addEventListener('mousemove', e => { dx = e.clientX; dy = e.clientY; });
  (function loop() {
    rx += (dx - rx) * 0.16; ry += (dy - ry) * 0.16;
    dot.style.transform = `translate(${dx - 3}px, ${dy - 3}px)`;
    ring.style.transform = `translate(${rx - 17}px, ${ry - 17}px)`;
    requestAnimationFrame(loop);
  })();
  document.querySelectorAll('a, button, .card').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('active'));
    el.addEventListener('mouseleave', () => ring.classList.remove('active'));
  });
})();
