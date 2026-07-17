// MoraReport.jsx v7.1 도넛차트, 카테고리 재편, 무당체 완전 통일
import React, { useState, useEffect } from 'react'
import { cleanText } from '../data/constants.js'
import { buildAstroPrompt, buildTarotPrompt } from '../utils/prompts.js'
import { callNetlify } from '../utils/callNetlify.js'

const C = {
  void: "#0D0A0F", dusk: "#1A1220", ember: "#241830",
  mahogany: "#3D2016", walnut: "#6B3A2A", caramel: "#A0522D",
  sand: "#C8956C", abyss: "#1E1028", plum: "#4A2060",
  iris: "#7B4FA6", lavender: "#B89FCC", parchment: "#F0E8DC",
  ash: "#9E8F8A", fog: "#5C5158",
}

const OHK_KR = { 목: "나무", 화: "불", 토: "흙", 금: "쇠", 수: "물" }
const OHK_COLOR = { 목: "#4CAF50", 화: "#FF5722", 토: "#8D6E63", 금: "#FFB300", 수: "#2196F3" }
const OHK_DESC = {
  목: "성장을 향해 끊임없이 뻗어나가는 에너지야. 새로운 것을 시작하고 가능성을 여는 힘이 강해. 창의적이고 추진력이 넘치지만, 뿌리가 약하면 방향이 흔들리기 쉬워. 한번 꽂히면 빠르게 달려가는데, 그 속도가 주변을 앞질러버리는 경우가 많아. 시작은 잘하는데 마무리가 약한 게 이 기운의 함정이야.",
  화: "뜨겁게 타오르는 에너지야. 표현력과 직관이 강하고, 주변을 밝히는 존재감이 있어. 사람을 끌어당기는 매력이 있지만, 타오르는 만큼 소진도 빨라. 감정의 기복이 크고, 흥미가 식으면 급격히 식어버리는 구조야. 이 기운이 강하면 화려하지만 지속성이 문제고, 너무 많으면 오히려 자기 자신을 태워버려.",
  토: "묵직하게 버티는 에너지야. 어떤 상황에서도 중심을 잡고, 주변을 안정시키는 힘이 있어. 포용력이 강하고 신뢰를 주는 존재가 되지만, 그 무게를 혼자 다 짊어지는 게 문제야. 변화에 느리고, 한번 굳으면 바꾸기 어려워. 안정감이 강점이지만, 지나치면 정체가 돼.",
  금: "자르고 정리하는 에너지야. 원칙이 뚜렷하고 결단력이 강해. 불필요한 것을 제거하고 핵심에 집중하는 능력이 있어. 하지만 날이 서있는 만큼 주변과 마찰이 생기기 쉬워. 타협을 못 하는 게 강점이기도 하고 약점이기도 해. 이 기운이 강하면 냉철한 대신 차갑게 보일 수 있어.",
  수: "깊이 스며드는 에너지야. 표면이 잔잔해 보여도 내면에 엄청난 깊이가 있어. 직관이 예리하고, 보이지 않는 것을 먼저 감지하는 능력이 있어. 유연하게 흐르면서 어떤 형태에도 적응하지만, 방향을 잃으면 어디로 흘러야 할지 모르는 구조야. 이 기운이 너무 많으면 생각이 깊어지는 대신 행동이 느려지고, 감정을 혼자 담아두다 무너지는 경우가 있어.",
}

const YONGSIN_DETAIL = {"목": {"업종": "교육, 출판, 작가, 콘텐츠 창작, 인테리어, 조경, 의류, 패션, 기획, 스타트업, 코칭", "행동": "새로운 것을 배우고 시작해. 독서, 강의 듣기, 새 프로젝트 시작", "취미": "등산, 원예, 독서, 글쓰기, 악기 배우기", "피해야할것": "너무 많이 시작하고 마무리 못 하는 패턴. 한 가지에 집중해."}, "화": {"업종": "방송, 엔터테인먼트, 뷰티, 마케팅, 강연, 홍보, 요식업, 전기, 에너지", "행동": "사람들 앞에 나서. 발표하고 빛나는 자리에 있어. 네트워킹 적극적으로 해.", "취미": "댄스, 노래, 요리, 사진, 유튜브, 공연 관람", "피해야할것": "너무 빠르게 소진되는 것. 충전 없이 계속 태우면 번아웃이 와."}, "토": {"업종": "부동산, 건축, 토목, 농업, 의료, 컨설팅, 중개업, 유통, 식품, 요양, 복지", "행동": "기반을 다져. 부동산 공부, 자격증 취득, 저축, 안정적인 루틴 만들기", "취미": "요리, 텃밭 가꾸기, 도예, 봉사활동, 명상", "피해야할것": "변화에 너무 느리게 반응하는 것. 한번 굳으면 바꾸기 어려운 게 약점이야."}, "금": {"업종": "법, 금융, 제조, 기계, 외과, 군경, 스포츠, 정밀 기계, 귀금속, IT 하드웨어", "행동": "원칙을 세우고 지켜. 계약서 꼼꼼히 보기, 법률 공부, 재테크, 규칙적인 운동", "취미": "격투기, 검도, 퍼즐, 정밀 공작, 수집", "피해야할것": "너무 날이 서있는 것. 타협 못 하면 주변과 마찰이 생겨."}, "수": {"업종": "무역, 유통, 해운, 여행, IT, 연구, 심리상담, 예술, 영성, 물 관련 사업", "행동": "유연하게 적응해. 새로운 정보 수집하기, 여행, 네트워크 만들기", "취미": "수영, 낚시, 요가, 명상, 글쓰기, 여행", "피해야할것": "방향 없이 흘러가는 것. 목표가 없으면 에너지가 흩어져."}, "화·토": {"업종": "의료, 요식업, 부동산, 에너지, 마케팅, 유통, 건설, 뷰티, 교육", "행동": "열정적으로 일하되 안정적인 기반을 쌓아. 자격증 취득, 꾸준한 저축, 인맥 관리", "취미": "요리, 원예, 댄스, 봉사활동", "피해야할것": "시작만 하고 마무리 못 하는 것."}, "목·화": {"업종": "교육, 출판, 창작, 방송, 마케팅, 강연, 기획, 콘텐츠 제작", "행동": "배우고 나눠. 가르치고, 발표하고, 새로운 프로젝트를 사람들과 함께 해.", "취미": "독서, 강의, 글쓰기, 퍼포먼스, 유튜브", "피해야할것": "산만하게 에너지를 흩뿌리는 것."}, "금·수": {"업종": "금융, IT, 무역, 연구, 귀금속, 해운, 데이터 분석, 컨설팅", "행동": "분석하고 판단해. 투자 공부, 자격증, 해외 네트워크 만들기", "취미": "바둑, 체스, 코딩, 독서, 여행", "피해야할것": "너무 냉정하게만 판단하는 것."}, "수·목": {"업종": "IT, 교육, 여행, 창작, 연구, 심리상담, 플랫폼, 미디어", "행동": "배우고 흘려보내. 지식을 쌓고 나누는 순환이 이 사람의 에너지야.", "취미": "독서, 여행, 수영, 글쓰기, 강의 듣기", "피해야할것": "계속 배우기만 하고 실행 안 하는 것."}, "토·금": {"업종": "건축, 법, 금융, 제조, 농업, 컨설팅, 의료, 부동산, 물류", "행동": "기반을 다지고 원칙을 지켜. 계약서, 법률, 재테크, 자격증", "취미": "도예, 정밀 공작, 격투기, 명상, 요리", "피해야할것": "너무 보수적으로만 가는 것."}}

