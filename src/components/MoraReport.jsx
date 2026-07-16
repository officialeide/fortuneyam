// MoraReport.jsx v6
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

const OHK = { 목: "나무", 화: "불", 토: "흙", 금: "쇠", 수: "물" }

function clean(s) {
  if (!s) return ""
  return cleanText(s)
    .replace(/[（(][一-龯\u4E00-\u9FFF\uAC00-\uD7A3 ]+[）)]/g, "")
    .replace(/[一-龯\u4E00-\u9FFF]{2,}/g, "")
    .replace(/[.:：]\s*/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim()
}

function mug(s) {
  if (!s) return ""
  let t = clean(s)
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
    ["신약(身弱)", "에너지 분산 구조"], ["신강(身强)", "에너지 집중 구조"],
    ["신약", "에너지 분산 구조"], ["신강", "에너지 집중 구조"],
    ["하세요.", "해."], ["주세요.", "줘."],
    ["해내요.", "해내."], ["해낼 수 있어요.", "해낼 수 있어."],
  ]
  for (const [o, n] of r) t = t.split(o).join(n)
  return t
}

// 좌리 없이 콜론 완전 제거
function noColon(s) {
  if (!s) return ""
  return mug(s).replace(/[：:]\s*/g, " ").trim()
}

const FONT = "'Nanum Myeongjo', 'Noto Serif KR', Georgia, serif"
const FONT_SANS = "'Nanum Gothic', 'Apple SD Gothic Neo', sans-serif"
const txt = { fontSize: 14, color: C.parchment, lineHeight: 1.9, fontWeight: 400, fontFamily: FONT }
const hdg = (a) => ({ fontSize: 9, letterSpacing: 3, color: a, textTransform: "uppercase", fontFamily: FONT_SANS, marginBottom: 8, fontWeight: 400 })
const dvd = { borderBottom: `1px solid ${C.ember}`, marginBottom: 20, paddingBottom: 20 }

function Block({ h, text, accent, last, highlight }) {
  return (
    <div style={last ? {} : dvd}>
      {h && <div style={hdg(accent)}>{h}</div>}
      {highlight && <span style={{ color: C.sand, fontSize: 15, fontFamily: FONT, fontWeight: 400 }}>{highlight} </span>}
      <div style={txt}>{text}</div>
    </div>
  )
}

