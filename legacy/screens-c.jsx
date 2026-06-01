/* ============================================================
   SCREENS C — Crear viaje (wizard), Invitar, Modo invitado, Empty states
   ============================================================ */
const { useState: useStateC, useEffect: useEffectC, useMemo: useMemoC } = React;

/* ---------------- EMPTY STATE ---------------- */
function EmptyState({ emoji, title, sub, cta, onCta, disabled }) {
  return (
    <div className="col center" style={{ padding:'36px 24px', textAlign:'center', gap:4 }}>
      <div style={{ fontSize:52, marginBottom:6 }} className="floaty">{emoji}</div>
      <div className="display" style={{ fontSize:19, lineHeight:1.15 }}>{title}</div>
      <div className="muted" style={{ fontSize:13.5, fontWeight:600, maxWidth:240, lineHeight:1.4 }}>{sub}</div>
      {cta && !disabled && <button className="btn btn-coral btn-sm" style={{ marginTop:14 }} onClick={onCta}>{cta}</button>}
    </div>
  );
}

/* ---------------- GUEST BANNER ---------------- */
function GuestBanner({ person }) {
  return (
    <div style={{ margin:'0 18px 6px', background:'linear-gradient(120deg,#EAE6FD,#E7F0FF)',
      border:'1px solid #DAD2F7', borderRadius:16, padding:'10px 13px', display:'flex', gap:10, alignItems:'center' }}>
      <Av p={person} size={30} />
      <div className="grow" style={{ fontSize:12.5, fontWeight:600, color:'#4b3fae', lineHeight:1.3 }}>
        Estás viendo como <b>{person.name}</b> · puedes votar ⭐ pero no decidir
      </div>
    </div>
  );
}

/* ---------------- VIEWER SWITCH (modo invitado demo) ---------------- */
function ViewerChip({ person, onClick, dark }) {
  return (
    <button onClick={onClick} style={{ border:0, cursor:'pointer',
      background: dark ? 'rgba(255,255,255,.85)' : '#fff', backdropFilter:'blur(6px)',
      borderRadius:99, padding:'5px 11px 5px 5px', display:'flex', alignItems:'center', gap:7,
      boxShadow:'var(--sh-sm)' }}>
      <Av p={person} size={26} />
      <span style={{ fontFamily:'var(--font-d)', fontWeight:700, fontSize:12.5, color:'var(--ink)' }}>
        {person.host ? 'Anfitrión' : 'Invitado'}
      </span>
      <Icon name="chevD" size={14} color="var(--ink-soft)" />
    </button>
  );
}

function ViewerSwitch({ open, people, viewer, onPick, onClose }) {
  return (
    <Sheet open={open} onClose={onClose}>
      <h2 className="display" style={{ fontSize:21, marginBottom:3 }}>Ver la app como…</h2>
      <div className="muted" style={{ fontSize:13, fontWeight:600, marginBottom:16 }}>
        Prueba la experiencia de cada quien. Los anfitriones deciden; los invitados votan.
      </div>
      <div className="col gap10">
        {people.map(p => (
          <button key={p.id} onClick={() => { onPick(p.id); onClose(); }} className="card"
            style={{ padding:12, display:'flex', gap:12, alignItems:'center', cursor:'pointer',
              border: viewer===p.id ? '1.5px solid var(--turq)' : '1px solid var(--line)' }}>
            <Av p={p} size={42} />
            <div className="grow" style={{ textAlign:'left' }}>
              <div className="display" style={{ fontSize:15.5 }}>{p.name}</div>
              <div className="muted" style={{ fontSize:12, fontWeight:600 }}>{p.host ? 'Anfitrión · control total' : 'Invitado · ve y vota'}</div>
            </div>
            {viewer===p.id
              ? <div style={{ width:26, height:26, borderRadius:99, background:'var(--turq)', display:'flex', alignItems:'center', justifyContent:'center' }}><Icon name="check" size={15} color="#fff" stroke={2.6} /></div>
              : <span className="tag" style={{ background: p.host?'var(--turq-soft)':'var(--grape-soft)', color: p.host?'var(--turq-deep)':'#5547C9' }}>{p.host?'Decide':'Vota'}</span>}
          </button>
        ))}
      </div>
    </Sheet>
  );
}