const GISIN_DETAIL = {"목": {"업종": "교육, 출판, 창작, 인테리어, 의류, 기획 분야", "행동": "새로운 시작을 자꾸 벌이는 것, 산만하게 에너지를 흩뿌리는 것", "사람": "시작은 잘하지만 마무리가 약한 사람, 변화가 잦은 사람"}, "화": {"업종": "방송, 엔터, 마케팅, 화려한 것을 쫓는 분야", "행동": "충동적인 결정, 과도한 네트워킹, 에너지 소진", "사람": "화려하고 자극적인 사람, 감정 기복이 큰 사람"}, "토": {"업종": "부동산 무분별한 투자, 중개업 섣불리 진입", "행동": "고집 부리기, 변화 거부, 무거운 책임을 혼자 짊어지기", "사람": "고집이 너무 강한 사람, 변화를 거부하는 사람"}, "금": {"업종": "법, 제조, 금융 쪽에서 원칙 없이 진입", "행동": "무조건적인 결단, 타협 없는 고집, 강압적인 방식", "사람": "냉정하고 날이 선 사람, 원칙만 따지는 사람"}, "수": {"업종": "무역, 해운, 물 관련 사업에 무분별하게 뛰어들기", "행동": "방향 없이 흘러다니기, 너무 많은 정보에 휩쓸리기", "사람": "일관성 없는 사람, 종잡을 수 없는 사람"}, "수·금": {"업종": "금융, IT, 무역, 정밀 분야에서 무리하게 투자", "행동": "냉정한 계산만 따르기, 감성 없는 판단, 방향 없이 흘러다니기", "사람": "차갑고 계산적인 사람, 일관성 없는 사람"}, "목·토": {"업종": "기획, 부동산, 농업, 중개업에서 섣불리 시작", "행동": "시작만 하고 마무리 못 하기, 너무 많은 책임 짊어지기", "사람": "변덕스러운 사람, 고집이 너무 강한 사람"}, "금·토": {"업종": "제조, 건설, 법 분야에서 무리하게 진입", "행동": "지나친 원칙주의, 변화 거부, 무거운 짐 혼자 짊어지기", "사람": "너무 딱딱하고 융통성 없는 사람"}, "목·수": {"업종": "창작, IT, 교육에서 방향 없이 뛰어들기", "행동": "산만하게 이것저것 시작하기, 방향 잃고 흘러다니기", "사람": "일관성 없는 사람, 시작만 하는 사람"}, "화·금": {"업종": "방송, 제조, 에너지 분야에서 충동적으로 진입", "행동": "충동적인 결정과 냉정한 판단이 충돌하는 상황", "사람": "감정 기복이 크면서 날이 선 사람"}}

const FONT = "'Nanum Myeongjo', 'Noto Serif KR', Georgia, serif"
const FONT_SANS = "'Nanum Gothic', 'Apple SD Gothic Neo', sans-serif"
const txt = { fontSize: 14, color: C.parchment, lineHeight: 1.9, fontWeight: 400, fontFamily: FONT }
const hdg = (a) => ({ fontSize: 9, letterSpacing: 3, color: a, textTransform: "uppercase", fontFamily: FONT_SANS, marginBottom: 8, fontWeight: 400 })
const dvd = { borderBottom: `1px solid ${C.ember}`, marginBottom: 20, paddingBottom: 20 }

function mug(s) {
  if (!s) return ""
  let t = s
    .replace(/[（(][一-龯\u4E00-\u9FFF\uAC00-\uD7A3 ]+[）)]/g, "")
    .replace(/[一-龯\u4E00-\u9FFF]{2,}/g, "")
    .replace(/\s{2,}/g, " ")
    .trim()
  const r = [
    ["이야.", "이야."], ["이야,", "이야,"], ["이야 ", "이야 "], ["이에요\n", "이야\n"],
    ["야.", "야."], ["야,", "야,"], ["야 ", "야 "], ["예요\n", "야\n"],
    ["있어.", "있어."], ["있어,", "있어,"], ["있어 ", "있어 "],
    ["없어.", "없어."], ["없어,", "없어,"], ["없어 ", "없어 "],
    ["해.", "해."], ["해,", "해,"], ["해 ", "해 "], ["해요\n", "해\n"],
    ["돼.", "돼."], ["돼,", "돼,"], ["돼 ", "돼 "],
    ["가.", "가."], ["가,", "가,"], ["가 ", "가 "],
    ["나.", "나."], ["나,", "나,"], ["나 ", "나 "],
    ["거야.", "거야."], ["거야,", "거야,"], ["거야 ", "거야 "],
    ["았어.", "았어."], ["었어.", "었어."], ["았어,", "았어,"], ["었어,", "었어,"],
    ["잖아.", "잖아."], ["잖아,", "잖아,"],
    ["네.", "네."], ["네,", "네,"], ["네 ", "네 "],
    ["어.", "어."], ["어,", "어,"], ["어 ", "어 "],
    ["아.", "아."], ["아,", "아,"], ["아 ", "아 "],
    ["ㄹ게.", "ㄹ게."], ["할게.", "할게."], ["줄게.", "줄게."],
    ["신약", "에너지 분산 구조"], ["신강", "에너지 집중 구조"],
    ["하세요.", "해."], ["주세요.", "줘."],
    ["해내요.", "해내."], ["느껴.", "느껴."], ["보여.", "보여."], ["바꿔.", "바꿔."], ["바꿔,", "바꿔,"], ["바꿔 ", "바꿔 "], ["줘.", "줘."], ["줘,", "줘,"], ["줘 ", "줘 "],
    ["위치하여", "에 있어."], ["위치해", "에 있어"],
    ["드러내", "드러내"], ["강화하는데", "강화해"],
    ["만들어줘", "만들어줘"],
  ]
  for (const [o, n] of r) t = t.split(o).join(n)
  return t
}

function noColon(s) {
  return mug(s || "").replace(/[：:]\s*/g, " ").trim()
}

