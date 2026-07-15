// MoraReport.jsx v3 — 날카로운 무당체
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

// 한자 제거 + ~에요 → 무당체 변환
function clean(s) {
  if (!s) return ""
  return cleanText(s)
    .replace(/[（(][一-龯\u4E00-\u9FFF]+[）)]/g, "")
    .replace(/[一-龯\u4E00-\u9FFF]{2,}/g, "")
    .replace(/\s{2,}/g, " ")
    .trim()
}

function mugdang(s) {
  if (!s) return ""
  const t = clean(s)
  const r = [
    ["이에요.", "이야."], ["이에요,", "이야,"], ["이에요 ", "이야 "], ["이에요\n", "이야\n"],
    ["예요.", "야."], ["예요,", "야,"], ["예요 ", "야 "], ["예요\n", "야\n"],
    ["있어요.", "있어."], ["있어요,", "있어,"], ["있어요 ", "있어 "], ["있어요\n", "있어\n"],
    ["없어요.", "없어."], ["없어요,", "없어,"], ["없어요 ", "없어 "],
    ["해요.", "해."], ["해요,", "해,"], ["해요 ", "해 "], ["해요\n", "해\n"],
    ["돼요.", "돼."], ["돼요,", "돼,"], ["돼요 ", "돼 "],
    ["가요.", "가."], ["가요,", "가,"], ["가요 ", "가 "],
    ["나요.", "나."], ["나요,", "나,"], ["나요 ", "나 "],
    ["거예요.", "거야."], ["거예요,", "거야,"], ["거예요 ", "거야 "],
    ["았어요.", "았어."], ["었어요.", "었어."], ["았어요,", "았어,"], ["었어요,", "었어,"],
    ["았어요 ", "았어 "], ["었어요 ", "었어 "],
    ["잖아요.", "잖아."], ["잖아요,", "잖아,"], ["잖아요 ", "잖아 "],
    ["네요.", "네."], ["네요,", "네,"], ["네요 ", "네 "],
    ["어요.", "어."], ["어요,", "어,"], ["어요 ", "어 "],
    ["아요.", "아."], ["아요,", "아,"], ["아요 ", "아 "],
    ["ㄹ게요.", "ㄹ게."], ["할게요.", "할게."], ["줄게요.", "줄게."],
    ["신약(身弱)", "몸이 약한 구조"], ["신강(身强)", "몸이 강한 구조"],
    ["신약", "에너지가 분산된 구조"], ["신강", "에너지가 집중된 구조"],
  ]
  let res = t
  for (const [o, n] of r) res = res.split(o).join(n)
  return res
}

const txt = { fontSize: 14, color: C.parchment, lineHeight: 1.85, fontWeight: 400, fontFamily: "Georgia, serif" }
const hdg = (a) => ({ fontSize: 10, letterSpacing: 3, color: a, textTransform: "uppercase", fontFamily: "sans-serif", marginBottom: 8 })
const dvd = { borderBottom: `1px solid ${C.ember}`, marginBottom: 20, paddingBottom: 20 }

function Block({ h, text, accent, last }) {
  return (
    <div style={last ? {} : dvd}>
      <div style={hdg(accent)}>{h}</div>
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
          <div style={{ fontSize: 10, letterSpacing: 4, color: accent, textTransform: "uppercase", fontFamily: "sans-serif" }}>{label}</div>
          {tag && <div style={{ background: tagColor, borderRadius: 20, padding: "3px 10px", fontSize: 11, color: tagText, fontFamily: "sans-serif" }}>{tag}</div>}
        </div>
        <div style={{ fontSize: 28, color: C.sand, marginBottom: 4, fontWeight: 400, opacity: 0.35, fontFamily: "Georgia, serif" }}>{num}</div>
        <div style={{ fontSize: 18, color: C.parchment, lineHeight: 1.55, whiteSpace: "pre-line", fontWeight: 400, fontFamily: "Georgia, serif" }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11, color: C.ash, marginTop: 6, fontFamily: "sans-serif", letterSpacing: 0.5 }}>{subtitle}</div>}
      </div>
      <div style={{ padding: "20px 24px 24px" }}>
        {blocks.map((b, i) => <Block key={i} h={b.h} text={b.text} accent={accent} last={i === blocks.length - 1} />)}
      </div>
    </div>
  )
}

