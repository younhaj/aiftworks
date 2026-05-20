// ── 예약 조회/선택 가능 범위 ──────────────────────────────────────────────────
function getBookingBounds(today) {
  const D = window.AppData;
  const min = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const max = new Date(today.getFullYear(), today.getMonth() + 7, 0);
  return { min: D.isoDay(min), max: D.isoDay(max) };
}
function getRepeatMax(today) {
  const D = window.AppData;
  const max = new Date(today.getFullYear(), today.getMonth() + 7, 0);
  return D.isoDay(max);
}
function calcRepeatCount(repeat, startDay, untilStr) {
  if (!untilStr || repeat === 'none') return 0;
  const start = startDay instanceof Date ? new Date(startDay) : new Date(startDay + 'T00:00:00');
  const until = new Date(untilStr + 'T00:00:00');
  let count = 0, cur = new Date(start);
  const intervalDays = { daily:1, weekly:7, biweekly:14, monthly:null }[repeat];
  while (cur <= until && count < 500) {
    count++;
    if (intervalDays) cur.setDate(cur.getDate() + intervalDays);
    else cur.setMonth(cur.getMonth() + 1);
  }
  return count;
}

// Booking modal + reservation detail panel + toast

function Backdrop({ onClose, children }) {
  return (
    <div onClick={onClose} style={{
      position:'fixed', inset: 0, background:'rgba(20,20,20,.32)', zIndex: 80,
      display:'flex', alignItems:'center', justifyContent:'center',
      padding: 40,
    }}>
      <div onClick={(e)=>e.stopPropagation()}>{children}</div>
    </div>
  );
}

function TimeSelect({ value, onChange, options }) {
  return (
    <select value={value} onChange={(e)=>onChange(parseInt(e.target.value))} style={{
      appearance:'none', WebkitAppearance:'none',
      border:'1px solid var(--border-strong)', borderRadius: 8,
      padding:'8px 28px 8px 12px', fontSize: 13, background:'#FFF',
      backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\\\'http://www.w3.org/2000/svg\\\' width=\\\'10\\\' height=\\\'10\\\' viewBox=\\\'0 0 10 10\\\'><polyline points=\\\'2,4 5,7 8,4\\\' fill=\\\'none\\\' stroke=\\\'%236B6B6B\\\' stroke-width=\\\'1.6\\\' stroke-linecap=\\\'round\\\' stroke-linejoin=\\\'round\\\'/></svg>")',
      backgroundRepeat:'no-repeat', backgroundPosition:'right 10px center',
      cursor:'pointer', minWidth: 100,
    }}>
      {options.map(o => <option key={o} value={o}>{window.AppData.minutesToLabel(o)}</option>)}
    </select>
  );
}