// 도넛 차트
function DonutChart({ ohaeng, dominant }) {
  const total = Object.values(ohaeng).reduce((a, b) => a + b, 0)
  if (!total) return null
  const size = 80; const r = 28; const cx = 40; const cy = 40; const stroke = 10
  let cumAngle = -90
  const slices = Object.entries(ohaeng).filter(([,v])=>v>0).map(([k,v])=>{
    const angle = (v/total)*360
    const startA = cumAngle; cumAngle += angle
    return {k, v, startA, angle, color: OHK_COLOR[k]||"#888"}
  })
  const polar = (a) => {
    const rad = (a*Math.PI)/180
    return [cx + r*Math.cos(rad), cy + r*Math.sin(rad)]
  }
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 10 }}>
        <svg width={size} height={size} viewBox="0 0 80 80" style={{ flexShrink: 0 }}>
          {slices.map(s => {
            const [x1,y1] = polar(s.startA)
            const [x2,y2] = polar(s.startA + s.angle)
            const large = s.angle > 180 ? 1 : 0
            if (s.angle >= 359.9) {
              return <circle key={s.k} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={stroke}/>
            }
            return (
              <path key={s.k}
                d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`}
                fill={s.color} stroke={C.dusk} strokeWidth={1}
              />
            )
          })}
          <circle cx={cx} cy={cy} r={r-stroke} fill={C.dusk}/>
          <text x={cx} y={cy-3} textAnchor="middle" fill={OHK_COLOR[dominant]||C.sand} fontSize="11" fontFamily={FONT_SANS} fontWeight="400">
            {OHK_KR[dominant]||dominant}
          </text>
          <text x={cx} y={cy+11} textAnchor="middle" fill={C.ash} fontSize="9" fontFamily={FONT_SANS}>
            {ohaeng[dominant]||0}개
          </text>
        </svg>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: C.fog, fontFamily: FONT_SANS, fontWeight: 400 }}>
            {Object.entries(ohaeng).filter(([,v])=>v>0).map(([k,v])=>(
              <span key={k} style={{ marginRight: 8 }}>
                <span style={{ color: OHK_COLOR[k]||C.fog }}>■</span> {OHK_KR[k]||k} {v}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div style={{ fontSize: 13, color: C.parchment, lineHeight: 1.8, fontFamily: FONT, fontWeight: 400 }}>
        {OHK_DESC[dominant] || ""}
      </div>
    </div>
  )
}

function Block({ h, text, jsxContent, highlight, accent, last }) {
  if (!text && !h && !jsxContent) return null
  return (
    <div style={last ? {} : dvd}>
      {h && <div style={hdg(accent || C.caramel)}>{h}</div>}
      {highlight && !text && <span style={{ color: C.sand, fontSize: 15, fontFamily: FONT, fontWeight: 400 }}>{highlight}</span>}
      {highlight && text && <div style={txt}><span style={{ color: C.sand, fontWeight: 400 }}>{highlight}</span>{text}</div>}
      {!highlight && text && <div style={txt}>{text}</div>}
      {jsxContent && <div>{jsxContent}</div>}
    </div>
  )
}

function ChapterCard({ label, tag, tagColor, tagText, accent, title, subtitle, blocks, extra, flipping, flipDir }) {
  return (
    <div style={{
      background: C.dusk, border: `1px solid ${C.mahogany}`, borderRadius: 16, overflow: "hidden",
      transform: flipping ? (flipDir > 0 ? "rotateY(-15deg) scale(0.96)" : "rotateY(15deg) scale(0.96)") : "rotateY(0deg) scale(1)",
      transition: "transform 0.4s cubic-bezier(0.4,0,0.2,1)",
      transformOrigin: flipDir > 0 ? "left center" : "right center",
      boxShadow: `0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px ${C.ember}`,
      minHeight: 480,
    }}>
      <div style={{ background: `linear-gradient(135deg, ${C.mahogany} 0%, ${C.abyss} 100%)`, padding: "24px 24px 18px", borderBottom: `1px solid ${C.ember}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ fontSize: 9, letterSpacing: 4, color: accent, textTransform: "uppercase", fontFamily: FONT_SANS, fontWeight: 400 }}>{label}</div>
          {tag && <div style={{ background: tagColor, borderRadius: 20, padding: "3px 10px", fontSize: 11, color: tagText, fontFamily: FONT_SANS, fontWeight: 400 }}>{tag}</div>}
        </div>
        <div style={{ fontSize: 17, color: C.parchment, lineHeight: 1.6, whiteSpace: "pre-line", fontWeight: 400, fontFamily: FONT }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11, color: C.ash, marginTop: 6, fontFamily: FONT_SANS, letterSpacing: 0.5, fontWeight: 400 }}>{subtitle}</div>}
      </div>
      <div style={{ padding: "20px 24px 24px" }}>
        {extra}
        {blocks.filter(Boolean).map((b, i) => (
          <Block key={i} {...b} last={i === blocks.filter(Boolean).length - 1} />
        ))}
      </div>
    </div>
  )
}