function LockedCard({ num, label, title, blocks }) {
  return (
    <div style={{ background: C.dusk, border: `1px solid ${C.mahogany}`, borderRadius: 16, overflow: "hidden", minHeight: 480 }}>
      <div style={{ background: `linear-gradient(135deg, ${C.mahogany} 0%, ${C.abyss} 100%)`, padding: "24px 24px 18px", borderBottom: `1px solid ${C.ember}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ fontSize: 10, letterSpacing: 4, color: C.caramel, textTransform: "uppercase", fontFamily: "sans-serif" }}>{label}</div>
          <div style={{ background: C.plum, borderRadius: 20, padding: "3px 10px", fontSize: 11, color: C.lavender, fontFamily: "sans-serif" }}>유료</div>
        </div>
        <div style={{ fontSize: 28, color: C.sand, marginBottom: 4, fontWeight: 400, opacity: 0.35, fontFamily: "Georgia, serif" }}>{num}</div>
        <div style={{ fontSize: 18, color: C.parchment, lineHeight: 1.55, whiteSpace: "pre-line", fontWeight: 400, fontFamily: "Georgia, serif" }}>{title}</div>
      </div>
      <div style={{ padding: "20px 24px 24px", position: "relative" }}>
        {blocks.map((b, i) => (
          <div key={i} style={{ ...(i < blocks.length - 1 ? dvd : {}), filter: "blur(4px)", userSelect: "none", pointerEvents: "none" }}>
            <div style={hdg(C.caramel)}>{b.h}</div>
            <div style={txt}>{b.text}</div>
          </div>
        ))}
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          background: "rgba(13,10,15,0.6)", borderRadius: "0 0 16px 16px",
        }}>
          <div style={{ fontSize: 13, color: C.lavender, marginBottom: 16, fontFamily: "sans-serif", textAlign: "center", lineHeight: 1.7 }}>
            이 챕터는 유료야.
          </div>
          <button onClick={() => alert("곧 열려.")} style={{
            background: C.walnut, border: `1px solid ${C.caramel}`,
            borderRadius: 8, padding: "12px 28px", color: C.parchment,
            fontSize: 13, cursor: "pointer", fontFamily: "sans-serif", letterSpacing: 1,
          }}>
            열어보기
          </button>
        </div>
      </div>
    </div>
  )
}

export default function MoraReport({ d, onHome, parentAstroAI, setParentAstroAI, parentTarotAI, setParentTarotAI }) {
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

  const sunSign = a.sun && a.sun !== "분석 중" ? a.sun : null
  const moonSign = a.moon && a.moon !== "분석 중" ? a.moon : null
  const ascSign = a.asc && a.asc !== "분석 중" ? a.asc : null

  // 주역 콜론/온점 정리
  const ichingName = (juyeokSys.key || d.iching?.bonmyeonggae || "").replace(/[.:：]/g, "").trim()
  const ichingNature = (juyeokSys.desc || d.iching?.gaeNature || "").replace(/^\./, "").trim()
  const ichingDesc = d.iching?.gaeDesc || ""
  const ichingStrategy = d.iching?.strategy || []
  const dansajuPillars = d.dansaju?.pillars || []

  // 신살 — 천을귀인\n문창귀인 형식
  const sinsalText = d.sinsal?.length
    ? d.sinsal.map(s => {
        const nm = s.name.replace(/\([^)]*\)/g, "").trim()
        const kw = s.kw || ""
        return `${nm}${kw ? ` — ${kw}` : ""}`
      }).join("\n")
    : "특별한 신살 없이 안정적인 구조네. 튀지 않는 대신 오래 가."

  // 일주 설명 한자 제거 + 무당체
  const iljuDesc = mugdang(isBnd ? bnd.standardDesc : (sajuSys.desc || ""))

  // 당사주 설명
  const dansajuText = (() => {
    if (!dansajuPillars.length) return mugdang(dansajuSys.desc || "")
    const stars = dansajuPillars.map(p => p.byeolseong?.split("(")[0].replace(/\([^)]*\)/g, "").trim() || "").filter(Boolean)
    const kws = dansajuPillars.map(p => p.kw || "").filter(Boolean)
    return `타고난 별의 흐름이야. ${stars.join(", ")} 순서로 흘러가. ${kws.slice(0,2).join("과 ")}의 기운이 삶의 뼈대를 만드네.`
  })()

  // 주역 텍스트
  const ichingText = (() => {
    const base = `${ichingName} ${ichingNature}`
    const desc = ichingDesc ? ` ${mugdang(ichingDesc).slice(0, 120)}` : ""
    const strat = ichingStrategy.length ? `\n\n지금 이 시기에 맞는 방향 — ${mugdang(ichingStrategy.slice(0,2).join(". "))}` : ""
    return base + desc + strat
  })()

  // 별자리 텍스트 (한자 제거)
  const astroSunText = sunSign
    ? mugdang(`태양이 ${clean(sunSign)}에 있어. ${clean(a.sunDesc || a.triangle || "")}`)
    : "별자리 분석을 불러오는 중이야."
  const astroMoonText = moonSign
    ? mugdang(`달이 ${clean(moonSign)}, 상승궁이 ${clean(ascSign || "")}에 자리 잡고 있어. ${clean(a.moonDesc || "")}`)
    : "잠시 후 나타나."

  // 타로 텍스트
  const tarotLifeText = mugdang(t.lifePathDesc || tarotSys.desc || "분석 중")
  const tarotSoulText = mugdang(tarotAI?.soulDesc || t.soulDesc || "분석 중")

  // MBTI 텍스트
  const mbtiText = mugdang(mbtiSys.desc || "분석 중")
  const mbtiSajuText = mugdang(d.mbti?.basis || d.summary?.persona?.charPhrase || "사주 오행과 MBTI가 교차 분석된 결과야.")

  // 재물 유료 미리보기 텍스트
  const yongsinA = d.yongsinA || ""
  const singang = d.singang || ""
  const sangBl = mugdang(`${yongsinA ? yongsinA + " 기운이 살길이야." : ""} ${singang.includes("약") ? "에너지가 분산된 구조라 돈을 벌어도 손에 잘 안 남아." : "에너지가 집중돼 있어서 돈을 잡으면 오래 쥐고 있어."}`.trim())
  const reomulBl = mugdang(d.summary?.yearForecast?.[0]?.areas?.재물 ? `올해 재물 흐름 ${d.summary.yearForecast[0].areas.재물}점이야. ${d.summary.yearForecast[0].summary || ""}` : "재물 흐름이 읽혔어.")

  // 연애 미리보기
  const nightData = d.summary?.sixSystems || []
  const loveText = mugdang(d.boundary?.standardDesc ? `관계에서 반복되는 패턴이 있어. 알면 피할 수 있는데, 모르면 또 그 사람 만나.` : "관계 패턴이 읽혔어.")

  // 운명 흐름 미리보기
  const daeun = d.daeun || []
  const curDaeun = daeun.find(dv => dv.cur)
  const daeunText = curDaeun ? mugdang(`지금 ${curDaeun.label} 대운이야. 이 흐름이 언제 바뀌는지, 어떻게 올라타야 하는지 다 나와.`) : "대운 흐름이 읽혔어."

  const freeChapters = [
    ...(isBnd ? [{
      type: "free",
      num: "序", label: "경계의 사주", accent: C.iris,
      tag: "경계 사주", tagColor: C.plum, tagText: C.lavender,
      title: "넌 특별한 사주야.",
      subtitle: "두 가지 기운을 동시에 품고 태어났어.",
      blocks: [
        { h: "두 기운을 동시에", text: "태어난 시간이 자정 경계에 걸쳐 있어. 어떤 학파는 한쪽으로, 어떤 학파는 다른 쪽으로 읽어. 틀린 게 아니야. 두 기운을 동시에 품고 태어났다는 뜻이야." },
        { h: "공통된 흐름", text: "두 기운 모두 겉으로 드러내지 않고 속으로 깊이 담는 타입이야. 조용해 보이는데 속은 훨씬 복잡하고, 한번 마음 열면 완전히 달라지지." },
        { h: "어느 쪽이 맞을까", text: "둘 다 읽어봐. 어느 쪽이 더 내 얘기처럼 느껴지는지 본인이 제일 잘 알아. 아니면 둘 다 맞는 경우도 있어. 그게 경계 사주의 특징이야." },
      ],
    }] : []),
    {
      type: "free",
      num: "I", label: "일주 본질", accent: C.caramel,
      tag: (sajuSys.key || "").replace(/\([^)]*\)/g, "").trim(),
      tagColor: C.mahogany, tagText: C.sand,
      title: `${(sajuSys.key || "").replace(/\([^)]*\)/g, "").trim()}.\n태어날 때부터 이렇게 설계됐어.`,
      subtitle: "사주",
      blocks: [
        { h: "본질", text: iljuDesc || "분석 중이야." },
        { h: "타고난 에너지", text: sinsalText },
        { h: "당사주", text: dansajuText },
      ],
    },
    {
      type: "free",
      num: "II", label: "내면 구조", accent: C.iris,
      tag: (tojungSys.key || "").replace(/[（(][一-龯\u4E00-\u9FFF]+[）)]/g, "").trim(),
      tagColor: C.abyss, tagText: C.lavender,
      title: "겉으로 보이는 게 전부가 아니야.",
      subtitle: "토정비결 · 주역",
      blocks: [
        { h: "올해의 흐름", text: mugdang(`${clean(tojungSys.key || "")} ${clean(tojungSys.desc || "")}`) },
        { h: "삶의 구조", text: ichingText },
      ],
    },
    {
      type: "free",
      num: "III", label: "하늘의 설계", accent: C.lavender,
      tag: "별자리", tagColor: C.plum, tagText: C.lavender,
      title: "태어난 순간 별들이\n이미 다 정해놨어.",
      subtitle: "별자리 네이탈",
      blocks: loadingAstro
        ? [{ h: "분석 중", text: "모라가 별자리를 읽고 있어. 잠깐만 기다려." }]
        : [
          { h: `태양 ${clean(sunSign || "")}`, text: astroSunText },
          { h: `달 ${clean(moonSign || "")} · 상승 ${clean(ascSign || "")}`, text: astroMoonText },
          ...(a.stellium ? [{ h: "집중 에너지", text: mugdang(clean(a.stellium)) }] : []),
        ],
    },
    {
      type: "free",
      num: "IV", label: "타고난 에너지", accent: C.sand,
      tag: `생명경로수 ${t.lifePath || ""}`,
      tagColor: C.mahogany, tagText: C.sand,
      title: "숫자 하나가 삶 전체를\n관통하고 있어.",
      subtitle: "타로수비학",
      blocks: [
        { h: `생명경로수 ${t.lifePath || ""}`, text: tarotLifeText || "분석 중이야." },
        { h: `${(t.lifePathCard || "본명 카드").replace(/\([^)]*\)/g, "").trim()}`, text: tarotSoulText || "분석 중이야." },
      ],
    },
    {
      type: "free",
      num: "V", label: "성향", accent: C.caramel,
      tag: mbtiSys.key || "",
      tagColor: C.walnut, tagText: C.parchment,
      title: `${mbtiSys.key || "MBTI"}.\n한 줄로 이렇게 설명돼.`,
      subtitle: "MBTI 사주 교차 분석",
      blocks: [
        { h: "기질", text: mbtiText || "분석 중이야." },
        { h: "사주로 보면", text: mbtiSajuText },
      ],
    },
  ]

  const lockedChapters = [
    {
      type: "locked", num: "VI", label: "재물 구조",
      title: "돈이 어떻게 들어오고\n어디서 새는지 다 보여.",
      blocks: [
        { h: "돈의 구조", text: sangBl || "재물 구조가 읽혔어. 어떻게 버는지, 어디서 새는지 다 나와." },
        { h: "올해 재물 흐름", text: reomulBl || "흐름이 보여." },
        { h: "터지는 시기", text: "재물운이 피크를 찍는 연도가 따로 있어. 지금이 그 구간인지 아닌지 봐야 해." },
      ],
    },
    {
      type: "locked", num: "VII", label: "연애 관계",
      title: "매번 같은 패턴에\n걸리는 이유가 있어.",
      blocks: [
        { h: "관계 패턴", text: loveText },
        { h: "이상형 구조", text: "끌리는 타입이 있어. 근데 그 타입이 맞는 타입인지는 다른 문제야." },
        { h: "만나는 시기", text: "인연이 들어오는 시기가 사주에 찍혀 있어. 지금이 그 구간인지 확인해봐." },
      ],
    },
    {
      type: "locked", num: "VIII", label: "운명 흐름",
      title: "언제 치고 나가고\n언제 버텨야 하는지.",
      blocks: [
        { h: "지금 대운", text: daeunText },
        { h: "연도별 흐름", text: "어느 해가 치고 나가야 할 해고, 어느 해가 버텨야 할 해인지 다 나와." },
        { h: "인생의 전환점", text: "판이 완전히 바뀌는 시기가 있어. 그게 언제인지 알면 준비할 수 있어." },
      ],
    },
    {
      type: "locked", num: "IX", label: "손금 관상",
      title: "얼굴과 손이\n사주를 확인해줘.",
      blocks: [
        { h: "관상", text: "얼굴에 사주가 드러나 있어. 어떤 기운이 가장 강하게 나오는지 읽어줄게." },
        { h: "손금", text: "생명선, 감정선, 운명선. 사주랑 교차하면 더 정확해." },
        { h: "이미지 업로드", text: "사진 올려줘. 직접 봐야 읽히는 게 있어." },
      ],
    },
  ]

  const chapters = [...freeChapters, ...lockedChapters]
  const ch = chapters[current]
  const isLocked = ch.type === "locked"
  const freeCount = freeChapters.length

  return (
    <div style={{
      background: C.void, minHeight: "100vh",
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "14px 16px 40px", fontFamily: "Georgia, serif",
      color: C.parchment, userSelect: "none",
    }}>
      <div style={{ width: "100%", maxWidth: 480, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: C.caramel, textTransform: "uppercase", fontFamily: "sans-serif" }}>Mora</div>
        <div style={{ fontSize: 12, color: C.ash, fontFamily: "sans-serif", textAlign: "center" }}>
          <div>{d.name}</div>
          <div style={{ fontSize: 10, color: C.fog }}>{d.gender}성</div>
        </div>
        <button onClick={onHome} style={{ background: "none", border: "none", color: C.caramel, fontSize: 18, cursor: "pointer", padding: 0 }}>🏠</button>
      </div>

      <div style={{ width: "100%", maxWidth: 480, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {chapters.map((_, i) => (
            <div key={i} style={{
              width: i === current ? 20 : 6, height: 4, borderRadius: 2,
              background: i >= freeCount ? C.fog : i === current ? C.caramel : C.ember,
              transition: "all 0.3s ease",
            }} />
          ))}
        </div>
        <div style={{ fontSize: 11, color: C.fog, fontFamily: "sans-serif" }}>{current + 1} / {chapters.length}</div>
      </div>

      <div style={{ width: "100%", maxWidth: 480, perspective: 1200, flex: 1 }}>
        {isLocked
          ? <LockedCard num={ch.num} label={ch.label} title={ch.title} blocks={ch.blocks} />
          : <ChapterCard {...ch} flipping={flipping} flipDir={flipDir} />
        }
      </div>

      <div style={{ width: "100%", maxWidth: 480, display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20 }}>
        <button onClick={() => goTo(-1)} disabled={current === 0} style={{
          background: current === 0 ? "transparent" : C.ember,
          border: `1px solid ${current === 0 ? C.fog : C.walnut}`,
          borderRadius: 10, padding: "11px 18px",
          color: current === 0 ? C.fog : C.sand,
          fontSize: 13, cursor: current === 0 ? "default" : "pointer",
          fontFamily: "sans-serif", transition: "all 0.2s",
        }}>이전</button>

        <div style={{ fontSize: 10, color: C.fog, fontFamily: "sans-serif", textAlign: "center" }}>{ch.label}</div>

        <button onClick={() => goTo(1)} disabled={current === chapters.length - 1} style={{
          background: current === chapters.length - 1 ? "transparent" : C.walnut,
          border: `1px solid ${current === chapters.length - 1 ? C.fog : C.caramel}`,
          borderRadius: 10, padding: "11px 18px",
          color: current === chapters.length - 1 ? C.fog : C.parchment,
          fontSize: 13, cursor: current === chapters.length - 1 ? "default" : "pointer",
          fontFamily: "sans-serif", transition: "all 0.2s",
        }}>다음</button>
      </div>

      {current === 0 && (
        <div style={{ marginTop: 10, fontSize: 11, color: C.fog, fontFamily: "sans-serif", letterSpacing: 1, textAlign: "center" }}>
          버튼을 눌러 챕터를 넘겨봐
        </div>
      )}
    </div>
  )
}
