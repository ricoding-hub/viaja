/* ============================================================
   SCREENS B — Opciones, Presupuesto, Investigación, Itinerario
   ============================================================ */
const { useState: useStateB, useEffect: useEffectB, useRef: useRefB } = React;

const CAT_ORDER = ['hospedaje','transporte','actividades','comida'];

/* unit label helper */
function unitLabel(o) {
  if (o.unit === 'pp')  return '/persona';
  if (o.unit === 'ppd') return '/persona/día';
  return 'total';
}

/* ============================================================
   OPCIONES  (compare + vote)
   ============================================================ */
function Options({ ctx }) {
  const { options, members, catMeta, rate, toggleWinner, viewer, isHost, viewerPerson, go } = ctx;
  const [filter, setFilter] = useStateB('all');
  const [compare, setCompare] = useStateB(null); // category id

  const cats = filter === 'all' ? CAT_ORDER : [filter];
  const empty = options.length === 0;

  return (
    <div className="scroll screen-in">
      <div className="safe-top" />
      <div className="pad">
        <div className="row between center" style={{ marginTop:6 }}>
          <div>
            <h1 className="display" style={{ fontSize:30 }}>Opciones</h1>
            <div className="muted" style={{ fontWeight:600, fontSize:14, marginTop:2 }}>Comparen y voten con estrellas ⭐</div>
          </div>
        </div>
      </div>

      {!isHost && <div style={{ marginTop:12 }}><GuestBanner person={viewerPerson} /></div>}

      {empty ? (
        <EmptyState emoji="🏖️" title="Aún no hay opciones" sub="Guarda ideas en la bandeja y conviértelas en opciones para que el grupo las vote."
          cta={isHost ? 'Ir a Ideas' : null} onCta={() => go('research')} />
      ) : (
      <>
      <div className="pad">
        {/* filter chips */}
        <div className="chip-row" style={{ margin:'14px 0 4px' }}>
          <button className={'chip'+(filter==='all'?' on':'')} onClick={()=>setFilter('all')}>Todas</button>
          {CAT_ORDER.map(c => (
            <button key={c} className={'chip'+(filter===c?' on':'')} onClick={()=>setFilter(c)}>
              {catMeta[c].label}
            </button>
          ))}
        </div>
      </div>

      {cats.map(cat => {
        const list = options.filter(o => o.cat === cat);
        if (!list.length) return null;
        const meta = catMeta[cat];
        return (
          <div key={cat} className="pad" style={{ marginTop:14 }}>
            <div className="row between center" style={{ marginBottom:10 }}>
              <div className="row gap8 center">
                <div style={{ width:30, height:30, borderRadius:10, background:meta.color+'22', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Icon name={meta.icon} size={17} color={meta.color} />
                </div>
                <h3 style={{ fontSize:17 }}>{meta.label}</h3>
              </div>
              {list.length > 1 && (
                <button className="chip" onClick={()=>setCompare(cat)}>
                  <Icon name="layers" size={14} color="var(--ink-2)" /> Comparar {list.length}
                </button>
              )}
            </div>
            <div className="col gap12">
              {list.map(o => (
                <OptionCard key={o.id} o={o} people={members} user={viewer} canChoose={isHost}
                  onRate={(n)=>rate(o.id,n)} onChoose={()=>toggleWinner(o.id)} />
              ))}
            </div>
          </div>
        );
      })}
      <div className="pb-nav" />
      </>
      )}

      <CompareSheet cat={compare} ctx={ctx} onClose={()=>setCompare(null)} />
    </div>
  );
}

function OptionCard({ o, people, user, canChoose, onRate, onChoose }) {
  const voters = people.filter(p => o.votes[p.id] != null);
  const a = avg(o.votes);
  const priceMain = o.price === 0 ? 'Gratis' : fmt(o.price);
  return (
    <div className="card" style={{ overflow:'hidden', padding:0, position:'relative',
      boxShadow: o.winner ? '0 10px 28px rgba(17,191,178,.22)' : 'var(--sh-sm)',
      border: o.winner ? '1.5px solid var(--turq)' : '1px solid var(--line)' }}>
      {o.winner && (
        <div style={{ position:'absolute', top:12, right:12, zIndex:4 }}>
          <span className="tag tag-win" style={{ boxShadow:'var(--sh-turq)' }}><Icon name="trophy" size={12} color="#fff" /> Elegida</span>
        </div>
      )}
      <PhotoSlot id={'photo-'+o.id} tone={o.tone} h={120} placeholder="Arrastra una foto 📷" />
      <div style={{ padding:14 }}>
        <div className="row between" style={{ alignItems:'flex-start' }}>
          <div className="grow" style={{ paddingRight:8 }}>
            <h4 style={{ fontSize:17 }}>{o.title}</h4>
            <div className="muted" style={{ fontSize:12.5, fontWeight:600, marginTop:2 }}>{o.subtitle}</div>
          </div>
          <div style={{ textAlign:'right', flex:'none' }}>
            <div className="display" style={{ fontSize:19, color:'var(--ink)' }}>{priceMain}</div>
            <div className="muted" style={{ fontSize:10.5, fontWeight:700 }}>{unitLabel(o)}</div>
          </div>
        </div>

        {/* meta chips */}
        <div className="row gap6" style={{ flexWrap:'wrap', marginTop:11 }}>
          {o.meta.map(([k,v],i) => (
            <span key={i} style={{ fontSize:11, fontWeight:600, background:'var(--sand-2)', color:'var(--ink-2)', padding:'5px 9px', borderRadius:9 }}>
              <span className="muted">{k}:</span> {v}
            </span>
          ))}
        </div>

        {/* source link */}
        <div className="row gap6 center muted" style={{ fontSize:11.5, fontWeight:600, marginTop:10 }}>
          <Icon name="link" size={13} color="var(--ink-soft)" /> {o.link}
        </div>

        <div style={{ height:1, background:'var(--line)', margin:'13px 0' }} />

        {/* voting row */}
        <div className="row between center">
          <div>
            <div className="muted" style={{ fontSize:10.5, fontWeight:700, letterSpacing:'.03em', marginBottom:4 }}>TU VOTO</div>
            <Stars value={o.votes[user] || 0} onRate={onRate} size={24} />
          </div>
          <div style={{ textAlign:'right' }}>
            <div className="row gap6 center" style={{ justifyContent:'flex-end' }}>
              <Icon name="star" size={15} color="#FFB43E" fill="#FFB43E" />
              <span className="display" style={{ fontSize:17 }}>{a ? a.toFixed(1) : '—'}</span>
            </div>
            <div className="row gap6 center" style={{ justifyContent:'flex-end', marginTop:5 }}>
              <AvStack people={voters} size={20} />
              <span className="muted" style={{ fontSize:11, fontWeight:600 }}>{voters.length} votos</span>
            </div>
          </div>
        </div>

        {canChoose ? (
          <button onClick={onChoose} className={'btn btn-block btn-sm ' + (o.winner ? 'btn-ghost' : 'btn-turq')} style={{ marginTop:13 }}>
            {o.winner ? <><Icon name="check" size={16} color="var(--turq-deep)" /> Elegida para el plan</> : 'Elegir esta opción'}
          </button>
        ) : (
          o.winner
            ? <div className="row gap6 center" style={{ marginTop:13, justifyContent:'center', fontFamily:'var(--font-d)', fontWeight:700, fontSize:13, color:'var(--turq-deep)' }}><Icon name="check" size={15} color="var(--turq-deep)" /> Elegida por el anfitrión</div>
            : <div className="muted" style={{ marginTop:13, textAlign:'center', fontSize:12, fontWeight:600 }}>Tu voto ayuda a decidir ⭐</div>
        )}
      </div>
    </div>
  );
}

/* comparison table sheet */
function CompareSheet({ cat, ctx, onClose }) {
  if (!cat) return null;
  const { options, catMeta } = ctx;
  const list = options.filter(o => o.cat === cat);
  const meta = catMeta[cat];
  const rows = list[0].meta.map(([k]) => k);
  return (
    <Sheet open={!!cat} onClose={onClose}>
      <div className="row gap8 center" style={{ marginBottom:14 }}>
        <div style={{ width:32, height:32, borderRadius:10, background:meta.color+'22', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Icon name={meta.icon} size={18} color={meta.color} />
        </div>
        <h2 className="display" style={{ fontSize:21 }}>Comparar {meta.label}</h2>
      </div>

      <div style={{ overflowX:'auto' }}>
        <div style={{ display:'grid', gridTemplateColumns:`96px repeat(${list.length},1fr)`, gap:0, minWidth: 120+list.length*120 }}>
          {/* header row */}
          <div />
          {list.map(o => (
            <div key={o.id} style={{ padding:'0 6px', textAlign:'center' }}>
              <Photo tone={o.tone} emoji={o.emoji} h={56} style={{ borderRadius:13 }} />
              <div className="display" style={{ fontSize:13, marginTop:6, lineHeight:1.1 }}>{o.title}</div>
              {o.winner && <span className="tag tag-win" style={{ fontSize:8.5, marginTop:4 }}>ELEGIDA</span>}
            </div>
          ))}

          <CompRow label="Precio" list={list} render={o => o.price===0?'Gratis':fmt(o.price)} sub={o=>unitLabel(o)} />
          <CompRow label="Rating" list={list} render={o => {
            const a = avg(o.votes); return <span className="row gap4 center" style={{ justifyContent:'center' }}><Icon name="star" size={13} color="#FFB43E" fill="#FFB43E" />{a?a.toFixed(1):'—'}</span>;
          }} />
          {rows.map((r,ri) => (
            <CompRow key={ri} label={r} list={list} render={o => (o.meta.find(([k])=>k===r)||[,'—'])[1]} />
          ))}
        </div>
      </div>
      <button className="btn btn-ghost btn-block" onClick={onClose} style={{ marginTop:18 }}>Cerrar</button>
    </Sheet>
  );
}
function CompRow({ label, list, render, sub }) {
  return (
    <>
      <div style={{ padding:'13px 6px', fontSize:12, fontWeight:700, color:'var(--ink-soft)', borderTop:'1px solid var(--line)', display:'flex', alignItems:'center' }}>{label}</div>
      {list.map(o => (
        <div key={o.id} style={{ padding:'13px 6px', textAlign:'center', borderTop:'1px solid var(--line)',
          background: o.winner ? 'var(--turq-soft)' : 'transparent' }}>
          <div className="display" style={{ fontSize:14 }}>{render(o)}</div>
          {sub && <div className="muted" style={{ fontSize:9.5, fontWeight:700 }}>{sub(o)}</div>}
        </div>
      ))}
    </>
  );
}

/* ============================================================
   PRESUPUESTO  (live, per-cápita, people slider)
   ============================================================ */
function Budget({ ctx }) {
  const { budget, peopleCount, setPeopleCount, goal, catMeta, go, days, isHost, viewerPerson } = ctx;
  const overGoal = budget.perCap > goal;
  const empty = budget.optCount === 0;

  return (
    <div className="scroll screen-in">
      <div className="safe-top" />
      <div className="pad">
        <h1 className="display" style={{ fontSize:30, marginTop:6 }}>Presupuesto</h1>
        <div className="muted" style={{ fontWeight:600, fontSize:14, marginTop:2 }}>Se actualiza solo con sus elecciones ✨</div>
      </div>

      {!isHost && <div style={{ marginTop:12 }}><GuestBanner person={viewerPerson} /></div>}

      {empty ? (
        <EmptyState emoji="💰" title="El presupuesto se arma solo" sub="En cuanto elijan opciones de hospedaje, transporte y más, aquí verán el costo por persona en vivo."
          cta={isHost?'Agregar opciones':null} onCta={()=>go('options')} />
      ) : (
      <div className="pad">
        {/* hero per-cápita */}
        <div className="card" style={{ marginTop:16, padding:20, textAlign:'center',
          background:'linear-gradient(140deg,#0FBDB0,#0B9A8F)', border:'none', boxShadow:'var(--sh-turq)', color:'#fff' }}>
          <div style={{ fontSize:12, fontWeight:700, letterSpacing:'.1em', opacity:.85 }}>POR PERSONA</div>
          <div className="display" style={{ fontSize:50, color:'#fff', marginTop:4 }}>
            <Count value={budget.perCap} prefix="$" />
          </div>
          <div className="row gap6 center nowrap" style={{ justifyContent:'center', marginTop:6, fontWeight:600, fontSize:13.5, opacity:.92 }}>
            <Icon name="users" size={15} color="#fff" /> {peopleCount} personas · total <Count value={budget.total} prefix="$" />
          </div>
        </div>

        {/* people slider — versatilidad */}
        <div className="card" style={{ marginTop:12, padding:16, opacity:isHost?1:.6, pointerEvents:isHost?'auto':'none' }}>
          <div className="row between center">
            <div className="row gap8 center">
              <Icon name="users" size={18} color="var(--coral)" />
              <span className="display nowrap" style={{ fontSize:15 }}>¿Cuántos van?</span>
            </div>
            <span className="display" style={{ fontSize:22, color:'var(--coral)' }}>{peopleCount}</span>
          </div>
          <input type="range" min="3" max="10" value={peopleCount} className="slider" disabled={!isHost}
            onChange={e => setPeopleCount(+e.target.value)}
            style={{ width:'100%', marginTop:12, accentColor:'var(--coral)' }} />
          <div className="row between muted" style={{ fontSize:11, fontWeight:700, marginTop:2 }}>
            <span>3</span><span>10 personas</span>
          </div>
          <div style={{ marginTop:10, fontSize:12.5, fontWeight:600, color:'var(--turq-deep)', background:'var(--turq-soft)', padding:'9px 12px', borderRadius:12 }}>
            💡 Entre más personas, la casa se reparte más barata por cabeza.
          </div>
        </div>

        {/* goal meter */}
        <div className="card" style={{ marginTop:12, padding:16 }}>
          <div className="row between center" style={{ marginBottom:9 }}>
            <span className="display nowrap" style={{ fontSize:15 }}>Meta por persona</span>
            <span className="display" style={{ fontSize:15, color: overGoal?'var(--coral-deep)':'var(--turq-deep)' }}>{fmt(goal)}</span>
          </div>
          <Meter pct={budget.perCap/goal*100} color={overGoal?'var(--coral)':'var(--turq)'} h={12} />
          <div className="row gap6 center nowrap" style={{ marginTop:9, fontSize:12.5, fontWeight:600, color: overGoal?'var(--coral-deep)':'var(--turq-deep)' }}>
            {overGoal
              ? <>⚠️ Van {fmt(budget.perCap-goal)} arriba de la meta</>
              : <>🎉 ¡Van {fmt(goal-budget.perCap)} por debajo de la meta!</>}
          </div>
        </div>

        {/* category breakdown */}
        <h3 style={{ fontSize:17, margin:'24px 2px 12px' }}>¿En qué se va?</h3>
        <div className="col gap10">
          {CAT_ORDER.map(cat => {
            const b = budget.byCat[cat];
            const meta = catMeta[cat];
            const pct = budget.total ? b.subtotal/budget.total*100 : 0;
            return (
              <button key={cat} onClick={()=>go('options')} className="card" style={{ padding:14, textAlign:'left', cursor:'pointer' }}>
                <div className="row between center">
                  <div className="row gap10 center">
                    <div style={{ width:38, height:38, borderRadius:12, background:meta.color+'22', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <Icon name={meta.icon} size={20} color={meta.color} />
                    </div>
                    <div>
                      <div className="display" style={{ fontSize:15.5 }}>{meta.label}</div>
                      <div className="muted" style={{ fontSize:11.5, fontWeight:600 }}>{b.note}</div>
                    </div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div className="display" style={{ fontSize:16 }}>{fmt(b.subtotal)}</div>
                    <div className="muted" style={{ fontSize:10.5, fontWeight:700 }}>{fmt(b.perPerson)}/persona</div>
                  </div>
                </div>
                <div style={{ marginTop:10 }}><Meter pct={pct} color={meta.color} h={7} /></div>
              </button>
            );
          })}
        </div>
        <div className="pb-nav" />
      </div>
      )}
    </div>
  );
}

/* ============================================================
   INVESTIGACIÓN  (paste links / notes → option)
   ============================================================ */
function Research({ ctx }) {
  const { research, catMeta, addResearch, convertResearch, go, isHost, viewerPerson } = ctx;
  const [filter, setFilter] = useStateB('all');
  const [adding, setAdding] = useStateB(false);

  const cats = ['all', ...Object.keys(catMeta)];
  const list = filter==='all' ? research : research.filter(r => r.cat===filter);
  const typeLabel = { tiktok:'TikTok', flight:'Vuelo', link:'Link', note:'Nota' };

  return (
    <div className="scroll screen-in" style={{ position:'relative' }}>
      <div className="safe-top" />
      <div className="pad">
        <h1 className="display" style={{ fontSize:30, marginTop:6 }}>Ideas & links</h1>
        <div className="muted" style={{ fontWeight:600, fontSize:14, marginTop:2 }}>Todo en un solo lugar, no más notas regadas 📌</div>

        {!isHost && <div style={{ margin:'14px 0 0' }}><GuestBanner person={viewerPerson} /></div>}

        {/* paste bar */}
        {isHost && (
        <button onClick={()=>setAdding(true)} className="card" style={{ width:'100%', marginTop:16, padding:14, display:'flex', gap:11, alignItems:'center', cursor:'pointer', border:'2px dashed var(--line)', background:'transparent' }}>
          <div style={{ width:38, height:38, borderRadius:12, background:'var(--grape-soft)', display:'flex', alignItems:'center', justifyContent:'center', flex:'none' }}>
            <Icon name="plus" size={20} color="var(--grape)" stroke={2.4} />
          </div>
          <div style={{ textAlign:'left' }}>
            <div className="display" style={{ fontSize:15 }}>Pegar link, TikTok o nota</div>
            <div className="muted" style={{ fontSize:12, fontWeight:600 }}>Guárdalo y conviértelo en opción</div>
          </div>
        </button>
        )}

        {/* filter */}
        <div className="chip-row" style={{ margin:'14px 0 4px' }}>
          {cats.map(c => (
            <button key={c} className={'chip'+(filter===c?' on':'')} onClick={()=>setFilter(c)}>
              {c==='all' ? 'Todo' : catMeta[c].label}
            </button>
          ))}
        </div>
      </div>

      <div className="pad col gap12" style={{ marginTop:8 }}>
        {research.length === 0 ? (
          <EmptyState emoji="📌" title="Sin ideas todavía" sub={isHost?'Pega un link de Airbnb, un TikTok o una nota. Se guarda aquí para todo el grupo.':'El anfitrión aún no guarda ideas.'}
            cta={isHost?'Guardar una idea':null} onCta={()=>setAdding(true)} />
        ) : list.map(r => (
          <div key={r.id} className="card" style={{ padding:0, overflow:'hidden', display:'flex' }}>
            <Photo tone={r.tone} h="auto" style={{ width:84, flex:'none', borderRadius:0, minHeight:120 }} />
            <div style={{ padding:13, flex:1 }}>
              <div className="row gap8 center" style={{ marginBottom:7 }}>
                <SourceGlyph type={r.type} />
                <div>
                  <div style={{ fontSize:10.5, fontWeight:700, color:'var(--ink-soft)', letterSpacing:'.03em' }}>{typeLabel[r.type]?.toUpperCase()}</div>
                  <div className="muted nowrap" style={{ fontSize:11, fontWeight:600 }}>guardó {r.saved}</div>
                </div>
              </div>
              <div className="display" style={{ fontSize:14.5, lineHeight:1.15 }}>{r.title}</div>
              <div className="muted" style={{ fontSize:12, fontWeight:500, marginTop:5, lineHeight:1.4 }}>{r.note}</div>
              <div className="row between center" style={{ marginTop:10 }}>
                <span className={'tag tag-'+({hospedaje:'turq',transporte:'grape',actividades:'coral',comida:'sun',general:'turq'})[r.cat]} style={{ fontSize:9.5 }}>
                  {catMeta[r.cat].label}
                </span>
                {r.converted
                  ? <span className="row gap4 center nowrap" style={{ fontSize:11, fontWeight:700, color:'var(--turq-deep)' }}><Icon name="check" size={14} color="var(--turq-deep)" /> Es opción</span>
                  : (isHost && r.cat!=='general')
                    ? <button className="btn btn-sm btn-turq" onClick={()=>convertResearch(r.id)} style={{ padding:'7px 12px', fontSize:12.5 }}>→ Opción</button>
                    : null}
              </div>
            </div>
          </div>
        ))}
        <div className="pb-nav" />
      </div>

      <AddResearchSheet open={adding} catMeta={catMeta} savedBy={viewerPerson.name} onClose={()=>setAdding(false)} onAdd={(it)=>{ addResearch(it); setAdding(false); }} />
    </div>
  );
}

function AddResearchSheet({ open, onClose, onAdd, catMeta, savedBy = 'Ricardo' }) {
  const [val, setVal] = useStateB('');
  const [cat, setCat] = useStateB('actividades');
  useEffectB(() => { if (open){ setVal(''); setCat('actividades'); } }, [open]);
  if (!open) return null;
  const looksLink = /https?:|\.com|\.mx|tiktok|airbnb|booking|instagram/i.test(val);
  const type = /tiktok/i.test(val) ? 'tiktok' : /volaris|aero|vuelo|flight/i.test(val) ? 'flight' : looksLink ? 'link' : 'note';
  return (
    <Sheet open={open} onClose={onClose}>
      <h2 className="display" style={{ fontSize:21, marginBottom:4 }}>Guardar idea</h2>
      <div className="muted" style={{ fontSize:13, fontWeight:600, marginBottom:14 }}>Pega un link o escribe una nota</div>
      <textarea className="input" placeholder="https://tiktok.com/…  o  «mezcalería en La Punta 🍸»"
        value={val} onChange={e=>setVal(e.target.value)} autoFocus />
      <div className="row gap8 center" style={{ margin:'10px 0 4px', fontSize:12, fontWeight:700, color:'var(--ink-soft)' }}>
        <SourceGlyph type={type} /> Detectado como <span style={{ color:'var(--ink)' }}>{ {tiktok:'TikTok',flight:'Vuelo',link:'Link',note:'Nota'}[type] }</span>
      </div>
      <div style={{ fontSize:12, fontWeight:700, color:'var(--ink-soft)', margin:'12px 0 8px' }}>CATEGORÍA</div>
      <div className="row gap6" style={{ flexWrap:'wrap' }}>
        {Object.keys(catMeta).map(c => (
          <button key={c} className={'chip'+(cat===c?' on':'')} onClick={()=>setCat(c)}>{catMeta[c].label}</button>
        ))}
      </div>
      <button className="btn btn-coral btn-block" style={{ marginTop:18 }}
        disabled={!val.trim()}
        onClick={()=>onAdd({ type, cat, title: val.slice(0,52)||'Idea nueva', source: looksLink?val:'Nota', note:'Agregado ahora', saved:savedBy, tone:['pool','sunset','palm','grape','coral'][Math.floor(Math.random()*5)] })}>
        Guardar idea
      </button>
    </Sheet>
  );
}

/* ============================================================
   ITINERARIO
   ============================================================ */
function Itinerary({ ctx }) {
  const { itinerary, trip } = ctx;
  return (
    <div className="scroll screen-in">
      <div className="safe-top" />
      <div className="pad">
        <h1 className="display" style={{ fontSize:30, marginTop:6 }}>Itinerario</h1>
        <div className="muted" style={{ fontWeight:600, fontSize:14, marginTop:2 }}>{itinerary.length ? `${trip.dates} · ${itinerary.length} días en el paraíso` : trip.dates}</div>

        {itinerary.length === 0 ? (
          <EmptyState emoji="🗓️" title="El plan día a día" sub="Cuando elijan actividades y fechas, el itinerario se arma aquí para que todos sepan qué sigue." />
        ) : (
        <div style={{ marginTop:18, position:'relative' }}>
          {/* timeline line */}
          <div style={{ position:'absolute', left:21, top:10, bottom:10, width:2, background:'var(--line)' }} />
          <div className="col gap14">
            {itinerary.map((d,i) => (
              <div key={d.day} className="row" style={{ gap:14, position:'relative' }}>
                <div style={{ flex:'none', zIndex:2 }}>
                  <div style={{ width:44, height:44, borderRadius:14, color:'#fff', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                    background:`var(--${d.tone==='night'?'grape':d.tone==='coral'?'coral':d.tone==='sunset'?'sun':'turq'})`, boxShadow:'var(--sh-sm)' }}>
                    <span style={{ fontSize:9, fontWeight:700, opacity:.85 }}>DÍA</span>
                    <span className="display" style={{ fontSize:18, color:'#fff', lineHeight:.9 }}>{d.day}</span>
                  </div>
                </div>
                <div className="card grow" style={{ padding:14, marginBottom:0 }}>
                  <div>
                    <div className="muted" style={{ fontSize:11.5, fontWeight:700 }}>{d.date}</div>
                    <div className="display" style={{ fontSize:16.5, marginTop:1, lineHeight:1.1 }}>{d.title}</div>
                  </div>
                  <div className="col gap8" style={{ marginTop:11 }}>
                    {d.items.map(([em,txt],ii) => (
                      <div key={ii} className="row gap10 center" style={{ fontSize:13.5, fontWeight:600 }}>
                        <span style={{ fontSize:18, width:24, textAlign:'center', flex:'none' }}>{em}</span>
                        <span style={{ flex:1, minWidth:0 }}>{txt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        )}
        <div className="pb-nav" />
      </div>
    </div>
  );
}

Object.assign(window, { Options, OptionCard, CompareSheet, Budget, Research, Itinerary });
