// ─── common.jsx ───────────────────────────────────────────────────────────────
// 공통: Icon, 헬퍼 함수, Sidebar, Header
// 모든 탭이 공유. index.html에서 가장 먼저 로드해야 함.

const { useState, useEffect, useMemo, useRef, useCallback } = React;

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icon = {
  Grid:        (p)=>(<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3.5" y="3.5" width="7" height="7" rx="1.2"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.2"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.2"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.2"/></svg>),
  Door:        (p)=>(<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 21V4a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v17"/><path d="M3 21h16"/><circle cx="13" cy="12.5" r="0.6" fill="currentColor" stroke="none"/></svg>),
  People:      (p)=>(<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="9" cy="8" r="3.2"/><path d="M2.8 19.5c.6-3.2 3.2-5 6.2-5s5.6 1.8 6.2 5"/><circle cx="17" cy="9" r="2.4"/><path d="M16 14.6c2.4 0 4.3 1.3 4.9 4"/></svg>),
  Gear:        (p)=>(<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8L4.2 7a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1A2 2 0 1 1 19.7 7l-.1.1a1.7 1.7 0 0 0-.3 1.8V9c.3.5.8.9 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></svg>),
  Logout:      (p)=>(<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>),
  Bell:        (p)=>(<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 8a6 6 0 1 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9Z"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>),
  ChevronDown: (p)=>(<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="6 9 12 15 18 9"/></svg>),
  ChevronLeft: (p)=>(<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="15 18 9 12 15 6"/></svg>),
  ChevronRight:(p)=>(<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="9 18 15 12 9 6"/></svg>),
  Plus:        (p)=>(<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>),
  X:           (p)=>(<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>),
  Check:       (p)=>(<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="20 6 9 17 4 12"/></svg>),
  Clock:       (p)=>(<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/></svg>),
  Search:      (p)=>(<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="11" cy="11" r="7"/><line x1="20" y1="20" x2="16.5" y2="16.5"/></svg>),
  Calendar:    (p)=>(<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="4.5" width="18" height="16" rx="2"/><line x1="3" y1="9.5" x2="21" y2="9.5"/><line x1="8" y1="2.5" x2="8" y2="6"/><line x1="16" y1="2.5" x2="16" y2="6"/></svg>),
  Users:       (p)=>(<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>),
  MapPin:      (p)=>(<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>),
  Lock:        (p)=>(<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>),
  Info:        (p)=>(<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="9"/><line x1="12" y1="11" x2="12" y2="17"/><circle cx="12" cy="7.6" r="0.6" fill="currentColor" stroke="none"/></svg>),
  Alert:       (p)=>(<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/><line x1="12" y1="9" x2="12" y2="13"/><circle cx="12" cy="16.5" r="0.6" fill="currentColor" stroke="none"/></svg>),
  Video:       (p)=>(<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>),
  Repeat:      (p)=>(<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>),
  Edit:        (p)=>(<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/></svg>),
  Trash:       (p)=>(<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>),
  Coffee:      (p)=>(<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M17 8h1a4 4 0 0 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>),
  Bolt:        (p)=>(<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none" {...p}><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"/></svg>),
  Star:        (p)=>(<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><polygon points="12 2.5 14.85 8.5 21.5 9.4 16.7 13.95 17.95 20.5 12 17.35 6.05 20.5 7.3 13.95 2.5 9.4 9.15 8.5"/></svg>),
  MoreH:       (p)=>(<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg>),
  Paperclip:   (p)=>(<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>),
  User:        (p)=>(<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>),
  Heart:       (p)=>(<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>),
  Smile:       (p)=>(<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>),
  Baby:        (p)=>(<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="7" r="4"/><path d="M12 2v2"/><path d="M8 14s1 3 4 3 4-3 4-3"/><path d="M5 21v-1a7 7 0 0 1 14 0v1"/></svg>),
  Zap:         (p)=>(<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>),
  StarFilled:  (p)=>(<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><polygon points="12 2.5 14.85 8.5 21.5 9.4 16.7 13.95 17.95 20.5 12 17.35 6.05 20.5 7.3 13.95 2.5 9.4 9.15 8.5"/></svg>),
  Folder:      (p)=>(<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 7.5a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/></svg>),
};

// ─── 공통 헬퍼 함수 ───────────────────────────────────────────────────────────
const TODAY = new Date(2026, 4, 14);
const DOW_KO  = ['일','월','화','수','목','금','토'];
const DAYS_KO = ['월','화','수','목','금'];

function isoDay(d){ return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function addDays(d,n){ const x=new Date(d); x.setDate(x.getDate()+n); return x; }
function startOfWeek(d){ const date=new Date(d); const day=date.getDay(); const diff=day===0?-6:1-day; date.setDate(date.getDate()+diff); date.setHours(0,0,0,0); return date; }
function sameDay(a,b){ return a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate(); }
function fmtKDate(d){ return `${d.getFullYear()}년 ${d.getMonth()+1}월 ${d.getDate()}일`; }
function diffDays(a,b){ return Math.round((new Date(a)-new Date(b))/(1000*60*60*24)); }
function dDay(dateStr){ const d=diffDays(dateStr,isoDay(TODAY)); if(d===0)return'D-Day'; if(d>0)return`D-${d}`; return`D+${Math.abs(d)}`; }
function minutesToLabel(m){ const h=Math.floor(m/60),mm=m%60; return `${String(h).padStart(2,'0')}:${String(mm).padStart(2,'0')}`; }
function timeRangeLabel(s,e){ return `${minutesToLabel(s)} – ${minutesToLabel(e)}`; }

// ─── 공통 ME 데이터 ───────────────────────────────────────────────────────────
const ME = { id:'u1', name:'전윤하', team:'사업기획실', email:'younha@company.com', initial:'전', color:'#F5A623', quarterEligible:false };

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ active, onChange }) {
  const items = [
    { id:'home',     icon:Icon.Grid,   label:'대시보드' },
    { id:'rooms',    icon:Icon.Door,   label:'회의실' },
    { id:'people',   icon:Icon.People, label:'연차' },
    { id:'settings', icon:Icon.Gear,   label:'설정' },
  ];
  return (
    <nav style={{ width:64, flexShrink:0, background:'#FFF', borderRight:'1px solid var(--border)',
      display:'flex', flexDirection:'column', alignItems:'center', padding:'18px 0 16px' }}>
      <div style={{ width:44, marginBottom:14, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <svg width="36" height="20" viewBox="0 0 88 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M31.361 2.3313C29.2506 2.3313 27.5281 4.02959 27.5281 6.14474C27.5281 8.25989 29.2351 9.94275 31.361 9.94275C33.4869 9.94275 35.1938 8.24445 35.1938 6.14474C35.1938 4.04503 33.4869 2.3313 31.361 2.3313Z" fill="#F38900"/>
          <path d="M24.4867 25.1811C24.4867 18.4805 18.9935 13.0151 12.2433 13.0151C5.49321 13.0151 0 18.4651 0 25.1811C0 31.8971 5.49321 37.3625 12.2433 37.3625C15.0055 37.3625 17.5503 36.4516 19.5987 34.9077C20.7159 36.3898 22.4849 37.3471 24.4867 37.3471V25.1811ZM12.2433 31.2795C8.87604 31.2795 6.12943 28.5468 6.12943 25.1965C6.12943 21.8463 8.87604 19.1135 12.2433 19.1135C15.6107 19.1135 18.3573 21.8463 18.3573 25.1965C18.3573 28.5468 15.6107 31.2795 12.2433 31.2795Z" fill="#F38900"/>
          <path d="M34.4179 12.9842H28.304V37.3471H34.4179V12.9842Z" fill="#F38900"/>
          <path d="M44.3647 2.3313H38.2508V37.3471H44.3647V2.3313Z" fill="#F38900"/>
          <path d="M54.3114 12.9842H48.1975V32.7771C48.1975 36.1428 50.9441 38.8601 54.3114 38.8601V12.9842Z" fill="#F38900"/>
          <path d="M58.1442 48C61.5271 48 64.2582 45.2673 64.2582 41.917V12.9842H58.1442V48Z" fill="#F38900"/>
          <path d="M74.9653 12.9842C70.7445 12.9842 67.3151 16.3963 67.3151 20.5957C67.3151 24.7951 70.7445 28.2071 74.9653 28.2071H80.3343C81.1568 28.2071 81.8706 28.9019 81.8706 29.7356C81.8706 30.5693 81.1723 31.2641 80.3343 31.2641H73.4445C70.0617 31.2641 67.3306 33.9968 67.3306 37.3471H80.3498C84.5706 37.3471 88 33.935 88 29.7356C88 25.5362 84.5706 22.1242 80.3498 22.1242H74.9808C74.1584 22.1242 73.4445 21.4294 73.4445 20.5957C73.4445 19.762 74.1428 19.0672 74.9808 19.0672H81.1102C84.493 19.0672 87.2241 16.3345 87.2241 12.9842H74.9653Z" fill="#F38900"/>
          <path d="M75.4929 8.22901V2.34674H76.7653V8.22901H75.4929ZM67.9358 8.21357V3.58186H66.6789V8.21357H65.4065V3.73625C65.4065 3.36571 65.5461 3.01061 65.8254 2.74815C66.1047 2.48569 66.4461 2.3313 66.8186 2.3313H67.7806C68.5565 2.3313 69.1927 2.9643 69.1927 3.73625V8.21357H67.9358ZM79.7912 8.21357C78.7981 8.21357 77.9912 7.41074 77.9912 6.42264V4.10679C77.9912 3.11869 78.7981 2.3313 79.7912 2.3313H81.1412C82.1344 2.3313 82.9413 3.13413 82.9413 4.12223C82.9413 5.11032 82.1344 5.91316 81.1412 5.91316H79.2481V6.43808C79.2481 6.71599 79.4964 6.96301 79.7757 6.96301H82.9258C82.8637 7.64233 82.3051 8.1827 81.6068 8.21357H79.7912ZM79.7912 3.5973C79.5119 3.5973 79.2636 3.84432 79.2636 4.12223V4.64715H81.1568C81.4361 4.64715 81.6844 4.40013 81.6844 4.12223C81.6844 3.84432 81.4361 3.5973 81.1568 3.5973H79.7912ZM61.2167 8.21357C59.5874 8.21357 58.2684 6.90125 58.2684 5.28015C58.2684 3.65905 59.5874 2.34674 61.2167 2.34674C62.8461 2.34674 64.165 3.65905 64.165 5.28015C64.165 6.90125 62.8461 8.21357 61.2167 8.21357ZM61.2167 3.5973C60.2857 3.5973 59.5253 4.35381 59.5253 5.28015C59.5253 6.2065 60.2857 6.96301 61.2167 6.96301C62.1478 6.96301 62.9081 6.2065 62.9081 5.28015C62.9081 4.35381 62.1478 3.5973 61.2167 3.5973ZM72.979 8.21357C72.2652 8.13638 71.7221 7.54969 71.7221 6.82406V3.5973H70.4652C70.5428 2.8871 71.1324 2.34674 71.8618 2.34674H72.1566C72.1566 2.34674 72.1721 2.34674 72.1876 2.34674C72.1876 2.34674 72.1876 2.34674 72.2031 2.34674H74.2204C74.1583 2.94886 73.6928 3.45835 73.0876 3.58186H72.979V8.22901V8.21357ZM54.2028 4.12223C54.2028 3.13413 55.0097 2.34674 56.0028 2.34674H57.9891C57.9115 3.05693 57.3218 3.5973 56.5925 3.5973H56.0183C55.739 3.5973 55.4907 3.84432 55.4907 4.12223V6.80862C55.4907 7.53426 54.9321 8.13638 54.2183 8.19813V4.10679L54.2028 4.12223ZM84.1982 4.12223C84.1982 3.13413 85.0051 2.34674 85.9982 2.34674H87.9845C87.9069 3.05693 87.3172 3.5973 86.5879 3.5973H86.0138C85.7344 3.5973 85.4862 3.84432 85.4862 4.12223V6.80862C85.4862 7.53426 84.9275 8.13638 84.2137 8.19813V4.10679L84.1982 4.12223ZM48.1975 4.12223C48.1975 3.13413 49.0044 2.34674 49.9975 2.34674H52.9459C52.8683 3.05693 52.2786 3.5973 51.5493 3.5973H49.9975C49.7182 3.5973 49.4699 3.84432 49.4699 4.12223V4.70891L49.6406 4.67803C49.7493 4.66259 49.8579 4.64715 49.9665 4.64715H52.7597C52.6821 5.35735 52.0924 5.89772 51.3631 5.89772H49.4699V6.80862C49.4699 7.53426 48.9113 8.13638 48.213 8.19813V4.10679L48.1975 4.12223ZM76.1136 0C75.6635 0 75.2911 0.370537 75.2911 0.818269C75.2911 1.266 75.6635 1.63654 76.1136 1.63654C76.5636 1.63654 76.936 1.266 76.936 0.818269C76.936 0.370537 76.5636 0 76.1136 0Z" fill="#F38900"/>
        </svg>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:4, width:'100%', alignItems:'center', flex:1 }}>
        {items.map(it => {
          const I = it.icon; const isActive = active === it.id;
          return (
            <button key={it.id} onClick={() => onChange(it.id)} title={it.label} style={{
              width:44, height:44, borderRadius:10, border:'none',
              background: isActive ? 'var(--accent-soft)' : 'transparent',
              color: isActive ? 'var(--accent-ink)' : 'var(--ink-500)',
              display:'inline-flex', alignItems:'center', justifyContent:'center',
              cursor:'pointer', position:'relative', transition:'background .12s',
            }}>
              <I />
              {isActive && <span style={{ position:'absolute', left:-12, top:'50%', transform:'translateY(-50%)', width:3, height:22, borderRadius:3, background:'var(--accent)' }} />}
            </button>
          );
        })}
      </div>
      <button title="로그아웃" style={{ width:44, height:44, borderRadius:10, border:'none',
        background:'transparent', color:'var(--ink-400)', display:'inline-flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
        <Icon.Logout />
      </button>
    </nav>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────
// nextMeeting: 회의실 탭에서 전달 (진행중/예정 회의). 없으면 배너 숨김.
function Header({ nextMeeting, onCheckIn, onCancelMeeting }) {
  const D = window.AppData;
  const minutesUntil = nextMeeting ? (nextMeeting.start - (10*60+5)) : null;
  const isOngoing = minutesUntil !== null && minutesUntil <= 0;
  return (
    <header style={{ height:64, flexShrink:0, background:'#FFF', borderBottom:'1px solid var(--border)',
      display:'flex', alignItems:'center', padding:'0 24px', gap:16 }}>
      {/* 날짜 */}
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <span style={{ fontSize:13, fontWeight:600, color:'var(--ink-700)' }}>{fmtKDate(TODAY)}</span>
        <span style={{ fontSize:11, color:'var(--ink-400)', background:'#F3F3F3', padding:'3px 8px', borderRadius:4, fontWeight:600 }}>
          {DOW_KO[TODAY.getDay()]}요일
        </span>
      </div>

      {/* 진행중/예정 회의 배너 */}
      {nextMeeting && (
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'7px 14px',
          background:'var(--accent-soft)', border:'1px solid #FCD89A', borderRadius:10, marginLeft:4 }}>
          {isOngoing && (
            <span style={{ width:7, height:7, borderRadius:'50%', background:'#EF4444',
              boxShadow:'0 0 0 3px rgba(239,68,68,.2)', animation:'pulse 1.5s infinite' }} />
          )}
          {!isOngoing && (
            <span style={{ width:22, height:22, borderRadius:6, background:'var(--accent)', color:'#fff',
              display:'inline-flex', alignItems:'center', justifyContent:'center' }}><Icon.Clock /></span>
          )}
          <div style={{ fontSize:12.5, color:'var(--ink-900)', lineHeight:1.3 }}>
            <span style={{ fontWeight:700, color:'var(--accent-ink)' }}>
              {isOngoing ? '진행 중' : `${minutesUntil}분 후`}
            </span>
            <span style={{ margin:'0 6px', color:'var(--ink-300)' }}>·</span>
            <span style={{ fontWeight:600 }}>{nextMeeting.title}</span>
            <span style={{ color:'var(--ink-500)', marginLeft:6 }}>
              {minutesToLabel(nextMeeting.start)}–{minutesToLabel(nextMeeting.end)}
            </span>
          </div>
          <div style={{ display:'flex', gap:6, marginLeft:8 }}>
            {onCancelMeeting && (
              <button onClick={onCancelMeeting} style={{ height:28, padding:'0 10px', borderRadius:6,
                border:'1px solid var(--border-strong)', background:'#FFF', color:'var(--ink-700)',
                fontSize:12, fontWeight:600, cursor:'pointer' }}>회의 취소</button>
            )}
            {onCheckIn && (
              <button onClick={onCheckIn} style={{ height:28, padding:'0 12px', borderRadius:6,
                border:'none', background:'#1A1A1A', color:'#FFF', fontSize:12, fontWeight:700, cursor:'pointer' }}>체크인</button>
            )}
          </div>
        </div>
      )}

      <div style={{ flex:1 }} />

      {/* 알림 */}
      <button style={{ position:'relative', width:38, height:38, borderRadius:10, border:'none',
        background:'transparent', color:'var(--ink-700)', cursor:'pointer',
        display:'inline-flex', alignItems:'center', justifyContent:'center' }}>
        <Icon.Bell />
        <span style={{ position:'absolute', top:9, right:10, width:7, height:7, borderRadius:'50%', background:'#EF4444', border:'2px solid #FFF' }} />
      </button>

      {/* 프로필 */}
      <button style={{ display:'flex', alignItems:'center', gap:10, padding:'4px 10px 4px 4px',
        borderRadius:999, border:'1px solid var(--border)', background:'#FFF', cursor:'pointer' }}>
        <span style={{ width:32, height:32, borderRadius:'50%', background:ME.color, color:'#fff',
          display:'inline-flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:13 }}>
          {ME.initial}
        </span>
        <div style={{ textAlign:'left', minWidth:0 }}>
          <div style={{ fontSize:13, fontWeight:700, color:'var(--ink-900)', lineHeight:1.2 }}>
            {ME.name} <span style={{ color:'var(--ink-400)', fontWeight:500, fontSize:11 }}>{ME.team}</span>
          </div>
          <div style={{ fontSize:11, color:'var(--ink-500)' }}>{ME.email}</div>
        </div>
        <Icon.ChevronDown />
      </button>

      <style>{`@keyframes pulse{0%,100%{box-shadow:0 0 0 3px rgba(239,68,68,.2)}50%{box-shadow:0 0 0 6px rgba(239,68,68,.08)}}`}</style>
    </header>
  );
}

// ─── Toast (공용) ─────────────────────────────────────────────────────────────
function Toast({ message, kind, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  const bg = kind === 'info' ? 'var(--blue)' : kind === 'error' ? 'var(--red)' : 'var(--green)';
  return (
    <div style={{ position:'fixed', bottom:28, left:'50%', transform:'translateX(-50%)',
      background:bg, color:'#FFF', fontSize:13, fontWeight:600, padding:'12px 20px',
      borderRadius:10, boxShadow:'0 12px 30px rgba(0,0,0,.16)', zIndex:90,
      display:'flex', alignItems:'center', gap:8, whiteSpace:'nowrap' }}>
      <Icon.Check /> {message}
    </div>
  );
}

// ─── 공용 스타일 상수 ─────────────────────────────────────────────────────────
const navIconBtn = { width:32, height:32, borderRadius:8, border:'1px solid var(--border)', background:'#FFF', display:'inline-flex', alignItems:'center', justifyContent:'center', color:'var(--ink-700)', cursor:'pointer' };
const fieldLabel = { display:'block', fontSize:11, color:'var(--ink-400)', fontWeight:600, letterSpacing:'.04em', marginBottom:8, textTransform:'uppercase' };
const textInput  = { width:'100%', borderRadius:8, border:'1px solid var(--border-strong)', padding:'8px 12px', fontSize:13, outline:'none', background:'#FFF', fontFamily:'inherit' };

window.CommonUI = { Icon, Sidebar, Header, Toast, navIconBtn, fieldLabel, textInput };
window.Icon = Icon; // modals.jsx, sidepanel.jsx 등 직접 참조용
window.CommonHelpers = { TODAY, DOW_KO, DAYS_KO, ME, isoDay, addDays, startOfWeek, sameDay, fmtKDate, diffDays, dDay, minutesToLabel, timeRangeLabel };
