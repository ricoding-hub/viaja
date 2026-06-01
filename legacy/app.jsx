/* ============================================================
   APP — state, budget engine, navigation, trips, viewer/guest, mount
   ============================================================ */
const { useState: useStateApp, useMemo, useCallback } = React;

const DAYS = 5;
const GOAL = 9000;
const PALETTE = ['#11BFB2','#FF6F5C','#7C6CF0','#FFB43E','#0E8AA6','#E8638F','#3FA796'];

function costOf(o, N) {
  if (o.unit === 'pp')  return o.price * N;
  if (o.unit === 'ppd') return o.price * N * DAYS;
  return o.price;
}

function App() {
  const seed = window.SEED;
  const [screen, setScreen]       = useStateApp('home');
  const [trips, setTrips]         = useStateApp(seed.trips);
  const [people, setPeople]       = useStateApp(seed.people);
  const [options, setOptions]     = useStateApp(seed.options);
  const [research, setResearch]   = useStateApp(seed.research);
  const [activeTripId, setActiveTripId] = useStateApp('pxm');
  const [peopleCount, setPeopleCount]   = useStateApp(5);
  const [viewer, setViewer]       = useStateApp('ric');
  const [toast, setToast]         = useStateApp(null);
  const [confetti, setConfetti]   = useStateApp(false);
  const [creating, setCreating]   = useStateApp(false);
  const [inviteOpen, setInviteOpen] = useStateApp(false);
  const [viewerOpen, setViewerOpen] = useStateApp(false);

  const peopleById = useMemo(() => Object.fromEntries(people.map(p => [p.id, p])), [people]);
  const viewerPerson = peopleById[viewer] || people[0];
  const isHost = !!viewerPerson.host;

  const trip = trips.find(t => t.id === activeTripId) || trips[0];
  const featured = trips.find(t => t.active) || trips[0];
  const membersOf = useCallback((tid) => {
    const t = trips.find(x => x.id === tid);
    return (t ? t.memberIds : []).map(id => peopleById[id]).filter(Boolean);
  }, [trips, peopleById]);
  const members = membersOf(activeTripId);

  const showToast = useCallback((msg) => {
    setToast(msg); clearTimeout(window.__t); window.__t = setTimeout(() => setToast(null), 2200);
  }, []);
  const burst = useCallback(() => {
    setConfetti(true); clearTimeout(window.__c); window.__c = setTimeout(() => setConfetti(false), 1600);
  }, []);

  /* ---- budget engine ---- */
  const computeBudget = useCallback((tid, count) => {
    const tOpts = options.filter(o => o.trip === tid);
    const byCat = {};
    CAT_ORDER.forEach(cat => {
      const winners = tOpts.filter(o => o.cat === cat && o.winner);
      const subtotal = winners.reduce((s,o) => s + costOf(o, count), 0);
      byCat[cat] = { subtotal, perPerson: subtotal / count,
        note: winners.length ? winners.map(w => w.title).join(' + ') : 'Sin elegir aún', winners };
    });
    const total = Object.values(byCat).reduce((s,b) => s + b.subtotal, 0);
    const decided = CAT_ORDER.filter(c => byCat[c].winners.length).length;
    const mem = (trips.find(t => t.id === tid)?.memberIds) || [];
    const confirmed = mem.map(id => peopleById[id]).filter(p => p && (p.host || p.confirmed)).length;
    const votesCast = tOpts.reduce((s,o) => s + Object.keys(o.votes).length, 0);
    const voteScore = tOpts.length ? votesCast / (tOpts.length * count) : 0;
    const progress = Math.round((decided/CAT_ORDER.length*0.5 + Math.min(1,voteScore)*0.3 + (mem.length?confirmed/mem.length:0)*0.2) * 100);
    return { byCat, total, perCap: count ? total / count : 0, decided, progress, optCount: tOpts.length };
  }, [options, trips, peopleById]);

  const budget = useMemo(() => computeBudget(activeTripId, peopleCount), [computeBudget, activeTripId, peopleCount]);
  const homeBudget = useMemo(() => computeBudget(featured.id, featured.people), [computeBudget, featured]);

  /* ---- actions ---- */
  const rate = useCallback((id, n) => {
    setOptions(prev => prev.map(o => o.id === id ? { ...o, votes: { ...o.votes, [viewer]: n } } : o));
  }, [viewer]);

  const toggleWinner = useCallback((id) => {
    if (!isHost) { showToast('Solo el anfitrión decide 🔒'); return; }
    setOptions(prev => {
      const target = prev.find(o => o.id === id);
      const on = !target.winner;
      return prev.map(o => {
        if (o.id === id) return { ...o, winner: on };
        if (on && ['hospedaje','transporte','comida'].includes(target.cat) && o.cat === target.cat) return { ...o, winner: false };
        return o;
      });
    });
    const t = options.find(o => o.id === id);
    if (!t.winner) { burst(); showToast(`¡${t.title} entró al plan! 🎉`); }
    else showToast('Quitada del plan');
  }, [options, isHost, burst, showToast]);

  const addResearch = useCallback((it) => {
    setResearch(prev => [{ ...it, id:'r'+Date.now(), converted:null, trip:activeTripId }, ...prev]);
    showToast('Idea guardada 📌');
  }, [showToast, activeTripId]);

  const convertResearch = useCallback((id) => {
    const r = research.find(x => x.id === id);
    if (!r) return;
    const newId = 'opt-'+id;
    if (!options.find(o => o.id === newId)) {
      setOptions(prev => [...prev, {
        id:newId, cat:r.cat, tone:r.tone, emoji:'✨', trip:activeTripId,
        title:r.title.slice(0,28), subtitle:r.note.slice(0,40),
        price:r.cat==='comida'?400:600, unit:r.cat==='hospedaje'?'total':'pp',
        priceNote:'estimado', meta:[['Fuente',r.saved],['Estado','Nueva']],
        link:r.source, winner:false, votes:{ [viewer]:4 },
      }]);
    }
    setResearch(prev => prev.map(x => x.id === id ? { ...x, converted:newId } : x));
    showToast('Convertida en opción ⭐ ¡ya pueden votarla!');
  }, [research, options, showToast, activeTripId, viewer]);

  const createTrip = useCallback((t) => {
    setTrips(prev => prev.map(x => ({ ...x, active:false })).concat([{
      ...t, active:true, memberIds:['ric','ale'],
    }]));
    setActiveTripId(t.id);
    setPeopleCount(t.people);
    setViewer('ric');
    setScreen('dashboard');
    showToast('¡Viaje creado! 🌴 Agrega opciones');
  }, [showToast]);

  const addGuest = useCallback((name) => {
    const id = 'g'+Date.now();
    const initials = name.trim()[0]?.toUpperCase() || '?';
    const color = PALETTE[(people.length) % PALETTE.length];
    setPeople(prev => [...prev, { id, name:name.trim(), initials, color, confirmed:false }]);
    setTrips(prev => prev.map(t => t.id === activeTripId ? { ...t, memberIds:[...t.memberIds, id], people:t.memberIds.length+1 } : t));
    showToast(`${name.trim()} fue invitado 🎉`);
  }, [people, activeTripId, showToast]);

  const openTrip = useCallback((id) => {
    const t = trips.find(x => x.id === id) || featured;
    setActiveTripId(id);
    setPeopleCount(t.memberIds?.length || t.people || 2);
    setScreen('dashboard');
  }, [trips, featured]);

  const ctx = {
    trip, featured, people, members, membersOf, peopleById,
    options: options.filter(o => o.trip === activeTripId),
    research: research.filter(r => r.trip === activeTripId),
    itinerary: activeTripId === 'pxm' ? seed.itinerary : [],
    peopleCount, setPeopleCount, catMeta: seed.catMeta, trips,
    budget, homeBudget, goal: GOAL, days: DAYS,
    viewer, viewerPerson, isHost,
    rate, toggleWinner, addResearch, convertResearch, createTrip, addGuest,
    toast: showToast, go: setScreen, openTrip,
    backHome: () => { setScreen('home'); },
    startCreate: () => setCreating(true),
    openInvite: () => setInviteOpen(true),
    openViewer: () => setViewerOpen(true),
    setViewer,
  };

  const TABS = [
    { id:'dashboard', label:'Inicio',      ic:'home' },
    { id:'options',   label:'Opciones',    ic:'layers' },
    { id:'budget',    label:'Presupuesto', ic:'wallet' },
    { id:'research',  label:'Ideas',       ic:'inbox' },
    { id:'itinerary', label:'Plan',        ic:'calendar' },
  ];

  const screens = {
    home: <HomeScreen ctx={ctx} />,
    dashboard: <Dashboard ctx={ctx} />,
    options: <Options ctx={ctx} />,
    budget: <Budget ctx={ctx} />,
    research: <Research ctx={ctx} />,
    itinerary: <Itinerary ctx={ctx} />,
    guests: <Guests ctx={ctx} />,
  };

  return (
    <div className="app">
      {screens[screen]}

      {screen !== 'home' && (
        <div className="nav">
          {TABS.map(t => (
            <button key={t.id} className={'nav-btn'+(screen===t.id?' on':'')} onClick={() => setScreen(t.id)}>
              <Icon name={t.ic} size={24} color={screen===t.id?'var(--turq-deep)':'var(--ink-soft)'} stroke={screen===t.id?2.4:2} />
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      )}

      {toast && (
        <div style={{ position:'absolute', left:'50%', bottom: screen==='home'?40:100, transform:'translateX(-50%)',
          zIndex:90, background:'var(--ink)', color:'#fff', padding:'12px 18px', borderRadius:16,
          fontFamily:'var(--font-d)', fontWeight:700, fontSize:13.5, whiteSpace:'nowrap', maxWidth:'92%',
          boxShadow:'var(--sh-lg)', animation:'pop .3s cubic-bezier(.34,1.56,.64,1) both' }}>
          {toast}
        </div>
      )}

      <Confetti show={confetti} />

      <InviteSheet open={inviteOpen} onClose={() => setInviteOpen(false)} onAdd={addGuest} toast={showToast} tripName={trip.name} />
      <ViewerSwitch open={viewerOpen} people={members.length ? members : people} viewer={viewer} onPick={setViewer} onClose={() => setViewerOpen(false)} />
      {creating && <CreateTrip ctx={ctx} onClose={() => setCreating(false)} />}
    </div>
  );
}

function Root() {
  return (
    <div style={{ minHeight:'100vh', width:'100%', display:'flex', alignItems:'center', justifyContent:'center',
      background:'radial-gradient(120% 120% at 50% 0%, #EAF7F4 0%, #E7EEF1 55%, #E4E9EC 100%)', padding:'24px 0' }}>
      <IOSDevice>
        <App />
      </IOSDevice>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Root />);
