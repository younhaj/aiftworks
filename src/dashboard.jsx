// ─── dashboard.jsx ────────────────────────────────────────────────────────────
// 대시보드 탭 전체 컴포넌트
// common.jsx, leave-data.jsx, data.jsx 다음에 로드해야 함.

const { Icon, Toast, fieldLabel, textInput } = window.CommonUI;
const { TODAY: _TODAY, DOW_KO: _DOW, ME: _ME, isoDay: _isoDay, minutesToLabel } = window.CommonHelpers;
const { LEAVE_TYPES: _LT, LEAVE_REASONS: _LR, ICON_MAP: _IM, TIME_OPTIONS: _TO, getDefaultTime: _GDT } = window.LeaveData;

// ─── 대시보드 전용 더미 데이터 ────────────────────────────────────────────────
const PEOPLE_DASH = [
  { id:'u1', name:'전윤하', team:'사업기획실',       initial:'전', color:'#F5A623' },
  { id:'u2', name:'김민준', team:'프로덕트디자인팀', initial:'김', color:'#3B82F6' },
  { id:'u3', name:'이서연', team:'사업기획실',       initial:'이', color:'#10B981' },
  { id:'u4', name:'박지호', team:'개발실',           initial:'박', color:'#8B5CF6' },
  { id:'u5', name:'최유진', team:'프로덕트디자인팀', initial:'최', color:'#EC4899' },
  { id:'u6', name:'한도윤', team:'개발실',           initial:'한', color:'#F97316' },
  { id:'u7', name:'정하린', team:'경영지원실',       initial:'정', color:'#06B6D4' },
  { id:'u8', name:'조태경', team:'사업기획실',       initial:'조', color:'#6366F1' },
];

const TODAY_ABSENT = [
  { person:PEOPLE_DASH[3], type:'연차',      typeBg:'#FFF4E0', typeFg:'#8A5A0F' },
  { person:PEOPLE_DASH[2], type:'반차(오후)', typeBg:'#EDE9FE', typeFg:'#5B21B6' },
  { person:PEOPLE_DASH[5], type:'반반차',    typeBg:'#FCE7F3', typeFg:'#9D174D' },
];

const TODAY_MEETINGS = [
  { id:'r7', room:'A', roomName:'A 회의실', roomColor:'#F5A623', roomBg:'#FFF4E0', roomFg:'#8A5A0F',
    start:10*60, end:11*60, title:'사업기획실 주간 보고',
    attendees:[PEOPLE_DASH[0],PEOPLE_DASH[2],PEOPLE_DASH[7],PEOPLE_DASH[6]], status:'ongoing' },
  { id:'r9', room:'A', roomName:'A 회의실', roomColor:'#F5A623', roomBg:'#FFF4E0', roomFg:'#8A5A0F',
    start:16*60, end:17*60, title:'채용 인터뷰 — 프로덕트 PM',
    attendees:[PEOPLE_DASH[7],PEOPLE_DASH[0]], external:true, status:'upcoming' },
];

const ROOM_STATUS = [
  { id:'A', name:'A 회의실', capacity:8, status:'busy',
    currentMeeting:{ title:'사업기획실 주간 보고', end:11*60 },
    nextMeeting:{ title:'채용 인터뷰 — 프로덕트 PM', start:16*60 } },
  { id:'B', name:'B 회의실', capacity:6, status:'available',
    currentMeeting:null,
    nextMeeting:{ title:'디자인 리뷰', start:14*60 } },
];

const MY_LEAVE = { legal:15, allotted:18, extra:1, used:7.5, remaining:11.5 };

const UPCOMING_LEAVES = [
  { id:'l8',  date:'2026-05-20', dateLabel:'5월 20일 (수)', type:'연차',    days:1,   dday:6 },
  { id:'l-a', date:'2026-05-31', dateLabel:'5월 31일 (일)', type:'연차',    days:1,   dday:17 },
  { id:'l-b', date:'2026-06-15', dateLabel:'6월 15일 (월)', type:'오전반차', days:0.5, dday:32 },
];

// ─── 연차 신청 모달 (대시보드용 - leave.jsx의 LeaveModal 재사용) ───────────────
function DashLeaveModal({ onClose }) {
  // leave.jsx의 LeaveModal을 그대로 사용
  const LeaveModal = window.LeaveModal;
  return <LeaveModal me={_ME} onClose={onClose} onSubmit={() => onClose()} onUpdate={() => onClose()} onWithdraw={() => onClose()} />;
}