export default function MoraReport({ d, onHome, onSavePDF, pdfLoading, parentAstroAI, setParentAstroAI, parentTarotAI, setParentTarotAI }) {
  const [current, setCurrent] = useState(0)
  const [flipping, setFlipping] = useState(false)
  const [flipDir, setFlipDir] = useState(null)
  const [astroAI, setAstroAI] = useState(parentAstroAI || null) // _astroAI 캐시 무시 항상 새로 계산
  const [tarotAI, setTarotAI] = useState(parentTarotAI || d._tarotAI || null)
  const [loadingAstro, setLoadingAstro] = useState(!astroAI)

  const goTo = (dir) => {
    if (flipping) return
    const next = current + dir
    if (next < 0 || next >= chapters.length) return
    setFlipDir(dir); setFlipping(true)
    setTimeout(() => { setCurrent(next); setFlipping(false); setFlipDir(null) }, 400)
  }

  useEffect(() => {
    if (astroAI) { setLoadingAstro(false); return }
    let cancelled = false
    async function fetchAstro() {
      setLoadingAstro(true)
      try {
        const pillarsStr = d.pillars?.map(p => `${p.name} ${p.gan.hanja}${p.ji.hanja}`).join(", ") || ""
        const ilganKo = d.pillars?.[2]?.gan?.ko || "무"
        const ilganHanja = d.pillars?.[2]?.gan?.hanja || "戊"
        const prompt = buildAstroPrompt(pillarsStr, ilganKo, ilganHanja, d.birth)
        const text = await callNetlify({ model: "claude-haiku-4-5-20251001", max_tokens: 1200, messages: [{ role: "user", content: prompt }] })
        const parsed = JSON.parse(text)
        if (!cancelled) { setAstroAI(parsed); if (setParentAstroAI) setParentAstroAI(parsed) }
      } catch (e) { console.error("astro:", e) }
      if (!cancelled) setLoadingAstro(false)
    }
    fetchAstro()
    return () => { cancelled = true }
  }, [d.birth])

  useEffect(() => {
    if (tarotAI) return
    let cancelled = false
    async function fetchTarot() {
      try {
        const ilganKo = d.pillars?.[2]?.gan?.ko || "무"
        const ilganHanja = d.pillars?.[2]?.gan?.hanja || "戊"
        const prompt = buildTarotPrompt(d.tarot, ilganKo, ilganHanja)
        const text = await callNetlify({ model: "claude-haiku-4-5-20251001", max_tokens: 250, messages: [{ role: "user", content: prompt }] })
        const parsed = JSON.parse(text)
        if (!cancelled) { setTarotAI(parsed); if (setParentTarotAI) setParentTarotAI(parsed) }
      } catch (e) { console.error("tarot:", e) }
    }
    fetchTarot()
    return () => { cancelled = true }
  }, [d.birth])

  // ── 데이터 추출 ──
  const bnd = d.boundary
  const isBnd = bnd?.isBoundary
  const ss = d.summary?.sixSystems || []
  const sajuSys = ss.find(s => s.system === "사주") || {}
  const tojungSys = ss.find(s => s.system === "토정비결") || {}
  const juyeokSys = ss.find(s => s.system === "주역") || {}
  const tarotSys = ss.find(s => s.system === "타로수비학") || {}
  const mbtiSys = ss.find(s => s.system === "MBTI") || {}
  const a = astroAI || d.astro || {}
  const t = d.tarot || {}
  const dn = d.daynight || {}
  const night = dn.night || {}

  // 오행
  const ohaeng = d.ohaengDist || {}
  const dominant = Object.entries(ohaeng).sort((x, y) => y[1] - x[1])[0]?.[0] || "토"
  const singang = d.singang || ""
  const isSingang = singang.includes("강")
  const yongsinA = d.yongsinA || ""
  const gisinA = d.gisinA || ""

  // 별자리 띠이름 완전 변환
  const zodiacFix = (s) => {
    if (!s) return ""
    return s
      .replace(/[一-龯\u4E00-\u9FFF]{2,}/g, "")
      .replace(/[（(][^）)]+[）)]/g, "")
      .replace(/戊|己|庚|辛|壬|癸|甲|乙|丙|丁/g, "")
      .replace(/쥐자리/g, "양자리").replace(/소자리/g, "황소자리")
      .replace(/범자리|호랑이자리/g, "쌍둥이자리").replace(/토끼자리/g, "게자리")
      .replace(/용자리/g, "사자자리").replace(/뱀자리/g, "처녀자리")
      .replace(/말자리/g, "천칭자리").replace(/양자리\(미\)|미자리|양자리\(羊\)/g, "전갈자리")
      .replace(/원숭이자리/g, "사수자리").replace(/닭자리/g, "염소자리")
      .replace(/개자리/g, "물병자리").replace(/돼지자리/g, "물고기자리")
      .replace(/\s{2,}/g, " ").trim()
  }
  const sunSign = a.sun && a.sun !== "분석 중" ? zodiacFix(a.sun) : null
  const moonSign = a.moon && a.moon !== "분석 중" ? zodiacFix(a.moon) : null
  const ascSign = a.asc && a.asc !== "분석 중" ? zodiacFix(a.asc) : null

  // 신살 한 박스, 엔터 구분, 마침표
  // 신살 JSX로 렌더링 (이름 색상 + 설명 인라인)
  const sinsalJSX = d.sinsal?.length
    ? d.sinsal.map((s, i) => {
        const nm = s.name.replace(/\([^)]*\)/g, "").trim()
        const desc = s.kw ? ` ${mug(s.kw)}` : ""
        const fullDesc = s.desc ? ` ${mug(s.desc).slice(0, 80)}` : ""
        return React.createElement("div", { key: i, style: { marginBottom: i < d.sinsal.length - 1 ? 10 : 0 } },
          React.createElement("span", { style: { color: C.sand, fontSize: 14, fontFamily: FONT, fontWeight: 400 } }, nm),
          React.createElement("span", { style: { color: C.parchment, fontSize: 14, fontFamily: FONT, fontWeight: 400 } }, desc + fullDesc)
        )
      })
    : [React.createElement("div", { key: 0, style: { color: C.parchment, fontSize: 14, fontFamily: FONT } }, "특별한 신살 없어. 안정적인 구조야. 튀지 않는 대신 오래 가.")]
  const sinsalText = ""

  // 토정비결
  const tojungKw = tojungSys.key?.replace(/[（(][一-龯\u4E00-\u9FFF]+[）)]/g, "").trim() || ""
  const tojungDesc = noColon(tojungSys.desc || "").replace(/^[\n\r]+/, "")

  // 주역 콜론 완전 제거
  const ichingKw = (juyeokSys.key || d.iching?.bonmyeonggae || "")
    .replace(/[.:：]/g, "").replace(/[一-龯\u4E00-\u9FFF（(][^）)]*[）)]/g, "").trim()
  const ichingNature = noColon(juyeokSys.desc || d.iching?.gaeNature || "").replace(/^[\n\r]+/, "")
  const ichingStrategy = (d.iching?.strategy || []).slice(0, 2).map(noColon)
  const ichingText = `${ichingNature}${ichingStrategy.length ? " " + ichingStrategy.join(" ") : ""}`

  // 일주 설명
  const iljuDescStd = mug(isBnd ? bnd.standardDesc : (sajuSys.desc || ""))
  const iljuDescMid = mug(bnd?.midnightDesc || "")

  // 당사주
  const dansajuPillars = d.dansaju?.pillars || []
  const dansajuText = (() => {
    if (!dansajuPillars.length) return ""
    const stars = dansajuPillars.map(p => p.byeolseong?.split("(")[0].replace(/\([^)]*\)/g, "").trim() || "").filter(Boolean)
    const kws = dansajuPillars.map(p => p.kw || "").filter(Boolean)
    return `별이 네 개야. ${stars.join(", ")} 순서로 흘러가. ${kws.slice(0, 2).join("과 ")}의 기운이 삶의 뼈대를 만드네.`
  })()

  // 별자리 텍스트 한자 완전 제거
  const astroSunText = sunSign ? mug(a.sunDesc || a.triangle || "") : "별자리 분석 불러오는 중이야."
  const astroMoonText = moonSign ? mug(a.moonDesc || "") : "잠시 후 나타나."

  // 타로
  const tarotLifeText = mug(t.lifePathDesc || tarotSys.desc || "")
  const tarotSoulText = mug(tarotAI?.soulDesc || t.soulDesc || "")
  const tarotCardName = (t.lifePathCard || "본명 카드").replace(/\([^)]*\)/g, "").trim()

  // 성격 요약 (MBTI 대체)
  const strengths = (d.mbti?.strengths || []).map(mug).filter(Boolean).slice(0, 2)
  const challenges = (d.mbti?.challenges || []).map(mug).filter(Boolean).slice(0, 2)
  const mbtiType = mbtiSys.key || d.mbti?.estimated || ""
  const mbtiDesc = mug(mbtiSys.desc || d.mbti?.basis || "")
  const dayImpression = mug(dn.day?.impression || "")
  const daymask = mug(dn.day?.mask || "")

  // 재물
  const yearForecast = d.summary?.yearForecast || []
  const thisYear = yearForecast[0] || {}
  const jaemuScore = thisYear?.areas?.재물 || 0
  const bestYear = [...yearForecast].sort((a, b) => (b.areas?.재물 || 0) - (a.areas?.재물 || 0))[0]
  const reomulStructure = isSingang
    ? `에너지가 집중된 구조야. 돈 잡으면 오래 쥐고 있어. 근데 욕심이 화근이야. 한 번에 다 가지려다 날리는 패턴, 이미 경험했지?`
    : `에너지가 분산된 구조야. 돈이 들어와도 손에 안 남아. 구조가 그래. 네 잘못이 아닌데 이 패턴 모르면 평생 반복돼.`
  const reomulYongsin = yongsinA ? `살길은 ${yongsinA} 기운이야. 이 방향으로 가야 돈이 따라와. 거슬러 가면 아무리 열심히 해도 제자리야.` : ""
  const _gd = GISIN_DETAIL[gisinA] || GISIN_DETAIL[gisinA?.split("·")[0]] || {}
  const reomulGisin = gisinA
    ? `${gisinA} 기운은 돈을 새게 만들어. 이쪽으로 가면 힘만 빼는 거야.\n\n피해야 할 업종과 분야 ${_gd["업종"] || gisinA + " 방향의 사업"}\n\n하지 말아야 할 행동 ${_gd["행동"] || "이 기운의 방향으로 무리하게 가는 것"}\n\n조심해야 할 사람 ${_gd["사람"] || gisinA + " 기운이 강한 사람"}`
    : ""
  const reomulYear = jaemuScore ? `올해 재물 흐름 ${jaemuScore}점이야. ${mug(thisYear.summary || "")}` : ""
  const reomulBest = bestYear && bestYear.year !== thisYear.year
    ? `향후 5년 중 ${bestYear.year}년이 재물 흐름이 제일 강해. 그때를 노려야 해.` : ""
  const reomulFlow = yearForecast.slice(0, 5).map(y => `${y.year}년 ${y.areas?.재물 || 0}점`).join(" · ")

  // 연애
  const desire = mug(night.desire || "")
  const desire2 = mug(night.desire2 || "")
  const attraction = mug(night.attraction || "")
  const idealType = mug(night.idealType || "")
  const idealType2 = mug(night.idealType2 || "")
  const triggers = (night.triggers || []).map(mug).filter(Boolean)

  // 커리어
  const bestEnv = mug(d.mbti?.bestEnv || "")
  const recovery = mug(d.mbti?.recovery || "")

  // 인간관계
  const dayMask = mug(dn.day?.mask || "")
  const dayImp = mug(dn.day?.impression || "")

  // 대운·세운
  const daeun = d.daeun || []
  const curDaeun = daeun.find(dv => dv.cur) || daeun[0]
  const nextDaeun = daeun[daeun.indexOf(curDaeun) + 1]
  const futureDaeun = daeun.slice(0, 5)
  const daeunCurText = curDaeun ? `지금 ${curDaeun.label?.replace(/[一-龯\u4E00-\u9FFF（(][^）)]*[）)]/g, "").trim()} 대운이야 (${curDaeun.period || ""}). ${mug(curDaeun.desc || "")}` : "대운 읽는 중이야."
  const daeunNextText = nextDaeun ? `다음 대운은 ${nextDaeun.label?.replace(/[一-龯\u4E00-\u9FFF（(][^）)]*[）)]/g, "").trim()}이야. 이 전환점이 오기 전에 지금을 써야 해.` : ""
  const daeunFlow = futureDaeun.map(dv => { const lb = dv.label?.replace(/[一-龯\u4E00-\u9FFF（(][^）)]*[）)]/g, "").trim(); const pd = dv.period || (dv.startAge ? `만 ${dv.startAge}~${Number(dv.startAge)+9}세` : ""); return `${lb} ${pd}` }).join("\n")
  const yearFlowText = yearForecast.slice(0, 5).map(y => `${y.year}년 ${y.score}점 ${mug(y.summary || "")}`).join("\n")

  const sajuTag = (sajuSys.key || "").replace(/[（(][一-龯\u4E00-\u9FFF]+[）)]/g, "").trim()

  // ── 챕터 구성 ──
  const bndChapters = isBnd ? [
    {
      label: "경계의 사주", accent: C.iris,
      tag: "경계 사주", tagColor: C.plum, tagText: C.lavender,
      title: "넌 특별한 사주야.",
      subtitle: "두 기운을 동시에 품고 태어났어.",
      blocks: [
        { h: "두 기운을 동시에", text: "태어난 시간이 자정 경계에 걸쳐 있어. 어떤 학파는 한쪽, 어떤 학파는 다른 쪽으로 읽어. 틀린 게 아니야. 두 기운을 동시에 품고 태어난 거야.", accent: C.iris },
        { h: "어느 쪽이 맞을까", text: "둘 다 읽어봐. 어느 쪽이 더 내 얘기처럼 느껴지는지 본인이 제일 잘 알아. 둘 다 맞는 경우도 있어. 그게 경계 사주야.", accent: C.iris },
      ],
    },
    {
      label: "무술 첫 번째 해석", accent: C.caramel,
      tag: "무술", tagColor: C.mahogany, tagText: C.sand,
      title: "흙 위에 흙.\n버티는 게 무기인 사람이야.",
      subtitle: "사주 · 오행 분포",
      extra: <DonutChart ohaeng={ohaeng} dominant={dominant} />,
      blocks: [
        { h: "일주 본질", text: iljuDescStd || "흙 위에 흙이 쌓인 구조야. 산이 두 개야, 이 사람은.", accent: C.caramel },
        { h: "타고난 에너지", jsxContent: sinsalJSX, accent: C.caramel },
      ],
    },
    {
      label: "기해 두 번째 해석", accent: C.iris,
      tag: "기해", tagColor: C.abyss, tagText: C.lavender,
      title: "흙 아래 물.\n겉이랑 속이 달라.",
      subtitle: "사주 · 오행 분포",
      extra: <DonutChart ohaeng={ohaeng} dominant={dominant} />,
      blocks: [
        { h: "일주 본질", text: iljuDescMid || "부드러운 흙 아래 깊은 물이 흐르는 구조야.", accent: C.iris },
        { h: "타고난 에너지", jsxContent: sinsalJSX, accent: C.iris },
      ],
    },
  ] : [
    {
      label: "일주 본질", accent: C.caramel,
      tag: sajuTag, tagColor: C.mahogany, tagText: C.sand,
      title: `${sajuTag}.\n태어날 때부터 이렇게 설계됐어.`,
      subtitle: "사주 · 오행 분포",
      extra: <DonutChart ohaeng={ohaeng} dominant={dominant} />,
      blocks: [
        { h: "본질", text: iljuDescStd || "분석 중이야.", accent: C.caramel },
        { h: "타고난 에너지", jsxContent: sinsalJSX, accent: C.caramel },
      ],
    },
  ]

  const freeChapters = [
    ...bndChapters,
    {
      label: "내면 구조", accent: C.iris,
      tag: tojungKw || "내면", tagColor: C.abyss, tagText: C.lavender,
      title: "겉으로 보이는 게 전부가 아니야.",
      subtitle: "당사주 · 토정비결 · 주역",
      blocks: [
        dansajuText ? { h: "당사주", text: dansajuText, accent: C.iris } : null,
        { h: "토정비결", text: tojungDesc, accent: C.iris, highlight: tojungKw + " " },
        { h: "주역", text: ichingText, accent: C.iris, highlight: ichingKw },
      ].filter(Boolean),
    },
    {
      label: "하늘의 설계", accent: C.lavender,
      tag: "별자리", tagColor: C.plum, tagText: C.lavender,
      title: "태어난 순간 별들이\n이미 다 정해놨어.",
      subtitle: "별자리 네이탈",
      blocks: loadingAstro
        ? [{ h: "분석 중", text: "모라가 별자리를 읽고 있어. 잠깐만 기다려.", accent: C.lavender }]
        : [
          sunSign ? { h: `태양 ${sunSign}`, text: astroSunText, accent: C.lavender } : null,
          moonSign ? { h: `달 ${moonSign} · 상승 ${ascSign || ""}`, text: astroMoonText, accent: C.lavender } : null,
          a.stellium ? { h: "집중 에너지", text: mug(a.stellium), accent: C.lavender } : null,
        ].filter(Boolean),
    },
    {
      label: "타고난 에너지", accent: C.sand,
      tag: `생명경로수 ${t.lifePath || ""}`, tagColor: C.mahogany, tagText: C.sand,
      title: "숫자 하나가 삶 전체를\n관통하고 있어.",
      subtitle: "타로수비학",
      blocks: [
        { h: `생명경로수 ${t.lifePath || ""}`, text: tarotLifeText || "분석 중이야.", accent: C.sand },
        { h: tarotCardName, text: tarotSoulText || "분석 중이야.", accent: C.sand },
      ],
    },
    {
      label: "성격 요약", accent: C.caramel,
      tag: mbtiType, tagColor: C.walnut, tagText: C.parchment,
      title: "한 줄로 설명하면 이래.",
      subtitle: "일주 · 별자리 · 타로 · MBTI 종합",
      blocks: [
        { h: "종합 기질", text: mbtiDesc || "분석 중이야.", accent: C.caramel },
        dayImp ? { h: "첫인상", text: dayImp, accent: C.caramel } : null,
        dayMask ? { h: "사회적 가면", text: dayMask, accent: C.caramel } : null,
        strengths.length ? { h: "잘하는 것", text: strengths.join("\n"), accent: C.caramel } : null,
        challenges.length ? { h: "발목 잡히는 것", text: challenges.join("\n"), accent: C.caramel } : null,
      ].filter(Boolean),
    },
  ]

  // 인연 시기 관성 대운/세운 기반
  const loveYears = (() => {
    if (!daeun.length) return ""
    const cur = daeun.find(dv => dv.cur)
    const curIdx = daeun.indexOf(cur)
    const nearby = daeun.slice(Math.max(0, curIdx-1), curIdx+3)
    // 관성(화·금 등) 대운 찾기 단순화
    const hot = nearby.filter(dv => dv.ohaeng && ["화","금","목","수"].includes(dv.ohaeng))
    if (hot.length) return `${hot.map(dv => dv.period || dv.label).join(", ")} 대운 구간에 인연이 강하게 들어와.`
    return "지금 대운 흐름에서 인연이 읽혀. 세운이 맞물리는 해를 봐야 해."
  })()

  // 용신 업종const GISIN_DETAIL = {"목": {"업종": "교육, 출판, 창작, 인테리어, 의류, 기획 분야", "행동": "새로운 시작을 자꾸 벌이는 것, 산만하게 에너지를 흩뿌리는 것", "사람": "시작은 잘하지만 마무리가 약한 사람, 변화가 잦은 사람"}, "화": {"업종": "방송, 엔터, 마케팅, 화려한 것을 쫓는 분야", "행동": "충동적인 결정, 과도한 네트워킹, 에너지 소진", "사람": "화려하고 자극적인 사람, 감정 기복이 큰 사람"}, "토": {"업종": "부동산 무분별한 투자, 중개업 섣불리 진입", "행동": "고집 부리기, 변화 거부, 무거운 책임을 혼자 짊어지기", "사람": "고집이 너무 강한 사람, 변화를 거부하는 사람"}, "금": {"업종": "법, 제조, 금융 쪽에서 원칙 없이 진입", "행동": "무조건적인 결단, 타협 없는 고집, 강압적인 방식", "사람": "냉정하고 날이 선 사람, 원칙만 따지는 사람"}, "수": {"업종": "무역, 해운, 물 관련 사업에 무분별하게 뛰어들기", "행동": "방향 없이 흘러다니기, 너무 많은 정보에 휩쓸리기", "사람": "일관성 없는 사람, 종잡을 수 없는 사람"}, "수·금": {"업종": "금융, IT, 무역, 정밀 분야에서 무리하게 투자", "행동": "냉정한 계산만 따르기, 감성 없는 판단, 방향 없이 흘러다니기", "사람": "차갑고 계산적인 사람, 일관성 없는 사람"}, "목·토": {"업종": "기획, 부동산, 농업, 중개업에서 섣불리 시작", "행동": "시작만 하고 마무리 못 하기, 너무 많은 책임 짊어지기", "사람": "변덕스러운 사람, 고집이 너무 강한 사람"}, "금·토": {"업종": "제조, 건설, 법 분야에서 무리하게 진입", "행동": "지나친 원칙주의, 변화 거부, 무거운 짐 혼자 짊어지기", "사람": "너무 딱딱하고 융통성 없는 사람"}, "목·수": {"업종": "창작, IT, 교육에서 방향 없이 뛰어들기", "행동": "산만하게 이것저것 시작하기, 방향 잃고 흘러다니기", "사람": "일관성 없는 사람, 시작만 하는 사람"}, "화·금": {"업종": "방송, 제조, 에너지 분야에서 충동적으로 진입", "행동": "충동적인 결정과 냉정한 판단이 충돌하는 상황", "사람": "감정 기복이 크면서 날이 선 사람"}}



  const yongsinJobMap = {"목": "교육, 출판, 의류, 인테리어, 조경, 원예, 목재, 가구, 창작, 기획, 성장 관련 분야야. 새로운 걸 시작하고 키우는 일이 맞아.", "화": "방송, 엔터테인먼트, 뷰티, 조명, 전기, 에너지, 요식업, 마케팅, 강연, 홍보 분야야. 빛을 내고 사람들 앞에 서는 일이 맞아.", "토": "부동산, 건축, 토목, 농업, 의료, 컨설팅, 중개업, 유통, 식품 분야야. 실체가 있는 것을 다루고 안정적인 기반을 만드는 일이 맞아.", "금": "법, 금융, 제조, 기계, 외과, 군경, 스포츠, 정밀 기계, 귀금속 분야야. 원칙이 명확하고 결과가 바로 나타나는 일이 맞아.", "수": "무역, 유통, 해운, 여행, IT, 연구, 심리상담, 예술, 영성 분야야. 흐르고 연결되는 성질의 일이 맞아.", "목·화": "교육, 출판, 창작, 방송, 마케팅, 강연, 기획 분야야. 새로운 것을 만들고 알리는 일이 맞아.", "화·토": "의료, 요식업, 부동산, 에너지, 마케팅, 유통, 건설 분야야. 실체 있는 것을 빛나게 만드는 일이 맞아.", "토·금": "건축, 법, 금융, 제조, 농업, 컨설팅, 의료 분야야. 안정적이고 원칙이 있는 일이 맞아.", "금·수": "금융, IT, 무역, 연구, 귀금속, 해운 분야야. 정밀하고 유연하게 흐르는 일이 맞아.", "수·목": "IT, 교육, 여행, 창작, 연구, 심리상담 분야야. 지식을 쌓고 나누는 일이 맞아."}
  const yongsinJob = yongsinJobMap[yongsinA] || yongsinJobMap[yongsinA?.split("·")[0]] || ""

  // 재물 상세
  const reomulType = isSingang
    ? `에너지가 집중된 구조야. 일단 방향이 잡히면 돈을 잡고 오래 쥐고 있어. 근데 그게 양날의 검이야. 한번 욕심이 생기면 멈추질 못해. 더 크게, 더 빨리 가지려다 한 번에 날리는 패턴이 이 구조의 함정이야. 이미 경험해봤지? 문제는 그게 한 번으로 안 끝난다는 거야. 모르면 계속 반복돼. 지금 당장 크게 버는 것보다 잃지 않는 구조를 만드는 게 먼저야. 욕심의 크기를 조절하는 것이 이 사주의 핵심 과제야.`
    : `에너지가 분산된 구조야. 돈이 들어오는 경로가 여러 개인 것 같은데, 정작 어디서 들어오고 어디서 나가는지 파악이 안 돼. 열심히 하는데 왜 안 쌓이나 싶었지? 구조가 그래. 네 잘못이 아니야. 근데 이 구조를 모르면 평생 이 패턴이 반복돼. 에너지를 한 곳에 모아야 해. 여러 가지를 동시에 하면 전부 흩어져. 하나를 깊게 파는 것이 이 사주에서 돈을 쌓는 유일한 방법이야. 선택과 집중, 이게 돈의 답이야.`
  const _yd = YONGSIN_DETAIL[yongsinA] || YONGSIN_DETAIL[yongsinA?.split("·")[0]] || {}
  const reomulSurvive = yongsinA
    ? `${yongsinA} 기운이 이 사람을 살려. 이 방향으로 가야 돈이 따라오고, 에너지가 살아나. 거슬러 가면 아무리 열심히 해도 제자리야. 지금 하는 일이 이 방향인지 한번 봐. 맞으면 계속 가고, 아니면 방향을 틀어야 해.\n\n맞는 업종 ${_yd["업종"] || yongsinJobMap[yongsinA] || yongsinA + " 방향의 분야"}\n\n일상에서 강화하는 법 ${_yd["행동"] || ""}. 취미도 ${_yd["취미"] || "이 기운을 살리는 활동"}으로 채워. 작은 것부터 이 기운을 늘려가는 게 재물을 쌓는 가장 빠른 길이야.\n\n조심할 것 ${_yd["피해야할것"] || ""}`
    : ""
  const reomulAvoid = reomulGisin
  const reomulInvest = isSingang
    ? "적극적으로 투자하고 확장하는 스타일이 맞아. 근데 리스크 관리를 못 하면 한 방에 날려. 욕심의 크기를 조절하는 게 관건이야."
    : "안정적으로 쌓아가는 스타일이 맞아. 한 번에 크게 가려다 다 잃는 경우가 많아. 꾸준히 쌓는 게 이 구조의 정답이야."

  // 연애 상세
  const lovePattern = triggers.length
    ? `매번 같은 상황에서 무너져. ${triggers[0]}. 이게 반복된다면 구조적인 문제야.`
    : "연애에서 반복되는 패턴이 있어. 상대가 문제가 아니야. 내 구조가 그렇게 돼 있어."
  const loveTiming = `인연이 들어오는 시기가 따로 있어. 대운과 세운이 맞아야 제대로 된 사람이 와. 아무리 노력해도 안 되는 시기가 있고, 가만 있어도 오는 시기가 있어.`
  const loveWarn = idealType2 ? `근데 주의해. ${mug(d.mbti?.challenges?.[0] || "")} 이 약점이 관계에서도 그대로 나타나.` : ""

  // 커리어 상세
  const careerStrength = (d.mbti?.strengths || []).slice(0,2).map(mug).join(" ") || `${yongsinA || ""} 기운이 강한 분야에서 실력이 빛나.`
  const careerWeak = (d.mbti?.challenges || []).slice(0,1).map(mug).join("") || "약점을 알고 보완하는 게 커리어의 핵심이야."
  const careerBest = yongsinA ? `${yongsinA} 기운이 살아있는 직종이야. 이 방향이 맞아. 돈도 따라오고 실력도 인정받아.` : ""
  const careerTiming = `지금 대운이 커리어에 유리한 시기인지, 내부를 다지는 시기인지가 중요해. 타이밍을 잘못 읽으면 아무리 잘해도 결과가 안 나와.`

  // 인간관계 상세
  const relGuardian = yongsinA ? `${yongsinA} 기운을 가진 사람이 귀인이야. 이 에너지가 나를 살려. 직관적으로 편한 사람, 같이 있으면 뭔가 잘 풀리는 사람이 그 타입이야.` : ""
  const relPoison = gisinA ? `${gisinA} 기운이 강한 사람과 가까이 있으면 이유 없이 지쳐. 나쁜 사람이 아닐 수 있어. 그냥 에너지가 안 맞는 거야. 가까이 할수록 손해야.` : ""
  const relStyle = dayMask ? `겉으로는 ${dayMask} 근데 실제 속모습은 달라. 이 차이를 아는 사람이 진짜 인연이야.` : ""

  // 대운 상세
  const daeunDetail = curDaeun ? mug(curDaeun.longDesc || curDaeun.desc || "") : ""
  const yearDetail = yearForecast.slice(0, 5).map(y => {
    const score = y.score || 0
    const areas = y.areas || {}
    const areaStr = Object.entries(areas).map(([k,v]) => `${k} ${v}점`).join(" / ")
    return `${y.year}년 종합 ${score}점\n${areaStr}\n${mug(y.summary || "")}`
  }).join("\n\n")

  const lockedChapters = [
    // 재물 3블록
    {
      label: "재물 구조", accent: C.sand,
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "돈이 어떻게 들어오고\n어디서 새는지 다 보여.",
      subtitle: "재물 심층 분석 1",
      blocks: [
        { h: "돈의 구조", text: reomulType, accent: C.sand },
        reomulSurvive ? { h: "살길", text: reomulSurvive, accent: C.sand } : null,
        reomulAvoid ? { h: "피해야 할 방향", text: reomulAvoid, accent: C.sand } : null,
      ].filter(Boolean),
    },
    {
      label: "재물 흐름", accent: C.sand,
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "올해가 채우는 해인지\n쓰는 해인지.",
      subtitle: "재물 심층 분석 2",
      blocks: [
        reomulYear ? { h: "올해 재물", text: reomulYear, accent: C.sand } : { h: "올해 흐름", text: "올해 재물 흐름이 읽혔어.", accent: C.sand },
        { h: "투자 vs 저축 체질", text: reomulInvest, accent: C.sand },
        reomulBest ? { h: "터지는 시기", text: reomulBest, accent: C.sand } : null,
        reomulFlow ? { h: "5년 재물 흐름", text: reomulFlow, accent: C.sand } : null,
      ].filter(Boolean),
    },
    // 연애 3블록
    {
      label: "연애 관계", accent: C.lavender,
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "매번 같은 패턴에\n걸리는 이유가 있어.",
      subtitle: "연애 심층 분석 1",
      blocks: [
        { h: "속에서 원하는 것", text: desire ? desire + (desire2 ? "\n\n" + desire2 : "") : `겉으로는 별로 안 원하는 척 해. 근데 속은 달라. 진심으로 알아봐 주는 사람을 원해. 말 안 해도 알아채고, 기대 없이 챙겨주는 사람. 그런 사람한테 한번 마음 열면 완전히 열어. 근데 그 사람을 만나기 전까지는 아무도 모르게 혼자 오래 기다려. 그게 이 사람의 방식이야.`, accent: C.lavender },
        attraction ? { h: "매력 발산 방식", text: attraction, accent: C.lavender } : null,
        { h: "무너지는 순간", text: triggers.length ? triggers.join("\n") : `말보다 행동으로 보여주는 사람한테 무너져. 대놓고 표현하는 사람보다 조용히 곁에 있어주는 사람한테 더 크게 흔들려. 근데 본인도 그걸 인정하기까지 시간이 걸려. 알면서도 모르는 척하는 거야. 그리고 한번 마음 열면 주도권을 넘겨. 평소엔 누구한테도 안 그러는데, 그러니까 그 순간 상대는 못 잊어.`, accent: C.lavender },
      ].filter(Boolean),
    },
    {
      label: "연애 심화", accent: C.lavender,
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "잘 맞는 상대와\n인연이 오는 시기.",
      subtitle: "연애 심층 분석 2",
      blocks: [
        { h: "잘 맞는 상대", text: idealType ? idealType + (idealType2 ? "\n\n" + idealType2 : "") : `리드하되 강요하지 않는 사람이야. 통제받는 순간 바로 닫히는 구조라, 자연스럽게 따라가게 만드는 사람이 맞아. 그리고 내가 말 안 해도 알아채는 사람. 표현을 안 하는 게 무관심이 아니라는 걸 이해하는 사람한테만 진짜 모습이 나와.`, accent: C.lavender },
        { h: "반복되는 패턴", text: lovePattern, accent: C.lavender },
        { h: "인연이 오는 시기", text: loveTiming + (loveYears ? "\n\n" + loveYears : ""), accent: C.lavender },
        loveWarn ? { h: "주의할 점", text: loveWarn, accent: C.lavender } : null,
      ].filter(Boolean),
    },
    // 커리어 + 인간관계
    {
      label: "커리어", accent: C.caramel,
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "어떤 일을 해야\n에너지가 살아나.",
      subtitle: "커리어 심층 분석",
      blocks: [
        { h: "강점", text: careerStrength, accent: C.caramel },
        { h: "약점", text: careerWeak, accent: C.caramel },
        careerBest ? { h: "맞는 방향", text: careerBest, accent: C.caramel } : null,
        { h: "타이밍", text: careerTiming, accent: C.caramel },
        bestEnv ? { h: "맞는 환경", text: mug(bestEnv), accent: C.caramel } : null,
        recovery ? { h: "충전 방식", text: mug(recovery), accent: C.caramel } : null,
      ].filter(Boolean),
    },
    {
      label: "인간관계", accent: C.iris,
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "어떤 사람이 귀인이고\n어떤 사람이 독이야.",
      subtitle: "인간관계 심층 분석",
      blocks: [
        dayImp ? { h: "사람들이 보는 나", text: dayImp, accent: C.iris } : null,
        relStyle ? { h: "실제 속모습", text: relStyle, accent: C.iris } : null,
        { h: "귀인의 조건", text: relGuardian || `용신 방향의 에너지를 가진 사람이야. 같이 있으면 뭔가 잘 풀리고, 이유 없이 편한 사람. 그게 귀인이야. 직관적으로 느껴져. 머리로 판단하지 말고 몸이 먼저 반응하는 사람을 따라가.`, accent: C.iris },
        { h: "조심해야 할 관계", text: relPoison || `기신 방향의 에너지가 강한 사람이야. 나쁜 사람이 아닐 수 있어. 그냥 에너지가 안 맞는 거야. 가까이 있으면 이유 없이 지치고 일이 꼬여. 이런 사람을 가까이 두면 귀인이 와도 막혀. 거리를 두는 게 나를 지키는 방법이야.`, accent: C.iris },
      ].filter(Boolean),
    },
    // 대운세운 2블록
    {
      label: "대운 흐름", accent: C.iris,
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "언제 치고 나가고\n언제 버텨야 하는지.",
      subtitle: "대운 심층 분석",
      blocks: [
        { h: "지금 대운", text: daeunCurText, accent: C.iris },
        daeunDetail ? { h: "이 대운의 의미", text: daeunDetail, accent: C.iris } : null,
        { h: "다음 전환점", text: daeunNextText || `대운이 바뀌는 시점이 곧 온다는 것만 알아도 지금 준비하는 방식이 달라져. 대운 전환점 이전에 무엇을 쌓았느냐가 다음 10년을 결정해.`, accent: C.iris },
        daeunFlow ? { h: "대운 전체 흐름", text: daeunFlow, accent: C.iris } : null,
      ].filter(Boolean),
    },
    {
      label: "세운 흐름", accent: C.iris,
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "올해부터 5년\n연도별로 다 보여.",
      subtitle: "세운 심층 분석",
      blocks: [
        yearDetail ? { h: "연도별 운세", text: yearDetail, accent: C.iris } : null,
        { h: "이 시기를 쓰는 법", text: (() => {
          const isGood = yearForecast[0]?.score >= 70
          const doList = _yd["행동"] || "용신 방향의 행동을 늘려"
          const hobby = _yd["취미"] || "에너지를 채우는 활동"
          const avoid = _yd["피해야할것"] || ""
          if (isGood) return `지금이 올라타야 할 시기야. 적극적으로 치고 나가.\n\n할 것 ${doList}\n\n취미 ${hobby}로 에너지 강화\n\n피할 것 ${avoid}`
          return `지금은 버티고 쌓는 시기야. 무리하게 치고 나가면 오히려 손해야.\n\n할 것 실력을 키우고 인맥을 다져. ${doList}\n\n피할 것 ${avoid}\n\n이 시기를 잘 버티면 다음 대운이 크게 열려.`
        })(), accent: C.iris },
      ].filter(Boolean),
    },
  ]

  const chapters = [...freeChapters, ...lockedChapters]
  const freeCount = freeChapters.length
  const ch = chapters[current]

  return (
    <div style={{ background: C.void, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", padding: "14px 16px 40px", fontFamily: FONT, color: C.parchment, userSelect: "none" }}>
      <div style={{ width: "100%", maxWidth: 480, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: C.caramel, textTransform: "uppercase", fontFamily: FONT_SANS, fontWeight: 400 }}>Mora</div>
        <div style={{ fontSize: 12, color: C.ash, fontFamily: FONT_SANS, textAlign: "center", fontWeight: 400 }}>
          <div>{d.name}</div>
          <div style={{ fontSize: 10, color: C.fog }}>{d.gender}성</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {onSavePDF && <button onClick={onSavePDF} disabled={pdfLoading} style={{ background: "none", border: "none", color: pdfLoading ? C.fog : C.caramel, fontSize: 16, cursor: pdfLoading ? "default" : "pointer", padding: 0, opacity: pdfLoading ? 0.5 : 1 }}>{pdfLoading ? "⏳" : "📥"}</button>}
          <button onClick={onHome} style={{ background: "none", border: "none", color: C.caramel, fontSize: 18, cursor: "pointer", padding: 0 }}>🏠</button>
        </div>
      </div>

      <div style={{ width: "100%", maxWidth: 480, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
          {chapters.map((_, i) => (
            <div key={i} style={{ width: i === current ? 18 : 5, height: 4, borderRadius: 2, background: i >= freeCount ? C.plum : i === current ? C.caramel : C.ember, transition: "all 0.3s ease" }} />
          ))}
        </div>
        <div style={{ fontSize: 11, color: C.fog, fontFamily: FONT_SANS, fontWeight: 400 }}>{current + 1} / {chapters.length}</div>
      </div>

      <div style={{ width: "100%", maxWidth: 480, perspective: 1200, flex: 1 }}>
        <ChapterCard {...ch} flipping={flipping} flipDir={flipDir} />
      </div>

      <div style={{ width: "100%", maxWidth: 480, display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20 }}>
        <button onClick={() => goTo(-1)} disabled={current === 0} style={{ background: current === 0 ? "transparent" : C.ember, border: `1px solid ${current === 0 ? C.fog : C.walnut}`, borderRadius: 10, padding: "11px 18px", color: current === 0 ? C.fog : C.sand, fontSize: 13, cursor: current === 0 ? "default" : "pointer", fontFamily: FONT_SANS, fontWeight: 400, transition: "all 0.2s" }}>이전</button>
        <div style={{ fontSize: 10, color: C.fog, fontFamily: FONT_SANS, textAlign: "center", fontWeight: 400 }}>
          {ch.label}{current >= freeCount && <span style={{ color: C.plum }}> · 유료</span>}
        </div>
        <button onClick={() => goTo(1)} disabled={current === chapters.length - 1} style={{ background: current === chapters.length - 1 ? "transparent" : C.walnut, border: `1px solid ${current === chapters.length - 1 ? C.fog : C.caramel}`, borderRadius: 10, padding: "11px 18px", color: current === chapters.length - 1 ? C.fog : C.parchment, fontSize: 13, cursor: current === chapters.length - 1 ? "default" : "pointer", fontFamily: FONT_SANS, fontWeight: 400, transition: "all 0.2s" }}>다음</button>
      </div>

      {current === 0 && <div style={{ marginTop: 10, fontSize: 11, color: C.fog, fontFamily: FONT_SANS, letterSpacing: 1, textAlign: "center", fontWeight: 400 }}>버튼을 눌러 챕터를 넘겨봐</div>}
    </div>
  )
}
