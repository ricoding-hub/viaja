/* ============================================================
   SCREENS A — Home (Mis viajes), Dashboard, Invitados
   ============================================================ */
const { useState: useStateA, useEffect: useEffectA } = React;

const STATUS_TAG = {
  planeando:   ['tag-turq', '🌴 Planeando'],
  idea:        ['tag-sun',  '💡 Idea'],
  completado:  ['tag-grape','✓ Hecho'],
};

/* ---------------- HOME · MIS VIAJES ---------------- */
function HomeScreen({ ctx }) {
  const { trips, featured, homeBudget, membersOf, openTrip, startCreate, viewerPerson } = ctx;
  const others = trips.filter(t => t.id !== featured.id);

  return (
    <div className="scroll screen-in">
      <div className="safe-top" />
      <div className="pad">
        {/* greeting */}
        <div className="row between center" style={{ marginTop:6, marginBottom:18 }}>
          <div>
            <div className="muted" style={{ fontWeight:600, fontSize:14 }}>Hola {viewerPerson.name} 🌴</div>
            <h1 className="display" style={{ fontSize:30, marginTop:2, whiteSpace:'nowrap' }}>Mis viajes</h1>
          </div>
          <div style={{ position:'relative' }}>
            <div className="card" style={{ width:46, height:46, borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Icon name="bell" size={21} color="#143A35" />
            </div>
            <span style={{ position:'absolute', top:-2, right:-2, width:11, height:11, borderRadius:99, background:'var(--coral)', border:'2px solid #fff' }} />
          </div>
        </div>

        {/* FEATURED trip — hero card */}
        <div className="stagger">
          <div className="card" onClick={() => openTrip(featured.id)}
            style={{ padding:0, overflow:'hidden', cursor:'pointer', boxShadow:'var(--sh-lg)' }}>
            <PhotoSlot id={'cover-'+featured.id} tone={featured.tone} h={186}>
              <div style={{ position:'absolute', top:14, left:14 }}>
                <span className="tag" style={{ background:'rgba(255,255,255,.9)', color:'var(--turq-deep)' }}>
                  <span style={{ width:6, height:6, borderRadius:99, background:'var(--turq)', display:'inline-block' }} /> Planeando ahora
                </span>
              </div>
              {featured.daysLeft != null && (
                <div style={{ position:'absolute', right:14, top:14 }}>
                  <div style={{ background:'rgba(20,48,44,.42)', backdropFilter:'blur(6px)', borderRadius:16, padding:'8px 12px', textAlign:'center', color:'#fff' }}>
                    <div className="display" style={{ fontSize:24, lineHeight:1 }}>{featured.daysLeft}</div>
                    <div style={{ fontSize:9, fontWeight:700, letterSpacing:'.1em', opacity:.9 }}>DÍAS</div>
                  </div>
                </div>
              )}
              <div style={{ position:'absolute', left:0, right:0, bottom:0, padding:16,
                background:'linear-gradient(to top,rgba(8,40,46,.66),transparent)' }}>
                <div style={{ color:'#fff' }}>
                  <div style={{ fontWeight:600, fontSize:13, opacity:.92 }}>{featured.sub}</div>
                  <div className="display" style={{ fontSize: featured.name.length>15?20:25, color:'#fff', lineHeight:1.05 }}>{featured.name}</div>
                </div>
              </div>
            </PhotoSlot>
            <div className="row between center" style={{ padding:'14px 16px' }}>
              <div className="col" style={{ gap:8 }}>
                <div className="row gap6 center muted nowrap" style={{ fontSize:13, fontWeight:600 }}>
                  <Icon name="calendar" size={15} color="var(--ink-soft)" /> {featured.dates}
                </div>
                <AvStack people={membersOf(featured.id)} size={28} />
              </div>
              <div className="col center" style={{ alignItems:'flex-end', gap:4 }}>
                <div className="muted" style={{ fontSize:11, fontWeight:700, letterSpacing:'.04em', whiteSpace:'nowrap' }}>POR PERSONA</div>
                <div className="display" style={{ fontSize:22, color:'var(--ink)' }}>{homeBudget.perCap ? fmt(homeBudget.perCap) : '—'}</div>
              </div>
            </div>
            <div style={{ padding:'0 16px 16px' }}>
              <div className="row between" style={{ fontSize:11.5, fontWeight:700, marginBottom:6 }}>
                <span className="muted nowrap">Avance de organización</span>
                <span style={{ color:'var(--turq-deep)' }}>{homeBudget.progress}%</span>
              </div>
              <Meter pct={homeBudget.progress} />
            </div>
          </div>
        </div>

        {/* other trips */}
        <div className="row between center" style={{ margin:'24px 2px 12px' }}>
          <h3 className="nowrap" style={{ fontSize:17 }}>Otros planes</h3>
        </div>
        <div className="col gap12">
          {others.map(t => {
            const [cls, label] = STATUS_TAG[t.status] || STATUS_TAG.idea;
            return (
              <div key={t.id} className="card" onClick={() => openTrip(t.id)}
                style={{ padding:10, display:'flex', gap:13, alignItems:'center', cursor:'pointer' }}>
                <PhotoSlot id={'cover-'+t.id} tone={t.tone} h={64} r={16} style={{ width:64, flex:'none' }} placeholder="" />
                <div className="grow">
                  <div className="row between center">
                    <h4 className="ellip grow" style={{ fontSize:16 }}>{t.name}</h4>
                    <span className={'tag ' + cls} style={{ fontSize:10 }}>{label}</span>
                  </div>
                  <div className="muted" style={{ fontSize:13, marginTop:2 }}>{t.sub}</div>
                  <div className="row gap8 center muted nowrap" style={{ fontSize:12, marginTop:7, fontWeight:600 }}>
                    <span className="row gap6 center"><Icon name="calendar" size={13} color="var(--ink-soft)" />{t.dates}</span>
                    <span className="row gap6 center"><Icon name="users" size={13} color="var(--ink-soft)" />{t.people}</span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* new trip */}
          <button onClick={startCreate} className="card" style={{ padding:18, display:'flex', gap:13, alignItems:'center',
            cursor:'pointer', border:'2px dashed var(--line)', background:'transparent', textAlign:'left' }}>
            <div style={{ width:46, height:46, borderRadius:15, background:'var(--coral-soft)', display:'flex', alignItems:'center', justifyContent:'center', flex:'none' }}>
              <Icon name="plus" size={24} color="var(--coral)" stroke={2.5} />
            </div>
            <div>
              <div className="display" style={{ fontSize:16, color:'var(--ink)' }}>Nuevo viaje</div>
              <div className="muted" style={{ fontSize:13 }}>Empieza un plan desde cero</div>
            </div>
          </button>
        </div>
        <div className="pb-nav" />
      </div>
    </div>
  );
}

/* ---------------- DASHBOARD ---------------- */
function Dashboard({ ctx }) {
  const { trip, members, budget, go, backHome, catMeta, isHost, viewerPerson, openInvite, openViewer } = ctx;
  const confirmed = members.filter(p => p.host || p.confirmed).length;
  const isDemo = trip.id === 'pxm';
  const empty = budget.optCount === 0;

  const shortcuts = [
    { id:'options',   label:'Opciones',  ic:'layers',   color:'#FF6F5C', note:`${budget.decided}/4 decididas` },
    { id:'budget',    label:'Presupuesto',ic:'wallet',  color:'#11BFB2', note: budget.perCap?fmt(budget.perCap)+' c/u':'Por armar' },
    { id:'research',  label:'Ideas',     ic:'inbox',    color:'#7C6CF0', note:ctx.research.length+' guardadas' },
    { id:'itinerary', label:'Itinerario',ic:'calendar', color:'#FFB43E', note: ctx.itinerary.length?ctx.itinerary.length+' días':'Por armar' },
  ];

  const feed = [
    { who:'sofi', txt:'calificó Casa Aleta con 5★', t:'hace 2h' },
    { who:'ale',  txt:'agregó “Surf en Carrizalillo”', t:'hace 5h' },
    { who:'memo', txt:'votó por el roadtrip en van', t:'ayer' },
  ];
  const byId = id => members.find(p => p.id === id) || ctx.peopleById[id];
  const pending = members.find(p => !p.host && !p.confirmed);

  return (
    <div className="scroll screen-in">
      {/* HERO */}
      <PhotoSlot id={'cover-'+trip.id} tone={trip.tone} h={300}>
        <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', justifyContent:'space-between',
          background:'linear-gradient(to top,rgba(8,40,46,.72),transparent 55%)' }}>
          <div className="row between center" style={{ padding:'56px 16px 0' }}>
            <button onClick={backHome} style={{ pointerEvents:'auto', border:0, cursor:'pointer', background:'rgba(255,255,255,.85)', backdropFilter:'blur(6px)',
              borderRadius:14, padding:'9px 13px', display:'flex', alignItems:'center', gap:6, fontFamily:'var(--font-d)', fontWeight:700, fontSize:13, color:'var(--ink)' }}>
              <Icon name="chevL" size={16} color="var(--ink)" /> Viajes
            </button>
            <div className="row gap8 center" style={{ pointerEvents:'auto' }}>
              <ViewerChip person={viewerPerson} onClick={openViewer} dark />
              <button onClick={openInvite} style={{ border:0, cursor:'pointer', background:'rgba(255,255,255,.85)', backdropFilter:'blur(6px)',
                borderRadius:14, width:40, height:40, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Icon name="share" size={18} color="var(--ink)" />
              </button>
            </div>
          </div>
          <div style={{ padding:'0 18px 46px', color:'#fff' }}>
            <span className="tag" style={{ background:'rgba(255,255,255,.92)', color:'var(--coral-deep)', marginBottom:10 }}>{trip.sub}</span>
            <div className="display" style={{ fontSize: trip.name.length>15?28:38, color:'#fff', lineHeight:1.04, marginTop:6, textShadow:'0 2px 16px rgba(0,0,0,.3)' }}>{trip.name}</div>
            <div className="row gap12 center nowrap" style={{ marginTop:12, fontWeight:600, fontSize:14 }}>
              <span className="row gap6 center nowrap"><Icon name="calendar" size={16} color="#fff" />{trip.dates}</span>
              <span className="row gap6 center nowrap"><Icon name="users" size={16} color="#fff" />{ctx.peopleCount} personas</span>
            </div>
          </div>
        </div>
      </PhotoSlot>

      <div className="pad" style={{ marginTop:-26, position:'relative', zIndex:5 }}>
        {/* countdown ribbon */}
        <div className="card stagger" style={{ padding:14, display:'flex', alignItems:'center', gap:14, boxShadow:'var(--sh-md)' }}>
          <Ring pct={budget.progress} size={62} sw={7} color="var(--turq)">
            <div className="display" style={{ fontSize:16, color:'var(--turq-deep)' }}>{budget.progress}%</div>
          </Ring>
          <div className="grow">
            <div className="display" style={{ fontSize:18 }}>{trip.daysLeft!=null ? `Faltan ${trip.daysLeft} días 🎉` : '¡Define las fechas! 📅'}</div>
            <div className="muted" style={{ fontSize:13, fontWeight:600, marginTop:2 }}>{empty ? 'Empieza agregando opciones para votar.' : 'El plan va tomando forma, ¡sigan votando!'}</div>
          </div>
        </div>

        {!isHost && <div style={{ marginTop:12 }}><GuestBanner person={viewerPerson} /></div>}

        {/* quick stats */}
        <div className="row gap10" style={{ marginTop:12 }}>
          <StatCard color="var(--turq)" big={budget.perCap?fmt(budget.perCap):'—'} label="por persona" ic="wallet" onClick={() => go('budget')} />
          <StatCard color="var(--coral)" big={`${confirmed}/${members.length}`} label="confirmados" ic="users" onClick={() => go('guests')} />
          <StatCard color="var(--grape)" big={`${budget.decided}/4`} label="decididas" ic="check" onClick={() => go('options')} />
        </div>

        {/* shortcuts grid */}
        <h3 style={{ fontSize:17, margin:'24px 2px 12px' }}>Módulos del viaje</h3>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          {shortcuts.map(s => (
            <button key={s.id} onClick={() => go(s.id)} className="card"
              style={{ padding:16, textAlign:'left', cursor:'pointer', display:'flex', flexDirection:'column', gap:10, alignItems:'flex-start' }}>
              <div style={{ width:44, height:44, borderRadius:14, background:s.color+'1f', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Icon name={s.ic} size={23} color={s.color} />
              </div>
              <div>
                <div className="display" style={{ fontSize:16.5 }}>{s.label}</div>
                <div className="muted" style={{ fontSize:12.5, fontWeight:600, marginTop:1 }}>{s.note}</div>
              </div>
            </button>
          ))}
        </div>

        {empty ? (
          /* getting-started for new trips */
          <div className="card" style={{ marginTop:14, padding:16 }}>
            <div className="display" style={{ fontSize:16 }}>Primeros pasos 🚀</div>
            <div className="col gap10" style={{ marginTop:12 }}>
              {[['inbox','Guarda ideas y links','research','#7C6CF0'],['layers','Agrega opciones para votar','options','#FF6F5C'],['share','Invita a tu gente','__invite','#11BFB2']].map(([ic,txt,to,c]) => (
                <button key={txt} onClick={() => to==='__invite'?openInvite():go(to)} className="row gap12 center" style={{ border:0, background:'var(--sand-2)', borderRadius:14, padding:12, cursor:'pointer', textAlign:'left' }}>
                  <div style={{ width:34, height:34, borderRadius:10, background:c+'22', display:'flex', alignItems:'center', justifyContent:'center', flex:'none' }}><Icon name={ic} size={18} color={c} /></div>
                  <span className="grow" style={{ fontSize:13.5, fontWeight:700, fontFamily:'var(--font-d)' }}>{txt}</span>
                  <Icon name="chevR" size={16} color="var(--ink-soft)" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* nudge */}
            {pending && (
              <div className="card" style={{ marginTop:14, padding:14, display:'flex', gap:12, alignItems:'center',
                background:'linear-gradient(120deg,#FFF6E9,#FFEFE9)', border:'1px solid #FFE2CF' }}>
                <div style={{ fontSize:26 }}>🙌</div>
                <div className="grow">
                  <div className="display" style={{ fontSize:15 }}>{pending.name} aún no confirma</div>
                  <div className="muted" style={{ fontSize:12.5, fontWeight:600 }}>Mándale el plan para cerrar el grupo</div>
                </div>
                <button className="btn btn-coral btn-sm" onClick={() => go('guests')}>Ver</button>
              </div>
            )}
            {/* activity feed (demo) */}
            {isDemo && (
              <>
                <h3 style={{ fontSize:17, margin:'24px 2px 12px' }}>Actividad reciente</h3>
                <div className="card" style={{ padding:6 }}>
                  {feed.map((f,i) => {
                    const p = byId(f.who);
                    return (
                      <div key={i} className="row gap12 center" style={{ padding:'11px 10px', borderBottom: i<feed.length-1?'1px solid var(--line)':'none' }}>
                        <Av p={p} size={34} />
                        <div className="grow" style={{ fontSize:13.5 }}>
                          <span style={{ fontWeight:700 }}>{p.name}</span> <span className="muted" style={{ fontWeight:500 }}>{f.txt}</span>
                        </div>
                        <span className="muted" style={{ fontSize:11, fontWeight:600, whiteSpace:'nowrap' }}>{f.t}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}
        <div className="pb-nav" />
      </div>
    </div>
  );
}

function StatCard({ color, big, label, ic, onClick }) {
  return (
    <button onClick={onClick} className="card grow" style={{ padding:'13px 12px', cursor:'pointer', textAlign:'left',
      display:'flex', flexDirection:'column', gap:7 }}>
      <Icon name={ic} size={19} color={color} />
      <div>
        <div className="display" style={{ fontSize:18 }}>{big}</div>
        <div className="muted" style={{ fontSize:11, fontWeight:700, letterSpacing:'.02em' }}>{label}</div>
      </div>
    </button>
  );
}

/* ---------------- INVITADOS ---------------- */
function Guests({ ctx }) {
  const { members, options, budget, openInvite, openViewer, viewer } = ctx;
  const totalVotables = options.length;

  return (
    <div className="scroll screen-in">
      <div className="safe-top" />
      <div className="pad">
        <div className="row between center" style={{ marginTop:6 }}>
          <div>
            <h1 className="display" style={{ fontSize:30 }}>Invitados</h1>
            <div className="muted" style={{ fontWeight:600, fontSize:14, marginTop:2 }}>
              {members.filter(p=>p.host||p.confirmed).length} confirmados · {members.length} en el grupo
            </div>
          </div>
          <button className="chip" onClick={openViewer}>
            <Icon name="users" size={14} color="var(--ink-2)" /> Ver como
          </button>
        </div>

        {/* split summary */}
        <div className="card" style={{ marginTop:16, padding:16, background:'linear-gradient(120deg,#E5F8F5,#D9F3FF)', border:'1px solid #C9EFEA' }}>
          <div className="row between center">
            <div>
              <div className="kicker">cuota por persona</div>
              <div className="display" style={{ fontSize:30, marginTop:4 }}>{budget.perCap?fmt(budget.perCap):'—'}</div>
            </div>
            <div style={{ fontSize:40 }}>💸</div>
          </div>
          <div className="muted" style={{ fontSize:12.5, fontWeight:600, marginTop:6 }}>
            Total estimado del viaje · {fmt(budget.total)}
          </div>
        </div>

        <div className="row between center" style={{ margin:'22px 2px 10px' }}>
          <h3 style={{ fontSize:17 }}>El grupo</h3>
          <button className="chip" onClick={openInvite}>
            <Icon name="share" size={14} color="var(--ink-2)" /> Invitar
          </button>
        </div>

        <div className="col gap10">
          {members.map(p => {
            const voted = options.filter(o => o.votes[p.id] != null).length;
            const pct = totalVotables ? Math.round(voted/totalVotables*100) : 0;
            const confirmed = p.host || p.confirmed;
            return (
              <div key={p.id} className="card" style={{ padding:13, display:'flex', gap:13, alignItems:'center',
                outline: p.id===viewer ? '2px solid var(--turq)' : 'none' }}>
                <Av p={p} size={46} />
                <div className="grow">
                  <div className="row gap8 center">
                    <span className="display" style={{ fontSize:16 }}>{p.name}</span>
                    {p.host && <span className="tag tag-turq" style={{ fontSize:9.5 }}>ANFITRIÓN</span>}
                    {p.id===viewer && <span className="tag tag-grape" style={{ fontSize:9.5 }}>TÚ</span>}
                  </div>
                  <div className="row gap8 center" style={{ marginTop:7 }}>
                    <div className="grow"><Meter pct={pct} color={p.color} h={7} /></div>
                    <span className="muted" style={{ fontSize:11, fontWeight:700, whiteSpace:'nowrap' }}>{voted}/{totalVotables} votos</span>
                  </div>
                </div>
                <div style={{ textAlign:'center', flex:'none' }}>
                  {confirmed
                    ? <div style={{ width:30, height:30, borderRadius:99, background:'var(--turq-soft)', display:'flex', alignItems:'center', justifyContent:'center' }}><Icon name="check" size={17} color="var(--turq-deep)" stroke={2.6} /></div>
                    : <span className="tag tag-sun" style={{ fontSize:9.5 }}>PENDIENTE</span>}
                </div>
              </div>
            );
          })}
        </div>
        <div className="pb-nav" />
      </div>
    </div>
  );
}

Object.assign(window, { HomeScreen, Dashboard, Guests, StatCard });
