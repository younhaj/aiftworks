// ─── app.jsx ──────────────────────────────────────────────────────────────────
// 루트 App: activeNav 상태로 탭 전환, Header에 nextMeeting 전달

const { Sidebar, Header, Toast } = window.CommonUI;
const { TODAY, ME } = window.CommonHelpers;

// ─── ViewToolbar (회의실 탭 툴바) ─────────────────────────────────────────────
const navIconBtn = { width:32, height:32, borderRadius:8, border:'1px solid var(--border)', background:'#FFF', display:'inline-flex', alignItems:'center', justifyContent:'center', color:'var(--ink-700)', cursor:'pointer' };
const { Icon } = window.CommonUI;

function ViewToolbar({ view, onViewChange, weekStart, viewDate, today, onPrev, onNext, onToday, myOnly, onToggleMyOnly, searchValue, onSearch }) {
  const D = window.AppData;
  const ws = weekStart, we = D.addDays(ws, 4);
  let title;
  if (view === 'week') title = `${ws.getMonth()+1}월 ${D.KWEEK[D.weekOfMonth(ws)-1]||''}`;
  else title = `${viewDate.getFullYear()}년 ${viewDate.getMonth()+1}월`;
  const sub = view === 'week' ? `${D.fmtMD(ws)} – ${D.fmtMD(we)}` : '';

  // 범위 체크
  const minKey = D.isoDay(new Date(today.getFullYear(), today.getMonth()-1, 1));
  const maxKey = D.isoDay(new Date(today.getFullYear(), today.getMonth()+7, 0));
  const prevKey = view==='week' ? D.isoDay(D.addDays(ws,-7)) : D.isoDay(new Date(viewDate.getFullYear(),viewDate.getMonth()-1,1));
  const nextKey = view==='week' ? D.isoDay(D.addDays(ws,7))  : D.isoDay(new Date(viewDate.getFullYear(),viewDate.getMonth()+1,1));
  const prevOk = prevKey >= minKey;
  const nextOk = nextKey <= maxKey;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:16, padding:'16px 24px 14px', flexShrink:0 }}>
      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
        <button onClick={onPrev} style={{ ...navIconBtn, opacity:prevOk?1:0.3, cursor:prevOk?'pointer':'default' }}><Icon.ChevronLeft /></button>
        <button onClick={onNext} style={{ ...navIconBtn, opacity:nextOk?1:0.3, cursor:nextOk?'pointer':'default' }}><Icon.ChevronRight /></button>
        <button onClick={onToday} style={{ height:32, padding:'0 12px', borderRadius:8, border:'1px solid var(--border-strong)', background:'#FFF', color:'var(--ink-700)', fontSize:12.5, fontWeight:600, cursor:'pointer', marginLeft:4 }}>오늘</button>
      </div>
      <div style={{ display:'flex', alignItems:'baseline', gap:10, minWidth:0 }}>
        <div style={{ fontSize:22, fontWeight:700, color:'var(--ink-900)' }}>{title}</div>
        {sub && <div style={{ fontSize:13, color:'var(--ink-400)', fontWeight:500 }}>{sub}</div>}
      </div>
      <div style={{ flex:1 }} />
      <div style={{ position:'relative' }}>
        <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--ink-400)' }}><Icon.Search /></span>
        <input value={searchValue} onChange={e => onSearch(e.target.value)} placeholder="회의명·참석자 검색"
          style={{ height:32, paddingLeft:32, paddingRight:12, borderRadius:8, border:'1px solid var(--border-strong)', background:'#FFF', fontSize:12.5, width:220, outline:'none' }} />
      </div>
      <button onClick={onToggleMyOnly} style={{ height:32, padding:'0 14px', borderRadius:999, border:`1px solid ${myOnly?'var(--accent)':'var(--border-strong)'}`, background:myOnly?'var(--accent-soft)':'#FFF', color:myOnly?'var(--accent-ink)':'var(--ink-700)', fontSize:12.5, fontWeight:700, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:6 }}>
        <span style={{ width:14, height:14, borderRadius:'50%', display:'inline-flex', alignItems:'center', justifyContent:'center', background:myOnly?'var(--accent)':'transparent', border:myOnly?'none':'1.5px solid var(--ink-300)', color:'#fff' }}>{myOnly && <Icon.Check />}</span>
        내 회의만
      </button>
      <div style={{ display:'inline-flex', background:'#F3F3F3', borderRadius:8, padding:3, gap:2 }}>
        {[['week','주간'],['month','월간']].map(([v,l]) => (
          <button key={v} onClick={() => onViewChange(v)} style={{ height:26, padding:'0 12px', borderRadius:6, border:'none', background:view===v?'#FFF':'transparent', color:view===v?'var(--ink-900)':'var(--ink-500)', fontSize:12, fontWeight:600, cursor:'pointer', boxShadow:view===v?'0 1px 2px rgba(0,0,0,.06)':'none' }}>{l}</button>
        ))}
      </div>
    </div>
  );
}

