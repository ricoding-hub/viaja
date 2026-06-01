/* ============================================================
   SHARED COMPONENTS  (exported to window)
   ============================================================ */
const { useState, useEffect, useRef } = React;

/* ---------- money / format ---------- */
const fmt = (n) => '$' + Math.round(n).toLocaleString('es-MX');
const fmtK = (n) => n >= 1000 ? '$' + (n/1000).toFixed(n%1000===0?0:1) + 'k' : '$' + n;

/* ---------- ICONS ---------- */
function Icon({ name, size = 24, stroke = 2, color = 'currentColor', fill = 'none' }) {
  const p = {
    home:   <path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10" />,
    compass:<><circle cx="12" cy="12" r="9"/><path d="M16 8l-2 6-6 2 2-6 6-2z"/></>,
    wallet: <><rect x="3" y="6" width="18" height="14" rx="3"/><path d="M3 10h18M17 14h.01"/></>,
    layers: <><path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/></>,
    inbox:  <><path d="M4 4h16v16H4z" rx="3"/><path d="M4 13h4l2 3h4l2-3h4"/></>,
    calendar:<><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 9h18M8 3v4M16 3v4"/></>,
    users:  <><circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-5 6-5s6 1.7 6 5"/><path d="M16 5.2A3.2 3.2 0 0119 11M21 20c0-2.4-1.2-4-3-4.6"/></>,
    plus:   <path d="M12 5v14M5 12h14"/>,
    bed:    <><path d="M3 18v-6a2 2 0 012-2h9a3 3 0 013 3v5M3 14h18M3 18v2M21 16v4"/><circle cx="7.5" cy="11.5" r="1.6"/></>,
    plane:  <path d="M10.5 2.5L12 9l8 4-8 1.5L11 21l-2-5-5-2 5-1.5 1.5-9z" />,
    star:   <path d="M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17.2 6.1 20.3l1.3-6.5L2.5 9.3l6.6-.8L12 2.5z"/>,
    food:   <><path d="M5 3v8a2 2 0 002 2v8M7 3v6M9 3v6M9 3v8"/><path d="M16 3c-1.6 0-2.5 2-2.5 5s.9 4 2.5 4v8"/></>,
    pin:    <><path d="M12 21s-7-6-7-11a7 7 0 0114 0c0 5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></>,
    link:   <path d="M9 15l6-6M10 6l1-1a4 4 0 016 6l-1 1M14 18l-1 1a4 4 0 01-6-6l1-1"/>,
    note:   <><rect x="4" y="3" width="16" height="18" rx="3"/><path d="M8 8h8M8 12h8M8 16h5"/></>,
    music:  <><circle cx="6" cy="18" r="2.6"/><circle cx="17" cy="16" r="2.6"/><path d="M8.6 18V7l11-2v9"/></>,
    heart:  <path d="M12 20S4 14.5 4 9.2A4.2 4.2 0 0112 6a4.2 4.2 0 018 3.2C20 14.5 12 20 12 20z"/>,
    check:  <path d="M5 12l4.5 4.5L19 7"/>,
    chevR:  <path d="M9 6l6 6-6 6"/>,
    chevL:  <path d="M15 6l-6 6 6 6"/>,
    chevD:  <path d="M6 9l6 6 6-6"/>,
    share:  <><circle cx="6" cy="12" r="2.4"/><circle cx="17" cy="6" r="2.4"/><circle cx="17" cy="18" r="2.4"/><path d="M8.2 11L15 7M8.2 13L15 17"/></>,
    sparkle:<path d="M12 3l1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6L12 3z"/>,
    sun:    <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19"/></>,
    close:  <path d="M6 6l12 12M18 6L6 18"/>,
    edit:   <path d="M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4"/>,
    bell:   <path d="M6 16V10a6 6 0 0112 0v6l2 2H4l2-2zM10 21h4"/>,
    trophy: <><path d="M7 4h10v4a5 5 0 01-10 0V4z"/><path d="M7 6H4v1a3 3 0 003 3M17 6h3v1a3 3 0 01-3 3M9 16h6M8 20h8M12 13v3"/></>,
    flame:  <path d="M12 3c1 3-2 4-2 7a2 2 0 004 0c0-1 0-1.5-.3-2 1.6 1 2.3 2.7 2.3 4.5A6 6 0 116 13c0-2 1-3 2-4 1.5 1 2 .5 2-1 0-2 1-4 2-5z"/>,
    ticket: <><path d="M4 7a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 000 6v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2a2 2 0 000-6V7z"/><path d="M14 5v14" strokeDasharray="2 2"/></>,
  }[name] || null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color}
      strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" className="ic">
      {p}
    </svg>
  );
}