// ─── 오늘 내 회의 ──────────────────────────────────────────────────────────────
function TodayMeetings() {
  return (
    <div style={{ background:'#FFF', borderRadius:14, border:'1px solid var(--border)', overflow:'hidden' }}>
      <div style={{ padding:'16px 18px 12px', borderBottom:'1px solid var(--border)' }}>
        <div style={{ fontSize:10.5, fontWeight:700, letterSpacing:'.06em', textTransform:'uppercase', color:'var(--ink-400)', marginBottom:2 }}>오늘 내 회의</div>
        <div style={{ fontSize:18, fontWeight:800, color:'var(--ink-900)', lineHeight:1 }}>{TODAY_MEETINGS.length}건</div>
      </div>
      <div style={{ padding:'12px 18px', display:'flex', flexDirection:'column', gap:8 }}>
        {TODAY_MEETINGS.length === 0 && <div style={{ padding:'20px 0', textAlign:'center', color:'var(--ink-400)', fontSize:13 }}>오늘 예정된 회의가 없어요.</div>}
        {TODAY_MEETINGS.map(m => {
          const isOngoing = m.status === 'ongoing';
          return (
            <div key={m.id} style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'12px 14px', borderRadius:10, background:isOngoing?'var(--accent-soft)':'#FAFAFA', border:`1px solid ${isOngoing?'#FCD89A':'var(--border)'}` }}>
              <div style={{ flexShrink:0, minWidth:70 }}>
                <div style={{ fontSize:12, fontWeight:700, color:isOngoing?'var(--accent-ink)':'var(--ink-700)', display:'flex', alignItems:'center', gap:4 }}>
                  {isOngoing && <span style={{ width:6, height:6, borderRadius:'50%', background:'#EF4444', animation:'pulse 1.5s infinite', flexShrink:0 }} />}
                  {minutesToLabel(m.start)}
                </div>
                <div style={{ fontSize:11, color:'var(--ink-400)' }}>–{minutesToLabel(m.end)}</div>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:13.5, fontWeight:700, color:'var(--ink-900)', marginBottom:6, lineHeight:1.3 }}>
                  {m.title}
                  {m.external && <span style={{ marginLeft:6, fontSize:10, fontWeight:700, color:'#92400E', background:'#FEF3C7', padding:'1px 5px', borderRadius:3 }}>외부 참석</span>}
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                  <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:11.5, fontWeight:700, padding:'2px 8px', borderRadius:4, background:m.roomBg, color:m.roomFg }}>
                    <span style={{ width:5, height:5, borderRadius:1, background:m.roomColor }} /> {m.roomName}
                  </span>
                  <span style={{ display:'inline-flex', alignItems:'center', gap:4, color:'var(--ink-500)', fontSize:11.5 }}>
                    <Icon.Users />
                    {m.attendees.slice(0,3).map(a => (
                      <span key={a.id} style={{ width:18, height:18, borderRadius:'50%', background:a.color, color:'#fff', fontSize:9, fontWeight:700, display:'inline-flex', alignItems:'center', justifyContent:'center', marginLeft:-4, border:'1.5px solid #fff' }}>{a.initial}</span>
                    ))}
                    {m.attendees.length > 3 && <span style={{ fontSize:11, color:'var(--ink-400)', marginLeft:2 }}>+{m.attendees.length-3}</span>}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── 회의실 현황 ───────────────────────────────────────────────────────────────