// ─── StatusBar (회의실 탭 하단) ───────────────────────────────────────────────
function StatusBar({ reservations, today }) {
  const D = window.AppData;
  const nowMin = 10*60 + 5;
  const rows = D.ROOMS.map(room => {
    const cur = reservations.find(r => r.day===D.isoDay(today) && r.room===room.id && r.start<=nowMin && r.end>nowMin);
    const upcoming = reservations.filter(r => r.day===D.isoDay(today) && r.room===room.id && r.start>nowMin).sort((a,b)=>a.start-b.start)[0];
    return { room, cur, upcoming };
  });
  return (
    <div style={{ flexShrink:0, padding:'14px 24px', borderTop:'1px solid var(--border)', background:'#FFF', display:'flex', alignItems:'center', gap:24 }}>
      <div style={{ fontSize:11, color:'var(--ink-400)', fontWeight:700, letterSpacing:'.08em' }}>NOW</div>
      <div style={{ display:'flex', gap:24, flex:1 }}>
        {rows.map(({ room, cur, upcoming }) => (
          <div key={room.id} style={{ display:'flex', alignItems:'center', gap:12, minWidth:0 }}>
            <span style={{ width:6, height:36, borderRadius:3, background:cur?(room.id==='A'?'var(--accent)':'#3B82F6'):'var(--border-strong)' }} />
            <div>
              <div style={{ fontSize:11, color:'var(--ink-500)', fontWeight:600, marginBottom:2 }}>{room.name}</div>
              {cur ? (
                <div style={{ fontSize:13, fontWeight:700, color:'var(--ink-900)' }}>
                  <span style={{ color:'#DC2626', fontWeight:700, fontSize:11, marginRight:8 }}>● 사용 중</span>
                  {cur.title} <span style={{ color:'var(--ink-500)', fontWeight:500, fontSize:12 }}>~ {D.minutesToLabel(cur.end)}</span>
                </div>
              ) : (
                <div style={{ fontSize:13, fontWeight:700, color:'var(--ink-900)' }}>
                  <span style={{ color:'#10B981', fontWeight:700, fontSize:11, marginRight:8 }}>● 사용 가능</span>
                  {upcoming ? <span style={{ color:'var(--ink-500)', fontWeight:500, fontSize:12 }}>{D.minutesToLabel(upcoming.start)}부터 {upcoming.title}</span> : <span style={{ color:'var(--ink-400)', fontWeight:500, fontSize:12 }}>오늘 남은 일정 없음</span>}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
const D = window.AppData;

const _D = window.AppData;

function App() {
  const [activeNav, setActiveNav] = useState('home');
  const [toast, setToast] = useState(null);

  const [reservations, setReservations] = useState(() => _D.makeSeed());
  const peopleById = useMemo(() => Object.fromEntries(_D.PEOPLE.map(p => [p.id, p])), []);

  const nextMeeting = useMemo(() => {
    const nowMin = 10*60 + 5;
    const todayResv = reservations.filter(r =>
      r.day === _D.isoDay(TODAY) &&
      (r.me || r.attendees.includes('u1') || r.organizerId === 'u1') &&
      r.end > nowMin
    );
    return todayResv.sort((a,b) => a.start - b.start)[0] || null;
  }, [reservations]);

  const handleNavChange = (tab) => setActiveNav(tab);

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden' }}>
      <Sidebar active={activeNav} onChange={handleNavChange} />
      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
        <Header
          nextMeeting={nextMeeting}
          onCheckIn={() => setToast({ kind:'success', msg:'체크인이 완료되었어요.' })}
          onCancelMeeting={() => setToast({ kind:'info', msg:'회의 취소를 요청했어요.' })}
        />
        <div style={{ flex:1, display:'flex', minHeight:0, overflow:'hidden' }}>
          {/* 대시보드 */}
          {activeNav === 'home' && <Dashboard />}

          {/* 회의실 탭 — 기존 SidePanel + Timetable/MonthlyView + modals */}
          {activeNav === 'rooms' && (
            <RoomsTab
              reservations={reservations}
              setReservations={setReservations}
              peopleById={peopleById}
              onToast={setToast}
            />
          )}

          {/* 연차 탭 */}
          {activeNav === 'people' && <LeaveTab onNavChange={handleNavChange} />}

          {/* 설정 탭 (플레이스홀더) */}
          {activeNav === 'settings' && (
            <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--ink-400)', fontSize:15, fontWeight:600 }}>
              설정 페이지 준비 중이에요.
            </div>
          )}
        </div>
      </div>
      {toast && <Toast message={toast.msg} kind={toast.kind} onClose={() => setToast(null)} />}
    </div>
  );
}

function RoomsTab({ reservations, setReservations, peopleById, onToast }) {
  const today = TODAY;
  const [view, setView] = useState('week');
  const [viewDate, setViewDate] = useState(today);
  const [selectedDate, setSelectedDate] = useState(today);
  const [roomsFilter, setRoomsFilter] = useState(['A','B']);
  const [myOnly, setMyOnly] = useState(false);
  const [search, setSearch] = useState('');
  const [bookingInit, setBookingInit] = useState(null);
  const [quickBook, setQuickBook] = useState(null);
  const [detail, setDetail] = useState(null);
  const nowMinutes = 10*60 + 5;

  const weekStart = useMemo(() => _D.startOfWeek(viewDate), [viewDate]);
  const visibleReservations = useMemo(() => {
    const q = search.trim().toLowerCase();
    return reservations.filter(r => {
      if (q) {
        const orgName = (peopleById[r.organizerId]||{}).name || '';
        const attNames = r.attendees.map(id => (peopleById[id]||{}).name || '').join(' ');
        if (!(r.title.toLowerCase().includes(q) || orgName.toLowerCase().includes(q) || attNames.toLowerCase().includes(q))) return false;
      }
      return true;
    });
  }, [reservations, search, peopleById]);

  const roomsForView = _D.ROOMS.filter(r => roomsFilter.includes(r.id));

  const roomBounds = { min: _D.isoDay(new Date(today.getFullYear(),today.getMonth()-1,1)), max: _D.isoDay(new Date(today.getFullYear(),today.getMonth()+7,0)) };
  const handlePrev = () => {
    if (view==='week') { const p=_D.addDays(viewDate,-7); if(_D.isoDay(p)>=roomBounds.min) setViewDate(p); }
    else { const p=new Date(viewDate.getFullYear(),viewDate.getMonth()-1,1); if(_D.isoDay(p)>=roomBounds.min) setViewDate(p); }
  };
  const handleNext = () => {
    if (view==='week') { const n=_D.addDays(viewDate,7); if(_D.isoDay(n)<=roomBounds.max) setViewDate(n); }
    else { const n=new Date(viewDate.getFullYear(),viewDate.getMonth()+1,1); if(_D.isoDay(n)<=roomBounds.max) setViewDate(n); }
  };
  const handleToday = () => { setViewDate(today); setSelectedDate(today); };

  const handleSelectSlot = ({ day, roomId, start, end }) => setBookingInit({ day, roomId, start, end, attendeeIds:['u1'] });
  const handleNewBook = () => {
    const s = Math.ceil(nowMinutes / 30) * 30;
    setBookingInit({ day:selectedDate, roomId:roomsFilter[0]||'A', start:s, end:s+60, attendeeIds:['u1'], title:'' });
  };

  const handleBookingSubmit = (data) => {
    setReservations(prev => [...prev, {
      id:'r'+Date.now(), day:_D.isoDay(data.day), room:data.roomId,
      start:data.start, end:data.end, title:data.title,
      organizerId:'u1', attendees:data.attendeeIds,
      category:data.category, desc:data.desc, me:true,
    }]);
    setBookingInit(null);
    onToast({ kind:'success', msg:`${_D.ROOMS.find(r=>r.id===data.roomId).name}에 「${data.title}」 예약이 완료됐어요.` });
  };

  const handleCancel = () => {
    setReservations(prev => prev.filter(r => r.id !== detail.id));
    setDetail(null);
    onToast({ kind:'info', msg:'예약이 취소되었습니다.' });
  };

  return (
    <div style={{ flex:1, display:'flex', minHeight:0 }}>
      <SidePanel
        weekStart={weekStart} viewDate={viewDate}
        selectedDate={selectedDate} onSelectDate={(d) => { setSelectedDate(d); setViewDate(d); }}
        onMonthChange={(delta) => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth()+delta, 1))}
        today={today} reservations={reservations} peopleById={peopleById}
        roomsFilter={roomsFilter}
        onToggleRoom={(id) => setRoomsFilter(prev => prev.includes(id) ? (prev.length>1 ? prev.filter(x=>x!==id) : prev) : [...prev,id])}
        onNewBook={handleNewBook}
      />
      <main style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0, background:'var(--bg)' }}>
        <ViewToolbar
          view={view} onViewChange={setView}
          weekStart={weekStart} viewDate={viewDate} today={today}
          onPrev={handlePrev} onNext={handleNext} onToday={handleToday}
          myOnly={myOnly} onToggleMyOnly={() => setMyOnly(v=>!v)}
          searchValue={search} onSearch={setSearch}
        />
        <div style={{ flex:1, padding:'0 24px 16px', minHeight:0, display:'flex' }}>
          {view === 'week' ? (
            <Timetable
              weekStart={weekStart} today={today} rooms={roomsForView}
              reservations={visibleReservations} peopleById={peopleById}
              onSelectSlot={handleSelectSlot} onResvClick={setDetail}
              myOnly={myOnly} nowMinutes={nowMinutes}
            />
          ) : (
            <MonthlyView
              viewDate={viewDate} today={today} rooms={roomsForView}
              reservations={visibleReservations} peopleById={peopleById}
              onResvClick={setDetail} onSelectSlot={handleSelectSlot} myOnly={myOnly}
            />
          )}
        </div>
        <StatusBar reservations={reservations} today={today} />
      </main>

      {bookingInit && (
        <BookingModal
          initial={bookingInit} reservations={reservations} peopleById={peopleById}
          today={today} nowMinutes={nowMinutes}
          onClose={() => setBookingInit(null)} onSubmit={handleBookingSubmit}
        />
      )}
      {quickBook && (
        <QuickBookModal
          today={today} nowMinutes={nowMinutes}
          reservations={reservations} peopleById={peopleById}
          defaultRoomId={roomsFilter[0]||'A'}
          onClose={() => setQuickBook(null)}
          onSubmit={({ roomId, start, end }) => {
            setReservations(prev => [...prev, {
              id:'r'+Date.now(), day:_D.isoDay(today), room:roomId,
              start, end, title:'바로 예약 회의',
              organizerId:'u1', attendees:['u1'], category:'회의', me:true,
            }]);
            setQuickBook(null);
            onToast({ kind:'success', msg:`${_D.ROOMS.find(r=>r.id===roomId).name}에 ${_D.minutesToLabel(start)}–${_D.minutesToLabel(end)} 바로 예약을 완료했어요.` });
          }}
        />
      )}
      {detail && (
        <ResvDetail
          r={detail} peopleById={peopleById}
          onClose={() => setDetail(null)}
          onCancel={handleCancel}
          onEdit={() => { setBookingInit({ day:new Date(detail.day+'T00:00:00'), roomId:detail.room, start:detail.start, end:detail.end, attendeeIds:detail.attendees, title:detail.title, desc:detail.desc, category:detail.category }); setDetail(null); }}
          onExtend={() => onToast({ kind:'success', msg:'30분 연장 요청을 보냈어요.' })}
          onCheckIn={() => onToast({ kind:'success', msg:'체크인이 완료되었어요.' })}
        />
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