/* ---------- PHOTO PLACEHOLDER (gradient, non-fillable) ---------- */
function Photo({ tone = '', emoji, label, h = 150, r, style = {}, children }) {
  const cls = tone ? `ph ph-${tone}` : 'ph';
  return (
    <div className={cls} style={{ height:h, borderRadius:r, ...style }}>
      {emoji && <div className="ph-emoji floaty">{emoji}</div>}
      {label && <div className="ph-label">▦ {label}</div>}
      {children}
    </div>
  );
}

/* ---------- tropical gradient as an SVG data-URI (image-slot fallback) ---------- */
function gradSrc(tone = '') {
  const map = {
    '':       ['#9fe9e0','#16b6c9','#0e8aa6'],
    pool:     ['#bdeefb','#3ec5e8','#1d8fd1'],
    sunset:   ['#ffd27a','#ff8a5b','#ff5e7e'],
    palm:     ['#b6ecc0','#2fbf8f','#0f8a86'],
    grape:    ['#d6c8ff','#9b7cf0','#6a52d8'],
    coral:    ['#ffd0c2','#ff8064','#ef5a55'],
    night:    ['#3a4d7a','#6a5acd','#c86fb0'],
  };
  const c = map[tone] || map[''];
  const svg = "<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'>"
    + "<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>"
    + `<stop offset='0' stop-color='${c[0]}'/><stop offset='0.55' stop-color='${c[1]}'/><stop offset='1' stop-color='${c[2]}'/>`
    + "</linearGradient><radialGradient id='s' cx='0.82' cy='0.14' r='0.55'>"
    + "<stop offset='0' stop-color='#ffd278' stop-opacity='0.85'/><stop offset='1' stop-color='#ffd278' stop-opacity='0'/>"
    + "</radialGradient></defs>"
    + "<rect width='400' height='300' fill='url(#g)'/><rect width='400' height='300' fill='url(#s)'/></svg>";
  return "data:image/svg+xml," + encodeURIComponent(svg);
}

/* ---------- PHOTO SLOT — user drops a real photo, persists; gradient fallback ---------- */
function PhotoSlot({ id, tone = '', h = 150, r = 0, style = {}, placeholder = 'Arrastra una foto 📷', children }) {
  return (
    <div style={{ position:'relative', height:h, borderRadius:r, overflow:'hidden', ...style }}>
      <image-slot id={id} src={gradSrc(tone)} shape="rect" placeholder={placeholder}
        style={{ position:'absolute', inset:0, width:'100%', height:'100%' }}></image-slot>
      {children && <div style={{ position:'absolute', inset:0, pointerEvents:'none' }}>{children}</div>}
    </div>
  );
}

/* ---------- AVATAR ---------- */
function Av({ p, size = 30 }) {
  return (
    <div className="av" title={p.name}
      style={{ width:size, height:size, background:p.color, fontSize:size*0.4 }}>
      {p.initials}
    </div>
  );
}
function AvStack({ people, size = 28, max = 5 }) {
  const show = people.slice(0, max);
  return (
    <div className="av-stack">
      {show.map(p => <Av key={p.id} p={p} size={size} />)}
    </div>
  );
}

