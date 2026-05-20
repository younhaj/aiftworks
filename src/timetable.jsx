// ── 조회 범위: 당월 기준 과거 1개월 ~ 미래 6개월 말 ──────────────────────────
function getRoomBounds(today) {
  const D = window.AppData;
  const min = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const max = new Date(today.getFullYear(), today.getMonth() + 7, 0);
  return { min: D.isoDay(min), max: D.isoDay(max) };
}

// Weekly timetable component
const { useRef, useEffect, useCallback } = React;

const D2 = () => window.AppData;

// snap minutes to 30-min boundary
function snap(min) { return Math.round(min / 30) * 30; }

function ResvBlock({ r, room, top, height, narrow, organizer, attendees, onClick }) {
  const D = window.AppData;
  const roomColor = room.id === 'A' ? 'var(--accent)' : '#3B82F6';
  const bg = room.id === 'A' ? 'var(--accent-soft)' : 'var(--blue-soft)';
  const ink = room.id === 'A' ? 'var(--accent-ink)' : '#1E40AF';
  return (
    <button
      onClick={(e)=>{ e.stopPropagation(); onClick(r); }}
      style={{
        position:'absolute', top, height, left: 3, right: 3, zIndex: 3,
        textAlign:'left', cursor:'pointer',
        background: bg,
        border: `1px solid ${roomColor}40`,
        borderRadius: 6,
        padding: '5px 7px',
        overflow:'hidden',
        transition:'transform .12s, box-shadow .12s',
      }}
      onMouseEnter={(e)=>{
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.boxShadow = '0 4px 14px rgba(20,20,20,.08)';
        e.currentTarget.style.zIndex = 5;
      }}
      onMouseLeave={(e)=>{
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.zIndex = 3;
      }}
    >
      <div style={{ fontSize: 11, color: ink, fontWeight: 700, marginBottom: 1, display:'flex', alignItems:'center', gap: 3, lineHeight: 1.2 }}>
        <Icon.Clock />
        <span>{D.minutesToLabel(r.start)} – {D.minutesToLabel(r.end)}</span>
      </div>
      <div style={{ fontSize: narrow? 11.5 : 12.5, fontWeight: 700, color:'var(--ink-900)', lineHeight: 1.25,
        display:'-webkit-box', WebkitLineClamp: height < 50 ? 1 : 2, WebkitBoxOrient:'vertical', overflow:'hidden',
      }}>
        {r.title}
      </div>
      {height >= 56 && (
        <div style={{ display:'flex', alignItems:'center', gap: 4, marginTop: 4, fontSize: 10.5, color:'var(--ink-500)', fontWeight: 500 }}>
          <Icon.Users />
          <span>{organizer ? organizer.name : ''} 외 {Math.max(0, r.attendees.length - 1)}명</span>
        </div>
      )}
      {height >= 80 && r.external && (
        <div style={{ display:'inline-flex', alignItems:'center', gap:3, marginTop: 3, fontSize: 10, color:'#92400E', background:'#FEF3C7', padding:'1px 5px', borderRadius: 3 }}>
          외부 참석
        </div>
      )}
      {r.me && (
        <span style={{ position:'absolute', top: 5, right: 5, fontSize: 9, fontWeight:700, background: ink, color:'#fff', padding:'1px 4px', borderRadius: 3, letterSpacing:'.05em' }}>MY</span>
      )}
    </button>
  );
}

