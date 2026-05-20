// Dummy data + helpers

const TODAY = new Date(2026, 4, 14); // 2026-05-14 (Thursday)
const WEEK_START_OFFSET = 1; // Monday-start week

function startOfWeek(d) {
  const date = new Date(d);
  const day = date.getDay(); // 0..6 Sun..Sat
  const diff = (day === 0 ? -6 : 1 - day); // back to Monday
  date.setDate(date.getDate() + diff);
  date.setHours(0,0,0,0);
  return date;
}
function addDays(d, n) {
  const x = new Date(d); x.setDate(x.getDate() + n); return x;
}
function fmtKDate(d) {
  return `${d.getFullYear()}년 ${d.getMonth()+1}월 ${d.getDate()}일`;
}
function fmtMD(d) { return `${d.getMonth()+1}.${String(d.getDate()).padStart(2,'0')}`; }
function sameDay(a, b) {
  return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
}
function isoDay(d) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function weekOfMonth(d) {
  // 해당 월의 첫 월요일을 1주차로 사용 (5월 첫 월요일 = 5/4 → 1주차, 5/11 → 2주차)
  const target = startOfWeek(d);
  // 타겟 주의 월요일이 속한 월을 기준으로 계산 (주 중간이 해당 월에 걸치는 케이스 보정)
  const refMonth = target.getMonth() === d.getMonth() ? target : d;
  const firstOfMonth = new Date(refMonth.getFullYear(), refMonth.getMonth(), 1);
  // 그 달의 첫 월요일
  const firstMonday = new Date(firstOfMonth);
  const dow = firstOfMonth.getDay(); // 0=Sun
  const addDays = dow === 0 ? 1 : (dow === 1 ? 0 : 8 - dow);
  firstMonday.setDate(firstOfMonth.getDate() + addDays);
  firstMonday.setHours(0,0,0,0);
  const diff = Math.round((target - firstMonday) / (7*24*3600*1000));
  return Math.max(1, diff + 1);
}
const KWEEK = ['첫째주','둘째주','셋째주','넷째주','다섯째주','여섯째주'];
const DAYS_KO = ['월','화','수','목','금','토','일'];

// Time grid: 09:00 — 19:00 (10h), 30-min steps => 20 rows
const DAY_START_MIN = 9 * 60;
const DAY_END_MIN = 19 * 60;
const SLOT_MIN = 30;
const SLOTS = (DAY_END_MIN - DAY_START_MIN) / SLOT_MIN; // 20
const SLOT_H = 28; // px per 30 min row in weekly view

