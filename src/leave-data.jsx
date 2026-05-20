// ─── leave-data.jsx ───────────────────────────────────────────────────────────
// 연차 탭 전용 데이터 및 상수
// common.jsx 다음에 로드해야 함.

const { TODAY, DOW_KO, ME, isoDay, addDays } = window.CommonHelpers;

const PEOPLE_LEAVE = [
  { id:'u1', name:'전윤하', team:'사업기획실',       initial:'전', color:'#F5A623' },
  { id:'u2', name:'김민준', team:'프로덕트디자인팀', initial:'김', color:'#3B82F6' },
  { id:'u3', name:'이서연', team:'사업기획실',       initial:'이', color:'#10B981' },
  { id:'u4', name:'박지호', team:'개발실',           initial:'박', color:'#8B5CF6' },
  { id:'u5', name:'최유진', team:'프로덕트디자인팀', initial:'최', color:'#EC4899' },
  { id:'u6', name:'한도윤', team:'개발실',           initial:'한', color:'#F97316' },
  { id:'u7', name:'정하린', team:'경영지원실',       initial:'정', color:'#06B6D4' },
];

const LEAVE_TYPES = [
  { id:'annual',  label:'연차',    days:1,    color:'#F5A623', bg:'#FFF4E0', fg:'#8A5A0F' },
  { id:'am_half', label:'오전반차',days:0.5,  color:'#3B82F6', bg:'#E8F0FE', fg:'#1E40AF' },
  { id:'pm_half', label:'오후반차',days:0.5,  color:'#8B5CF6', bg:'#EDE9FE', fg:'#5B21B6' },
  { id:'quarter', label:'반반차',  days:0.25, color:'#EC4899', bg:'#FCE7F3', fg:'#9D174D', restricted:true },
];

// 병가·경조사·공가 → 첨부파일 필요
const ATTACH_REASONS = ['ceremony','sick','public'];

const LEAVE_REASONS = [
  { id:'personal', label:'개인사유', icon:'User',  disabled:false },
  { id:'ceremony', label:'경조사',   icon:'Heart', disabled:false },
  { id:'birthday', label:'생일',     icon:'Smile', disabled:false },
  { id:'childcare',label:'자녀돌봄', icon:'Baby',  disabled:false },
  { id:'sick',     label:'병가',     icon:'Zap',   disabled:false },
  { id:'public',   label:'공가',     icon:'User',  disabled:false },
  { id:'promote',  label:'연차촉진', icon:'Zap',   disabled:false },
];

const ICON_MAP = {
  User:  window.CommonUI.Icon.User,
  Heart: window.CommonUI.Icon.Heart,
  Smile: window.CommonUI.Icon.Smile,
  Baby:  window.CommonUI.Icon.Baby,
  Zap:   window.CommonUI.Icon.Zap,
};

const QUOTA = { legal:15, carryover:3, extra:1 };

function calcStats(leaves) {
  const allotted = QUOTA.carryover + QUOTA.legal;
  const extra = QUOTA.extra;
  const myLeaves = leaves.filter(l => l.userId === 'u1');
  const used = myLeaves.reduce((s, l) => s + l.days, 0);
  const remaining = allotted + extra - used;
  return { legal:QUOTA.legal, allotted, extra, used, remaining };
}

function getDefaultTime(typeId, dateObj) {
  const isFri = dateObj ? dateObj.getDay() === 5 : false;
  switch(typeId) {
    case 'annual':  return { start:'09:00', end:'18:00', allDay:true };
    case 'am_half': return isFri ? { start:'13:30', end:'17:30', allDay:false } : { start:'14:00', end:'18:00', allDay:false };
    case 'pm_half': return { start:'09:00', end:'13:00', allDay:false };
    case 'quarter': return { start:'09:00', end:'11:00', allDay:false };
    default:        return { start:'09:00', end:'18:00', allDay:true };
  }
}

function makeTimeOptions() {
  const opts = [];
  for (let h = 8; h <= 19; h++) for (let m = 0; m < 60; m += 30) opts.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`);
  opts.push('20:00');
  return opts;
}
const TIME_OPTIONS = makeTimeOptions();

// 헬퍼
const lt = id => LEAVE_TYPES.find(t => t.id === id) || LEAVE_TYPES[0];
const lr = id => LEAVE_REASONS.find(r => r.id === id) || { label: id };
const personLeave = id => PEOPLE_LEAVE.find(p => p.id === id) || { name:'알 수 없음', initial:'?', color:'#9CA3AF', team:'' };

const SEED_LEAVES = [
  { id:'l1',  userId:'u1', date:'2026-01-08', type:'annual',  days:1,   reason:'personal', memo:'', status:'confirmed' },
  { id:'l2',  userId:'u1', date:'2026-02-14', type:'am_half', days:0.5, reason:'personal', memo:'병원', status:'confirmed' },
  { id:'l3',  userId:'u1', date:'2026-03-03', type:'annual',  days:1,   reason:'ceremony', memo:'', status:'confirmed' },
  { id:'l4',  userId:'u1', date:'2026-03-20', type:'pm_half', days:0.5, reason:'personal', memo:'', status:'confirmed' },
  { id:'l5',  userId:'u1', date:'2026-04-10', type:'annual',  days:1,   reason:'personal', memo:'', status:'confirmed' },
  { id:'l6',  userId:'u1', date:'2026-04-22', type:'am_half', days:0.5, reason:'personal', memo:'', status:'confirmed' },
  { id:'l7',  userId:'u1', date:'2026-05-06', type:'annual',  days:1,   reason:'promote',  memo:'', status:'confirmed' },
  { id:'l8',  userId:'u1', date:'2026-05-20', type:'annual',  days:1,   reason:'personal', memo:'', status:'unconfirmed' },
  { id:'l9',  userId:'u1', date:'2026-05-28', type:'am_half', days:0.5, reason:'personal', memo:'', status:'unconfirmed' },
  { id:'l10', userId:'u2', date:'2026-05-07', type:'annual',  days:1,   reason:'personal', memo:'', status:'confirmed' },
  { id:'l11', userId:'u2', date:'2026-05-13', type:'am_half', days:0.5, reason:'ceremony', memo:'', status:'confirmed' },
  { id:'l12', userId:'u3', date:'2026-05-14', type:'pm_half', days:0.5, reason:'personal', memo:'', status:'unconfirmed' },
  { id:'l13', userId:'u4', date:'2026-05-08', type:'annual',  days:1,   reason:'personal', memo:'', status:'confirmed' },
  { id:'l14', userId:'u5', date:'2026-05-19', type:'annual',  days:1,   reason:'personal', memo:'', status:'unconfirmed' },
  { id:'l15', userId:'u6', date:'2026-05-21', type:'am_half', days:0.5, reason:'promote',  memo:'', status:'unconfirmed' },
  { id:'l16', userId:'u7', date:'2026-05-15', type:'annual',  days:1,   reason:'ceremony', memo:'', status:'confirmed' },
];

window.LeaveData = {
  PEOPLE_LEAVE, LEAVE_TYPES, ATTACH_REASONS, LEAVE_REASONS, ICON_MAP,
  QUOTA, SEED_LEAVES, TIME_OPTIONS,
  calcStats, getDefaultTime, lt, lr, personLeave,
};
