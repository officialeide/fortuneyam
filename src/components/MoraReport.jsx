// MoraReport.jsx v7.1 — 도넛차트, 카테고리 재편, 무당체 완전 통일
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
    ["이에요.", "이야."], ["이에요,", "이야,"], ["이에요 ", "이야 "], ["이에요\n", "이야\n"],
    ["예요.", "야."], ["예요,", "야,"], ["예요 ", "야 "], ["예요\n", "야\n"],
    ["있어요.", "있어."], ["있어요,", "있어,"], ["있어요 ", "있어 "],
    ["없어요.", "없어."], ["없어요,", "없어,"], ["없어요 ", "없어 "],
    ["해요.", "해."], ["해요,", "해,"], ["해요 ", "해 "], ["해요\n", "해\n"],
    ["돼요.", "돼."], ["돼요,", "돼,"], ["돼요 ", "돼 "],
    ["가요.", "가."], ["가요,", "가,"], ["가요 ", "가 "],
    ["나요.", "나."], ["나요,", "나,"], ["나요 ", "나 "],
    ["거예요.", "거야."], ["거예요,", "거야,"], ["거예요 ", "거야 "],
    ["았어요.", "았어."], ["었어요.", "었어."], ["았어요,", "았어,"], ["었어요,", "었어,"],
    ["잖아요.", "잖아."], ["잖아요,", "잖아,"],
    ["네요.", "네."], ["네요,", "네,"], ["네요 ", "네 "],
    ["어요.", "어."], ["어요,", "어,"], ["어요 ", "어 "],
    ["아요.", "아."], ["아요,", "아,"], ["아요 ", "아 "],
    ["ㄹ게요.", "ㄹ게."], ["할게요.", "할게."], ["줄게요.", "줄게."],
    ["신약", "에너지 분산 구조"], ["신강", "에너지 집중 구조"],
    ["하세요.", "해."], ["주세요.", "줘."],
    ["해내요.", "해내."], ["느껴요.", "느껴."], ["보여요.", "보여."], ["바꿔요.", "바꿔."], ["바꿔요,", "바꿔,"], ["바꿔요 ", "바꿔 "], ["줘요.", "줘."], ["줘요,", "줘,"], ["줘요 ", "줘 "],
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
  const size = 80
  const r = 28
  const cx = size / 2
  const cy = size / 2
  const stroke = 10
  const circumference = 2 * Math.PI * r
  let offset = 0
  const segments = Object.entries(ohaeng)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => {
      const pct = v / total
      const dash = pct * circumference
      const seg = { key: k, dash, gap: circumference - dash, offset, color: OHK_COLOR[k] || "#888", pct }
      offset += dash
      return seg
    })

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
      <svg width={size} height={size} style={{ flexShrink: 0 }}>
        {segments.map(s => (
          <circle key={s.key} cx={cx} cy={cy} r={r}
            fill="none" stroke={s.color} strokeWidth={stroke}
            strokeDasharray={`${s.dash} ${s.gap}`}
            strokeDashoffset={-s.offset}
            style={{ transform: "rotate(-90deg)", transformOrigin: `${cx}px ${cy}px` }}
          />
        ))}
        <text x={cx} y={cy - 4} textAnchor="middle" fill={OHK_COLOR[dominant] || C.sand} fontSize="11" fontFamily={FONT_SANS} fontWeight="400">
          {OHK_KR[dominant] || dominant}
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill={C.ash} fontSize="9" fontFamily={FONT_SANS}>
          {ohaeng[dominant] || 0}개
        </text>
      </svg>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, color: C.parchment, lineHeight: 1.7, fontFamily: FONT, fontWeight: 400 }}>
          {OHK_DESC[dominant] || ""}
        </div>
        <div style={{ fontSize: 11, color: C.fog, marginTop: 4, fontFamily: FONT_SANS, fontWeight: 400 }}>
          {Object.entries(ohaeng).filter(([, v]) => v > 0).map(([k, v]) => `${OHK_KR[k] || k} ${v}`).join(" · ")}
        </div>
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
  const [astroAI, setAstroAI] = useState(parentAstroAI || d._astroAI || null)
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

  // 별자리 — 띠이름 완전 변환
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

  // 신살 — 한 박스, 엔터 구분, 마침표
  // 신살 — JSX로 렌더링 (이름 색상 + 설명 인라인)
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

  // 주역 — 콜론 완전 제거
  const ichingKw = (juyeokSys.key || d.iching?.bonmyeonggae || "")
    .replace(/[.:：]/g, "").replace(/[一-龯\u4E00-\u9FFF（(][^）)]*[）)]/g, "").trim()
  const ichingNature = noColon(juyeokSys.desc || d.iching?.gaeNature || "").replace(/^[\n\r]+/, "")
  const ichingStrategy = (d.iching?.strategy || []).slice(0, 2).map(noColon)
  const ichingText = `${ichingNature}${ichingStrategy.length ? "\n\n" + ichingStrategy.join(" ") : ""}`

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

  // 별자리 텍스트 — 한자 완전 제거
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
  const reomulGisin = gisinA ? `${gisinA} 기운은 돈을 새게 만들어. 이쪽으로 가면 힘만 빼는 거야.` : ""
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
  const daeunCurText = curDaeun ? `지금 ${curDaeun.label?.replace(/[一-龯\u4E00-\u9FFF（(][^）)]*[）)]/g, "").trim()} 대운이야. ${mug(curDaeun.desc || "")}` : "대운 읽는 중이야."
  const daeunNextText = nextDaeun ? `다음 대운은 ${nextDaeun.label?.replace(/[一-龯\u4E00-\u9FFF（(][^）)]*[）)]/g, "").trim()}이야. 이 전환점이 오기 전에 지금을 써야 해.` : ""
  const daeunFlow = futureDaeun.map(dv => `${dv.label?.replace(/[一-龯\u4E00-\u9FFF（(][^）)]*[）)]/g, "").trim()} ${dv.startAge || ""}세~`).join(" → ")
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
      label: "무술 — 첫 번째 해석", accent: C.caramel,
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
      label: "기해 — 두 번째 해석", accent: C.iris,
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
        { h: "주역", text: ichingText, accent: C.iris, highlight: ichingKw + " " },
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

  const lockedChapters = [
    {
      label: "재물 구조", accent: C.sand,
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "돈이 어떻게 들어오고\n어디서 새는지 다 보여.",
      subtitle: "재물 심층 분석",
      blocks: [
        { h: "구조", text: reomulStructure, accent: C.sand },
        reomulYongsin ? { h: "살길", text: reomulYongsin, accent: C.sand } : null,
        reomulGisin ? { h: "피해야 할 방향", text: reomulGisin, accent: C.sand } : null,
        reomulYear ? { h: "올해 재물", text: reomulYear, accent: C.sand } : null,
        reomulBest ? { h: "터지는 시기", text: reomulBest, accent: C.sand } : null,
        reomulFlow ? { h: "5년 흐름", text: reomulFlow, accent: C.sand } : null,
      ].filter(Boolean),
    },
    {
      label: "연애 관계", accent: C.lavender,
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "매번 같은 패턴에\n걸리는 이유가 있어.",
      subtitle: "연애 심층 분석",
      blocks: [
        desire ? { h: "속에서 원하는 것", text: desire + (desire2 ? "\n\n" + desire2 : ""), accent: C.lavender } : null,
        attraction ? { h: "매력 발산 방식", text: attraction, accent: C.lavender } : null,
        triggers.length ? { h: "무너지는 순간", text: triggers.join("\n"), accent: C.lavender } : null,
        (idealType || idealType2) ? { h: "잘 맞는 상대", text: idealType + (idealType2 ? "\n\n" + idealType2 : ""), accent: C.lavender } : null,
      ].filter(Boolean),
    },
    {
      label: "커리어", accent: C.caramel,
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "어떤 일을 해야\n에너지가 살아나.",
      subtitle: "커리어 심층 분석",
      blocks: [
        { h: "맞는 환경", text: bestEnv || "전문성이 인정받는 환경이야. 성과가 명확하게 보이는 곳.", accent: C.caramel },
        { h: "맞는 업종 방향", text: yongsinA ? `${yongsinA} 기운이 살아있는 분야가 맞아. 이 방향으로 가야 실력이 빛나.` : "용신 방향을 봐야 해.", accent: C.caramel },
        { h: "충전 방식", text: recovery || "혼자만의 시간이 필요해. 그게 다음을 위한 준비야.", accent: C.caramel },
      ],
    },
    {
      label: "인간관계", accent: C.iris,
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "어떤 사람이 귀인이고\n어떤 사람이 독이야.",
      subtitle: "인간관계 심층 분석",
      blocks: [
        dayImp ? { h: "사람들이 보는 나", text: dayImp, accent: C.iris } : null,
        dayMask ? { h: "실제 속모습", text: dayMask, accent: C.iris } : null,
        { h: "귀인의 조건", text: yongsinA ? `${yongsinA} 기운을 가진 사람이 귀인이야. 이 에너지가 나를 살려.` : "귀인 분석 중이야.", accent: C.iris },
        { h: "조심해야 할 관계", text: gisinA ? `${gisinA} 기운이 강한 사람이 에너지를 빼앗아. 가까이 하면 이유 없이 지쳐.` : "기신 방향 분석 중이야.", accent: C.iris },
      ].filter(Boolean),
    },
    {
      label: "대운 · 세운", accent: C.iris,
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "언제 치고 나가고\n언제 버텨야 하는지.",
      subtitle: "대운 · 세운 심층 분석",
      blocks: [
        { h: "지금 대운", text: daeunCurText, accent: C.iris },
        daeunNextText ? { h: "다음 전환점", text: daeunNextText, accent: C.iris } : null,
        daeunFlow ? { h: "대운 흐름", text: daeunFlow, accent: C.iris } : null,
        yearFlowText ? { h: "연도별 흐름", text: yearFlowText, accent: C.iris } : null,
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