function minutesToLabel(m) {
  const h = Math.floor(m/60), mm = m%60;
  return `${String(h).padStart(2,'0')}:${String(mm).padStart(2,'0')}`;
}
function timeRangeLabel(s, e) {
  return `${minutesToLabel(s)} – ${minutesToLabel(e)}`;
}
function ampmLabel(s, e) {
  const fmt = (m) => {
    const h = Math.floor(m/60), mm = m%60;
    const ampm = h < 12 ? '오전' : '오후';
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${ampm} ${h12}:${String(mm).padStart(2,'0')}`;
  };
  return `${fmt(s)} – ${fmt(e)}`;
}

// People
// status: undefined | '병가' | '공가' | '연차' | '반차(오전)' | '반차(오후)' | '반반차'
const PEOPLE = [
  { id:'u1', name:'전윤하', team:'사업기획실', email:'younha@company.com', phone:'010-1234-5678', initial:'전', color:'#F5A623', me:true },
  { id:'u2', name:'김민준', team:'프로덕트디자인팀', email:'minjun@company.com', initial:'김', color:'#3B82F6' },
  { id:'u3', name:'이서연', team:'사업기획실', email:'seoyeon@company.com', initial:'이', color:'#10B981', status:'반차(오후)' },
  { id:'u4', name:'박지호', team:'개발실', email:'jiho@company.com', initial:'박', color:'#8B5CF6', status:'연차' },
  { id:'u5', name:'최유진', team:'프로덕트디자인팀', email:'yujin@company.com', initial:'최', color:'#EC4899' },
  { id:'u6', name:'한도윤', team:'개발실', email:'doyun@company.com', initial:'한', color:'#F97316', status:'반반차' },
  { id:'u7', name:'정하린', team:'경영지원실', email:'harin@company.com', initial:'정', color:'#06B6D4' },
  { id:'u8', name:'조태경', team:'사업기획실', email:'taekyung@company.com', initial:'조', color:'#6366F1' },
  { id:'u9', name:'윤서아', team:'개발실', email:'seoa@company.com', initial:'윤', color:'#EF4444', status:'병가' },
  { id:'u10', name:'장민서', team:'프로덕트디자인팀', email:'minseo@company.com', initial:'장', color:'#22C55E' },
];

// Status color tokens
const STATUS_COLORS = {
  '병가':       { bg:'#FEE2E2', fg:'#991B1B' },
  '공가':       { bg:'#E0F2FE', fg:'#075985' },
  '연차':       { bg:'#FEF3C7', fg:'#92400E' },
  '반차(오전)': { bg:'#FEF3C7', fg:'#92400E' },
  '반차(오후)': { bg:'#FEF3C7', fg:'#92400E' },
  '반반차':     { bg:'#FEF3C7', fg:'#92400E' },
};

const ROOMS = [
  { id:'A', name:'A 회의실', capacity:8, floor:'4F 출입구 앞', amenities:['모니터'] },
  { id:'B', name:'B 회의실', capacity:10, floor:'4F 대표실 옆', amenities:['화이트보드'] },
];

// Predefined favorite groups for booking modal
const FAVORITE_GROUPS = [
  { id:'g1', name:'사업기획실 정기',    memberIds:['u3','u8','u7'] },
  { id:'g2', name:'프로덕트 디자인 리뷰', memberIds:['u2','u5','u10'] },
  { id:'g3', name:'개발실 코어',         memberIds:['u4','u6','u9'] },
];

// Default favorited individuals (seed)
const DEFAULT_FAVORITE_IDS = ['u3','u2'];

// Reservations — keyed by ISO day, list of items
// `start`/`end` are minutes from midnight; `room` = 'A' or 'B'
function makeSeed() {
  const ws = startOfWeek(TODAY); // Monday this week
  const d = (n) => isoDay(addDays(ws, n));
  return [
    // Monday
    { id:'r1', day:d(0), room:'A', start: 9*60+30, end: 10*60+30,
      title:'주간 OKR 점검', organizerId:'u3', attendees:['u1','u3','u8'], category:'정기',
      desc:'사업기획실 주간 OKR 진척도 점검' },
    { id:'r2', day:d(0), room:'B', start: 11*60, end: 12*60,
      title:'온보딩 1:1', organizerId:'u5', attendees:['u5','u10'], category:'1:1' },

    // Tuesday
    { id:'r3', day:d(1), room:'A', start: 13*60, end: 14*60+30,
      title:'파트너사 미팅', organizerId:'u8', attendees:['u8','u1','u3'], category:'외부', external:true,
      desc:'B사 PoC 킥오프, 외부 참석자 2인' },
    { id:'r4', day:d(1), room:'B', start: 15*60, end: 16*60,
      title:'스프린트 회고', organizerId:'u4', attendees:['u4','u6','u9'], category:'정기' },

    // Wednesday
    { id:'r5', day:d(2), room:'A', start: 10*60, end: 11*60,
      title:'경영지원실 정기 보고', organizerId:'u7', attendees:['u7','u8'], category:'정기' },
    { id:'r6', day:d(2), room:'B', start: 14*60, end: 15*60+30,
      title:'디자인 시스템 워크샵', organizerId:'u5', attendees:['u5','u2','u10'], category:'워크샵' },

    // Thursday (today)
    { id:'r7', day:d(3), room:'A', start: 10*60, end: 11*60,
      title:'사업기획실 주간 보고', organizerId:'u1', attendees:['u1','u3','u8','u7'], category:'정기', me:true,
      desc:'금주 진척도 공유 및 다음 주 우선순위' },
    { id:'r8', day:d(3), room:'B', start: 14*60, end: 15*60+30,
      title:'디자인 리뷰', organizerId:'u2', attendees:['u2','u5'], category:'리뷰',
      desc:'5월 2주차 디자인 산출물 리뷰' },
    { id:'r9', day:d(3), room:'A', start: 16*60, end: 17*60,
      title:'채용 인터뷰 — 프로덕트 PM', organizerId:'u8', attendees:['u8','u1'], category:'채용', external:true },

    // Friday
    { id:'r10', day:d(4), room:'A', start: 9*60, end: 10*60,
      title:'전사 위클리', organizerId:'u7', attendees:['u1','u3','u4','u5','u7','u8'], category:'전사' },
    { id:'r11', day:d(4), room:'B', start: 11*60, end: 12*60,
      title:'기획-디자인 싱크', organizerId:'u1', attendees:['u1','u2','u5'], category:'1:1', me:true },
    { id:'r12', day:d(4), room:'A', start: 15*60+30, end: 17*60,
      title:'PoC 기술 검토', organizerId:'u4', attendees:['u4','u6','u9'], category:'리뷰' },
  ];
}

window.AppData = {
  TODAY, PEOPLE, ROOMS, STATUS_COLORS, FAVORITE_GROUPS, DEFAULT_FAVORITE_IDS,
  startOfWeek, addDays, fmtKDate, fmtMD, sameDay, isoDay, weekOfMonth,
  KWEEK, DAYS_KO,
  DAY_START_MIN, DAY_END_MIN, SLOT_MIN, SLOTS, SLOT_H,
  minutesToLabel, timeRangeLabel, ampmLabel,
  makeSeed,
};