function DayColumn({
  day, dayIdx, isToday, isPast, rooms, reservationsForDay, peopleById,
  onSelectSlot, onResvClick, weekHeight, nowMinutes,
}) {
  const D = window.AppData;
  const dayRefs = useRef([]);
  const [drag, setDrag] = useState(null); // {roomId, startMin, endMin}

  // group reservations by room
  const byRoom = {};
  for (const room of rooms) byRoom[room.id] = reservationsForDay.filter(r => r.room === room.id);

  const colWidth = `${100 / rooms.length}%`;

  // Helpers to convert y → minutes
  const minutesFromY = (y) => {
    const total = (y / weekHeight) * (D.DAY_END_MIN - D.DAY_START_MIN);
    return D.DAY_START_MIN + total;
  };

  const handleMouseDown = (e, roomId) => {
    if (e.button !== 0) return;
    if (isPast) return; // 지나간 날짜는 예약 불가
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const startMin = snap(minutesFromY(y));
    // 오늘인 경우 지나간 시간은 예약 불가
    if (isToday && startMin < snap(nowMinutes + 29)) return;
    setDrag({ roomId, startMin, endMin: startMin + 60 });
    e.preventDefault();
  };

  useEffect(() => {
    if (!drag) return;
    const onMove = (e) => {
      const col = dayRefs.current[drag.roomId];
      if (!col) return;
      const rect = col.getBoundingClientRect();
      const y = Math.max(0, Math.min(weekHeight, e.clientY - rect.top));
      const m = snap(minutesFromY(y));
      setDrag(prev => prev ? { ...prev, endMin: m } : prev);
    };
    const onUp = () => {
      setDrag(curr => {
        if (curr) {
          const s = Math.min(curr.startMin, curr.endMin);
          const en = Math.max(curr.startMin, curr.endMin);
          const dur = en - s;
          // if just a click (no drag), default 60 min
          const final = dur < 30 ? { roomId: curr.roomId, start: s, end: s + 60 } : { roomId: curr.roomId, start: s, end: en };
          // setTimeout으로 render phase 밖에서 호출
          setTimeout(() => onSelectSlot({ day, ...final }), 0);
        }
        return null;
      });
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [drag, day, onSelectSlot, weekHeight]);

  return (
    <div style={{ flex: 1, minWidth: 0, display:'flex', flexDirection:'column' }}>
      {/* Day header */}
      <div style={{
        textAlign:'center', padding: '10px 4px 8px',
        borderBottom:'1px solid var(--border)',
        background: isToday ? 'var(--accent-soft)' : '#FFF',
        position:'sticky', top: 0, zIndex: 4,
      }}>
        <div style={{ fontSize: 10.5, color: isToday ? 'var(--accent-ink)' : (isPast ? 'var(--ink-300)' : 'var(--ink-400)'), fontWeight: 600, letterSpacing:'.06em' }}>
          {D.DAYS_KO[dayIdx]}
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, marginTop: 2,
          color: isToday ? 'var(--accent-ink)' : isPast ? 'var(--ink-300)' : 'var(--ink-900)' }}>
          {day.getDate()}
        </div>
      </div>

      {/* Grid body */}
      <div style={{ display:'flex', position:'relative', height: weekHeight, background:'#FFF' }}>
        {rooms.map((room, ri) => (
          <div
            key={room.id}
            ref={el => (dayRefs.current[room.id] = el)}
            onMouseDown={(e) => handleMouseDown(e, room.id)}
            style={{
              flex: 1, minWidth: 0, position:'relative',
              borderRight: ri < rooms.length - 1 ? '1px dashed var(--border-strong)' : 'none',
              cursor: isPast ? 'not-allowed' : 'cell',
            }}
          >
            {/* slot lines */}
            {Array.from({ length: D.SLOTS }).map((_, i) => (
              <div key={i} style={{
                position:'absolute', left: 0, right: 0,
                top: i * D.SLOT_H, height: D.SLOT_H,
                borderBottom: i % 2 === 1 ? '1px solid var(--border)' : '1px dashed #F1F1F1',
              }} />
            ))}

            {/* past-day full-column shading */}
            {isPast && (
              <div style={{
                position:'absolute', top: 0, left: 0, right: 0, bottom: 0,
                background:'repeating-linear-gradient(45deg, rgba(220,220,220,.45) 0 4px, rgba(243,243,243,.45) 4px 8px)',
                pointerEvents:'none', zIndex: 1,
              }} />
            )}

            {/* past-time shading on today */}
            {isToday && nowMinutes > D.DAY_START_MIN && (
              <div style={{
                position:'absolute', top: 0, left: 0, right: 0,
                height: ((Math.min(nowMinutes, D.DAY_END_MIN) - D.DAY_START_MIN) / (D.DAY_END_MIN - D.DAY_START_MIN)) * weekHeight,
                background:'repeating-linear-gradient(45deg, rgba(229,229,229,.5) 0 4px, rgba(243,243,243,.5) 4px 8px)',
                pointerEvents:'none', zIndex: 1,
              }} />
            )}

            {/* current time line */}
            {isToday && nowMinutes >= D.DAY_START_MIN && nowMinutes <= D.DAY_END_MIN && ri === 0 && (
              <div style={{
                position:'absolute', left: 0, right: -1 + (rooms.length-1)*0, // covered by overlay below
                pointerEvents:'none',
              }} />
            )}

            {/* reservations */}
            {byRoom[room.id].map(r => {
              const top = ((r.start - D.DAY_START_MIN) / (D.DAY_END_MIN - D.DAY_START_MIN)) * weekHeight;
              const height = ((r.end - r.start) / (D.DAY_END_MIN - D.DAY_START_MIN)) * weekHeight - 2;
              const organizer = peopleById[r.organizerId];
              const isPastBlock = isPast || (isToday && r.end <= nowMinutes);
              return (
                <div key={r.id} style={{ opacity: isPastBlock ? 0.55 : 1 }}>
                  <ResvBlock
                    r={r} room={room}
                    top={top} height={height}
                    narrow
                    organizer={organizer}
                    onClick={onResvClick}
                  />
                </div>
              );
            })}

            {/* drag selection */}
            {drag && drag.roomId === room.id && (
              <div style={{
                position:'absolute', left: 3, right: 3,
                top: ((Math.min(drag.startMin, drag.endMin) - D.DAY_START_MIN) / (D.DAY_END_MIN - D.DAY_START_MIN)) * weekHeight,
                height: Math.max(20, (Math.abs(drag.endMin - drag.startMin) / (D.DAY_END_MIN - D.DAY_START_MIN)) * weekHeight),
                background: 'rgba(245,166,35,.18)',
                border: '1.5px dashed var(--accent)',
                borderRadius: 6, zIndex: 4,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize: 11, color:'var(--accent-ink)', fontWeight: 600,
                pointerEvents:'none',
              }}>
                {D.minutesToLabel(Math.min(drag.startMin, drag.endMin))} – {D.minutesToLabel(Math.max(drag.startMin, drag.endMin))}
              </div>
            )}
          </div>
        ))}

        {/* current time line spanning columns */}
        {isToday && nowMinutes >= D.DAY_START_MIN && nowMinutes <= D.DAY_END_MIN && (
          <div style={{
            position:'absolute', left: 0, right: 0,
            top: ((nowMinutes - D.DAY_START_MIN) / (D.DAY_END_MIN - D.DAY_START_MIN)) * weekHeight,
            height: 0, borderTop: '1.5px solid #EF4444',
            pointerEvents:'none', zIndex: 6,
          }}>
            <span style={{
              position:'absolute', left: -4, top: -4, width: 8, height: 8, borderRadius: '50%', background:'#EF4444',
            }} />
          </div>
        )}
      </div>
    </div>
  );
}