function RoomStatusCards() {
  const statusMeta = {
    available:{ label:'사용 가능', color:'#10B981', bg:'#D1FAE5', dot:'#10B981' },
    busy:     { label:'사용 중',   color:'#EF4444', bg:'#FEE2E2', dot:'#EF4444' },
    soon:     { label:'회의 예정', color:'#F5A623', bg:'#FFF4E0', dot:'#F5A623' },
  };
  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
      {ROOM_STATUS.map(room => {
        const meta = statusMeta[room.status];
        const roomColor = room.id==='A'?'var(--accent)':'#3B82F6';
        const roomBg = room.id==='A'?'var(--accent-soft)':'var(--blue-soft)';
        const roomFg = room.id==='A'?'var(--accent-ink)':'#1E40AF';
        return (
          <div key={room.id} style={{ background:'#FFF', borderRadius:12, border:'1px solid var(--border)', padding:'16px 16px 14px', display:'flex', flexDirection:'column', gap:12 }}>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8 }}>
              <div>
                <div style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:12, fontWeight:700, padding:'3px 9px', borderRadius:5, background:roomBg, color:roomFg, marginBottom:6 }}>
                  <span style={{ width:6, height:6, borderRadius:1.5, background:roomColor }} /> {room.name}
                </div>
                <div style={{ fontSize:11, color:'var(--ink-400)' }}>5F · {room.capacity}인실</div>
              </div>
              <span style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:11.5, fontWeight:700, padding:'4px 10px', borderRadius:6, background:meta.bg, color:meta.color, flexShrink:0, marginTop:2 }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:meta.dot, ...(room.status==='busy'?{animation:'pulse 1.5s infinite'}:{}) }} />
                {meta.label}
              </span>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {room.currentMeeting
                ? <div style={{ fontSize:12, color:'var(--ink-700)', lineHeight:1.4 }}><span style={{ color:'var(--ink-400)', marginRight:4 }}>진행 중</span><span style={{ fontWeight:600 }}>{room.currentMeeting.title}</span><span style={{ color:'var(--ink-400)', marginLeft:4 }}>~{minutesToLabel(room.currentMeeting.end)}</span></div>
                : <div style={{ fontSize:12, color:'var(--green)', fontWeight:600 }}>지금 바로 사용 가능</div>}
              {room.nextMeeting && (
                <div style={{ fontSize:11.5, color:'var(--ink-400)', display:'flex', alignItems:'center', gap:4 }}>
                  <Icon.Clock /> 다음 · {room.nextMeeting.title} {minutesToLabel(room.nextMeeting.start)}부터
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── 연차 현황 카드 ────────────────────────────────────────────────────────────
function LeaveQuotaCards() {
  const cards = [
    { label:'법정 연차', value:MY_LEAVE.legal,    sub:'26년 부여', color:'#3B82F6', bg:'#EFF6FF', fg:'#1D4ED8' },
    { label:'부여 연차', value:MY_LEAVE.allotted,  sub:'이월+부여', color:'#F5A623', bg:'#FFF4E0', fg:'#8A5A0F' },
    { label:'추가 연차', value:MY_LEAVE.extra,     sub:'특별연차',  color:'#8B5CF6', bg:'#F5F3FF', fg:'#5B21B6' },
    { label:'잔여',      value:MY_LEAVE.remaining, sub:'사용 가능', color:'#10B981', bg:'#ECFDF5', fg:'#065F46', highlight:true },
  ];
  const usedPct = Math.round((MY_LEAVE.used / (MY_LEAVE.allotted + MY_LEAVE.extra)) * 100);
  return (
    <div style={{ background:'#FFF', borderRadius:14, border:'1px solid var(--border)', overflow:'hidden' }}>
      <div style={{ padding:'16px 18px 14px', borderBottom:'1px solid var(--border)' }}>
        <div style={{ fontSize:10.5, fontWeight:700, letterSpacing:'.06em', textTransform:'uppercase', color:'var(--ink-400)', marginBottom:6 }}>내 연차 현황</div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ flex:1, height:6, borderRadius:4, background:'#F3F3F3', overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${usedPct}%`, background:'var(--accent)', borderRadius:4 }} />
          </div>
          <span style={{ fontSize:11.5, color:'var(--ink-500)', whiteSpace:'nowrap' }}>
            <span style={{ color:'var(--accent)', fontWeight:700 }}>{MY_LEAVE.used}일</span> 사용 ·&nbsp;
            <span style={{ color:'var(--green)', fontWeight:700 }}>{MY_LEAVE.remaining}일</span> 잔여
          </span>
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)' }}>
        {cards.map((c,i) => (
          <div key={c.label} style={{ padding:'14px 16px', borderRight:i<3?'1px solid var(--border)':'none', background:c.highlight?c.bg:'#FFF' }}>
            <div style={{ fontSize:10.5, fontWeight:700, color:c.highlight?c.fg:'var(--ink-400)', letterSpacing:'.04em', marginBottom:6, textTransform:'uppercase' }}>{c.label}</div>
            <div style={{ display:'flex', alignItems:'baseline', gap:3 }}>
              <span style={{ fontSize:28, fontWeight:800, color:c.highlight?c.fg:'var(--ink-900)', lineHeight:1 }}>{c.value}</span>
              <span style={{ fontSize:12, color:'var(--ink-400)', fontWeight:500 }}>일</span>
            </div>
            <div style={{ fontSize:11, color:c.highlight?c.fg:'var(--ink-400)', marginTop:4, opacity:c.highlight?0.8:1 }}>{c.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 다가오는 내 연차 ──────────────────────────────────────────────────────────
function UpcomingLeaves({ onLeaveApply }) {
  const typeColors = {
    '연차':    {bg:'#FFF4E0',fg:'#8A5A0F'},
    '오전반차':{bg:'#E8F0FE',fg:'#1E40AF'},
    '오후반차':{bg:'#EDE9FE',fg:'#5B21B6'},
    '반반차':  {bg:'#FCE7F3',fg:'#9D174D'},
  };
  return (
    <div style={{ background:'#FFF', borderRadius:14, border:'1px solid var(--border)', overflow:'hidden' }}>
      <div style={{ padding:'14px 18px 12px', borderBottom:'1px solid var(--border)' }}>
        <div style={{ fontSize:10.5, fontWeight:700, letterSpacing:'.06em', textTransform:'uppercase', color:'var(--ink-400)' }}>다가오는 내 연차</div>
      </div>
      <div style={{ padding:'10px 18px 14px', display:'flex', flexDirection:'column', gap:6 }}>
        <button onClick={onLeaveApply} style={{ height:32, borderRadius:7, border:'1px solid var(--border)', background:'#FAFAFA', color:'var(--ink-700)', fontSize:12, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}
          onMouseEnter={e=>e.currentTarget.style.background='#F3F3F3'}
          onMouseLeave={e=>e.currentTarget.style.background='#FAFAFA'}>
          <Icon.Plus /> 연차 신청
        </button>
        {UPCOMING_LEAVES.length === 0 && <div style={{ padding:'16px 0', textAlign:'center', color:'var(--ink-400)', fontSize:13 }}>예정된 연차가 없어요.</div>}
        {UPCOMING_LEAVES.map(lv => {
          const tc = typeColors[lv.type] || {bg:'#FFF4E0',fg:'#8A5A0F'};
          return (
            <div key={lv.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:8, background:'#FAFAFA', border:'1px solid var(--border)' }}>
              <div style={{ minWidth:42, textAlign:'center', padding:'4px 0', background:'var(--accent-soft)', borderRadius:6 }}>
                <div style={{ fontSize:9, fontWeight:700, color:'var(--accent-ink)', letterSpacing:'.04em' }}>D-</div>
                <div style={{ fontSize:15, fontWeight:800, color:'var(--accent-ink)', lineHeight:1 }}>{lv.dday}</div>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight:600, color:'var(--ink-900)', marginBottom:2 }}>{lv.dateLabel}</div>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <span style={{ fontSize:11, fontWeight:700, padding:'1px 6px', borderRadius:4, background:tc.bg, color:tc.fg }}>{lv.type}</span>
                  <span style={{ fontSize:11, color:'var(--ink-400)' }}>{lv.days}일 차감</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── 연차 소진 가이드 ──────────────────────────────────────────────────────────
function LeaveGuide() {
  const remaining = MY_LEAVE.remaining, monthsLeft = 7;
  const perMonth = (remaining / monthsLeft).toFixed(1);
  return (
    <div style={{ background:'#FFFFFF', borderRadius:14, border:'1px solid #ECECEC', padding:'18px 20px', display:'flex', alignItems:'center', gap:16 }}>
      <div style={{ flexShrink:0, width:52, height:52 }}>
        <svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="26" cy="34" rx="11" ry="10" fill="#F5A623" opacity=".2"/>
          <ellipse cx="26" cy="33" rx="9" ry="8" fill="#F5A623" opacity=".4"/>
          <ellipse cx="21" cy="16" rx="3.5" ry="7" fill="#F5A623" opacity=".8" transform="rotate(-10 21 16)"/>
          <ellipse cx="31" cy="15" rx="3.5" ry="7" fill="#F5A623" opacity=".8" transform="rotate(10 31 15)"/>
          <ellipse cx="21" cy="16" rx="2" ry="5" fill="#FFE9C2" transform="rotate(-10 21 16)"/>
          <ellipse cx="31" cy="15" rx="2" ry="5" fill="#FFE9C2" transform="rotate(10 31 15)"/>
          <circle cx="26" cy="25" r="9" fill="#F5A623" opacity=".9"/>
          <circle cx="23" cy="24" r="1.2" fill="#8A5A0F"/>
          <circle cx="29" cy="24" r="1.2" fill="#8A5A0F"/>
          <ellipse cx="26" cy="27" rx="1" ry=".7" fill="#C47020"/>
          <rect x="36" y="10" width="2" height="14" rx="1" fill="#8A5A0F" opacity=".6"/>
          <path d="M38 10 L46 13.5 L38 17 Z" fill="#EF4444" opacity=".85"/>
          <ellipse cx="18" cy="39" rx="4" ry="2.5" fill="#F5A623" opacity=".7" transform="rotate(-30 18 39)"/>
          <ellipse cx="35" cy="40" rx="4" ry="2.5" fill="#F5A623" opacity=".7" transform="rotate(20 35 40)"/>
        </svg>
      </div>
      <div>
        <div style={{ fontSize:13.5, fontWeight:700, color:'var(--accent-ink)', marginBottom:4, lineHeight:1.4 }}>
          올해 연차를 다 쓰려면<br/>
          <span style={{ fontSize:17, fontWeight:800 }}>매달 {perMonth}일</span>씩 쉬어야 해요
        </div>
        <div style={{ fontSize:11.5, color:'#A0680E', lineHeight:1.5 }}>잔여 {remaining}일 · 남은 기간 {monthsLeft}개월</div>
      </div>
    </div>
  );
}

// ─── 오늘 팀원 부재 ────────────────────────────────────────────────────────────
function TeamAbsent() {
  if (TODAY_ABSENT.length === 0) {
    return (
      <div style={{ background:'#FFF', borderRadius:14, border:'1px solid var(--border)', padding:'16px 18px' }}>
        <div style={{ fontSize:10.5, fontWeight:700, letterSpacing:'.06em', textTransform:'uppercase', color:'var(--ink-400)', marginBottom:12 }}>오늘 팀원 부재</div>
        <div style={{ textAlign:'center', padding:'16px 0', color:'var(--ink-400)', fontSize:13 }}>오늘 자리를 비운 팀원이 없어요 🎉</div>
      </div>
    );
  }
  return (
    <div style={{ background:'#FFF', borderRadius:14, border:'1px solid var(--border)', overflow:'hidden' }}>
      <div style={{ padding:'14px 18px 12px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ fontSize:10.5, fontWeight:700, letterSpacing:'.06em', textTransform:'uppercase', color:'var(--ink-400)' }}>오늘 팀원 부재</div>
        <span style={{ fontSize:11.5, color:'var(--ink-400)', fontWeight:600 }}>{TODAY_ABSENT.length}명</span>
      </div>
      <div style={{ padding:'10px 18px 14px', display:'flex', flexDirection:'column', gap:6 }}>
        {TODAY_ABSENT.map((ab,i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:i<TODAY_ABSENT.length-1?'1px solid var(--border)':'none' }}>
            <span style={{ width:30, height:30, borderRadius:'50%', background:ab.person.color, color:'#fff', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, flexShrink:0 }}>{ab.person.initial}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:600, color:'var(--ink-900)' }}>{ab.person.name}</div>
              <div style={{ fontSize:11, color:'var(--ink-400)' }}>{ab.person.team}</div>
            </div>
            <span style={{ fontSize:11.5, fontWeight:700, padding:'3px 8px', borderRadius:5, background:ab.typeBg, color:ab.typeFg }}>{ab.type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Dashboard Root ────────────────────────────────────────────────────────────
function Dashboard() {
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  return (
    <div style={{ flex:1, overflowY:'auto', padding:'24px 28px', display:'flex', flexDirection:'column', gap:20 }}>
      {/* 인사말 */}
      <div>
        <div style={{ fontSize:22, fontWeight:800, color:'var(--ink-900)', lineHeight:1.2 }}>
          안녕하세요, {_ME.name}님
        </div>
      </div>

      {/* 2컬럼 */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, alignItems:'start' }}>
        {/* 왼쪽: 회의실 */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <TodayMeetings />
          <div style={{ background:'#FFF', borderRadius:14, border:'1px solid var(--border)', overflow:'hidden' }}>
            <div style={{ padding:'14px 18px 12px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ fontSize:10.5, fontWeight:700, letterSpacing:'.06em', textTransform:'uppercase', color:'var(--ink-400)' }}>회의실 현황</div>
              <span style={{ fontSize:11, color:'var(--ink-400)', display:'flex', alignItems:'center', gap:4 }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:'#10B981' }} /> 실시간
              </span>
            </div>
            <div style={{ padding:'14px 18px' }}>
              <RoomStatusCards />
            </div>
          </div>
        </div>

        {/* 오른쪽: 연차 */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <LeaveGuide />
          <LeaveQuotaCards />
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <UpcomingLeaves onLeaveApply={() => setShowLeaveModal(true)} />
            <TeamAbsent />
          </div>
        </div>
      </div>

      {showLeaveModal && <DashLeaveModal onClose={() => setShowLeaveModal(false)} />}
    </div>
  );
}

window.Dashboard = Dashboard;
