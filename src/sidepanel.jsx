// ── 조회 범위: 당월 기준 과거 1개월 ~ 미래 6개월 말 ──────────────────────────
function getRoomBounds(today) {
  const D = window.AppData;
  const min = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const max = new Date(today.getFullYear(), today.getMonth() + 7, 0);
  return { min: D.isoDay(min), max: D.isoDay(max) };
}

// Left side panel: mini calendar (A+B dots), room multi-filter, my meetings
const { useMemo, useState } = React;

function MiniCalendar({ viewDate, selectedDate, onSelect, daysIndex, today, onMonthChange }) {
  const D = window.AppData;
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const first = new Date(year, month, 1);
  const start = D.startOfWeek(first);
  // 5-day weeks (월–금)
  const weeks = [];
  for (let w = 0; w < 6; w++) {
    const row = [];
    for (let i = 0; i < 5; i++) row.push(D.addDays(start, w * 7 + i));
    weeks.push(row);
  }
  const usedWeeks = weeks.filter(row => row.some(d => d.getMonth() === month));
  const cells = usedWeeks.flat();

  const [hover, setHover] = useState(null);

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 10 }}>
        <button onClick={() => {
          const prev = new Date(year, month - 1, 1);
          const bounds = getRoomBounds(today);
          if (D.isoDay(prev) >= bounds.min) onMonthChange(-1);
        }} style={{ ...navBtnStyle, opacity: (() => { const prev = new Date(year,month-1,1); const b=getRoomBounds(today); return D.isoDay(prev)>=b.min?1:0.3; })() }} aria-label="prev month">
          <Icon.ChevronLeft />
        </button>
        <div style={{ fontSize: 13, fontWeight: 600, color:'var(--ink-900)' }}>
          {year}년 {month + 1}월
        </div>
        <button onClick={() => {
          const next = new Date(year, month + 1, 1);
          const bounds = getRoomBounds(today);
          if (D.isoDay(next) <= bounds.max) onMonthChange(1);
        }} style={{ ...navBtnStyle, opacity: (() => { const next = new Date(year,month+1,1); const b=getRoomBounds(today); return D.isoDay(next)<=b.max?1:0.3; })() }} aria-label="next month">
          <Icon.ChevronRight />
        </button>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap: 0, fontSize: 10.5, color:'var(--ink-400)', textAlign:'center', marginBottom: 4 }}>
        {['월','화','수','목','금'].map((d) => (
          <div key={d} style={{ padding:'4px 0', color: 'var(--ink-400)' }}>{d}</div>
        ))}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5, 1fr)', rowGap: 2 }}>
        {cells.map((d, i) => {
          const inMonth = d.getMonth() === month;
          const isToday = D.sameDay(d, today);
          const isSel = D.sameDay(d, selectedDate);
          const flags = daysIndex[D.isoDay(d)] || { A: false, B: false };
          const isHover = hover && D.sameDay(hover, d);
          const bounds = getRoomBounds(today);
          const dayKey = D.isoDay(d);
          const outOfBounds = dayKey < bounds.min || dayKey > bounds.max;
          return (
            <button
              key={i}
              onClick={() => { if (!outOfBounds) onSelect(d); }}
              onMouseEnter={() => { if (!outOfBounds) setHover(d); }}
              onMouseLeave={() => setHover(null)}
              style={{
                appearance:'none', border:'none', background:'transparent',
                padding: '0', height: 30, position: 'relative',
                cursor: outOfBounds ? 'default' : 'pointer', borderRadius: 6,
                color: !inMonth || outOfBounds ? '#CFCFCF' : 'var(--ink-700)',
                fontSize: 12,
                fontWeight: isToday || isSel ? 700 : 500,
                transition:'background .12s',
                background: isSel ? 'var(--accent)' : (isHover && !outOfBounds ? 'var(--accent-soft)' : 'transparent'),
                opacity: outOfBounds ? 0.35 : 1,
                ...(isSel ? { color:'#fff' } : {}),
              }}
            >
              <span>{d.getDate()}</span>
              {!isSel && (flags.A || flags.B) && !outOfBounds && (
                <span style={{
                  position:'absolute', bottom: 3, left:'50%', transform:'translateX(-50%)',
                  display:'inline-flex', gap: 2,
                }}>
                  {flags.A && <span style={{ width: 3, height: 3, borderRadius:'50%', background:'var(--accent)' }} />}
                  {flags.B && <span style={{ width: 3, height: 3, borderRadius:'50%', background:'#3B82F6' }} />}
                </span>
              )}
              {isToday && !isSel && (
                <span style={{
                  position:'absolute', inset: 0, border:'1.5px solid var(--accent)', borderRadius: 6, pointerEvents:'none'
                }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
const navBtnStyle = {
  width: 22, height: 22, borderRadius: 6, border:'none', background:'transparent',
  display:'flex', alignItems:'center', justifyContent:'center',
  color:'var(--ink-500)', cursor:'pointer',
};

function MyMeetingItem({ r, room, onClick, isNext }) {
  const D = window.AppData;
  const c = room.id === 'A' ? 'var(--accent)' : '#3B82F6';
  return (
    <button onClick={onClick} style={{
      appearance:'none', border:'none', textAlign:'left', cursor:'pointer',
      background: isNext ? 'var(--accent-soft)' : '#FFF',
      borderRadius: 10, padding: '10px 12px',
      display:'block', width:'100%',
      boxShadow: '0 0 0 1px var(--border)',
    }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 4 }}>
        <div style={{ fontSize: 11, color:'var(--ink-500)', display:'flex', alignItems:'center', gap:4 }}>
          <Icon.Clock /> {D.minutesToLabel(r.start)}–{D.minutesToLabel(r.end)}
        </div>
        {isNext && <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent-ink)', background:'#FFE9C2', padding:'2px 6px', borderRadius: 4 }}>NEXT</span>}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color:'var(--ink-900)', marginBottom: 6, lineHeight: 1.35 }}>{r.title}</div>
      <div style={{ display:'flex', alignItems:'center', gap: 6, fontSize: 11, color:'var(--ink-500)' }}>
        <span style={{ display:'inline-flex', alignItems:'center', gap: 4, padding:'2px 7px', borderRadius: 4, background: room.id === 'A' ? 'var(--accent-soft)' : 'var(--blue-soft)', color: room.id === 'A' ? 'var(--accent-ink)' : '#1E40AF', fontWeight: 700 }}>
          <span style={{ width: 6, height: 6, borderRadius: 2, background: c }} />
          {room.name}
        </span>
        <span>· {r.attendees.length}명</span>
      </div>
    </button>
  );
}

function SidePanel({
  weekStart, viewDate, selectedDate, onSelectDate, onMonthChange,
  reservations, peopleById, today,
  roomsFilter, onToggleRoom,
  onNewBook,
}) {
  const D = window.AppData;
  // Build per-day room index (which rooms have reservations on a given day)
  const daysIndex = useMemo(() => {
    const out = {};
    for (const r of reservations) {
      out[r.day] = out[r.day] || { A: false, B: false };
      out[r.day][r.room] = true;
    }
    return out;
  }, [reservations]);

  const myToday = useMemo(() => reservations
    .filter(r => r.day === D.isoDay(today) && (r.organizerId === 'u1' || r.attendees.includes('u1')))
    .sort((a,b)=>a.start-b.start), [reservations, today]);
  const nextOne = myToday.find(r => r.end > 10*60 + 5);

  return (
    <aside style={{
      width: 240, flexShrink: 0, padding: '14px 14px 16px',
      borderRight: '1px solid var(--border)',
      background:'#FFFFFF',
      display:'flex', flexDirection:'column', gap: 16,
      overflowY:'auto',
    }}>
      {/* New booking CTA — taller */}
      <button onClick={onNewBook} style={{
        height: 52, borderRadius: 12, background:'var(--accent)', color:'#fff',
        border:'none', fontWeight: 700, fontSize: 14,
        display:'flex', alignItems:'center', justifyContent:'center', gap:8,
        boxShadow:'0 4px 14px rgba(245,166,35,.28)', cursor:'pointer',
      }}>
        <Icon.Plus /> 새 예약
      </button>

      {/* Mini calendar */}
      <div>
        <MiniCalendar
          viewDate={viewDate}
          selectedDate={selectedDate}
          onSelect={onSelectDate}
          daysIndex={daysIndex}
          today={today}
          onMonthChange={onMonthChange}
        />
      </div>

      {/* Room filter — multi-select */}
      <div>
        <div style={panelLabel}><span>회의실</span></div>
        <div style={{ display:'flex', flexDirection:'column', gap: 4 }}>
          {D.ROOMS.map(room => {
            const active = roomsFilter.includes(room.id);
            const roomColor = room.id === 'A' ? 'var(--accent)' : '#3B82F6';
            return (
              <label key={room.id} style={{
                display:'flex', alignItems:'center', gap: 10, padding:'8px 10px', borderRadius: 8,
                background: active ? '#FAFAFA' : 'transparent',
                cursor:'pointer', userSelect:'none',
              }}>
                <span style={{
                  width: 16, height: 16, borderRadius: 4, display:'inline-flex', alignItems:'center', justifyContent:'center',
                  background: active ? roomColor : '#FFF',
                  border: active ? 'none' : '1.5px solid var(--ink-300)',
                  color:'#fff',
                  transition:'background .12s',
                }}>
                  {active && <Icon.Check />}
                </span>
                <input type="checkbox" checked={active} onChange={() => onToggleRoom(room.id)} style={{ display:'none' }} />
                <span style={{ width: 10, height: 10, borderRadius: 2, background: roomColor, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 13, color:'var(--ink-700)', fontWeight: 500 }}>{room.name}</span>
                <span style={{ fontSize: 11, color:'var(--ink-400)' }}>{room.capacity}인</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* My meetings today */}
      <div>
        <div style={panelLabel}>
          <span>오늘 내 회의</span>
          <span style={{ fontSize: 10.5, color:'var(--ink-400)', fontWeight: 500 }}>{myToday.length}건</span>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap: 6 }}>
          {myToday.length === 0 && (
            <div style={{ fontSize: 12, color:'var(--ink-400)', padding:'10px 0' }}>예약된 회의가 없어요.</div>
          )}
          {myToday.map(r => (
            <MyMeetingItem key={r.id} r={r} room={D.ROOMS.find(rm=>rm.id===r.room)} isNext={r===nextOne} onClick={()=>{}} />
          ))}
        </div>
      </div>
    </aside>
  );
}
const panelLabel = {
  fontSize: 11, color:'var(--ink-400)', fontWeight: 600, letterSpacing: '.04em', textTransform:'uppercase',
  marginBottom: 8, display:'flex', alignItems:'center', justifyContent:'space-between',
};

window.SidePanel = SidePanel;