function PersonChip({ p, onRemove, statusOverride, hasConflict }) {
  const D = window.AppData;
  const [hover, setHover] = useState(false);
  const statusText = statusOverride || p.status;
  const sc = statusText ? D.STATUS_COLORS[statusText] : null;
  return (
    <span
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position:'relative',
        display:'inline-flex', alignItems:'center', gap: 6,
        background:'#F3F3F3', color:'var(--ink-900)', fontSize: 12, fontWeight: 500,
        padding:'4px 4px 4px 4px', borderRadius: 999,
        maxWidth:'100%',
      }}>
      <span style={{ width: 20, height: 20, borderRadius:'50%', background: p.color, color:'#fff', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
        {p.initial}
      </span>
      <span style={{ whiteSpace:'nowrap' }}>{p.name}{p.external && <span style={{ marginLeft: 4, fontSize: 9.5, color:'#92400E', background:'#FEF3C7', padding:'1px 4px', borderRadius: 3, fontWeight: 700 }}>외부</span>}</span>
      {statusText && sc && (
        <span style={{
          fontSize: 10, fontWeight: 700, padding:'1px 6px', borderRadius: 3,
          background: sc.bg, color: sc.fg, whiteSpace:'nowrap',
        }}>{statusText}</span>
      )}
      {hasConflict && (
        <span style={{
          fontSize: 10, fontWeight: 700, padding:'1px 6px', borderRadius: 3,
          background:'#FEE2E2', color:'#991B1B', whiteSpace:'nowrap',
          display:'inline-flex', alignItems:'center', gap: 3,
        }}>
          <span style={{ width: 5, height: 5, borderRadius:'50%', background:'#DC2626' }} />
          일정 중복
        </span>
      )}
      {onRemove && (
        <button onClick={onRemove} style={{ width: 18, height: 18, borderRadius:'50%', border:'none', background:'transparent', color:'var(--ink-500)', display:'inline-flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink: 0 }}>
          <Icon.X />
        </button>
      )}
      {hover && hasConflict && (
        <span style={{
          position:'absolute', bottom: 'calc(100% + 6px)', left:'50%', transform:'translateX(-50%)',
          background:'#1A1A1A', color:'#FFF', fontSize: 11, fontWeight: 600,
          padding:'6px 10px', borderRadius: 6, whiteSpace:'nowrap',
          boxShadow:'0 4px 14px rgba(0,0,0,.18)', zIndex: 10,
          pointerEvents:'none',
        }}>
          이 시간에 다른 회의가 있어요
          <span style={{
            position:'absolute', top:'100%', left:'50%', transform:'translateX(-50%)',
            width: 0, height: 0, borderLeft:'5px solid transparent', borderRight:'5px solid transparent', borderTop:'5px solid #1A1A1A',
          }} />
        </span>
      )}
    </span>
  );
}

// Single row used in the search dropdown / recent / favorites lists
function PersonSearchRow({ p, isFavorite, onToggleFavorite, onAdd, compact }) {
  const D = window.AppData;
  const sc = p.status ? D.STATUS_COLORS[p.status] : null;
  return (
    <div style={{
      display:'flex', alignItems:'center', gap: 8, padding:'6px 8px', borderRadius: 6,
      transition:'background .12s',
    }}
      onMouseEnter={(e)=>{ e.currentTarget.style.background = '#F7F7F7'; }}
      onMouseLeave={(e)=>{ e.currentTarget.style.background = 'transparent'; }}
    >
      {/* Star — leftmost, before the surname avatar */}
      <button
        onClick={onToggleFavorite}
        title={isFavorite ? '즐겨찾기 해제' : '즐겨찾기에 추가'}
        style={{
          width: 22, height: 22, borderRadius: 6, border:'none',
          background:'transparent',
          color: isFavorite ? 'var(--accent)' : 'var(--ink-300)',
          cursor:'pointer', display:'inline-flex', alignItems:'center', justifyContent:'center',
          flexShrink: 0,
        }}
        onMouseEnter={(e)=>{ if (!isFavorite) e.currentTarget.style.color = 'var(--ink-500)'; }}
        onMouseLeave={(e)=>{ if (!isFavorite) e.currentTarget.style.color = 'var(--ink-300)'; }}
      >
        {isFavorite ? <Icon.StarFilled /> : <Icon.Star />}
      </button>

      {/* Add area */}
      <button onClick={onAdd} style={{
        appearance:'none', border:'none', background:'transparent',
        flex: 1, minWidth: 0, display:'flex', alignItems:'center', gap: 8,
        padding: 0, cursor:'pointer', textAlign:'left',
      }}>
        <span style={{ width: 22, height: 22, borderRadius:'50%', background: p.color, color:'#fff', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{p.initial}</span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display:'flex', alignItems:'center', gap: 6 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color:'var(--ink-900)' }}>{p.name}</span>
            <span style={{ fontSize: 11, color:'var(--ink-400)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', minWidth: 0 }}>{p.team}</span>
          </div>
          {sc && (
            <div style={{ marginTop: 2 }}>
              <span style={{
                display:'inline-block', fontSize: 9.5, fontWeight: 700,
                padding:'1px 5px', borderRadius: 3,
                background: sc.bg, color: sc.fg, lineHeight: 1.4,
              }}>{p.status}</span>
            </div>
          )}
        </div>
        <span style={{ color:'var(--ink-400)', flexShrink: 0 }}><Icon.Plus /></span>
      </button>
    </div>
  );
}

function BookingModal({ initial, reservations, peopleById, today, nowMinutes, onClose, onSubmit }) {
  const D = window.AppData;
  const [title, setTitle] = useState(initial.title || '');
  const [day, setDay] = useState(initial.day);
  const [roomId, setRoomId] = useState(initial.roomId || 'A');
  const [start, setStart] = useState(initial.start ?? 10*60);
  const [end, setEnd] = useState(initial.end ?? 11*60);
  const [category, setCategory] = useState(initial.category || '회의');
  const [attendeeIds, setAttendeeIds] = useState(initial.attendeeIds || ['u1']);
  const [externals, setExternals] = useState([]); // [{ id, name, email, phone, initial, color, external:true }]
  const [extOpen, setExtOpen] = useState(false);
  const [extName, setExtName] = useState('');
  const [extEmail, setExtEmail] = useState('');
  const [extPhone, setExtPhone] = useState('');
  const [search, setSearch] = useState('');
  const [showRecent, setShowRecent] = useState(true);
  const [desc, setDesc] = useState(initial.desc || '');
  const [repeat, setRepeat] = useState('none');
  const [repeatUntil, setRepeatUntil] = useState(() => {
    // 당월 말 기준 6개월 후
    const d = initial.day instanceof Date ? initial.day : new Date(initial.day + 'T00:00:00');
    const max = new Date(d.getFullYear(), d.getMonth() + 7, 0);
    return D.isoDay(max);
  });
  const [favoriteIds, setFavoriteIds] = useState(() => new Set(D.DEFAULT_FAVORITE_IDS || []));
  const [favTab, setFavTab] = useState('recent'); // 'recent' | 'favorite'

  const toggleFavorite = (id) => {
    setFavoriteIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // 오늘이면 지금 이후 시간으로 잘라냄. 과거 날짜는 예약 자체가 불가.
  const todayKey = today ? D.isoDay(today) : null;
  const dayKey = D.isoDay(day);
  const isToday = todayKey === dayKey;
  const isPastDay = todayKey && dayKey < todayKey;
  const minStartMin = isToday ? Math.ceil((nowMinutes || 0) / 30) * 30 : D.DAY_START_MIN;

  // start가 minStart 보다 작으면 보정
  useEffect(() => {
    if (isToday && start < minStartMin) {
      setStart(minStartMin);
      if (end <= minStartMin) setEnd(minStartMin + 60);
    }
  }, []); // mount only

  const timeOptions = [];
  for (let m = D.DAY_START_MIN; m <= D.DAY_END_MIN; m += 30) {
    if (m < minStartMin) continue;
    timeOptions.push(m);
  }

  const conflicts = useMemo(() => {
    return reservations.filter(r =>
      r.day === D.isoDay(day) && r.room === roomId &&
      !(end <= r.start || start >= r.end)
    );
  }, [day, roomId, start, end, reservations]);

  // Per-attendee schedule conflicts: same day, overlapping time, attendee/organizer is in another reservation
  const attendeeConflicts = useMemo(() => {
    const map = {};
    for (const id of attendeeIds) {
      const c = reservations.find(r =>
        r.day === D.isoDay(day) &&
        !(end <= r.start || start >= r.end) &&
        (r.organizerId === id || r.attendees.includes(id))
      );
      if (c) map[id] = c;
    }
    return map;
  }, [attendeeIds, day, start, end, reservations]);

  const search_q = search.trim();
  const filteredPeople = useMemo(() => {
    if (!search_q) return [];
    return D.PEOPLE.filter(p => (p.name.includes(search_q) || p.team.includes(search_q) || p.email.includes(search_q)) && !attendeeIds.includes(p.id)).slice(0, 6);
  }, [search_q, attendeeIds]);

  const recent = D.PEOPLE.filter(p => ['u3','u8','u2','u5'].includes(p.id) && !attendeeIds.includes(p.id));

  const attendees = attendeeIds.map(id => peopleById[id]).filter(Boolean);
  const allAttendees = [...attendees, ...externals];

  // Hash external email for invite indicator
  const externalsWithEmail = externals.filter(e => e.email && e.email.trim());

  const room = D.ROOMS.find(r => r.id === roomId);
  const dayStr = `${day.getFullYear()}. ${day.getMonth()+1}. ${day.getDate()}. ${['일','월','화','수','목','금','토'][day.getDay()]}`;

  const canSave = title.trim() && start < end && attendees.length > 0 && !isPastDay && start >= minStartMin;

  return (
    <Backdrop onClose={onClose}>
      <div style={{
        width: 760, maxHeight: '88vh', background:'#FFF', borderRadius: 14,
        boxShadow: 'var(--shadow-pop)', display:'flex', flexDirection:'column',
        overflow:'hidden',
      }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 22px', borderBottom:'1px solid var(--border)' }}>
          <div>
            <div style={{ fontSize: 11, color:'var(--ink-400)', fontWeight: 600, letterSpacing:'.06em' }}>새 예약</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginTop: 2 }}>{room.name} 회의 예약</div>
          </div>
          <button onClick={onClose} style={iconBtn}><Icon.X /></button>
        </div>

        <div style={{ display:'flex', flex: 1, minHeight: 0 }}>
          {/* Left: form */}
          <div style={{ flex: 1, padding: '18px 22px', display:'flex', flexDirection:'column', gap: 16, overflowY:'auto' }}>
            {/* Title */}
            <div>
              <label style={fieldLabel}>회의명 *</label>
              <input
                value={title} onChange={(e)=>setTitle(e.target.value)}
                placeholder="예) 사업기획실 주간 보고"
                autoFocus
                style={textInput}
              />
            </div>

            {/* Room (full-width) */}
            <div>
              <label style={fieldLabel}>회의실</label>
              <div style={{ display:'flex', gap: 8 }}>
                {D.ROOMS.map(r => {
                  const active = r.id === roomId;
                  return (
                    <button key={r.id} onClick={()=>setRoomId(r.id)} style={{
                      flex: 1, height: 44, borderRadius: 10,
                      border: `1.5px solid ${active ? 'var(--accent)' : 'var(--border-strong)'}`,
                      background: active ? 'var(--accent-soft)' : '#FFF',
                      color: active ? 'var(--accent-ink)' : 'var(--ink-700)',
                      fontWeight: 700, fontSize: 13.5, cursor:'pointer',
                      display:'flex', alignItems:'center', justifyContent:'center', gap: 8,
                    }}>
                      <span style={{ width: 9, height: 9, borderRadius: 2, background: r.id === 'A' ? 'var(--accent)' : '#3B82F6' }} />
                      {r.name}
                      <span style={{ color:'var(--ink-400)', fontWeight: 500, fontSize: 12 }}>· {r.capacity}인 · {r.floor}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date + Time */}
            <div>
              <label style={fieldLabel}>일시</label>
              <div style={{ display:'flex', alignItems:'center', gap: 10, flexWrap:'wrap' }}>
                <div style={{ position:'relative', display:'inline-flex' }}>
                  <button
                    onClick={() => document.getElementById('booking-date-input').showPicker?.() || document.getElementById('booking-date-input').focus()}
                    style={{
                      display:'inline-flex', alignItems:'center', gap: 6, padding:'8px 12px',
                      background:'#F7F7F7', borderRadius: 8, fontSize: 13, fontWeight: 500,
                      border:'1px solid var(--border-strong)', cursor:'pointer', color:'var(--ink-900)',
                    }}>
                    📅 {dayStr}
                  </button>
                  <input
                    id="booking-date-input"
                    type="date"
                    value={D.isoDay(day)}
                    min={getBookingBounds(today).min}
                    max={getBookingBounds(today).max}
                    onChange={e => {
                      if (!e.target.value) return;
                      setDay(new Date(e.target.value + 'T00:00:00'));
                    }}
                    style={{ position:'absolute', opacity:0, pointerEvents:'none', width:1, height:1, top:0, left:0 }}
                  />
                </div>
                <TimeSelect value={start} onChange={(v)=>{ setStart(v); if (v >= end) setEnd(v + 30); }} options={timeOptions} />
                <span style={{ color:'var(--ink-400)' }}>–</span>
                <TimeSelect value={end} onChange={setEnd} options={timeOptions.filter(o => o > start)} />
                <span style={{ marginLeft:'auto', fontSize: 12, color:'var(--ink-500)' }}>
                  총 {Math.floor((end-start)/60)}시간 {(end-start)%60 ? `${(end-start)%60}분` : ''}
                </span>
              </div>
            </div>

            {/* Recurrence */}
            <div>
              <label style={fieldLabel}>반복</label>
              <div style={{ display:'flex', gap: 6, flexWrap:'wrap' }}>
                {[['none','반복 안 함'],['daily','매일'],['weekly','매주'],['biweekly','격주'],['monthly','매월']].map(([v,l]) => {
                  const active = v === repeat;
                  return (
                    <button key={v} onClick={()=>setRepeat(v)} style={{
                      height: 30, padding:'0 12px', borderRadius: 999,
                      border: `1px solid ${active ? 'var(--ink-900)' : 'var(--border-strong)'}`,
                      background: active ? '#FFF' : '#FFF',
                      color: active ? 'var(--ink-900)' : 'var(--ink-500)',
                      fontSize: 12, fontWeight: active ? 700 : 500, cursor:'pointer',
                      display:'inline-flex', alignItems:'center', gap: 4,
                    }}>
                      {v !== 'none' && <Icon.Repeat />} {l}
                    </button>
                  );
                })}
              </div>
              {repeat !== 'none' && (
                <div style={{
                  marginTop: 10, padding:'12px 14px', background:'#FCFCFC',
                  border:'1px dashed var(--border-strong)', borderRadius: 10,
                  display:'flex', alignItems:'center', gap: 14, flexWrap:'wrap',
                }}>
                  <div style={{ display:'flex', alignItems:'center', gap: 6, fontSize: 12, fontWeight: 600, color:'var(--ink-700)' }}>
                    <Icon.Calendar /> 반복 예약 종료 날짜
                  </div>
                  <input
                    type="date"
                    value={repeatUntil}
                    min={D.isoDay(day)}
                    max={getRepeatMax(today)}
                    onChange={(e)=>setRepeatUntil(e.target.value)}
                    style={{
                      height: 34, padding:'0 12px', borderRadius: 8,
                      border:'1px solid var(--border-strong)', background:'#FFF',
                      fontSize: 13, color:'var(--ink-900)', outline:'none',
                      fontFamily:'inherit',
                    }}
                  />
                  <div style={{ fontSize: 11.5, color:'var(--ink-500)', fontWeight:600 }}>
                    {(() => {
                      const cnt = calcRepeatCount(repeat, day, repeatUntil);
                      return `종료일까지 ${cnt}번 반복`;
                    })()}
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label style={fieldLabel}>안건 (선택)</label>
              <textarea
                value={desc} onChange={(e)=>setDesc(e.target.value)}
                placeholder="회의 안건이나 메모를 적어주세요"
                rows={3}
                style={{ ...textInput, resize:'vertical', minHeight: 64 }}
              />
            </div>
          </div>

          {/* Right: attendees */}
          <div style={{
            width: 280, flexShrink: 0, borderLeft:'1px solid var(--border)',
            padding:'18px 18px', display:'flex', flexDirection:'column', gap: 12, background:'#FCFCFC',
            overflowY:'auto',
          }}>
            <div>
              <label style={fieldLabel}>참석자 <span style={{ color:'var(--ink-400)', fontWeight: 500 }}>({allAttendees.length}/{room.capacity})</span></label>
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left: 10, top: '50%', transform:'translateY(-50%)', color:'var(--ink-400)' }}><Icon.Search /></span>
                <input
                  value={search} onChange={(e)=>setSearch(e.target.value)}
                  placeholder="이름, 팀, 이메일로 검색"
                  style={{ ...textInput, paddingLeft: 32 }}
                />
              </div>
              {filteredPeople.length > 0 && (
                <div style={{ marginTop: 6, background:'#FFF', border:'1px solid var(--border-strong)', borderRadius: 8, padding: 4, boxShadow:'0 4px 14px rgba(0,0,0,.05)' }}>
                  {filteredPeople.map(p => (
                    <PersonSearchRow
                      key={p.id} p={p}
                      isFavorite={favoriteIds.has(p.id)}
                      onToggleFavorite={(e)=>{ e.stopPropagation(); toggleFavorite(p.id); }}
                      onAdd={()=>{ setAttendeeIds(prev=>[...prev, p.id]); setSearch(''); }}
                    />
                  ))}
                </div>
              )}
            </div>

            <div>
              <div style={{ display:'flex', flexWrap:'wrap', gap: 6 }}>
                {attendees.map(p => (
                  <PersonChip
                    key={p.id}
                    p={p}
                    hasConflict={!!attendeeConflicts[p.id]}
                    onRemove={p.me ? null : () => setAttendeeIds(prev => prev.filter(id => id !== p.id))}
                  />
                ))}
                {externals.map(p => (
                  <PersonChip
                    key={p.id}
                    p={p}
                    onRemove={() => setExternals(prev => prev.filter(e => e.id !== p.id))}
                  />
                ))}
              </div>
              {externalsWithEmail.length > 0 && (
                <div style={{ marginTop: 8, padding:'7px 10px', background:'#ECFDF5', border:'1px solid #A7F3D0', borderRadius: 6, fontSize: 11, color:'#065F46', fontWeight: 500, display:'flex', alignItems:'center', gap: 6 }}>
                  <Icon.Check /> 외부 참석자 {externalsWithEmail.length}명에게 이메일로 일정이 전송됩니다.
                </div>
              )}
            </div>

            {/* Recent / Favorite tabbed quick add */}
            <div>
              <div style={{ display:'flex', alignItems:'center', gap: 4, marginBottom: 8, borderBottom:'1px solid var(--border)' }}>
                {[
                  ['recent','최근 참석자'],
                  ['favorite','즐겨찾기'],
                ].map(([v,l]) => {
                  const active = favTab === v;
                  return (
                    <button key={v} onClick={()=>setFavTab(v)} style={{
                      appearance:'none', border:'none', background:'transparent',
                      padding:'6px 4px', marginBottom: -1,
                      fontSize: 11, fontWeight: active ? 700 : 600,
                      color: active ? 'var(--ink-900)' : 'var(--ink-400)',
                      letterSpacing:'.04em', textTransform:'uppercase',
                      borderBottom: active ? '2px solid var(--ink-900)' : '2px solid transparent',
                      cursor:'pointer',
                      display:'inline-flex', alignItems:'center', gap: 4,
                    }}>
                      {v === 'favorite' && <Icon.StarFilled style={{ color: active ? 'var(--accent)' : 'var(--ink-300)' }} />}
                      {l}
                    </button>
                  );
                })}
              </div>

              {favTab === 'recent' && (() => {
                const recentList = recent;
                if (recentList.length === 0) return (
                  <div style={{ fontSize: 11.5, color:'var(--ink-400)', padding:'8px 2px' }}>최근 추가한 참석자가 없어요.</div>
                );
                return (
                  <div style={{ display:'flex', flexDirection:'column', gap: 2 }}>
                    {recentList.map(p => (
                      <PersonSearchRow
                        key={p.id} p={p}
                        isFavorite={favoriteIds.has(p.id)}
                        onToggleFavorite={(e)=>{ e.stopPropagation(); toggleFavorite(p.id); }}
                        onAdd={()=>setAttendeeIds(prev=>[...prev, p.id])}
                        compact
                      />
                    ))}
                  </div>
                );
              })()}

              {favTab === 'favorite' && (() => {
                const favPeople = D.PEOPLE.filter(p => favoriteIds.has(p.id) && !attendeeIds.includes(p.id));
                const groups = D.FAVORITE_GROUPS || [];
                const addGroup = (g) => {
                  setAttendeeIds(prev => {
                    const next = [...prev];
                    for (const id of g.memberIds) if (!next.includes(id)) next.push(id);
                    return next;
                  });
                };
                return (
                  <div style={{ display:'flex', flexDirection:'column', gap: 10 }}>
                    {/* Favorite groups */}
                    {groups.length > 0 && (
                      <div>
                        <div style={{ fontSize: 10, color:'var(--ink-400)', fontWeight: 700, letterSpacing:'.06em', textTransform:'uppercase', marginBottom: 4, display:'flex', alignItems:'center', gap: 4 }}>
                          <Icon.Folder /> 그룹
                        </div>
                        <div style={{ display:'flex', flexDirection:'column', gap: 4 }}>
                          {groups.map(g => {
                            const members = g.memberIds.map(id => peopleById[id]).filter(Boolean);
                            const alreadyAll = g.memberIds.every(id => attendeeIds.includes(id));
                            return (
                              <button key={g.id} onClick={()=>!alreadyAll && addGroup(g)} disabled={alreadyAll}
                                style={{
                                  appearance:'none', textAlign:'left',
                                  border:'1px solid var(--border-strong)', borderRadius: 8,
                                  background: alreadyAll ? '#F7F7F7' : '#FFF',
                                  padding:'8px 10px', cursor: alreadyAll ? 'default' : 'pointer',
                                  display:'flex', alignItems:'center', gap: 8,
                                  opacity: alreadyAll ? 0.6 : 1,
                                }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontSize: 12, fontWeight: 700, color:'var(--ink-900)', marginBottom: 2, display:'flex', alignItems:'center', gap: 4 }}>
                                    {g.name}
                                    <span style={{ fontSize: 10, color:'var(--ink-400)', fontWeight: 500 }}>· {members.length}명</span>
                                  </div>
                                  <div style={{ display:'flex', alignItems:'center', gap: -4 }}>
                                    {members.slice(0, 5).map((m, i) => (
                                      <span key={m.id} title={m.name} style={{
                                        width: 18, height: 18, borderRadius:'50%', background: m.color, color:'#fff',
                                        display:'inline-flex', alignItems:'center', justifyContent:'center',
                                        fontSize: 9, fontWeight: 700, marginLeft: i === 0 ? 0 : -4,
                                        border:'1.5px solid #FFF',
                                      }}>{m.initial}</span>
                                    ))}
                                  </div>
                                </div>
                                <span style={{
                                  fontSize: 10.5, fontWeight: 700,
                                  color: alreadyAll ? 'var(--ink-400)' : 'var(--accent-ink)',
                                  background: alreadyAll ? 'transparent' : 'var(--accent-soft)',
                                  padding:'3px 8px', borderRadius: 999,
                                  whiteSpace:'nowrap',
                                }}>{alreadyAll ? '추가됨' : '+ 전체 추가'}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Favorite people */}
                    <div>
                      <div style={{ fontSize: 10, color:'var(--ink-400)', fontWeight: 700, letterSpacing:'.06em', textTransform:'uppercase', marginBottom: 4, display:'flex', alignItems:'center', gap: 4 }}>
                        <Icon.StarFilled style={{ color:'var(--accent)' }} /> 즐겨찾기한 사람
                      </div>
                      {favPeople.length === 0 ? (
                        <div style={{ fontSize: 11.5, color:'var(--ink-400)', padding:'6px 2px' }}>
                          검색 결과에서 ★ 아이콘을 눌러 자주 함께하는 사람을 추가해보세요.
                        </div>
                      ) : (
                        <div style={{ display:'flex', flexDirection:'column', gap: 2 }}>
                          {favPeople.map(p => (
                            <PersonSearchRow
                              key={p.id} p={p}
                              isFavorite={true}
                              onToggleFavorite={(e)=>{ e.stopPropagation(); toggleFavorite(p.id); }}
                              onAdd={()=>setAttendeeIds(prev=>[...prev, p.id])}
                              compact
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* External attendee inline form */}
            {!extOpen ? (
              <button onClick={() => setExtOpen(true)} style={{
                marginTop: 4, height: 34, borderRadius: 8, border:'1px dashed var(--border-strong)', background:'#FFF',
                color:'var(--ink-500)', fontSize: 12.5, fontWeight: 500, cursor:'pointer',
                display:'inline-flex', alignItems:'center', justifyContent:'center', gap: 6,
              }}>
                <Icon.Plus /> 외부 참석자 추가
              </button>
            ) : (
              <div style={{
                marginTop: 4, padding: 12, borderRadius: 10,
                background:'#FFF', border:'1px solid var(--border-strong)',
                display:'flex', flexDirection:'column', gap: 8,
              }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color:'var(--ink-900)' }}>외부 참석자</div>
                  <button onClick={()=>{ setExtOpen(false); setExtName(''); setExtEmail(''); setExtPhone(''); }} style={{ width: 22, height: 22, borderRadius: 6, border:'none', background:'transparent', color:'var(--ink-400)', cursor:'pointer', display:'inline-flex', alignItems:'center', justifyContent:'center' }}>
                    <Icon.X />
                  </button>
                </div>
                <div>
                  <label style={{ ...fieldLabel, fontSize: 10.5, marginBottom: 4 }}>이름 <span style={{ color:'var(--accent)' }}>*</span></label>
                  <input value={extName} onChange={(e)=>setExtName(e.target.value)} placeholder="홍길동" style={{ ...textInput, height: 32, fontSize: 12.5 }} />
                </div>
                <div>
                  <label style={{ ...fieldLabel, fontSize: 10.5, marginBottom: 4 }}>이메일 <span style={{ color:'var(--ink-400)', fontWeight: 500, textTransform:'none', letterSpacing: 0 }}>(선택)</span></label>
                  <input value={extEmail} onChange={(e)=>setExtEmail(e.target.value)} placeholder="hong@example.com" style={{ ...textInput, height: 32, fontSize: 12.5 }} />
                  <div style={{ fontSize: 10.5, color:'var(--ink-400)', marginTop: 4 }}>※ 이메일 입력 시 해당 주소로 일정이 자동 전송됩니다.</div>
                </div>
                <div>
                  <label style={{ ...fieldLabel, fontSize: 10.5, marginBottom: 4 }}>전화번호 <span style={{ color:'var(--ink-400)', fontWeight: 500, textTransform:'none', letterSpacing: 0 }}>(선택)</span></label>
                  <input value={extPhone} onChange={(e)=>setExtPhone(e.target.value)} placeholder="010-0000-0000" style={{ ...textInput, height: 32, fontSize: 12.5 }} />
                </div>
                <div style={{ display:'flex', gap: 6, marginTop: 2 }}>
                  <button onClick={()=>{ setExtOpen(false); setExtName(''); setExtEmail(''); setExtPhone(''); }} style={{ flex: 1, height: 32, borderRadius: 8, border:'1px solid var(--border-strong)', background:'#FFF', color:'var(--ink-700)', fontSize: 12, fontWeight: 600, cursor:'pointer' }}>취소</button>
                  <button
                    disabled={!extName.trim()}
                    onClick={() => {
                      const trimmed = extName.trim();
                      if (!trimmed) return;
                      const ne = {
                        id: 'ext_' + Date.now(),
                        name: trimmed,
                        email: extEmail.trim(),
                        phone: extPhone.trim(),
                        initial: trimmed[0] || '외',
                        color: '#9CA3AF',
                        team:'외부',
                        external: true,
                      };
                      setExternals(prev => [...prev, ne]);
                      setExtOpen(false); setExtName(''); setExtEmail(''); setExtPhone('');
                    }}
                    style={{
                      flex: 1, height: 32, borderRadius: 8, border:'none',
                      background: extName.trim() ? 'var(--accent)' : '#E5E5E5',
                      color: '#FFF', fontSize: 12, fontWeight: 700,
                      cursor: extName.trim() ? 'pointer' : 'not-allowed',
                    }}>추가</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding:'14px 22px', borderTop:'1px solid var(--border)',
          display:'flex', alignItems:'center', justifyContent:'space-between', gap: 12,
          background:'#FCFCFC',
        }}>
          <div style={{ fontSize: 12 }}>
            {isPastDay ? (
              <div style={{
                display:'flex', alignItems:'flex-start', gap: 8,
                color:'#7A7A7A',
              }}>
                <span style={{ color:'var(--ink-400)', marginTop: 1, flexShrink: 0 }}><Icon.Alert /></span>
                <div>
                  <div style={{ fontWeight: 700, color:'var(--ink-700)' }}>지나간 날짜에는 예약할 수 없어요</div>
                  <div style={{ fontSize: 11.5, marginTop: 2, color:'var(--ink-400)' }}>
                    오늘 또는 이후 날짜를 선택해주세요.
                  </div>
                </div>
              </div>
            ) : (isToday && start < minStartMin) ? (
              <div style={{
                display:'flex', alignItems:'flex-start', gap: 8,
                color:'#7A7A7A',
              }}>
                <span style={{ color:'var(--ink-400)', marginTop: 1, flexShrink: 0 }}><Icon.Alert /></span>
                <div>
                  <div style={{ fontWeight: 700, color:'var(--ink-700)' }}>지나간 시간에는 예약할 수 없어요</div>
                  <div style={{ fontSize: 11.5, marginTop: 2, color:'var(--ink-400)' }}>
                    {D.minutesToLabel(minStartMin)} 이후 시간으로 다시 선택해주세요.
                  </div>
                </div>
              </div>
            ) : conflicts.length > 0 ? (
              <div style={{
                display:'flex', alignItems:'flex-start', gap: 8,
                color:'#991B1B',
              }}>
                <span style={{ color:'#DC2626', marginTop: 1, flexShrink: 0 }}><Icon.Alert /></span>
                <div>
                  <div style={{ fontWeight: 700 }}>이 시간에 다른 예약과 충돌해요</div>
                  <div style={{ fontSize: 11.5, marginTop: 2, color:'#7F1D1D' }}>
                    {conflicts.map(c => `${c.title} (${D.minutesToLabel(c.start)}–${D.minutesToLabel(c.end)})`).join(' · ')}
                  </div>
                </div>
              </div>
            ) : (
              <span style={{ color:'var(--ink-500)' }}>예약 시 참석자에게 Push 알림이 발송됩니다.</span>
            )}
          </div>
          <div style={{ display:'flex', gap: 8, flexShrink: 0 }}>
            <button onClick={onClose} style={btnSecondary}>취소</button>
            <button
              disabled={!canSave || conflicts.length > 0}
              onClick={() => onSubmit({ title, day, roomId, start, end, category, attendeeIds, externals, desc, repeat, repeatUntil })}
              style={{
                ...btnPrimary,
                opacity: (canSave && conflicts.length === 0) ? 1 : 0.5,
                cursor: (canSave && conflicts.length === 0) ? 'pointer' : 'not-allowed',
                background: conflicts.length > 0 ? '#E5E5E5' : 'var(--accent)',
                boxShadow: conflicts.length > 0 ? 'none' : '0 2px 8px rgba(245,166,35,.25)',
              }}>
              예약하기
            </button>
          </div>
        </div>
      </div>
    </Backdrop>
  );
}

function ResvDetail({ r, peopleById, onClose, onCancel, onEdit, onExtend, onCheckIn }) {
  const D = window.AppData;
  const room = D.ROOMS.find(rm => rm.id === r.room);
  const organizer = peopleById[r.organizerId];
  const attendees = r.attendees.map(id => peopleById[id]).filter(Boolean);
  const day = new Date(r.day + 'T00:00:00');
  const dayStr = `${day.getMonth()+1}월 ${day.getDate()}일 (${['일','월','화','수','목','금','토'][day.getDay()]})`;
  const isMine = r.me || r.organizerId === 'u1' || r.attendees.includes('u1');
  return (
    <Backdrop onClose={onClose}>
      <div style={{
        width: 440, maxHeight:'88vh', background:'#FFF', borderRadius: 14,
        boxShadow:'var(--shadow-pop)', display:'flex', flexDirection:'column', overflow:'hidden',
      }}>
        <div style={{ padding: '20px 24px 6px', display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap: 6, fontSize: 11, fontWeight: 700, padding:'3px 8px', borderRadius: 4,
              background: r.room === 'A' ? 'var(--accent-soft)' : 'var(--blue-soft)',
              color: r.room === 'A' ? 'var(--accent-ink)' : '#1E40AF',
              marginBottom: 8,
            }}>
              {room.name} · {r.category}
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color:'var(--ink-900)', lineHeight: 1.3 }}>{r.title}</div>
          </div>
          <button onClick={onClose} style={iconBtn}><Icon.X /></button>
        </div>

        <div style={{ padding: '14px 24px 18px', display:'flex', flexDirection:'column', gap: 14 }}>
          <DetailRow icon={<Icon.Clock />} label="일시" value={`${dayStr} · ${D.timeRangeLabel(r.start, r.end)} (${Math.floor((r.end-r.start)/60)}시간${(r.end-r.start)%60 ? ` ${(r.end-r.start)%60}분` : ''})`} />
          <DetailRow icon={<Icon.MapPin />} label="장소" value={`${room.name} · ${room.floor} · 정원 ${room.capacity}인`} extra={
            <div style={{ marginTop: 4, display:'flex', gap: 4, flexWrap:'wrap' }}>
              {room.amenities.map(a => (
                <span key={a} style={{ fontSize: 10.5, color:'var(--ink-500)', background:'#F3F3F3', padding:'2px 7px', borderRadius: 3 }}>{a}</span>
              ))}
            </div>
          } />
          <DetailRow icon={<Icon.Users />} label="참석자" value={`${organizer ? organizer.name : ''} (주관) 외 ${attendees.length-1}명`} extra={
            <div style={{ marginTop: 8, display:'flex', flexDirection:'column', gap: 6 }}>
              {attendees.map(p => (
                <div key={p.id} style={{ display:'flex', alignItems:'center', gap: 8 }}>
                  <span style={{ width: 22, height: 22, borderRadius:'50%', background: p.color, color:'#fff', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize: 10, fontWeight: 700 }}>{p.initial}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600 }}>{p.name} {p.id === r.organizerId && <span style={{ fontSize: 10, color:'var(--accent-ink)', background:'var(--accent-soft)', padding:'1px 5px', borderRadius: 3, marginLeft: 4 }}>주관</span>}</div>
                    <div style={{ fontSize: 11, color:'var(--ink-400)' }}>{p.team}</div>
                  </div>
                </div>
              ))}
            </div>
          } />
          {r.desc && <DetailRow icon={<Icon.Info />} label="안건" value={r.desc} />}
          {r.external && (
            <div style={{ padding:'8px 10px', background:'#FEF3C7', borderRadius: 8, fontSize: 12, color:'#92400E', display:'flex', alignItems:'center', gap: 8 }}>
              <Icon.Alert /> 외부 참석자가 포함된 회의입니다. 출입 카드를 미리 신청해주세요.
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div style={{
          marginTop:'auto', padding:'12px 16px', borderTop:'1px solid var(--border)',
          display:'flex', alignItems:'center', gap: 6, background:'#FCFCFC',
        }}>
          <button onClick={onCheckIn} style={{ ...btnGhost, color:'var(--accent-ink)' }}>
            <Icon.Check /> 체크인
          </button>
          <button onClick={onExtend} style={btnGhost}>
            <Icon.Clock /> 연장
          </button>
          <div style={{ flex: 1 }} />
          {isMine && (
            <>
              <button onClick={onEdit} style={btnGhost}><Icon.Edit /> 수정</button>
              <button onClick={onCancel} style={{ ...btnGhost, color:'#DC2626' }}><Icon.Trash /> 취소</button>
            </>
          )}
        </div>
      </div>
    </Backdrop>
  );
}

function DetailRow({ icon, label, value, extra }) {
  return (
    <div style={{ display:'flex', gap: 12 }}>
      <div style={{ width: 18, color:'var(--ink-400)', marginTop: 2 }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, color:'var(--ink-400)', fontWeight: 600, letterSpacing:'.04em', marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 13, color:'var(--ink-900)', fontWeight: 500, lineHeight: 1.5 }}>{value}</div>
        {extra}
      </div>
    </div>
  );
}

function Toast({ message, kind = 'info', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  const colors = {
    info: { bg:'#1A1A1A', fg:'#FFF' },
    success: { bg:'#10B981', fg:'#FFF' },
    error: { bg:'#EF4444', fg:'#FFF' },
  }[kind];
  return (
    <div style={{
      position:'fixed', bottom: 28, left:'50%', transform:'translateX(-50%)',
      background: colors.bg, color: colors.fg, fontSize: 13, fontWeight: 600,
      padding:'12px 18px', borderRadius: 10, boxShadow:'0 12px 30px rgba(0,0,0,.18)',
      zIndex: 90, display:'flex', alignItems:'center', gap: 8,
    }}>
      {kind === 'success' && <Icon.Check />}
      {message}
    </div>
  );
}

// Shared styles (used by BookingModal + ResvDetail + QuickBookModal)
const fieldLabel = {
  display:'block', fontSize: 11, color:'var(--ink-400)', fontWeight: 600, letterSpacing:'.04em',
  marginBottom: 6, textTransform:'uppercase',
};
const textInput = {
  width:'100%', height: 38, borderRadius: 8, border:'1px solid var(--border-strong)',
  padding:'0 12px', fontSize: 13, outline:'none', background:'#FFF',
  transition:'border-color .12s, box-shadow .12s',
};
const iconBtn = {
  width: 32, height: 32, borderRadius: 8, border:'none', background:'#F7F7F7',
  display:'inline-flex', alignItems:'center', justifyContent:'center', color:'var(--ink-700)', cursor:'pointer',
};
const btnPrimary = {
  height: 38, padding:'0 18px', borderRadius: 10, background:'var(--accent)', color:'#FFF',
  border:'none', fontWeight: 700, fontSize: 13, cursor:'pointer', boxShadow:'0 2px 8px rgba(245,166,35,.25)',
  whiteSpace:'nowrap',
};
const btnSecondary = {
  height: 38, padding:'0 16px', borderRadius: 10, background:'#FFF', color:'var(--ink-700)',
  border:'1px solid var(--border-strong)', fontWeight: 600, fontSize: 13, cursor:'pointer',
  whiteSpace:'nowrap',
};
const btnGhost = {
  height: 34, padding:'0 12px', borderRadius: 8, background:'transparent', color:'var(--ink-700)',
  border:'none', fontWeight: 600, fontSize: 12.5, cursor:'pointer',
  display:'inline-flex', alignItems:'center', gap: 4,
};
const searchRow = {
  appearance:'none', border:'none', width:'100%', background:'transparent',
  display:'flex', alignItems:'center', gap: 8, padding:'6px 8px', borderRadius: 6, cursor:'pointer',
  textAlign:'left',
};

// =====================================================
// RES-006 — Quick Book Popup (회의실 바로 예약)
// =====================================================
function QuickBookModal({ today, nowMinutes, reservations, peopleById, defaultRoomId, onClose, onSubmit }) {
  const D = window.AppData;
  const me = peopleById['u1'];
  const dayKey = D.isoDay(today);

  // Reservations for today by room
  const resvByRoom = useMemo(() => ({
    A: reservations.filter(r => r.day === dayKey && r.room === 'A').sort((a,b)=>a.start-b.start),
    B: reservations.filter(r => r.day === dayKey && r.room === 'B').sort((a,b)=>a.start-b.start),
  }), [reservations, dayKey]);

  // Smart default: if defaultRoom is free now, use it; otherwise pick the free one
  const isFreeNow = (rid) => !resvByRoom[rid].find(r => r.start <= nowMinutes && r.end > nowMinutes);
  const initialRoom = isFreeNow(defaultRoomId) ? defaultRoomId : (defaultRoomId === 'A' ? (isFreeNow('B') ? 'B' : 'A') : (isFreeNow('A') ? 'A' : 'B'));
  const [roomId, setRoomId] = useState(initialRoom);
  const [keeper, setKeeper] = useState(true); // 예약자 chip presence

  // start: snap nowMinutes to next 5-min step for cleanness (or use exact)
  const startMin = nowMinutes;

  const todayResv = resvByRoom[roomId];
  const nextMeeting = todayResv.find(r => r.start >= startMin);

  // For each option, compute end time and conflict
  const options = useMemo(() => {
    const ongoingInRoom = !isFreeNow(roomId);
    const opts = [
      { key:'30',  label:'현재 시간으로부터', duration: 30  },
      { key:'60',  label:'현재 시간으로부터', duration: 60  },
      { key:'90',  label:'현재 시간으로부터', duration: 90  },
      { key:'next',label:'다음 회의 전까지',  duration: null },
    ];
    return opts.map(o => {
      let end;
      if (o.duration != null) end = startMin + o.duration;
      else end = nextMeeting ? nextMeeting.start : D.DAY_END_MIN;
      // RES-006: 최대 2시간 cap
      end = Math.min(end, startMin + 120, D.DAY_END_MIN);
      const conflict = !!(nextMeeting && end > nextMeeting.start);
      const tooShort = end - startMin < 15;
      const dur = end - startMin;
      let value;
      if (o.key === 'next') {
        value = nextMeeting ? `${D.minutesToLabel(end)}까지` : (end < D.DAY_END_MIN ? `${D.minutesToLabel(end)}까지` : '오늘 종료까지');
      } else if (o.duration === 30) value = '30분';
      else if (o.duration === 60) value = '1시간';
      else if (o.duration === 90) value = '1시간 30분';
      return { ...o, end, dur, value, conflict, disabled: conflict || tooShort || ongoingInRoom };
    });
  }, [startMin, nextMeeting, roomId, resvByRoom]);

  const enabledFirst = options.find(o => !o.disabled);
  const [selectedKey, setSelectedKey] = useState(enabledFirst ? enabledFirst.key : '30');
  // re-select first enabled option whenever room changes
  useEffect(() => {
    const next = options.find(o => !o.disabled);
    setSelectedKey(next ? next.key : '30');
  }, [roomId]);

  const selectedOpt = options.find(o => o.key === selectedKey) || options[0];
  const endMin = selectedOpt.end;
  const durMin = endMin - startMin;
  const roomBusyNow = !isFreeNow(roomId);

  // Timeline window: ~6 hours, centered around now
  const winStart = Math.max(D.DAY_START_MIN, Math.floor(startMin / 60) * 60 - 60);
  const winEnd = Math.min(D.DAY_END_MIN, winStart + 360);
  const pxPerMin = 1.6; // 60min = 96px → 6h = 576px
  const lineHeight = (winEnd - winStart) * pxPerMin;

  const timelineRef = useRef(null);
  useEffect(() => {
    // Scroll timeline so current-time line is ~1/3 from top
    if (timelineRef.current) {
      const y = (startMin - winStart) * pxPerMin;
      timelineRef.current.scrollTop = Math.max(0, y - 80);
    }
  }, [roomId, startMin]);

  const dayWeekday = ['일','월','화','수','목','금','토'][today.getDay()];

  const room = D.ROOMS.find(r => r.id === roomId);

  const canSave = !selectedOpt.disabled && keeper;

  return (
    <Backdrop onClose={onClose}>
      <div style={{
        width: 980, maxHeight:'92vh',
        background:'#FFF', borderRadius: 18,
        boxShadow:'var(--shadow-pop)', display:'flex', flexDirection:'column',
        overflow:'hidden',
      }}>
        {/* Header */}
        <div style={{ padding:'24px 30px 18px', display:'flex', alignItems:'center', justifyContent:'space-between', gap: 14 }}>
          <div style={{ display:'flex', alignItems:'baseline', gap: 12, flexWrap:'wrap' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color:'var(--ink-900)' }}>회의실 바로 예약</div>
            <div style={{ fontSize: 12, color:'var(--ink-400)' }}>※ 회의실 바로 예약은 당일 예약만 가능합니다.</div>
          </div>
          <button onClick={onClose} style={iconBtn}><Icon.X /></button>
        </div>

        {/* Body — 2 columns */}
        <div style={{ display:'flex', flex: 1, minHeight: 0, padding:'0 30px 20px', gap: 24 }}>
          {/* LEFT: form */}
          <div style={{ flex:'1 1 0', minWidth: 0, display:'flex', flexDirection:'column', gap: 26 }}>
            {/* 예약자 */}
            <FormRow label="예약자">
              {keeper ? (
                <div style={{
                  display:'flex', alignItems:'center', gap: 10, padding:'10px 14px',
                  background:'#F5F5F5', borderRadius: 10, height: 48,
                }}>
                  <span style={{ width: 28, height: 28, borderRadius:'50%', background: me.color, color:'#fff', display:'inline-flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize: 12 }}>{me.initial}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color:'var(--ink-900)' }}>{me.name}</div>
                    <div style={{ fontSize: 11, color:'var(--ink-400)' }}>{me.team}</div>
                  </div>
                  <button onClick={()=>setKeeper(false)} style={{
                    width: 22, height: 22, borderRadius:'50%', background:'#D9D9D9', border:'none', cursor:'pointer',
                    display:'inline-flex', alignItems:'center', justifyContent:'center', color:'#fff',
                  }}><Icon.X /></button>
                </div>
              ) : (
                <button onClick={()=>setKeeper(true)} style={{
                  height: 48, borderRadius: 10, border:'1px dashed var(--border-strong)', background:'#FFF',
                  color:'var(--ink-500)', fontSize: 13, fontWeight: 600, cursor:'pointer',
                  display:'inline-flex', alignItems:'center', justifyContent:'center', gap: 6, padding:'0 14px',
                }}>
                  <Icon.Plus /> 예약자 추가
                </button>
              )}
            </FormRow>

            {/* 시간 */}
            <FormRow label="시간" alignTop>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 12 }}>
                {options.map(o => {
                  const active = selectedKey === o.key;
                  return (
                    <button key={o.key}
                      onClick={() => !o.disabled && setSelectedKey(o.key)}
                      disabled={o.disabled}
                      style={{
                        appearance:'none', textAlign:'left',
                        padding:'14px 16px', borderRadius: 12, cursor: o.disabled ? 'not-allowed' : 'pointer',
                        background: o.disabled ? '#F7F7F7' : (active ? 'var(--accent-soft)' : '#F5F5F5'),
                        border: `1.5px solid ${active ? 'var(--accent)' : 'transparent'}`,
                        opacity: o.disabled ? 0.55 : 1,
                        display:'flex', alignItems:'center', gap: 14,
                        transition:'background .12s, border-color .12s',
                      }}>
                      <span style={{
                        width: 20, height: 20, borderRadius:'50%',
                        background: active ? 'var(--accent)' : '#FFF',
                        border: active ? 'none' : '1.5px solid var(--ink-300)',
                        display:'inline-flex', alignItems:'center', justifyContent:'center', flexShrink: 0,
                      }}>
                        {active && <span style={{ width: 7, height: 7, borderRadius:'50%', background:'#FFF' }} />}
                      </span>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: 12.5, color: 'var(--ink-500)', fontWeight: 500, marginBottom: 2, whiteSpace:'nowrap' }}>{o.label}</div>
                        <div style={{ fontSize: 17, fontWeight: 800, color:'var(--ink-900)', whiteSpace:'nowrap' }}>{o.value}</div>
                        {o.conflict && <div style={{ fontSize: 10.5, color:'#DC2626', fontWeight: 600, marginTop: 3 }}>다음 회의와 충돌</div>}
                      </div>
                    </button>
                  );
                })}
              </div>
              <div style={{ marginTop: 12, fontSize: 12, color:'var(--ink-400)' }}>
                ※ 회의실 바로 예약은 <strong style={{ color:'var(--ink-700)', fontWeight: 700 }}>최대 2시간</strong>까지 가능합니다.
              </div>
              {roomBusyNow && (
                <div style={{
                  marginTop: 12, padding:'10px 12px', background:'#FEF2F2', border:'1px solid #FECACA',
                  borderRadius: 10, fontSize: 12, color:'#991B1B', display:'flex', alignItems:'center', gap: 8,
                }}>
                  <Icon.Alert /> <strong>{room.name}</strong>은(는) 현재 사용 중입니다. 다른 회의실을 선택해주세요.
                </div>
              )}
            </FormRow>
          </div>

          {/* RIGHT: timeline preview */}
          <div style={{
            width: 360, flexShrink: 0, background:'#FFF',
            border:'1px solid var(--border)', borderRadius: 14,
            padding:'16px 18px 18px',
            display:'flex', flexDirection:'column', gap: 14, minHeight: 0,
          }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color:'var(--ink-900)' }}>
                {String(today.getMonth()+1).padStart(2,'0')}.{String(today.getDate()).padStart(2,'0')} ({dayWeekday}) {room.name} 현황
              </div>
            </div>
            {/* Room A/B segmented control */}
            <div style={{ display:'inline-flex', alignSelf:'flex-start', background:'#F3F3F3', borderRadius: 999, padding: 3, gap: 2 }}>
              {D.ROOMS.map(r => {
                const active = roomId === r.id;
                return (
                  <button key={r.id} onClick={()=>setRoomId(r.id)} style={{
                    height: 26, padding:'0 12px', borderRadius: 999, border:'none',
                    background: active ? '#FFF' : 'transparent',
                    color: active ? 'var(--ink-900)' : 'var(--ink-500)',
                    fontSize: 11.5, fontWeight: 700, cursor:'pointer',
                    boxShadow: active ? '0 1px 2px rgba(0,0,0,.06)' : 'none',
                    display:'inline-flex', alignItems:'center', gap: 5,
                  }}>
                    <span style={{ width: 7, height: 7, borderRadius: 2, background: r.id === 'A' ? 'var(--accent)' : '#3B82F6' }} />
                    {r.name}
                  </button>
                );
              })}
            </div>

            {/* Timeline body */}
            <div ref={timelineRef} style={{ position:'relative', flex: 1, overflowY:'auto', minHeight: 360 }}>
              <div style={{ position:'relative', height: lineHeight, paddingLeft: 70, paddingRight: 6 }}>
                {/* Hour lines + labels */}
                {Array.from({ length: Math.floor((winEnd - winStart) / 60) + 1 }).map((_, i) => {
                  const m = winStart + i * 60;
                  const y = (m - winStart) * pxPerMin;
                  const label = ampmHourLabel(m);
                  return (
                    <div key={i} style={{ position:'absolute', left: 0, right: 0, top: y, display:'flex', alignItems:'center', gap: 0 }}>
                      <div style={{
                        position:'absolute', left: 0, width: 60,
                        fontSize: 11, color:'var(--ink-400)', fontWeight: 500,
                        transform:'translateY(-50%)', whiteSpace:'nowrap',
                      }}>{label}</div>
                      <div style={{
                        position:'absolute', left: 60, top:'50%',
                        width: 5, height: 5, borderRadius:'50%', background:'#D4D4D4', transform:'translateY(-50%)',
                      }} />
                      <div style={{
                        position:'absolute', left: 72, right: 6, top:'50%',
                        borderTop:'1px dashed #E5E5E5', transform:'translateY(-50%)',
                      }} />
                    </div>
                  );
                })}

                {/* Existing meetings */}
                {todayResv.filter(r => r.end > winStart && r.start < winEnd).map(r => {
                  const top = (Math.max(r.start, winStart) - winStart) * pxPerMin;
                  const height = (Math.min(r.end, winEnd) - Math.max(r.start, winStart)) * pxPerMin - 2;
                  const roomColor = r.room === 'A' ? 'var(--accent)' : '#3B82F6';
                  const bg = r.room === 'A' ? 'var(--accent-soft)' : 'var(--blue-soft)';
                  return (
                    <div key={r.id} style={{
                      position:'absolute', left: 72, right: 6, top, height,
                      background: bg, border: `1px solid ${roomColor}50`,
                      borderRadius: 10, padding:'8px 12px',
                      display:'flex', flexDirection:'column', justifyContent:'space-between',
                      zIndex: 2,
                    }}>
                      <div style={{ display:'flex', alignItems:'center', gap: 6, minWidth: 0 }}>
                        <span style={{ width: 7, height: 7, borderRadius:'50%', background: roomColor, flexShrink: 0 }} />
                        <span style={{ fontSize: 12.5, fontWeight: 700, color:'var(--ink-900)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.title}</span>
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-500)' }}>
                        {D.minutesToLabel(r.start)} ~ {D.minutesToLabel(r.end)}
                      </div>
                    </div>
                  );
                })}

                {/* Selected slot preview */}
                {!selectedOpt.disabled && (() => {
                  const top = (startMin - winStart) * pxPerMin;
                  const height = (endMin - startMin) * pxPerMin - 2;
                  return (
                    <div style={{
                      position:'absolute', left: 72, right: 6, top, height: Math.max(24, height),
                      background:'rgba(245,166,35,.10)', border:'1.5px dashed var(--accent)',
                      borderRadius: 10, padding:'6px 12px',
                      display:'flex', alignItems:'center', justifyContent:'flex-end',
                      zIndex: 3,
                    }}>
                      <span style={{ fontSize: 11.5, fontWeight: 700, color:'var(--accent-ink)' }}>
                        {D.minutesToLabel(startMin)} ~ {D.minutesToLabel(endMin)} ({durMin}분)
                      </span>
                    </div>
                  );
                })()}

                {/* Current time line + pill */}
                {startMin >= winStart && startMin <= winEnd && (
                  <>
                    <div style={{
                      position:'absolute', left: 60, right: 6,
                      top: (startMin - winStart) * pxPerMin,
                      borderTop:'2px solid #1A1A1A',
                      zIndex: 4,
                    }} />
                    <div style={{
                      position:'absolute', left: 0,
                      top: (startMin - winStart) * pxPerMin,
                      transform:'translateY(-50%)',
                      zIndex: 5,
                    }}>
                      <span style={{
                        display:'inline-block', background:'#1A1A1A', color:'#FFF',
                        fontSize: 11, fontWeight: 700, padding:'4px 8px', borderRadius: 6,
                        whiteSpace:'nowrap',
                      }}>{ampmTimeLabel(startMin)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding:'14px 30px 24px', borderTop:'1px solid var(--border)',
          display:'grid', gridTemplateColumns:'1fr 1.4fr', gap: 12,
          background:'#FFF',
        }}>
          <button onClick={onClose} style={{
            height: 52, borderRadius: 12, border:'none',
            background:'#FFF4E0', color:'var(--accent-ink)',
            fontSize: 14, fontWeight: 700, cursor:'pointer',
          }}>뒤로 가기</button>
          <button
            onClick={() => canSave && onSubmit({ roomId, start: startMin, end: endMin })}
            disabled={!canSave}
            style={{
              height: 52, borderRadius: 12, border:'none',
              background: canSave ? 'var(--accent)' : '#E5E5E5',
              color:'#FFF', cursor: canSave ? 'pointer' : 'not-allowed',
              fontSize: 14, fontWeight: 700,
              display:'inline-flex', alignItems:'center', justifyContent:'center', gap: 8,
              boxShadow: canSave ? '0 4px 14px rgba(245,166,35,.32)' : 'none',
            }}>
            <Icon.Clock /> 예약하기
          </button>
        </div>
      </div>
    </Backdrop>
  );
}

function FormRow({ label, children, alignTop }) {
  return (
    <div style={{ display:'flex', alignItems: alignTop ? 'flex-start' : 'center', gap: 24 }}>
      <div style={{
        width: 80, flexShrink: 0,
        fontSize: 13, fontWeight: 700, color:'var(--ink-900)',
        paddingTop: alignTop ? 14 : 0,
        display:'flex', alignItems:'center', gap: 4,
      }}>
        {label} <span style={{ color:'var(--accent)', fontWeight: 700 }}>*</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
    </div>
  );
}

function ampmHourLabel(m) {
  const h = Math.floor(m / 60);
  const ampm = h < 12 ? '오전' : '오후';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${ampm} ${String(h12).padStart(2,'0')} : 00`;
}
function ampmTimeLabel(m) {
  const h = Math.floor(m/60), mm = m%60;
  const ampm = h < 12 ? '오전' : '오후';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${ampm} ${String(h12).padStart(2,'0')} : ${String(mm).padStart(2,'0')}`;
}

Object.assign(window, { BookingModal, ResvDetail, Toast, QuickBookModal });