/* ---------------- INVITE SHEET ---------------- */
function InviteSheet({ open, onClose, onAdd, toast, tripName }) {
  const [name, setName] = useStateC('');
  const link = 'viaja.app/u/' + (tripName ? tripName.toLowerCase().replace(/[^a-z]/g,'').slice(0,8) : 'viaje') + '-x7k';
  useEffectC(() => { if (open) setName(''); }, [open]);
  const channels = [
    { k:'WhatsApp', c:'#25D366', ic:'share' },
    { k:'Mensajes', c:'#11BFB2', ic:'note' },
    { k:'Copiar',   c:'#7C6CF0', ic:'link' },
  ];
  return (
    <Sheet open={open} onClose={onClose}>
      <h2 className="display" style={{ fontSize:21, marginBottom:3 }}>Invitar al viaje 🌴</h2>
      <div className="muted" style={{ fontSize:13, fontWeight:600, marginBottom:16 }}>
        Comparte el link. Quien entre podrá ver el plan y votar las opciones.
      </div>

      {/* link */}
      <div className="row gap8 center" style={{ background:'#fff', border:'1.5px solid var(--line)', borderRadius:14, padding:'6px 6px 6px 14px' }}>
        <Icon name="link" size={16} color="var(--turq)" />
        <span className="grow ellip" style={{ fontSize:13.5, fontWeight:600, color:'var(--ink-2)' }}>{link}</span>
        <button className="btn btn-turq btn-sm" onClick={() => toast('Link copiado 🔗')}>Copiar</button>
      </div>

      {/* channels */}
      <div className="row gap10" style={{ marginTop:14 }}>
        {channels.map(ch => (
          <button key={ch.k} onClick={() => toast(`Compartido por ${ch.k} ✓`)} className="card grow"
            style={{ padding:'13px 8px', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:7 }}>
            <div style={{ width:40, height:40, borderRadius:13, background:ch.c+'22', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Icon name={ch.ic} size={20} color={ch.c} />
            </div>
            <span style={{ fontFamily:'var(--font-d)', fontWeight:700, fontSize:12 }}>{ch.k}</span>
          </button>
        ))}
      </div>

      {/* add by name */}
      <div style={{ fontSize:12, fontWeight:700, color:'var(--ink-soft)', margin:'18px 0 8px' }}>O AGREGA A ALGUIEN</div>
      <div className="row gap8">
        <input className="input grow" placeholder="Nombre del invitado" value={name} onChange={e=>setName(e.target.value)} />
        <button className="btn btn-coral" disabled={!name.trim()}
          onClick={() => { onAdd(name.trim()); setName(''); }}>Agregar</button>
      </div>
    </Sheet>
  );
}

/* ---------------- CREATE TRIP WIZARD ---------------- */
const VIBES = [
  { tone:'pool',   emoji:'🏝️', label:'Playa' },
  { tone:'palm',   emoji:'⛰️', label:'Montaña' },
  { tone:'sunset', emoji:'🌅', label:'Roadtrip' },
  { tone:'grape',  emoji:'🌮', label:'Ciudad' },
  { tone:'night',  emoji:'🎉', label:'Fiesta' },
  { tone:'coral',  emoji:'🏄', label:'Aventura' },
];

function CreateTrip({ ctx, onClose }) {
  const [step, setStep] = useStateC(0);
  const [draft, setDraft] = useStateC({
    name:'', sub:'', vibe:VIBES[0], people:5, start:'', end:'',
    id: 'trip-' + Date.now(),
  });
  const set = (patch) => setDraft(d => ({ ...d, ...patch }));

  const fmtDates = () => {
    if (!draft.start) return 'Sin fecha';
    const m = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
    const a = new Date(draft.start+'T00:00');
    if (!draft.end) return `${a.getDate()} ${m[a.getMonth()]} ${a.getFullYear()}`;
    const b = new Date(draft.end+'T00:00');
    const yr = b.getFullYear();
    if (a.getMonth()===b.getMonth()) return `${a.getDate()}–${b.getDate()} ${m[b.getMonth()]} ${yr}`;
    return `${a.getDate()} ${m[a.getMonth()]} – ${b.getDate()} ${m[b.getMonth()]} ${yr}`;
  };
  const daysLeft = () => {
    if (!draft.start) return null;
    const d = Math.ceil((new Date(draft.start+'T00:00') - new Date()) / 86400000);
    return d > 0 ? d : 0;
  };

  const steps = ['Lo básico','Fechas & gente','Portada','Invitar'];
  const canNext = step===0 ? draft.name.trim().length>0 : true;

  const finish = () => {
    ctx.createTrip({
      id: draft.id, name: draft.name.trim(), sub: draft.sub.trim() || '¡Nuevo viaje!',
      tone: draft.vibe.tone, emoji: draft.vibe.emoji,
      dates: fmtDates(), daysLeft: daysLeft(), people: draft.people,
      status: 'planeando',
    });
    onClose();
  };

  return (
    <div className="sheet-bg" style={{ alignItems:'stretch' }} onClick={onClose}>
      <div className="col" onClick={e=>e.stopPropagation()} style={{ width:'100%', background:'var(--sand)',
        animation:'sheetUp .42s cubic-bezier(.22,1,.36,1) both' }}>
        {/* header */}
        <div style={{ padding:'54px 18px 10px' }}>
          <div className="row between center">
            <button onClick={step===0?onClose:()=>setStep(step-1)} style={{ border:0, background:'#fff', cursor:'pointer',
              borderRadius:13, width:40, height:40, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'var(--sh-sm)' }}>
              <Icon name={step===0?'close':'chevL'} size={18} color="var(--ink)" />
            </button>
            <div className="row gap6">
              {steps.map((_,i) => (
                <span key={i} style={{ width: i===step?22:7, height:7, borderRadius:99,
                  background: i<=step?'var(--turq)':'var(--line)', transition:'all .3s' }} />
              ))}
            </div>
            <div style={{ width:40 }} />
          </div>
          <div className="kicker" style={{ marginTop:18 }}>Paso {step+1} de 4</div>
          <h1 className="display" style={{ fontSize:27, marginTop:4 }}>{steps[step]}</h1>
        </div>

        <div className="scroll" style={{ padding:'4px 18px 18px' }}>
          {step===0 && (
            <div className="col gap16 stagger">
              <div>
                <label className="kicker">Nombre del viaje</label>
                <input className="input" style={{ marginTop:8 }} placeholder="Ej. Cumple en la playa 🎂"
                  value={draft.name} onChange={e=>set({name:e.target.value})} autoFocus />
              </div>
              <div>
                <label className="kicker">¿A dónde van?</label>
                <input className="input" style={{ marginTop:8 }} placeholder="Ej. Puerto Escondido"
                  value={draft.sub} onChange={e=>set({sub:e.target.value})} />
              </div>
              <div>
                <label className="kicker">Vibra del viaje</label>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginTop:10 }}>
                  {VIBES.map(v => (
                    <button key={v.tone} onClick={()=>set({vibe:v})} className="card"
                      style={{ padding:0, overflow:'hidden', cursor:'pointer',
                        border: draft.vibe.tone===v.tone ? '2px solid var(--turq)' : '1px solid var(--line)' }}>
                      <div style={{ height:54, backgroundImage:`url("${gradSrc(v.tone)}")`, backgroundSize:'cover',
                        display:'flex', alignItems:'center', justifyContent:'center', fontSize:26 }}>{v.emoji}</div>
                      <div className="display" style={{ fontSize:12.5, padding:'7px 0' }}>{v.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step===1 && (
            <div className="col gap16 stagger">
              <div className="row gap10">
                <div className="grow">
                  <label className="kicker">Salida</label>
                  <input type="date" className="input" style={{ marginTop:8 }} value={draft.start} onChange={e=>set({start:e.target.value})} />
                </div>
                <div className="grow">
                  <label className="kicker">Regreso</label>
                  <input type="date" className="input" style={{ marginTop:8 }} value={draft.end} onChange={e=>set({end:e.target.value})} />
                </div>
              </div>
              <div className="card" style={{ padding:16 }}>
                <div className="row between center">
                  <span className="display nowrap" style={{ fontSize:15 }}>¿Cuántos van?</span>
                  <span className="display" style={{ fontSize:22, color:'var(--coral)' }}>{draft.people}</span>
                </div>
                <input type="range" min="2" max="12" value={draft.people} style={{ width:'100%', marginTop:12, accentColor:'var(--coral)' }}
                  onChange={e=>set({people:+e.target.value})} />
                <div className="muted" style={{ fontSize:12, fontWeight:600, marginTop:6 }}>
                  Podrás ajustarlo después — el presupuesto se reparte solo.
                </div>
              </div>
            </div>
          )}

          {step===2 && (
            <div className="col gap14 stagger">
              <div className="muted" style={{ fontSize:13.5, fontWeight:600 }}>Arrastra una foto que les emocione 🌴 (o déjala así por ahora).</div>
              <PhotoSlot id={'cover-'+draft.id} tone={draft.vibe.tone} h={210} r={20} placeholder="Arrastra la foto de portada 📷">
                <div style={{ position:'absolute', left:14, bottom:14, color:'#fff' }}>
                  <div className="display" style={{ fontSize:22, textShadow:'0 2px 12px rgba(0,0,0,.4)' }}>{draft.name || 'Tu viaje'}</div>
                  {draft.sub && <div style={{ fontWeight:600, fontSize:13, textShadow:'0 2px 8px rgba(0,0,0,.4)' }}>{draft.sub}</div>}
                </div>
              </PhotoSlot>
              <div className="card" style={{ padding:14, display:'flex', gap:11, alignItems:'center' }}>
                <div style={{ fontSize:24 }}>{draft.vibe.emoji}</div>
                <div className="grow">
                  <div className="display" style={{ fontSize:14.5 }}>{fmtDates()}</div>
                  <div className="muted" style={{ fontSize:12.5, fontWeight:600 }}>{draft.people} personas · vibra {draft.vibe.label.toLowerCase()}</div>
                </div>
              </div>
            </div>
          )}

          {step===3 && (
            <div className="col gap14 stagger">
              <div className="muted" style={{ fontSize:13.5, fontWeight:600 }}>Comparte el link para que se unan y empiecen a votar.</div>
              <div className="row gap8 center" style={{ background:'#fff', border:'1.5px solid var(--line)', borderRadius:14, padding:'6px 6px 6px 14px' }}>
                <Icon name="link" size={16} color="var(--turq)" />
                <span className="grow ellip" style={{ fontSize:13.5, fontWeight:600, color:'var(--ink-2)' }}>viaja.app/u/{(draft.name||'viaje').toLowerCase().replace(/[^a-z]/g,'').slice(0,8)}-x7k</span>
                <button className="btn btn-turq btn-sm" onClick={()=>ctx.toast('Link copiado 🔗')}>Copiar</button>
              </div>
              <div className="card" style={{ padding:16, textAlign:'center' }}>
                <div style={{ fontSize:34 }}>🎉</div>
                <div className="display" style={{ fontSize:17, marginTop:6 }}>¡Todo listo!</div>
                <div className="muted" style={{ fontSize:13, fontWeight:600, marginTop:3, lineHeight:1.4 }}>
                  Crea el viaje y empieza a agregar opciones de hospedaje, transporte y actividades.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* footer */}
        <div style={{ padding:'10px 18px calc(18px + env(safe-area-inset-bottom))', borderTop:'1px solid var(--line)', background:'var(--sand)' }}>
          {step < 3
            ? <button className="btn btn-turq btn-block" disabled={!canNext} onClick={()=>setStep(step+1)}>Continuar</button>
            : <button className="btn btn-coral btn-block" onClick={finish}>Crear viaje 🌴</button>}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { EmptyState, GuestBanner, ViewerChip, ViewerSwitch, InviteSheet, CreateTrip, VIBES });