/* ---------- STARS ---------- */
function Stars({ value = 0, onRate, size = 22, readOnly = false }) {
  const [pop, setPop] = useState(-1);
  return (
    <div className="stars" onMouseLeave={() => {}}>
      {[1,2,3,4,5].map(n => {
        const on = n <= value;
        return (
          <span key={n} className={'star' + (pop===n ? ' pop':'')}
            onClick={readOnly ? undefined : (e) => { e.stopPropagation(); setPop(n); onRate && onRate(n); setTimeout(()=>setPop(-1),420); }}
            style={{ cursor: readOnly ? 'default':'pointer' }}>
            <Icon name="star" size={size} stroke={1.5}
              color={on ? '#FFB43E' : '#E2D8C8'} fill={on ? '#FFB43E' : '#F2EADD'} />
          </span>
        );
      })}
    </div>
  );
}

/* aggregate rating helper */
function avg(votes) {
  const v = Object.values(votes || {});
  if (!v.length) return 0;
  return v.reduce((a,b)=>a+b,0) / v.length;
}

/* ---------- METER ---------- */
function Meter({ pct, color = 'var(--turq)', h = 10 }) {
  return (
    <div className="meter" style={{ height:h }}>
      <i style={{ width: Math.min(100,Math.max(0,pct))+'%', background:color }} />
    </div>
  );
}

/* ---------- RING (donut progress) ---------- */
function Ring({ pct, size = 64, sw = 8, color = 'var(--turq)', track = '#EFE6D7', children }) {
  const r = (size - sw)/2, c = 2*Math.PI*r;
  const off = c - (Math.min(100,pct)/100)*c;
  return (
    <div style={{ position:'relative', width:size, height:size }}>
      <svg width={size} height={size} className="ring">
        <circle cx={size/2} cy={size/2} r={r} stroke={track} strokeWidth={sw} fill="none" />
        <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={sw} fill="none"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off} />
      </svg>
      <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column' }}>
        {children}
      </div>
    </div>
  );
}

/* ---------- CONFETTI burst ---------- */
function Confetti({ show }) {
  if (!show) return null;
  const colors = ['#11BFB2','#FF6F5C','#FFB43E','#7C6CF0','#0E8AA6'];
  const pcs = Array.from({ length: 36 }, (_, i) => ({
    left: Math.random()*100,
    bg: colors[i % colors.length],
    delay: Math.random()*0.3,
    dur: 1.1 + Math.random()*0.7,
    rot: Math.random()*360,
  }));
  return (
    <div className="confetti-wrap">
      {pcs.map((c,i) => (
        <div key={i} className="confetti-pc" style={{
          left: c.left+'%', background:c.bg,
          animationDelay: c.delay+'s', animationDuration: c.dur+'s',
          transform:`rotate(${c.rot}deg)`,
          borderRadius: i%3===0 ? '50%' : '2px',
        }} />
      ))}
    </div>
  );
}

/* ---------- animated count-up number ---------- */
function Count({ value, prefix = '', dur = 700, cls = '' }) {
  const [n, setN] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    const start = performance.now(); const a = from.current, b = value;
    let raf;
    const tick = (t) => {
      const k = Math.min(1, (t-start)/dur);
      const e = 1-Math.pow(1-k,3);
      setN(a + (b-a)*e);
      if (k<1) raf = requestAnimationFrame(tick); else from.current = b;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <span className={cls + ' tnum'}>{prefix}{Math.round(n).toLocaleString('es-MX')}</span>;
}

/* ---------- bottom sheet ---------- */
function Sheet({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="sheet-bg" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-grab" />
        {children}
      </div>
    </div>
  );
}

/* ---------- source-type glyph for research ---------- */
function SourceGlyph({ type }) {
  const map = { tiktok:['music','#FF6F5C'], flight:['plane','#7C6CF0'], link:['link','#11BFB2'], note:['note','#FFB43E'] };
  const [ic, col] = map[type] || ['link','#11BFB2'];
  return (
    <div style={{ width:34, height:34, borderRadius:11, background:col+'22',
      display:'flex', alignItems:'center', justifyContent:'center', flex:'none' }}>
      <Icon name={ic} size={18} color={col} stroke={2.2} />
    </div>
  );
}

Object.assign(window, {
  fmt, fmtK, Icon, Photo, gradSrc, PhotoSlot, Av, AvStack, Stars, avg, Meter, Ring, Confetti, Count, Sheet, SourceGlyph,
});
