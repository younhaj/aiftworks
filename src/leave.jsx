// ─── leave.jsx ────────────────────────────────────────────────────────────────
// 연차 탭 전체 컴포넌트 (수정사항 전체 반영)

const {
  PEOPLE_LEAVE, LEAVE_TYPES, ATTACH_REASONS, LEAVE_REASONS, ICON_MAP,
  SEED_LEAVES, TIME_OPTIONS, calcStats, getDefaultTime, lt, lr, personLeave,
} = window.LeaveData;

const { Icon, fieldLabel, textInput, navIconBtn } = window.CommonUI;
const { TODAY, DOW_KO, DAYS_KO, ME, isoDay, addDays, startOfWeek, sameDay, fmtKDate, dDay } = window.CommonHelpers;

// ─── 조회 범위: 과거 1개월 ~ 미래 6개월 말 ────────────────────────────────────
function getViewBounds(today) {
  const pastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const futureEnd = new Date(today.getFullYear(), today.getMonth() + 7, 0);
  return { min: isoDay(pastMonth), max: isoDay(futureEnd) };
}

// ─── 주간 타이틀: N월 N째주 MM.DD-MM.DD ──────────────────────────────────────
function weekTitle(weekStart) {
  const we = addDays(weekStart, 4);
  const year = weekStart.getFullYear(), month = weekStart.getMonth();
  const first = new Date(year, month, 1);
  const firstMonday = new Date(first);
  const dow = first.getDay();
  firstMonday.setDate(first.getDate() + (dow === 0 ? 1 : dow === 1 ? 0 : 8 - dow));
  firstMonday.setHours(0,0,0,0);
  const weekNum = Math.max(1, Math.round((weekStart - firstMonday) / (7*24*3600*1000)) + 1);
  const KWEEK = ['첫째주','둘째주','셋째주','넷째주','다섯째주'];
  const pad = n => String(n).padStart(2,'0');
  const fmt = d => `${d.getMonth()+1}.${pad(d.getDate())}`;
  return `${month+1}월 ${KWEEK[weekNum-1]||''}  ${fmt(weekStart)}–${fmt(we)}`;
}