function ChapterCard({ num, label, tag, tagColor, tagText, accent, title, subtitle, blocks, flipping, flipDir }) {
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
        {blocks.map((b, i) => <Block key={i} {...b} last={i === blocks.length - 1} />)}
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

  // 데이터 추출
  const bnd = d.boundary
  const isBnd = bnd?.isBoundary
  const ss = d.summary?.sixSystems || []
  const sajuSys = ss.find(s => s.system === "사주") || {}
  const tojungSys = ss.find(s => s.system === "토정비결") || {}
  const juyeokSys = ss.find(s => s.system === "주역") || {}
  const tarotSys = ss.find(s => s.system === "타로수비학") || {}
  const mbtiSys = ss.find(s => s.system === "MBTI") || {}
  const dansajuSys = ss.find(s => s.system === "당사주") || {}
  const a = astroAI || d.astro || {}
  const t = d.tarot || {}
  const dn = d.daynight || {}
  const night = dn.night || {}

  // 오행 분포
  const ohaeng = d.ohaengDist || {}
  const ohaengText = Object.entries(ohaeng)
    .filter(([,v]) => v > 0)
    .map(([k, v]) => `${OHK[k] || k} ${v}개`)
    .join(" · ") || ""
  const singang = d.singang || ""
  const isSingang = singang.includes("강")
  const yongsinA = d.yongsinA || ""

  // 별자리 — 한자/띠이름 변환
  const zodiacMap = {
    "쥐자리": "양자리", "소자리": "황소자리", "범자리": "쌍둥이자리",
    "토끼자리": "게자리", "용자리": "사자자리", "뱀자리": "처녀자리",
    "말자리": "천칭자리", "양자리(미)": "전갈자리", "원숭이자리": "사수자리",
    "닭자리": "염소자리", "개자리": "물병자리", "돼지자리": "물고기자리",
  }
  function fixSign(s) {
    if (!s) return ""
    const c = clean(s)
    return zodiacMap[c] || c
  }

  const sunSign = a.sun && a.sun !== "분석 중" ? fixSign(a.sun) : null
  const moonSign = a.moon && a.moon !== "분석 중" ? fixSign(a.moon) : null
  const ascSign = a.asc && a.asc !== "분석 중" ? fixSign(a.asc) : null

  // 신살 — 한 박스에 엔터 구분
  const sinsalText = d.sinsal?.length
    ? d.sinsal.map(s => {
        const nm = s.name.replace(/\([^)]*\)/g, "").trim()
        const kw = s.kw ? ` ${s.kw}` : ""
        return `${nm}${kw}`
      }).join("\n")
    : "특별한 신살 없어. 안정적인 구조야. 튀지 않는 대신 오래 가."

  // 토정비결 — highlight로 앞에 색상 강조
  const tojungKw = clean(tojungSys.key || d.tojung?.saja || "")
  const tojungDesc = noColon(tojungSys.desc || d.tojung?.sajaDesc || "")

  // 주역 — 콜론 완전 제거
  const ichingKw = clean(juyeokSys.key || d.iching?.bonmyeonggae || "")
    .replace(/[.:：]/g, "").trim()
  const ichingNature = noColon(juyeokSys.desc || d.iching?.gaeNature || "")
  const ichingStrategy = (d.iching?.strategy || []).slice(0, 2)
  const ichingText = `${ichingNature}${ichingStrategy.length ? "\n\n" + noColon(ichingStrategy.join(" ")) : ""}`

  // 일주 설명
  const iljuDescStd = mug(isBnd ? bnd.standardDesc : (sajuSys.desc || ""))
  const iljuDescMid = mug(bnd?.midnightDesc || "")

  // 당사주
  const dansajuPillars = d.dansaju?.pillars || []
  const dansajuText = (() => {
    if (!dansajuPillars.length) return mug(dansajuSys.desc || "")
    const stars = dansajuPillars.map(p => p.byeolseong?.split("(")[0].replace(/\([^)]*\)/g, "").trim() || "").filter(Boolean)
    const kws = dansajuPillars.map(p => p.kw || "").filter(Boolean)
    return `별이 네 개야. ${stars.join(", ")} 순서로 흘러가. ${kws.slice(0, 2).join("과 ")}의 기운이 삶의 뼈대를 만드네.`
  })()

  // 별자리 텍스트
  const astroSunText = sunSign
    ? mug(`${clean(a.sunDesc || a.triangle || "")}`)
    : "별자리 분석 불러오는 중이야."
  const astroMoonText = moonSign
    ? mug(`${clean(a.moonDesc || "")}`)
    : "잠시 후 나타나."

  // 타로
  const tarotLifeText = mug(t.lifePathDesc || tarotSys.desc || "")
  const tarotSoulText = mug(tarotAI?.soulDesc || t.soulDesc || "")
  const tarotCardName = (t.lifePathCard || "본명 카드").replace(/\([^)]*\)/g, "").trim()

  // MBTI
  const mbtiText = mug(mbtiSys.desc || d.mbti?.basis || "")
  const mbtiStrengths = (d.mbti?.strengths || []).map(mug).filter(Boolean).slice(0, 2)
  const mbtiChallenges = (d.mbti?.challenges || []).map(mug).filter(Boolean).slice(0, 1)

  // 재물 — 실제 데이터 기반
  const yearForecast = d.summary?.yearForecast || []
  const thisYear = yearForecast[0] || {}
  const nextYears = yearForecast.slice(1, 4)
  const jaemuScore = thisYear?.areas?.재물 || 0
  const bestYear = [...yearForecast].sort((a, b) => (b.areas?.재물 || 0) - (a.areas?.재물 || 0))[0]
  const reomulStructure = isSingang
    ? `에너지가 집중된 구조야. 돈 잡으면 오래 쥐고 있어. 근데 욕심이 화근이야. 한 번에 다 가지려다 날리는 패턴, 이미 경험했지?`
    : `에너지가 분산된 구조야. 돈이 들어와도 손에 안 남아. 구조가 그래. 네 잘못이 아닌데, 이 패턴 모르면 평생 반복돼.`
  const reomulYongsin = yongsinA
    ? `살길은 ${yongsinA} 기운이야. 이 방향으로 가야 돈이 따라와. 거슬러 가면 아무리 열심히 해도 제자리야.`
    : ""
  const reomulYear = jaemuScore
    ? `올해 재물 흐름 ${jaemuScore}점이야. ${mug(thisYear.summary || "")}`
    : ""
  const reomulBest = bestYear && bestYear.year !== thisYear.year
    ? `향후 5년 중 ${bestYear.year}년이 재물 흐름이 제일 강해. 그때를 노려야 해.`
    : ""
  const reomulFlow = nextYears.map(y => `${y.year}년 재물 ${y.areas?.재물 || ""}점`).join(" · ")

  // 연애 — 실제 데이터
  const desire = mug(night.desire || "")
  const desire2 = mug(night.desire2 || "")
  const attraction = mug(night.attraction || "")
  const idealType = mug(night.idealType || "")
  const idealType2 = mug(night.idealType2 || "")
  const triggers = (night.triggers || []).map(mug).filter(Boolean)

  // 대운
  const daeun = d.daeun || []
  const curDaeun = daeun.find(dv => dv.cur) || daeun[0]
  const nextDaeun = daeun[daeun.indexOf(curDaeun) + 1]
  const futureDaeun = daeun.filter(dv => !dv.cur).slice(0, 3)
  const daeunCurText = curDaeun
    ? `지금 ${clean(curDaeun.label)} 대운이야. ${mug(curDaeun.desc || "")}`
    : "대운 읽는 중이야."
  const daeunNextText = nextDaeun
    ? `다음 대운은 ${clean(nextDaeun.label)}이야. 이 전환점이 오기 전에 지금을 써야 해.`
    : ""
  const daeunFlowText = futureDaeun.length
    ? futureDaeun.map(dv => `${clean(dv.label)} 대운 ${dv.startAge || ""}세~`).join(" → ")
    : ""

  const sajuTag = (sajuSys.key || "").replace(/[（(][一-龯\u4E00-\u9FFF]+[）)]/g, "").trim()

  // 챕터 구성
  const bndChapters = isBnd ? [
    {
      num: "序", label: "경계의 사주", accent: C.iris,
      tag: "경계 사주", tagColor: C.plum, tagText: C.lavender,
      title: "넌 특별한 사주야.",
      subtitle: "두 기운을 동시에 품고 태어났어.",
      blocks: [
        { h: "두 기운을 동시에", text: "태어난 시간이 자정 경계에 걸쳐 있어. 어떤 학파는 한쪽, 어떤 학파는 다른 쪽으로 읽어. 틀린 게 아니야. 두 기운을 동시에 품고 태어난 거야.", accent: C.iris },
        { h: "어느 쪽이 맞을까", text: "둘 다 읽어봐. 어느 쪽이 더 내 얘기처럼 느껴지는지 본인이 제일 잘 알아. 둘 다 맞는 경우도 있어. 그게 경계 사주야.", accent: C.iris },
      ],
    },
    {
      num: "序A", label: "무술 — 첫 번째 해석", accent: C.caramel,
      tag: "무술", tagColor: C.mahogany, tagText: C.sand,
      title: "흙 위에 흙.\n버티는 게 무기인 사람이야.",
      subtitle: "사주 · 오행 분포",
      blocks: [
        { h: "일주 본질", text: iljuDescStd || "흙 위에 흙이 쌓인 구조야. 산이 두 개야, 이 사람은.", accent: C.caramel },
        { h: "타고난 에너지", text: sinsalText, accent: C.caramel },
        { h: "오행 분포", text: `${ohaengText}\n\n${isSingang ? "에너지가 집중된 구조야. 강한 만큼 혼자 다 짊어지려는 경향이 있어." : "에너지가 분산된 구조야. 외부 영향을 많이 받아. 환경이 중요해."}`, accent: C.caramel },
      ],
    },
    {
      num: "序B", label: "기해 — 두 번째 해석", accent: C.iris,
      tag: "기해", tagColor: C.abyss, tagText: C.lavender,
      title: "흙 아래 물.\n겉이랑 속이 달라.",
      subtitle: "사주 · 오행 분포",
      blocks: [
        { h: "일주 본질", text: iljuDescMid || "부드러운 흙 아래 깊은 물이 흐르는 구조야. 겉으로는 온화한데 속은 끊임없이 감지하고 곱씹고 있어.", accent: C.iris },
        { h: "타고난 에너지", text: sinsalText, accent: C.iris },
        { h: "오행 분포", text: `${ohaengText}\n\n포용력이 강한 만큼 혼자 삭이는 것도 많아. 감정을 안으로 담는 구조야.`, accent: C.iris },
      ],
    },
  ] : [
    {
      num: "I", label: "일주 본질", accent: C.caramel,
      tag: sajuTag, tagColor: C.mahogany, tagText: C.sand,
      title: `${sajuTag}.\n태어날 때부터 이렇게 설계됐어.`,
      subtitle: "사주 · 오행 분포",
      blocks: [
        { h: "본질", text: iljuDescStd || "분석 중이야.", accent: C.caramel },
        { h: "타고난 에너지", text: sinsalText, accent: C.caramel },
        { h: "오행 분포", text: `${ohaengText}\n\n${isSingang ? "에너지가 집중된 구조야. 강한 만큼 혼자 다 짊어지려는 경향이 있어." : "에너지가 분산된 구조야. 외부 영향을 많이 받아. 환경이 중요해."}`, accent: C.caramel },
      ],
    },
  ]

  const midChapters = [
    {
      num: isBnd ? "一" : "II", label: "내면 구조", accent: C.iris,
      tag: clean(tojungKw), tagColor: C.abyss, tagText: C.lavender,
      title: "겉으로 보이는 게 전부가 아니야.",
      subtitle: "당사주 · 토정비결 · 주역",
      blocks: [
        { h: "당사주", text: dansajuText, accent: C.iris },
        { h: "토정비결", text: tojungDesc, accent: C.iris, highlight: tojungKw },
        { h: "주역", text: ichingText, accent: C.iris, highlight: ichingKw },
      ],
    },
    {
      num: isBnd ? "二" : "III", label: "하늘의 설계", accent: C.lavender,
      tag: "별자리", tagColor: C.plum, tagText: C.lavender,
      title: "태어난 순간 별들이\n이미 다 정해놨어.",
      subtitle: "별자리 네이탈",
      blocks: loadingAstro
        ? [{ h: "분석 중", text: "모라가 별자리를 읽고 있어. 잠깐만 기다려.", accent: C.lavender }]
        : [
          { h: `태양 ${sunSign || ""}`, text: astroSunText, accent: C.lavender },
          { h: `달 ${moonSign || ""} · 상승 ${ascSign || ""}`, text: astroMoonText, accent: C.lavender },
          ...(a.stellium ? [{ h: "집중 에너지", text: mug(clean(a.stellium)), accent: C.lavender }] : []),
        ],
    },
    {
      num: isBnd ? "三" : "IV", label: "타고난 에너지", accent: C.sand,
      tag: `생명경로수 ${t.lifePath || ""}`, tagColor: C.mahogany, tagText: C.sand,
      title: "숫자 하나가 삶 전체를\n관통하고 있어.",
      subtitle: "타로수비학",
      blocks: [
        { h: `생명경로수 ${t.lifePath || ""}`, text: tarotLifeText || "분석 중이야.", accent: C.sand },
        { h: tarotCardName, text: tarotSoulText || "분석 중이야.", accent: C.sand },
      ],
    },
    {
      num: isBnd ? "四" : "V", label: "성향", accent: C.caramel,
      tag: mbtiSys.key || "", tagColor: C.walnut, tagText: C.parchment,
      title: `${mbtiSys.key || "MBTI"}.\n한 줄로 이렇게 설명돼.`,
      subtitle: "MBTI 사주 교차 분석",
      blocks: [
        { h: "기질", text: mbtiText || "분석 중이야.", accent: C.caramel },
        ...(mbtiStrengths.length ? [{ h: "잘하는 것", text: mbtiStrengths.join("\n"), accent: C.caramel }] : []),
        ...(mbtiChallenges.length ? [{ h: "발목 잡히는 것", text: mbtiChallenges.join("\n"), accent: C.caramel }] : []),
      ],
    },
  ]

  const lockedChapters = [
    {
      num: "VI", label: "재물 구조", accent: C.sand,
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "돈이 어떻게 들어오고\n어디서 새는지 다 보여.",
      subtitle: "재물 심층 분석",
      blocks: [
        { h: "돈의 구조", text: reomulStructure, accent: C.sand },
        ...(reomulYongsin ? [{ h: "살길", text: reomulYongsin, accent: C.sand }] : []),
        { h: "올해 재물 흐름", text: reomulYear || "올해 흐름이 읽혔어.", accent: C.sand },
        ...(reomulBest ? [{ h: "터지는 시기", text: reomulBest, accent: C.sand }] : []),
        ...(reomulFlow ? [{ h: "향후 3년 흐름", text: reomulFlow, accent: C.sand }] : []),
      ],
    },
    {
      num: "VII", label: "연애 관계", accent: C.lavender,
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "매번 같은 패턴에\n걸리는 이유가 있어.",
      subtitle: "연애 심층 분석",
      blocks: [
        ...(desire ? [{ h: "속에서 원하는 것", text: desire + (desire2 ? "\n" + desire2 : ""), accent: C.lavender }] : []),
        ...(attraction ? [{ h: "끌리는 순간", text: attraction, accent: C.lavender }] : []),
        ...(triggers.length ? [{ h: "무너지는 포인트", text: triggers.join("\n"), accent: C.lavender }] : []),
        { h: "잘 맞는 상대", text: idealType + (idealType2 ? "\n" + idealType2 : "") || "사주에 이미 찍혀 있어.", accent: C.lavender },
      ],
    },
    {
      num: "VIII", label: "운명 흐름", accent: C.iris,
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "언제 치고 나가고\n언제 버텨야 하는지.",
      subtitle: "대운 · 세운 심층 분석",
      blocks: [
        { h: "지금 대운", text: daeunCurText, accent: C.iris },
        ...(daeunNextText ? [{ h: "다음 전환점", text: daeunNextText, accent: C.iris }] : []),
        ...(daeunFlowText ? [{ h: "앞으로의 대운 흐름", text: daeunFlowText, accent: C.iris }] : []),
        { h: "연도별 흐름", text: yearForecast.slice(0, 4).map(y => `${y.year}년 ${y.score}점 ${mug(y.summary || "")}`).join("\n"), accent: C.iris },
      ],
    },
    {
      num: "IX", label: "손금 관상", accent: C.ash,
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "얼굴과 손이\n사주를 확인해줘.",
      subtitle: "관상 · 손금 분석",
      blocks: [
        { h: "관상", text: "얼굴에 사주가 드러나 있어. 어떤 기운이 가장 강하게 나오는지 읽어줄게.", accent: C.ash },
        { h: "손금", text: "생명선, 감정선, 운명선. 사주랑 교차하면 더 정확해.", accent: C.ash },
        { h: "이미지 업로드", text: "사진 올려줘. 직접 봐야 읽히는 게 있어.", accent: C.ash },
      ],
    },
  ]

  const chapters = [...bndChapters, ...midChapters, ...lockedChapters]
  const freeCount = bndChapters.length + midChapters.length
  const ch = chapters[current]

  return (
    <div style={{ background: C.void, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", padding: "14px 16px 40px", fontFamily: FONT, color: C.parchment, userSelect: "none" }}>
      {/* 헤더 */}
      <div style={{ width: "100%", maxWidth: 480, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: C.caramel, textTransform: "uppercase", fontFamily: FONT_SANS, fontWeight: 400 }}>Mora</div>
        <div style={{ fontSize: 12, color: C.ash, fontFamily: FONT_SANS, textAlign: "center", fontWeight: 400 }}>
          <div>{d.name}</div>
          <div style={{ fontSize: 10, color: C.fog }}>{d.gender}성</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {onSavePDF && (
            <button onClick={onSavePDF} disabled={pdfLoading} style={{ background: "none", border: "none", color: pdfLoading ? C.fog : C.caramel, fontSize: 16, cursor: pdfLoading ? "default" : "pointer", padding: 0, opacity: pdfLoading ? 0.5 : 1 }} title="저장">
              {pdfLoading ? "⏳" : "📥"}
            </button>
          )}
          <button onClick={onHome} style={{ background: "none", border: "none", color: C.caramel, fontSize: 18, cursor: "pointer", padding: 0 }}>🏠</button>
        </div>
      </div>

      {/* 진행 표시 */}
      <div style={{ width: "100%", maxWidth: 480, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
          {chapters.map((_, i) => (
            <div key={i} style={{ width: i === current ? 18 : 5, height: 4, borderRadius: 2, background: i >= freeCount ? C.plum : i === current ? C.caramel : C.ember, transition: "all 0.3s ease" }} />
          ))}
        </div>
        <div style={{ fontSize: 11, color: C.fog, fontFamily: FONT_SANS, fontWeight: 400 }}>{current + 1} / {chapters.length}</div>
      </div>

      {/* 카드 */}
      <div style={{ width: "100%", maxWidth: 480, perspective: 1200, flex: 1 }}>
        <ChapterCard {...ch} flipping={flipping} flipDir={flipDir} />
      </div>

      {/* 네비게이션 */}
      <div style={{ width: "100%", maxWidth: 480, display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20 }}>
        <button onClick={() => goTo(-1)} disabled={current === 0} style={{ background: current === 0 ? "transparent" : C.ember, border: `1px solid ${current === 0 ? C.fog : C.walnut}`, borderRadius: 10, padding: "11px 18px", color: current === 0 ? C.fog : C.sand, fontSize: 13, cursor: current === 0 ? "default" : "pointer", fontFamily: FONT_SANS, fontWeight: 400, transition: "all 0.2s" }}>이전</button>

        <div style={{ fontSize: 10, color: C.fog, fontFamily: FONT_SANS, textAlign: "center", fontWeight: 400 }}>
          {ch.label}
          {current >= freeCount && <span style={{ color: C.plum }}> · 유료</span>}
        </div>

        <button onClick={() => goTo(1)} disabled={current === chapters.length - 1} style={{ background: current === chapters.length - 1 ? "transparent" : C.walnut, border: `1px solid ${current === chapters.length - 1 ? C.fog : C.caramel}`, borderRadius: 10, padding: "11px 18px", color: current === chapters.length - 1 ? C.fog : C.parchment, fontSize: 13, cursor: current === chapters.length - 1 ? "default" : "pointer", fontFamily: FONT_SANS, fontWeight: 400, transition: "all 0.2s" }}>다음</button>
      </div>

      {current === 0 && (
        <div style={{ marginTop: 10, fontSize: 11, color: C.fog, fontFamily: FONT_SANS, letterSpacing: 1, textAlign: "center", fontWeight: 400 }}>버튼을 눌러 챕터를 넘겨봐</div>
      )}
    </div>
  )
}
