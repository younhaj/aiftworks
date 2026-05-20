// ── 조회 범위: 당월 기준 과거 1개월 ~ 미래 6개월 말 ──────────────────────────
function getRoomBounds(today) {
  const D = window.AppData;
  const min = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const max = new Date(today.getFullYear(), today.getMonth() + 7, 0);
  return { min: D.isoDay(min), max: D.isoDay(max) };
}

// Monthly calendar view
function MonthlyView({ viewDate, today, rooms, reservations, peopleById, onResvClick, onSelectSlot, myOnly }) {
  const D = window.AppData;
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const first = new Date(year, month, 1);
  const start = D.startOfWeek(first);
  // 5-day weeks (월–금)만 표시. 월 전체를 포함하는 데 필요한 주 수만큼 사용 (최대 6주).
  const weeks = [];
  for (let w = 0; w < 6; w++) {
    const row = [];
    for (let i = 0; i < 5; i++) row.push(D.addDays(start, w * 7 + i));
    weeks.push(row);
  }
  const usedWeeks = weeks.filter(row => row.some(d => d.getMonth() === month));
  const days = usedWeeks.flat();
  const [hover, setHover] = useState(null);
  const todayKey = D.isoDay(today);

  const byDay = useMemo(() => {
    const map = {};
    for (const r of reservations) {
      if (!rooms.some(rm => rm.id === r.room)) continue;
      if (myOnly && !(r.me || r.attendees.includes('u1') || r.organizerId === 'u1')) continue;
      (map[r.day] = map[r.day] || []).push(r);
    }
    Object.values(map).forEach(arr => arr.sort((a,b)=>a.start-b.start));
    return map;
  }, [reservations, rooms, myOnly]);

  return (
    <div style={{
      background:'#FFF', borderRadius: 12, border:'1px solid var(--border)',
      overflow:'hidden', display:'flex', flexDirection:'column',
      flex: 1, minHeight: 0,
    }}>
      {/* Day-of-week header */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5, 1fr)', borderBottom:'1px solid var(--border)', background:'#FCFCFC' }}>
        {D.DAYS_KO.slice(0, 5).map((d, i) => (
          <div key={d} style={{
            padding:'10px 12px', fontSize: 11, fontWeight: 600, letterSpacing:'.06em',
            color: 'var(--ink-500)',
            borderRight: i < 4 ? '1px solid var(--border)' : 'none',
          }}>{d}</div>
        ))}
      </div>
      {/* Grid */}
      <div style={{
        display:'grid', gridTemplateColumns:'repeat(5, 1fr)',
        gridAutoRows: `minmax(0, 1fr)`,
        flex: 1, minHeight: 0,
      }}>
        {days.map((d, idx) => {
          const inMonth = d.getMonth() === month;
          const isToday = D.sameDay(d, today);
          const dayKey = D.isoDay(d);
          const bounds = getRoomBounds(today);
          const outOfBounds = dayKey < bounds.min || dayKey > bounds.max;
          const isPast = !isToday && dayKey < todayKey;
          const isBlocked = isPast || outOfBounds;
          const list = byDay[dayKey] || [];
          const dow = idx % 5;
          const isHovering = hover === idx && !isBlocked;
          return (
            <div
              key={idx}
              onMouseEnter={() => setHover(idx)}
              onMouseLeave={() => setHover(null)}
              onClick={() => { if (isBlocked) return; onSelectSlot({ day: d, roomId: rooms[0].id, start: 9*60, end: 10*60 }); }}
              style={{
                borderRight: dow < 4 ? '1px solid var(--border)' : 'none',
                borderBottom: idx < days.length - 5 ? '1px solid var(--border)' : 'none',
                padding: '8px 10px 6px',
                backgroundColor: isToday ? 'var(--accent-soft)' : (isHovering ? '#FFFBF2' : (outOfBounds ? '#F7F7F7' : (inMonth ? '#FFF' : '#FAFAFA'))),
                backgroundImage: isBlocked ? 'repeating-linear-gradient(45deg, rgba(220,220,220,.35) 0 4px, rgba(243,243,243,.35) 4px 8px)' : 'none',
                display:'flex', flexDirection:'column', gap: 4,
                minHeight: 0, position:'relative',
                cursor: isBlocked ? 'not-allowed' : 'pointer',
              }}
            >
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <span style={{
                  fontSize: 13, fontWeight: 700,
                  color: !inMonth || outOfBounds ? '#CFCFCF' : isPast ? '#BDBDBD' : isToday ? 'var(--accent-ink)' : 'var(--ink-900)',
                }}>
                  {d.getDate()}
                </span>
                {list.length > 0 && (
                  <span style={{ fontSize: 10, color: isPast ? '#C4C4C4' : 'var(--ink-400)', fontWeight: 500 }}>{list.length}건</span>
                )}
                {isHovering && !isPast && (
                  <span style={{
                    position:'absolute', top: 4, right: 6,
                    width: 18, height: 18, borderRadius: 4,
                    background:'var(--accent)', color:'#fff',
                    display:'inline-flex', alignItems:'center', justifyContent:'center',
                  }}>
                    <Icon.Plus />
                  </span>
                )}
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap: 3, overflow:'hidden', opacity: outOfBounds ? 0.25 : isPast ? 0.55 : 1 }}>
                {list.slice(0, 3).map(r => {
                  const room = D.ROOMS.find(rm => rm.id === r.room);
                  const c = r.room === 'A' ? 'var(--accent)' : '#3B82F6';
                  const bg = r.room === 'A' ? 'var(--accent-soft)' : 'var(--blue-soft)';
                  return (
                    <button key={r.id} onClick={(e)=>{e.stopPropagation(); onResvClick(r);}} style={{
                      appearance:'none', border:'none',
                      textAlign:'left',
                      background: bg,
                      padding:'3px 6px', borderRadius: 4,
                      fontSize: 10.5, lineHeight: 1.25,
                      color:'var(--ink-900)', fontWeight: 600,
                      overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                      cursor:'pointer',
                    }}>
                      <span style={{ display:'inline-block', width:5, height:5, borderRadius:'50%', background: c, marginRight: 5, verticalAlign:'middle' }} />
                      <span style={{ color:'var(--ink-500)', fontWeight: 500, marginRight: 4 }}>{D.minutesToLabel(r.start)}</span>
                      {r.title}
                    </button>
                  );
                })}
                {list.length > 3 && (
                  <span style={{ fontSize: 10, color:'var(--ink-400)' }}>+ {list.length - 3}건 더보기</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

window.MonthlyView = MonthlyView;