function Timetable({
  weekStart, today, rooms, reservations, peopleById,
  onSelectSlot, onResvClick, myOnly, nowMinutes,
}) {
  const D = window.AppData;
  const days = Array.from({ length: 5 }).map((_, i) => D.addDays(weekStart, i));
  const weekHeight = D.SLOTS * D.SLOT_H;

  return (
    <div style={{
      background:'#FFF', borderRadius: 12, border:'1px solid var(--border)',
      overflow:'hidden', display:'flex', flexDirection:'column',
      flex: 1, minHeight: 0,
    }}>
      <div style={{ display:'flex', flex: 1, overflow:'auto' }}>
        {/* Time gutter */}
        <div style={{ width: 56, flexShrink: 0, borderRight: '1px solid var(--border)', background:'#FCFCFC' }}>
          <div style={{ height: 53, borderBottom: '1px solid var(--border)', position:'sticky', top: 0, background:'#FCFCFC', zIndex: 5 }} />
          <div style={{ position:'relative', height: weekHeight }}>
            {Array.from({ length: D.SLOTS / 2 + 1 }).map((_, i) => {
              const m = D.DAY_START_MIN + i * 60;
              if (m > D.DAY_END_MIN) return null;
              const y = i * D.SLOT_H * 2;
              return (
                <div key={i} style={{
                  position:'absolute', top: y - 7, right: 8, fontSize: 11, color:'var(--ink-400)', fontWeight: 500,
                }}>
                  {D.minutesToLabel(m)}
                </div>
              );
            })}
          </div>
        </div>

        {/* 7 day columns */}
        <div style={{ flex: 1, display:'flex', minWidth: 0 }}>
          {days.map((day, idx) => {
            const isToday = D.sameDay(day, today);
            const dayKey = D.isoDay(day);
            const todayKey = D.isoDay(today);
            const bounds = getRoomBounds(today);
            const outOfBounds = dayKey < bounds.min || dayKey > bounds.max;
            const isPast = (!isToday && dayKey < todayKey) || outOfBounds;
            let dayResv = reservations.filter(r => r.day === dayKey && rooms.some(rm => rm.id === r.room));
            if (myOnly) dayResv = dayResv.filter(r => r.me || r.attendees.includes('u1') || r.organizerId === 'u1');
            return (
              <DayColumn
                key={idx} day={day} dayIdx={idx} isToday={isToday} isPast={isPast}
                rooms={rooms}
                reservationsForDay={dayResv}
                peopleById={peopleById}
                onSelectSlot={onSelectSlot}
                onResvClick={onResvClick}
                weekHeight={weekHeight}
                nowMinutes={nowMinutes}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

window.Timetable = Timetable;