// ─── View Toolbar ─────────────────────────────────────────────────────────────
function LeaveToolbar({ view, onViewChange, viewDate, weekStart, today, onPrev, onNext, onToday, myOnly, onToggleMyOnly, search, onSearch, listRange, onListRangeChange }) {
  const year = viewDate.getFullYear(), month = viewDate.getMonth();
  let title;
  if (view === 'week') title = weekTitle(weekStart);
  else if (view === 'month') title = `${year}년 ${month+1}월`;
  else title = '내 연차 전체보기';

  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, padding:'16px 24px 14px', flexShrink:0, flexWrap:'wrap' }}>
      {view !== 'list' && (() => {
        const bounds = getViewBounds(today);
        const year2 = viewDate.getFullYear(), month2 = viewDate.getMonth();
        const prevMonthKey = isoDay(new Date(year2,month2-1,1));
        const prevWeekKey  = isoDay(addDays(weekStart,-7));
        const nextMonthKey = isoDay(new Date(year2,month2+1,1));
        const nextWeekKey  = isoDay(addDays(weekStart,7));
        const prevOk = view==='week' ? prevWeekKey>=bounds.min : prevMonthKey>=bounds.min;
        const nextOk = view==='week' ? nextWeekKey<=bounds.max : nextMonthKey<=bounds.max;
        return (
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <button onClick={onPrev} style={{ ...navIconBtn, opacity:prevOk?1:0.3, cursor:prevOk?'pointer':'default' }}><Icon.ChevronLeft /></button>
            <button onClick={onNext} style={{ ...navIconBtn, opacity:nextOk?1:0.3, cursor:nextOk?'pointer':'default' }}><Icon.ChevronRight /></button>
            <button onClick={onToday} style={{ height:32, padding:'0 12px', borderRadius:8, border:'1px solid var(--border-strong)', background:'#FFF', color:'var(--ink-700)', fontSize:12.5, fontWeight:600, cursor:'pointer', marginLeft:4 }}>오늘</button>
          </div>
        );
      })()}
      {view === 'week' ? (
        <div style={{ display:'flex', alignItems:'baseline', gap:10, minWidth:0 }}>
          <div style={{ fontSize:22, fontWeight:700, color:'var(--ink-900)' }}>{weekTitle(weekStart).split('  ')[0]}</div>
          <div style={{ fontSize:13, color:'var(--ink-400)', fontWeight:500 }}>{weekTitle(weekStart).split('  ')[1]||''}</div>
        </div>
      ) : (
        <div style={{ fontSize:20, fontWeight:700, color:'var(--ink-900)' }}>{title}</div>
      )}
      <div style={{ flex:1 }} />

      {view === 'list' && (
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ fontSize:12, color:'var(--ink-500)', fontWeight:500 }}>조회기간</span>
          <input type="date" value={listRange.from} onChange={e => onListRangeChange({...listRange, from:e.target.value})}
            style={{ height:32, padding:'0 10px', borderRadius:8, border:'1px solid var(--border-strong)', fontSize:12.5, outline:'none', background:'#FFF', fontFamily:'inherit' }} />
          <span style={{ color:'var(--ink-400)', fontSize:13 }}>–</span>
          <input type="date" value={listRange.to} onChange={e => onListRangeChange({...listRange, to:e.target.value})}
            style={{ height:32, padding:'0 10px', borderRadius:8, border:'1px solid var(--border-strong)', fontSize:12.5, outline:'none', background:'#FFF', fontFamily:'inherit' }} />
        </div>
      )}

      {view !== 'list' && (
        <>
          <div style={{ position:'relative' }}>
            <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--ink-400)', display:'inline-flex' }}><Icon.Search /></span>
            <input value={search} onChange={e => onSearch(e.target.value)} placeholder="사원 이름 검색"
              style={{ height:32, paddingLeft:32, paddingRight:12, borderRadius:8, border:'1px solid var(--border-strong)', background:'#FFF', fontSize:12.5, width:180, outline:'none' }} />
          </div>
          <button onClick={onToggleMyOnly} style={{ height:32, padding:'0 14px', borderRadius:999, border:`1px solid ${myOnly?'var(--accent)':'var(--border-strong)'}`, background:myOnly?'var(--accent-soft)':'#FFF', color:myOnly?'var(--accent-ink)':'var(--ink-700)', fontSize:12.5, fontWeight:700, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:6 }}>
            <span style={{ width:14, height:14, borderRadius:'50%', display:'inline-flex', alignItems:'center', justifyContent:'center', background:myOnly?'var(--accent)':'transparent', border:myOnly?'none':'1.5px solid var(--ink-300)', color:'#fff' }}>{myOnly && <Icon.Check />}</span>
            내 연차만
          </button>
        </>
      )}

      <div style={{ display:'inline-flex', background:'#F3F3F3', borderRadius:8, padding:3, gap:2 }}>
        {[['week','주간'],['month','월간'],['list','히스토리']].map(([v,l]) => (
          <button key={v} onClick={() => onViewChange(v)} style={{ height:26, padding:'0 12px', borderRadius:6, border:'none', background:view===v?'#FFF':'transparent', color:view===v?'var(--ink-900)':'var(--ink-500)', fontSize:12, fontWeight:600, cursor:'pointer', boxShadow:view===v?'0 1px 2px rgba(0,0,0,.06)':'none' }}>
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Weekly View ──────────────────────────────────────────────────────────────
function LeaveWeekly({ weekStart, today, leaves, onDateClick, onLeaveClick, myOnly, searchName }) {
  const bounds = getViewBounds(today);
  const todayKey = isoDay(today);
  const days = Array.from({ length:5 }, (_,i) => addDays(weekStart, i));
  const [hoverIdx, setHoverIdx] = useState(null);

  const filtered = useMemo(() => {
    let list = leaves.filter(l => l.date >= bounds.min && l.date <= bounds.max);
    if (myOnly) list = list.filter(l => l.userId === 'u1');
    if (searchName.trim()) list = list.filter(l => personLeave(l.userId).name.includes(searchName.trim()));
    return list;
  }, [leaves, myOnly, searchName, bounds.min, bounds.max]);
  const byDay = useMemo(() => { const m={}; for(const l of filtered)(m[l.date]=m[l.date]||[]).push(l); return m; }, [filtered]);

  return (
    <div style={{ background:'#FFF', borderRadius:12, border:'1px solid var(--border)', overflow:'hidden', display:'flex', flexDirection:'column', flex:1, minHeight:0 }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', borderBottom:'1px solid var(--border)', background:'#FCFCFC' }}>
        {days.map((d,i) => {
          const isToday = sameDay(d, today);
          const dayKey = isoDay(d);
          const isPastHeader = !isToday && dayKey < todayKey;
          return (
            <div key={i} style={{ padding:'10px 4px 8px', borderRight:i<4?'1px solid var(--border)':'none', textAlign:'center', background:isToday?'var(--accent-soft)':'#FFF', position:'sticky', top:0, zIndex:4 }}>
              <div style={{ fontSize:10.5, color:isToday?'var(--accent-ink)':isPastHeader?'var(--ink-300)':'var(--ink-400)', fontWeight:600, letterSpacing:'.06em' }}>{DAYS_KO[i]}</div>
              <div style={{ fontSize:18, fontWeight:700, marginTop:2, color:isToday?'var(--accent-ink)':isPastHeader?'var(--ink-300)':'var(--ink-900)' }}>{d.getDate()}</div>
            </div>
          );
        })}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', flex:1, minHeight:0, overflow:'auto' }}>
        {days.map((d,i) => {
          const dayKey = isoDay(d);
          const outOfBounds = dayKey < bounds.min || dayKey > bounds.max;
          const isPast = !sameDay(d,today) && dayKey < todayKey;
          const isBlocked = isPast || outOfBounds;
          const list = byDay[dayKey] || [];
          const isToday = sameDay(d, today);
          return (
            <div key={i}
              onClick={() => { if (isBlocked) return; onDateClick(d); }}
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(null)}
              style={{
                borderRight: i<4?'1px solid var(--border)':'none',
                padding: '12px 10px',
                display: 'flex', flexDirection: 'column', gap: 6,
                backgroundColor: isToday ? '#FFFBF0' : (!isBlocked && hoverIdx===i) ? '#FFFBF2' : outOfBounds ? '#F7F7F7' : '#FFF',
                backgroundImage: isBlocked ? 'repeating-linear-gradient(45deg,rgba(220,220,220,.35) 0 4px,rgba(243,243,243,.35) 4px 8px)' : 'none',
                cursor: isBlocked ? 'not-allowed' : 'pointer',
                minHeight: 120, position: 'relative',
              }}>
              {!isBlocked && hoverIdx === i && (
                <span style={{ position:'absolute', top:6, right:6, width:18, height:18, borderRadius:4, background:'var(--accent)', color:'#fff', display:'inline-flex', alignItems:'center', justifyContent:'center', pointerEvents:'none' }}>
                  <Icon.Plus />
                </span>
              )}
              {list.length === 0 && !isBlocked && <div style={{ color:'var(--ink-200)', fontSize:11, textAlign:'center', marginTop:8 }}>+</div>}
              <div style={{ display:'flex', flexDirection:'column', gap:6, opacity: outOfBounds ? 0.25 : isPast ? 0.55 : 1 }}>
                {list.map(l => {
                  const t = lt(l.type), p = personLeave(l.userId), isMe = l.userId === 'u1';
                  return (
                    <button key={l.id} onClick={e => { e.stopPropagation(); onLeaveClick(l); }}
                      style={{ appearance:'none', border:'none', textAlign:'left', background:t.bg, padding:'6px 8px', borderRadius:6, cursor:'pointer', display:'flex', alignItems:'center', gap:6, width:'100%' }}>
                      <span style={{ width:18, height:18, borderRadius:'50%', background:p.color, color:'#fff', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:700, flexShrink:0 }}>{p.initial}</span>
                      <div style={{ minWidth:0, flex:1 }}>
                        <div style={{ fontSize:11, fontWeight:700, color:t.fg, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.name}</div>
                        <div style={{ fontSize:10, color:'var(--ink-500)', marginTop:1 }}>{t.label}</div>
                      </div>
                      {isMe && <span style={{ fontSize:9, fontWeight:700, background:t.color, color:'#fff', padding:'1px 4px', borderRadius:3, flexShrink:0 }}>MY</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Monthly View ─────────────────────────────────────────────────────────────
function LeaveCalendar({ viewDate, today, leaves, onDateClick, onLeaveClick, myOnly, searchName }) {
  const bounds = getViewBounds(today);
  const year = viewDate.getFullYear(), month = viewDate.getMonth();
  const first = new Date(year, month, 1), start = startOfWeek(first);
  const weeks = []; for(let w=0;w<6;w++){const row=[];for(let i=0;i<5;i++)row.push(addDays(start,w*7+i));weeks.push(row);}
  const days = weeks.filter(r => r.some(d => d.getMonth() === month)).flat();
  const [hover, setHover] = useState(null);
  const todayKey = isoDay(today);

  const filtered = useMemo(() => {
    let list = leaves.filter(l => l.date >= bounds.min && l.date <= bounds.max);
    if (myOnly) list = list.filter(l => l.userId === 'u1');
    if (searchName.trim()) list = list.filter(l => personLeave(l.userId).name.includes(searchName.trim()));
    return list;
  }, [leaves, myOnly, searchName, bounds.min, bounds.max]);
  const byDay = useMemo(() => { const m={}; for(const l of filtered)(m[l.date]=m[l.date]||[]).push(l); return m; }, [filtered]);

  return (
    <div style={{ background:'#FFF', borderRadius:12, border:'1px solid var(--border)', overflow:'hidden', display:'flex', flexDirection:'column', flex:1, minHeight:0 }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', borderBottom:'1px solid var(--border)', background:'#FCFCFC' }}>
        {DAYS_KO.map((d,i) => <div key={d} style={{ padding:'10px 12px', fontSize:11, fontWeight:600, letterSpacing:'.06em', color:'var(--ink-500)', borderRight:i<4?'1px solid var(--border)':'none' }}>{d}</div>)}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gridAutoRows:'minmax(0,1fr)', flex:1, minHeight:0 }}>
        {days.map((d,idx) => {
          const inMonth = d.getMonth() === month, isToday = sameDay(d, today);
          const dayKey = isoDay(d);
          const outOfBounds = dayKey < bounds.min || dayKey > bounds.max;
          const isPast = !isToday && dayKey < todayKey;
          const isBlocked = isPast || outOfBounds;
          const list = byDay[dayKey] || [], dow = idx%5, isHov = hover===idx && !isBlocked;
          return (
            <div key={idx} onMouseEnter={()=>setHover(idx)} onMouseLeave={()=>setHover(null)}
              onClick={() => { if (isBlocked) return; onDateClick(d); }}
              style={{
                borderRight: dow<4?'1px solid var(--border)':'none',
                borderBottom: idx<days.length-5?'1px solid var(--border)':'none',
                padding: '8px 10px 6px',
                backgroundColor: isToday ? 'var(--accent-soft)' : (isHov ? '#FFFBF2' : (outOfBounds ? '#F7F7F7' : (inMonth ? '#FFF' : '#FAFAFA'))),
                backgroundImage: isBlocked ? 'repeating-linear-gradient(45deg,rgba(220,220,220,.35) 0 4px,rgba(243,243,243,.35) 4px 8px)' : 'none',
                display: 'flex', flexDirection: 'column', gap: 4,
                minHeight: 0, position: 'relative',
                cursor: isBlocked ? 'not-allowed' : 'pointer',
              }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <span style={{ fontSize:13, fontWeight:700, color:!inMonth||outOfBounds?'#CFCFCF':isPast?'#BDBDBD':isToday?'var(--accent-ink)':'var(--ink-900)' }}>{d.getDate()}</span>
                {isHov && <span style={{ position:'absolute', top:4, right:6, width:18, height:18, borderRadius:4, background:'var(--accent)', color:'#fff', display:'inline-flex', alignItems:'center', justifyContent:'center' }}><Icon.Plus /></span>}
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:3, overflow:'hidden', opacity:outOfBounds?0.25:isPast?0.55:1 }}>
                {list.slice(0,3).map(l => {
                  const t = lt(l.type), p = personLeave(l.userId), isMe = l.userId === 'u1';
                  return (
                    <button key={l.id} onClick={e => { e.stopPropagation(); onLeaveClick(l); }} style={{ appearance:'none', border:'none', textAlign:'left', background:t.bg, padding:'3px 6px', borderRadius:4, fontSize:10.5, lineHeight:1.25, color:'var(--ink-900)', fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', cursor:'pointer', display:'flex', alignItems:'center', gap:5 }}>
                      <span style={{ width:14, height:14, borderRadius:'50%', background:p.color, color:'#fff', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:8, fontWeight:700, flexShrink:0 }}>{p.initial}</span>
                      <span style={{ color:t.fg, fontWeight:700, flexShrink:0 }}>{t.label}</span>
                      {!isMe && <span style={{ color:'var(--ink-500)', fontSize:10, overflow:'hidden', textOverflow:'ellipsis' }}>{p.name}</span>}
                    </button>
                  );
                })}
                {list.length > 3 && <span style={{ fontSize:10, color:'var(--ink-400)' }}>+{list.length-3}건</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── List View ────────────────────────────────────────────────────────────────
function LeaveListView({ leaves, today, listRange, stats, onEditLeave, onWithdrawLeave }) {
  const todayKey = isoDay(today);
  const [moreMenuId, setMoreMenuId] = useState(null);

  const filtered = useMemo(() => {
    return leaves
      .filter(l => l.userId === 'u1' && l.date >= listRange.from && l.date <= listRange.to)
      .sort((a,b) => b.date.localeCompare(a.date));
  }, [leaves, listRange]);

  const withCumulative = useMemo(() => {
    // 누적은 전체 내역 기준
    const allMy = leaves.filter(l => l.userId === 'u1').sort((a,b) => a.date.localeCompare(b.date));
    let cum = 0;
    const cumMap = {};
    for (const l of allMy) { cum += l.days; cumMap[l.id] = cum; }
    return filtered.map(l => ({ ...l, cumDays: cumMap[l.id] || l.days }));
  }, [filtered, leaves]);

  const th = (label, w) => (
    <th style={{ padding:'9px 12px', fontSize:11, fontWeight:700, color:'var(--ink-400)', letterSpacing:'.04em', textTransform:'uppercase', borderBottom:'1px solid var(--border-strong)', textAlign:'center', background:'#FCFCFC', width:w, whiteSpace:'nowrap' }}>{label}</th>
  );
  const td = (children, extra={}) => (
    <td style={{ padding:'10px 12px', fontSize:12.5, color:'var(--ink-700)', borderBottom:'1px solid var(--border)', textAlign:'center', verticalAlign:'middle', ...extra }}>{children}</td>
  );

  return (
    <div style={{ flex:1, overflow:'auto', background:'#FFF', borderRadius:12, border:'1px solid var(--border)' }}>
      {withCumulative.length === 0 ? (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:200, color:'var(--ink-400)', fontSize:14 }}>
          해당 기간에 연차 내역이 없어요.
        </div>
      ) : (
        <table style={{ width:'100%', borderCollapse:'collapse', tableLayout:'auto' }}>
          <thead>
            <tr>
              {th('번호', 44)}
              {th('휴가구분', 100)}
              {th('사용일수', 72)}
              {th('시작일', 110)}
              {th('종료일', 110)}
              {th('사유', 90)}
              {th('누적사용일수', 100)}
              {th('신청일자', 100)}
              {th('첨부파일', 80)}
              {th('관리자 확인', 90)}
              {th('', 48)}
            </tr>
          </thead>
          <tbody>
            {withCumulative.map((l, idx) => {
              const t = lt(l.type);
              const d = new Date(l.date+'T00:00:00');
              const isUpcoming = l.date >= todayKey;
              const isMenuOpen = moreMenuId === l.id;
              const dateStr = `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;
              return (
                <tr key={l.id} style={{ background: idx%2===0 ? '#FFF' : '#FAFAFA' }}>
                  {td(<span style={{ color:'var(--ink-400)', fontSize:11 }}>{idx+1}</span>)}
                  {td(
                    <span style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:12, fontWeight:700, padding:'2px 8px', borderRadius:4, background:t.bg, color:t.fg }}>
                      <span style={{ width:5, height:5, borderRadius:'50%', background:t.color, flexShrink:0 }} />{t.label}
                    </span>
                  )}
                  {td(<span style={{ fontWeight:700 }}>{l.days}일</span>)}
                  {td(<><span>{dateStr}</span><span style={{ fontSize:10.5, color:'var(--ink-400)', marginLeft:4 }}>({DOW_KO[d.getDay()]})</span></>)}
                  {td(<><span>{dateStr}</span><span style={{ fontSize:10.5, color:'var(--ink-400)', marginLeft:4 }}>({DOW_KO[d.getDay()]})</span></>)}
                  {td(<span style={{ color:'var(--ink-700)' }}>{(window.LeaveData.lr(l.reason)||{}).label||l.reason}</span>)}
                  {td(<span style={{ fontWeight:700, color:'var(--accent-ink)' }}>{l.cumDays}일</span>)}
                  {td(<span>{(l.createdAt||l.date).replace(/-/g,'.')}</span>)}
                  {td(
                    l.file
                      ? <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:11.5, color:'var(--blue)', fontWeight:600, cursor:'pointer' }}><Icon.Paperclip />{l.file}</span>
                      : <span style={{ color:'var(--ink-300)' }}>–</span>
                  )}
                  {td(
                    l.status === 'confirmed'
                      ? <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:11.5, fontWeight:700, color:'#065F46', background:'#D1FAE5', padding:'2px 8px', borderRadius:4 }}><Icon.Check />확인</span>
                      : <span style={{ fontSize:11.5, fontWeight:600, color:'var(--ink-400)', background:'#F3F3F3', padding:'2px 8px', borderRadius:4 }}>대기중</span>
                  )}
                  <td style={{ padding:'10px 8px', borderBottom:'1px solid var(--border)', textAlign:'center', verticalAlign:'middle', position:'relative' }}>
                    {isUpcoming && (
                      <>
                        <button onClick={e => { e.stopPropagation(); setMoreMenuId(isMenuOpen ? null : l.id); }}
                          style={{ width:28, height:28, borderRadius:6, border:'none', background:'transparent', color:'var(--ink-400)', display:'inline-flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                          <Icon.MoreH />
                        </button>
                        {isMenuOpen && (
                          <div style={{ position:'absolute', right:8, top:'calc(100% - 4px)', background:'#FFF', border:'1px solid var(--border-strong)', borderRadius:8, boxShadow:'0 4px 16px rgba(0,0,0,.10)', zIndex:20, minWidth:100, overflow:'hidden' }}>
                            <button onClick={() => { setMoreMenuId(null); onEditLeave(l); }}
                              style={{ width:'100%', padding:'8px 12px', border:'none', background:'transparent', display:'flex', alignItems:'center', gap:6, fontSize:12, color:'var(--ink-700)', cursor:'pointer', textAlign:'left' }}>
                              <Icon.Edit /> 수정
                            </button>
                            <button onClick={() => { setMoreMenuId(null); onWithdrawLeave(l); }}
                              style={{ width:'100%', padding:'8px 12px', border:'none', background:'transparent', display:'flex', alignItems:'center', gap:6, fontSize:12, color:'var(--red)', cursor:'pointer', textAlign:'left' }}>
                              <Icon.Trash /> 철회
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ─── Side Mini Calendar ───────────────────────────────────────────────────────
function SideMiniCalendar({ viewDate, today, leaves, selectedDate, onSelect, onMonthChange }) {
  const bounds = getViewBounds(today);
  const year = viewDate.getFullYear(), month = viewDate.getMonth();
  const first = new Date(year, month, 1), start = startOfWeek(first);
  const weeks = []; for(let w=0;w<6;w++){const row=[];for(let i=0;i<5;i++)row.push(addDays(start,w*7+i));weeks.push(row);}
  const cells = weeks.filter(r => r.some(d => d.getMonth() === month)).flat();
  const [hover, setHover] = useState(null);
  const leaveDays = new Set(leaves.filter(l => l.userId === 'u1').map(l => l.date));

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
        {(() => {
          const bounds = getViewBounds(today);
          const prevOk = isoDay(new Date(year,month-1,1)) >= bounds.min;
          const nextOk = isoDay(new Date(year,month+1,1)) <= bounds.max;
          return (<>
            <button onClick={() => { if(prevOk) onMonthChange(-1); }} style={{ width:22, height:22, borderRadius:6, border:'none', background:'transparent', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--ink-500)', cursor:prevOk?'pointer':'default', opacity:prevOk?1:0.3 }}><Icon.ChevronLeft /></button>
            <div style={{ fontSize:13, fontWeight:600, color:'var(--ink-900)' }}>{year}년 {month+1}월</div>
            <button onClick={() => { if(nextOk) onMonthChange(1); }} style={{ width:22, height:22, borderRadius:6, border:'none', background:'transparent', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--ink-500)', cursor:nextOk?'pointer':'default', opacity:nextOk?1:0.3 }}><Icon.ChevronRight /></button>
          </>);
        })()}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', fontSize:10.5, color:'var(--ink-400)', textAlign:'center', marginBottom:4 }}>
        {DAYS_KO.map(d => <div key={d} style={{ padding:'4px 0' }}>{d}</div>)}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', rowGap:2 }}>
        {cells.map((d,i) => {
          const inMonth = d.getMonth() === month, isToday = sameDay(d, today);
          const isSel = selectedDate && sameDay(d, selectedDate);
          const dayKey = isoDay(d);
          const outOfBounds = dayKey < bounds.min || dayKey > bounds.max;
          const hasLeave = leaveDays.has(dayKey), isHov = hover && sameDay(hover, d);
          return (
            <button key={i} onClick={() => { if (!outOfBounds) onSelect(d); }}
              onMouseEnter={() => setHover(d)} onMouseLeave={() => setHover(null)}
              style={{ appearance:'none', border:'none', background:isSel?'var(--accent)':(isHov&&!outOfBounds?'var(--accent-soft)':'transparent'), padding:0, height:30, position:'relative', cursor:outOfBounds?'default':'pointer', borderRadius:6, color:!inMonth||outOfBounds?'#CFCFCF':isSel?'#fff':'var(--ink-700)', fontSize:12, fontWeight:isToday||isSel?700:500, opacity:outOfBounds?0.35:1 }}>
              <span>{d.getDate()}</span>
              {!isSel && hasLeave && !outOfBounds && <span style={{ position:'absolute', bottom:3, left:'50%', transform:'translateX(-50%)', width:4, height:4, borderRadius:'50%', background:'var(--accent)' }} />}
              {isToday && !isSel && <span style={{ position:'absolute', inset:0, border:'1.5px solid var(--accent)', borderRadius:6, pointerEvents:'none' }} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Leave Side Panel ─────────────────────────────────────────────────────────
function LeaveSidePanel({ viewDate, today, leaves, onMonthChange, onApply, stats, onSelectDate }) {
  const [selDate, setSelDate] = useState(today);
  const todayKey = isoDay(today);

  const myLeaves = useMemo(() => leaves.filter(l => l.userId === 'u1').sort((a,b) => a.date.localeCompare(b.date)), [leaves]);
  const upcomingLeaves = useMemo(() => myLeaves.filter(l => l.date >= todayKey), [myLeaves, todayKey]);
  const currentMonthLeaves = useMemo(() => {
    const m = viewDate.getMonth(), y = viewDate.getFullYear();
    return myLeaves.filter(l => { const d = new Date(l.date+'T00:00:00'); return d.getFullYear()===y && d.getMonth()===m; });
  }, [myLeaves, viewDate]);

  const total = stats.allotted + stats.extra;
  const usedPct = Math.min(100, Math.round((stats.used / total) * 100));

  const handleSelect = (d) => { setSelDate(d); onSelectDate(d); };

  return (
    <aside style={{ width:240, flexShrink:0, padding:'14px 14px 16px', borderRight:'1px solid var(--border)', background:'#FFF', display:'flex', flexDirection:'column', gap:16, overflowY:'auto' }}>
      <button onClick={onApply} style={{ height:52, borderRadius:12, background:'var(--accent)', color:'#fff', border:'none', fontWeight:700, fontSize:14, display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:'0 4px 14px rgba(245,166,35,.28)', cursor:'pointer', width:'100%' }}>
        <Icon.Plus /> 연차 신청
      </button>

      <SideMiniCalendar viewDate={viewDate} today={today} leaves={leaves} selectedDate={selDate} onSelect={handleSelect} onMonthChange={onMonthChange} />

      {/* 내 연차 현황 + 게이지바 */}
      <div style={{ background:'#F7F7F7', borderRadius:10, padding:'12px 14px', display:'flex', flexDirection:'column', gap:8 }}>
        <div style={{ fontSize:11, fontWeight:700, color:'var(--ink-400)', letterSpacing:'.04em', textTransform:'uppercase', marginBottom:2 }}>내 연차 현황</div>
        {[{label:'부여',value:stats.allotted},{label:'사용',value:stats.used},{label:'잔여',value:stats.remaining,accent:true}].map(s => (
          <div key={s.label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <span style={{ fontSize:12, color:'var(--ink-500)' }}>{s.label}</span>
            <span style={{ fontSize:14, fontWeight:700, color:s.accent?'var(--accent)':'var(--ink-400)' }}>{s.value}일</span>
          </div>
        ))}
        {/* 10. 게이지바 + % */}
        <div style={{ marginTop:4 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
            <span style={{ fontSize:10.5, color:'var(--ink-400)' }}>사용률</span>
            <span style={{ fontSize:10.5, fontWeight:700, color:'var(--accent-ink)' }}>{usedPct}%</span>
          </div>
          <div style={{ height:5, borderRadius:5, background:'var(--border)', overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${usedPct}%`, background:'var(--accent)', borderRadius:5, transition:'width .4s' }} />
          </div>
        </div>
      </div>

      {/* 11. 다가오는 연차 — 흰 배경, 같은 스트로크 */}
      <div>
        <div style={{ fontSize:11, color:'var(--ink-400)', fontWeight:700, letterSpacing:'.04em', textTransform:'uppercase', marginBottom:8, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span>다가오는 연차</span>
          <span style={{ fontSize:10.5, fontWeight:500 }}>{upcomingLeaves.length}건</span>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
          {upcomingLeaves.length === 0 && <div style={{ fontSize:12, color:'var(--ink-400)', padding:'6px 0' }}>다가오는 연차가 없어요.</div>}
          {upcomingLeaves.slice(0,3).map(l => {
            const t = lt(l.type), d = new Date(l.date+'T00:00:00'), dd = dDay(l.date);
            return (
              <div key={l.id} style={{ background:'#FFF', border:'1px solid var(--border)', borderRadius:8, padding:'8px 10px', display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ width:6, height:32, borderRadius:3, background:t.color, flexShrink:0 }} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:11, color:'var(--ink-400)', marginBottom:2 }}>{d.getMonth()+1}.{String(d.getDate()).padStart(2,'0')} ({DOW_KO[d.getDay()]})</div>
                  <div style={{ fontSize:12, fontWeight:600, color:'var(--ink-900)' }}>{t.label}</div>
                </div>
                <span style={{ fontSize:11, fontWeight:700, color:dd==='D-Day'?'#fff':'var(--accent-ink)', background:dd==='D-Day'?'var(--accent)':'var(--accent-soft-2)', padding:'3px 7px', borderRadius:5, flexShrink:0 }}>{dd}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 이번 달 사용 */}
      <div>
        <div style={{ fontSize:11, color:'var(--ink-400)', fontWeight:700, letterSpacing:'.04em', textTransform:'uppercase', marginBottom:8, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span>이번 달 사용</span>
          <span style={{ fontSize:10.5, fontWeight:500 }}>{currentMonthLeaves.length}건</span>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
          {currentMonthLeaves.length === 0 && <div style={{ fontSize:12, color:'var(--ink-400)', padding:'6px 0' }}>이번 달 사용 내역이 없어요.</div>}
          {currentMonthLeaves.map(l => {
            const t = lt(l.type), d = new Date(l.date+'T00:00:00');
            return (
              <div key={l.id} style={{ background:'#FFF', border:'1px solid var(--border)', borderRadius:8, padding:'8px 10px', display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ width:6, height:32, borderRadius:3, background:t.color, flexShrink:0 }} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:11, color:'var(--ink-400)', marginBottom:2 }}>{d.getMonth()+1}.{String(d.getDate()).padStart(2,'0')} ({DOW_KO[d.getDay()]})</div>
                  <div style={{ fontSize:12, fontWeight:600, color:'var(--ink-700)' }}>{t.label}</div>
                </div>
                <span style={{ fontSize:11, fontWeight:700, color:t.fg, background:t.bg, padding:'2px 7px', borderRadius:4 }}>{l.days}일</span>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

// ─── Confirm Popup ────────────────────────────────────────────────────────────
function ConfirmPopup({ message, confirmLabel, confirmColor, onCancel, onConfirm }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(20,20,20,.4)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ background:'#FFF', borderRadius:14, boxShadow:'var(--shadow-pop)', padding:'28px 28px 20px', width:340, display:'flex', flexDirection:'column', gap:20 }}>
        <div style={{ fontSize:15, fontWeight:600, color:'var(--ink-900)', lineHeight:1.5, textAlign:'center' }}>{message}</div>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={onCancel} style={{ flex:1, height:42, borderRadius:10, border:'1px solid var(--border-strong)', background:'#FFF', color:'var(--ink-700)', fontSize:14, fontWeight:600, cursor:'pointer' }}>취소</button>
          <button onClick={onConfirm} style={{ flex:1, height:42, borderRadius:10, border:'none', background:confirmColor||'var(--accent)', color:'#FFF', fontSize:14, fontWeight:700, cursor:'pointer' }}>{confirmLabel||'확인'}</button>
        </div>
      </div>
    </div>
  );
}

// ─── Leave Modal ──────────────────────────────────────────────────────────────
function LeaveModal({ initialDate, existingLeave, onClose, onSubmit, onUpdate, onWithdraw, me }) {
  const isEdit = !!existingLeave;
  const [type, setType] = useState(isEdit ? existingLeave.type : 'annual');
  const [dateStr, setDateStr] = useState(isEdit ? existingLeave.date : (initialDate ? isoDay(initialDate) : isoDay(TODAY)));
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [allDay, setAllDay] = useState(true);
  const [reason, setReason] = useState(isEdit ? existingLeave.reason : 'personal');
  const [file, setFile] = useState(null);
  const [reasonOpen, setReasonOpen] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [confirmWithdraw, setConfirmWithdraw] = useState(false);

  const dateObj = useMemo(() => new Date(dateStr+'T00:00:00'), [dateStr]);
  const isFri = dateObj.getDay() === 5;
  const bounds = getViewBounds(TODAY);

  // 2. 반반차 비활성이면 자녀돌봄도 비활성
  const quarterEnabled = me && me.quarterEligible;
  const effectiveReasons = LEAVE_REASONS.map(r => ({
    ...r,
    disabled: r.id === 'childcare' && !quarterEnabled ? true : r.disabled,
  }));

  useEffect(() => {
    if (isEdit) { const t=getDefaultTime(existingLeave.type,new Date(existingLeave.date+'T00:00:00')); setStartTime(t.start); setEndTime(t.end); setAllDay(t.allDay); }
  }, []);

  useEffect(() => {
    const t = getDefaultTime(type, dateObj);
    setStartTime(t.start); setEndTime(t.end); setAllDay(t.allDay);
    if (!quarterEnabled && reason === 'childcare') setReason('personal');
  }, [type, dateStr]);

  const isDirty = useMemo(() => {
    if (!isEdit) return false;
    return type!==existingLeave.type || dateStr!==existingLeave.date || reason!==existingLeave.reason;
  }, [type, dateStr, reason, isEdit, existingLeave]);

  const handleClose = () => { if (isEdit && isDirty) { setConfirmDiscard(true); return; } onClose(); };
  const needsAttach = ATTACH_REASONS.includes(reason);
  const selReason = effectiveReasons.find(r => r.id === reason) || effectiveReasons[0];
  const selType = LEAVE_TYPES.find(t => t.id === type) || LEAVE_TYPES[0];
  const ReasonIcon = ICON_MAP[selReason.icon] || Icon.User;
  const canSubmit = dateStr && reason;

  return (
    <>
      <div onClick={handleClose} style={{ position:'fixed', inset:0, background:'rgba(20,20,20,.32)', zIndex:80, display:'flex', alignItems:'center', justifyContent:'center', padding:40 }}>
        <div onClick={e => e.stopPropagation()} style={{ width:520, background:'#FFF', borderRadius:16, boxShadow:'var(--shadow-pop)', display:'flex', flexDirection:'column', overflow:'hidden', maxHeight:'90vh' }}>
          {/* 헤더 */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 24px 16px', borderBottom:'1px solid var(--border)' }}>
            <div>
              <div style={{ fontSize:11, color:'var(--ink-400)', fontWeight:600, letterSpacing:'.06em' }}>{isEdit?'수정':'새 신청'}</div>
              <div style={{ fontSize:20, fontWeight:700, marginTop:2 }}>{isEdit?'연차 수정':'연차 신청'}</div>
            </div>
            <button onClick={handleClose} style={{ width:32, height:32, borderRadius:8, border:'none', background:'#F7F7F7', display:'inline-flex', alignItems:'center', justifyContent:'center', color:'var(--ink-700)', cursor:'pointer' }}><Icon.X /></button>
          </div>

          <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:18, overflowY:'auto' }}>
            {/* 신청자 */}
            <div>
              <label style={fieldLabel}>신청자</label>
              <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', background:'#F7F7F7', borderRadius:10, height:48 }}>
                <span style={{ width:28, height:28, borderRadius:'50%', background:me.color, color:'#fff', display:'inline-flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:12 }}>{me.initial}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:700, color:'var(--ink-900)' }}>{me.name}</div>
                  <div style={{ fontSize:11, color:'var(--ink-400)' }}>{me.team}</div>
                </div>
                <Icon.Lock style={{ color:'var(--ink-300)' }} />
              </div>
            </div>

            {/* 휴가 구분 */}
            <div>
              <label style={fieldLabel}>휴가 구분</label>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                {LEAVE_TYPES.map(t => {
                  const isActive = type === t.id;
                  const isDisabled = t.restricted && !quarterEnabled;
                  return (
                    <button key={t.id} onClick={() => !isDisabled && setType(t.id)} disabled={isDisabled}
                      style={{ padding:'12px 14px', borderRadius:10, textAlign:'left', border:`1.5px solid ${isActive?t.color:'var(--border-strong)'}`, background:isActive?t.bg:'#FFF', opacity:isDisabled?0.4:1, cursor:isDisabled?'not-allowed':'pointer', display:'flex', alignItems:'center', gap:10 }}>
                      <span style={{ width:10, height:10, borderRadius:'50%', background:isActive?t.color:'var(--ink-300)' }} />
                      <div>
                        <div style={{ fontSize:13, fontWeight:700, color:isActive?t.fg:'var(--ink-700)' }}>{t.label}</div>
                        <div style={{ fontSize:11, color:'var(--ink-400)', marginTop:1 }}>{t.days}일</div>
                      </div>
                      {isDisabled && <span style={{ marginLeft:'auto', fontSize:10, color:'var(--ink-300)', fontWeight:700 }}>비활성</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 일시 — date input, 조회 범위 제한 */}
            <div>
              <label style={fieldLabel}>일시</label>
              <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
                <input type="date" value={dateStr} min={bounds.min} max={bounds.max}
                  onChange={e => setDateStr(e.target.value)}
                  style={{ height:38, padding:'0 12px', borderRadius:8, border:'1px solid var(--border-strong)', background:'#FFF', fontSize:13, color:'var(--ink-900)', outline:'none', fontFamily:'inherit' }} />
                <select value={startTime} onChange={e => setStartTime(e.target.value)} disabled={allDay}
                  style={{ height:38, padding:'0 10px', borderRadius:8, border:'1px solid var(--border-strong)', background:allDay?'#F5F5F5':'#FFF', fontSize:13, color:allDay?'var(--ink-400)':'var(--ink-900)', outline:'none', cursor:allDay?'not-allowed':'pointer', minWidth:90 }}>
                  {TIME_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <span style={{ color:'var(--ink-400)' }}>–</span>
                <select value={endTime} onChange={e => setEndTime(e.target.value)} disabled={allDay}
                  style={{ height:38, padding:'0 10px', borderRadius:8, border:'1px solid var(--border-strong)', background:allDay?'#F5F5F5':'#FFF', fontSize:13, color:allDay?'var(--ink-400)':'var(--ink-900)', outline:'none', cursor:allDay?'not-allowed':'pointer', minWidth:90 }}>
                  {TIME_OPTIONS.filter(o => o > startTime).map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <button onClick={() => { if (type !== 'annual') return; setAllDay(v => !v); }}
                  style={{ height:38, padding:'0 14px', borderRadius:8, border:`1.5px solid ${allDay?'var(--accent)':'var(--border-strong)'}`, background:allDay?'var(--accent-soft)':'#FFF', color:allDay?'var(--accent-ink)':'var(--ink-400)', fontSize:12, fontWeight:700, cursor:type==='annual'?'pointer':'not-allowed', opacity:type==='annual'?1:0.45, display:'inline-flex', alignItems:'center', gap:6 }}>
                  {allDay && <Icon.Check style={{ color:'var(--accent)' }} />} 종일
                </button>
              </div>
              {isFri && (type==='am_half'||type==='pm_half') && (
                <div style={{ marginTop:8, padding:'7px 10px', background:'#E8F0FE', borderRadius:6, fontSize:11.5, color:'#1E40AF', fontWeight:500, display:'flex', alignItems:'center', gap:6 }}>
                  <Icon.Info /> 금요일: 반차 시간이 자동 조정되었어요.
                </div>
              )}
            </div>

            {/* 사유 */}
            <div>
              <label style={fieldLabel}>사유</label>
              <div style={{ position:'relative' }}>
                <button onClick={() => setReasonOpen(v => !v)}
                  style={{ width:'100%', height:42, padding:'0 14px', borderRadius:10, border:`1.5px solid ${reasonOpen?'var(--accent)':'var(--border-strong)'}`, background:'#FFF', display:'flex', alignItems:'center', gap:10, cursor:'pointer', fontSize:13, color:'var(--ink-900)', fontWeight:600 }}>
                  <ReasonIcon style={{ color:'var(--ink-400)' }} />
                  <span style={{ flex:1, textAlign:'left' }}>{selReason.label}</span>
                  <Icon.ChevronDown style={{ color:'var(--ink-400)', transform:reasonOpen?'rotate(180deg)':'none', transition:'transform .15s' }} />
                </button>
                {reasonOpen && (
                  <div style={{ position:'absolute', top:'calc(100% + 6px)', left:0, right:0, background:'#FFF', border:'1px solid var(--border-strong)', borderRadius:10, boxShadow:'0 8px 24px rgba(0,0,0,.08)', zIndex:10, padding:4 }}>
                    {effectiveReasons.map(r => {
                      const RI = ICON_MAP[r.icon] || Icon.User, isSel = reason === r.id;
                      return (
                        <button key={r.id} onClick={() => { if (r.disabled) return; setReason(r.id); setReasonOpen(false); }}
                          style={{ width:'100%', padding:'10px 12px', border:'none', background:isSel?'var(--accent-soft)':'transparent', borderRadius:8, display:'flex', alignItems:'center', gap:10, cursor:r.disabled?'not-allowed':'pointer', fontSize:13, color:r.disabled?'var(--ink-300)':isSel?'var(--accent-ink)':'var(--ink-900)', fontWeight:isSel?700:500, textAlign:'left', opacity:r.disabled?0.45:1 }}>
                          <RI style={{ color:r.disabled?'var(--ink-300)':isSel?'var(--accent)':'var(--ink-400)' }} />
                          {r.label}
                          {r.disabled && <span style={{ marginLeft:'auto', fontSize:10, color:'var(--ink-300)', fontWeight:600 }}>비활성</span>}
                          {!r.disabled && isSel && <Icon.Check style={{ marginLeft:'auto', color:'var(--accent)' }} />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* 1. 메모 제거 — 첨부 필요 시만 표시 */}
            {needsAttach && (
              <div>
                <label style={fieldLabel}>첨부파일</label>
                <label style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px', borderRadius:10, border:'1.5px dashed var(--border-strong)', cursor:'pointer', color:'var(--ink-500)', fontSize:13 }}>
                  <Icon.Paperclip />
                  <span style={{ flex:1 }}>{file ? file.name : '파일을 선택하거나 드래그하세요'}</span>
                  {file && <button onClick={e => { e.preventDefault(); setFile(null); }} style={{ border:'none', background:'transparent', color:'var(--ink-400)', cursor:'pointer', padding:0, display:'inline-flex' }}><Icon.X /></button>}
                  <input type="file" onChange={e => setFile(e.target.files[0]||null)} style={{ display:'none' }} />
                </label>
                <div style={{ fontSize:11, color:'var(--ink-400)', marginTop:6 }}>※ {selReason.label} 사용 시 관련 서류를 첨부해주세요.</div>
              </div>
            )}
          </div>

          {/* 푸터 */}
          {isEdit ? (
            <div style={{ padding:'14px 24px', borderTop:'1px solid var(--border)', display:'flex', gap:10, background:'#FCFCFC' }}>
              <button onClick={() => setConfirmWithdraw(true)} style={{ height:44, padding:'0 16px', borderRadius:10, border:'none', background:'#FEE2E2', color:'#DC2626', fontSize:13, fontWeight:700, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:6 }}><Icon.Trash /> 철회하기</button>
              <div style={{ flex:1 }} />
              <button onClick={onClose} style={{ height:44, padding:'0 16px', borderRadius:10, border:'1px solid var(--border-strong)', background:'#FFF', color:'var(--ink-700)', fontSize:13, fontWeight:600, cursor:'pointer' }}>취소</button>
              <button disabled={!isDirty} onClick={() => { if (!isDirty) return; onUpdate({...existingLeave,type,date:dateStr,days:selType.days,reason}); }}
                style={{ height:44, padding:'0 18px', borderRadius:10, border:'none', background:isDirty?'var(--accent)':'#E5E5E5', color:'#FFF', fontSize:13, fontWeight:700, cursor:isDirty?'pointer':'not-allowed', boxShadow:isDirty?'0 4px 12px rgba(245,166,35,.28)':'none' }}>
                수정하기
              </button>
            </div>
          ) : (
            <div style={{ padding:'16px 24px', borderTop:'1px solid var(--border)', display:'flex', gap:10, background:'#FCFCFC' }}>
              <button onClick={onClose} style={{ flex:1, height:44, borderRadius:10, border:'1px solid var(--border-strong)', background:'#FFF', color:'var(--ink-700)', fontSize:14, fontWeight:600, cursor:'pointer' }}>취소</button>
              <button disabled={!canSubmit} onClick={() => { if (!canSubmit) return; onSubmit({ id:'l'+Date.now(), date:dateStr, type, days:selType.days, reason, status:'unconfirmed', createdAt:isoDay(TODAY) }); }}
                style={{ flex:2, height:44, borderRadius:10, border:'none', background:canSubmit?'var(--accent)':'#E5E5E5', color:'#FFF', fontSize:14, fontWeight:700, cursor:canSubmit?'pointer':'not-allowed', boxShadow:canSubmit?'0 4px 12px rgba(245,166,35,.28)':'none' }}>
                연차 신청
              </button>
            </div>
          )}
        </div>
      </div>

      {confirmDiscard && (
        <ConfirmPopup message="수정사항을 저장하시겠습니까?" confirmLabel="저장" confirmColor="var(--accent)"
          onCancel={() => { setConfirmDiscard(false); onClose(); }}
          onConfirm={() => { setConfirmDiscard(false); onUpdate({...existingLeave,type,date:dateStr,days:selType.days,reason}); }} />
      )}
      {confirmWithdraw && (
        <ConfirmPopup message="연차 신청을 철회하시겠습니까?" confirmLabel="철회하기" confirmColor="#DC2626"
          onCancel={() => setConfirmWithdraw(false)}
          onConfirm={() => { setConfirmWithdraw(false); onWithdraw(existingLeave); }} />
      )}
    </>
  );
}

// ─── LeaveTab Root ────────────────────────────────────────────────────────────
function LeaveTab({ onNavChange }) {
  const today = TODAY, me = ME;
  const { calcStats, SEED_LEAVES } = window.LeaveData;
  const [leaves, setLeaves] = useState(SEED_LEAVES);
  const [view, setView] = useState('month');
  const [viewDate, setViewDate] = useState(today);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [myOnly, setMyOnly] = useState(false);
  const [search, setSearch] = useState('');

  // 리스트 뷰 조회 범위 — 디폴트: 당월 1개월
  const defaultListRange = useMemo(() => {
    const from = new Date(today.getFullYear(), today.getMonth(), 1);
    const to = new Date(today.getFullYear(), today.getMonth()+1, 0);
    return { from: isoDay(from), to: isoDay(to) };
  }, []);
  const [listRange, setListRange] = useState(defaultListRange);

  const stats = useMemo(() => calcStats(leaves), [leaves]);
  const weekStart = useMemo(() => startOfWeek(viewDate), [viewDate]);
  const bounds = getViewBounds(today);

  const clampDate = (d) => {
    const k = isoDay(d);
    if (k < bounds.min) return new Date(bounds.min+'T00:00:00');
    if (k > bounds.max) return new Date(bounds.max+'T00:00:00');
    return d;
  };

  const handlePrev = () => {
    if (view==='week') setViewDate(d => clampDate(addDays(d,-7)));
    else setViewDate(d => { const p=new Date(d.getFullYear(),d.getMonth()-1,1); return isoDay(p)>=bounds.min?p:d; });
  };
  const handleNext = () => {
    if (view==='week') setViewDate(d => clampDate(addDays(d,7)));
    else setViewDate(d => { const n=new Date(d.getFullYear(),d.getMonth()+1,1); return isoDay(n)<=bounds.max?n:d; });
  };
  const handleToday = () => setViewDate(today);

  // 8. 사이드 캘린더 날짜 선택 → 뷰 이동 (리스트 뷰면 월간으로)
  const handleSelectDate = (d) => {
    setViewDate(d);
    if (view === 'list') setView('month');
  };

  const handleSubmit = data => { setLeaves(p => [...p, {...data, userId:'u1'}]); setModal(null); setToast('연차 신청을 완료했어요.'); };
  const handleUpdate = data => { setLeaves(p => p.map(l => l.id===data.id ? data : l)); setModal(null); setToast('연차가 수정되었어요.'); };
  const handleWithdraw = leave => { setLeaves(p => p.filter(l => l.id !== leave.id)); setModal(null); setToast('연차 신청이 철회되었어요.'); };
  const handleLeaveClick = leave => { if (leave.userId === 'u1') setModal({ leave }); };

  const { Toast } = window.CommonUI;

  return (
    <div style={{ flex:1, display:'flex', minHeight:0 }}>
      <LeaveSidePanel
        viewDate={viewDate} today={today} leaves={leaves}
        onMonthChange={delta => setViewDate(d => new Date(d.getFullYear(), d.getMonth()+delta, 1))}
        onApply={() => setModal({ date:today })}
        stats={stats}
        onSelectDate={handleSelectDate}
      />
      <main style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0, background:'var(--bg)' }}>
        <LeaveToolbar
          view={view} onViewChange={setView}
          viewDate={viewDate} weekStart={weekStart} today={today}
          onPrev={handlePrev} onNext={handleNext} onToday={handleToday}
          myOnly={myOnly} onToggleMyOnly={() => setMyOnly(v => !v)}
          search={search} onSearch={setSearch}
          listRange={listRange} onListRangeChange={setListRange} />

        <div style={{ flex:1, padding:'0 24px 16px', minHeight:0, display:'flex' }}>
          {view === 'week' && (
            <LeaveWeekly weekStart={weekStart} today={today} leaves={leaves}
              onDateClick={d => setModal({date:d})} onLeaveClick={handleLeaveClick}
              myOnly={myOnly} searchName={search} />
          )}
          {view === 'month' && (
            <LeaveCalendar viewDate={viewDate} today={today} leaves={leaves}
              onDateClick={d => setModal({date:d})} onLeaveClick={handleLeaveClick}
              myOnly={myOnly} searchName={search} />
          )}
          {view === 'list' && (
            <LeaveListView
              leaves={leaves} today={today} listRange={listRange} stats={stats}
              onEditLeave={leave => setModal({ leave })}
              onWithdrawLeave={leave => { setLeaves(p => p.filter(l => l.id !== leave.id)); setToast('연차 신청이 철회되었어요.'); }}
            />
          )}
        </div>
      </main>

      {modal && (
        modal.leave
          ? <LeaveModal existingLeave={modal.leave} me={me} onClose={() => setModal(null)} onSubmit={handleSubmit} onUpdate={handleUpdate} onWithdraw={handleWithdraw} />
          : <LeaveModal initialDate={modal.date} me={me} onClose={() => setModal(null)} onSubmit={handleSubmit} onUpdate={handleUpdate} onWithdraw={handleWithdraw} />
      )}
      {toast && <Toast message={toast} kind="success" onClose={() => setToast(null)} />}
    </div>
  );
}

window.LeaveTab = LeaveTab;
window.LeaveModal = LeaveModal;
