// MoraReport.jsx v2 — 무당체
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

function LockedCard({ num, label, title, teaser }) {
  return (
    <div style={{ background: C.dusk, border: `1px solid ${C.ember}`, borderRadius: 16, overflow: "hidden", minHeight: 380 }}>
      <div style={{ background: `linear-gradient(135deg, ${C.abyss} 0%, ${C.void} 100%)`, padding: "24px 24px 18px", borderBottom: `1px solid ${C.ember}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ fontSize: 10, letterSpacing: 4, color: C.fog, textTransform: "uppercase", fontFamily: "sans-serif" }}>{label}</div>
          <div style={{ background: C.plum, borderRadius: 20, padding: "3px 10px", fontSize: 11, color: C.lavender, fontFamily: "sans-serif" }}>유료</div>
        </div>
        <div style={{ fontSize: 28, color: C.fog, marginBottom: 4, fontWeight: 400, opacity: 0.2, fontFamily: "Georgia, serif" }}>{num}</div>
        <div style={{ fontSize: 18, color: C.fog, lineHeight: 1.55, whiteSpace: "pre-line", fontWeight: 400, fontFamily: "Georgia, serif" }}>{title}</div>
      </div>
      <div style={{ padding: "20px 24px 24px" }}>
        <div style={{ fontSize: 13, color: C.fog, lineHeight: 1.8, marginBottom: 24, fontFamily: "Georgia, serif" }}>{teaser}</div>
        <button onClick={() => alert("결제 기능 준비 중이야.")} style={{
          width: "100%", background: C.walnut, border: `1px solid ${C.caramel}`,
          borderRadius: 8, padding: "13px", color: C.parchment, fontSize: 13,
          cursor: "pointer", fontFamily: "sans-serif", letterSpacing: 1,
        }}>
          열어보기
        </button>
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
    async function fetch() {
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
    fetch()
    return () => { cancelled = true }
  }, [d.birth])

  useEffect(() => {
    if (tarotAI) return
    let cancelled = false
    async function fetch() {
      try {
        const ilganKo = d.pillars?.[2]?.gan?.ko || "무"
        const ilganHanja = d.pillars?.[2]?.gan?.hanja || "戊"
        const prompt = buildTarotPrompt(d.tarot, ilganKo, ilganHanja)
        const text = await callNetlify({ model: "claude-haiku-4-5-20251001", max_tokens: 250, messages: [{ role: "user", content: prompt }] })
        const parsed = JSON.parse(text)
        if (!cancelled) { setTarotAI(parsed); if (setParentTarotAI) setParentTarotAI(parsed) }
      } catch (e) { console.error("tarot:", e) }
    }
    fetch()
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

  const ichingName = juyeokSys.key || d.iching?.bonmyeonggae || ""
  const ichingNature = juyeokSys.desc || d.iching?.gaeNature || ""
  const ichingDesc = d.iching?.gaeDesc || ""
  const ichingStrategy = d.iching?.strategy || []
  const dansajuPillars = d.dansaju?.pillars || []

  const sinsalText = d.sinsal?.length
    ? d.sinsal.map(s => `${s.name.replace(/살$/, '').replace(/귀인$/, ' 기운')}: ${s.kw || s.desc || ""}`).join("\n")
    : "특별한 신살 없이 안정적인 구조야. 튀지 않는 대신 오래 가."

  const freeChapters = [
    ...(isBnd ? [{
      type: "free",
      num: "序", label: "경계의 사주", accent: C.iris,
      tag: "경계 사주", tagColor: C.plum, tagText: C.lavender,
      title: "넌 특별한 사주야.",
      subtitle: "두 가지 기운을 동시에 품고 태어났어.",
      blocks: [
        { h: "두 기운을 동시에", text: "태어난 시간이 자정 경계에 걸쳐 있어. 어떤 학파는 한쪽으로, 어떤 학파는 다른 쪽으로 읽어. 틀린 게 아니야. 두 기운을 동시에 품고 태어났다는 뜻이야." },
        { h: "공통된 흐름", text: "두 기운 모두 겉으로 드러내지 않고 속으로 깊이 담는 타입이야. 조용해 보이는데 속은 훨씬 복잡하고, 한번 마음 열면 완전히 달라지는 구조야." },
        { h: "어느 쪽이 맞을까", text: "둘 다 읽어봐. 어느 쪽이 더 내 얘기처럼 느껴지는지 본인이 제일 잘 알아. 아니면 둘 다 맞는 경우도 있어. 그게 경계 사주의 특징이야." },
      ],
    }] : []),
    {
      type: "free",
      num: "I", label: "일주 본질", accent: C.caramel,
      tag: sajuSys.key || "", tagColor: C.mahogany, tagText: C.sand,
      title: `${sajuSys.key || ""}.\n태어날 때부터 이렇게 설계됐어.`,
      subtitle: "사주",
      blocks: [
        { h: "본질", text: cleanText(isBnd ? bnd.standardDesc : (sajuSys.desc || "분석 중")) },
        { h: "타고난 에너지", text: sinsalText },
        { h: "당사주", text: (() => {
          if (!dansajuPillars.length) return cleanText(dansajuSys.desc || "분석 중")
          const stars = dansajuPillars.map(p => p.byeolseong?.split("(")[0] || "").filter(Boolean)
          const kws = dansajuPillars.map(p => p.kw || "").filter(Boolean)
          return `타고난 별의 흐름이야. ${stars.join(", ")}이 각 시기를 따라가면서, ${kws.slice(0,2).join("과 ")}의 기운이 삶의 뼈대를 만들어. ${cleanText(d.dansaju?.overall || "").slice(0, 80)}`
        })() },
      ],
    },
    {
      type: "free",
      num: "II", label: "내면 구조", accent: C.iris,
      tag: tojungSys.key || "", tagColor: C.abyss, tagText: C.lavender,
      title: "겉으로 보이는 게 전부가 아니야.",
      subtitle: "토정비결 · 주역",
      blocks: [
        { h: "올해의 흐름 (토정비결)", text: `${cleanText(tojungSys.key || "")}. ${cleanText(tojungSys.desc || "분석 중")}` },
        { h: "삶의 구조 (주역)", text: (() => {
          const base = `${ichingName}. ${ichingNature}.`
          const desc = ichingDesc ? ` ${cleanText(ichingDesc).slice(0, 100)}` : ""
          const strat = ichingStrategy.length ? `\n\n지금 이 시기에 맞는 방향: ${ichingStrategy.slice(0,2).join(". ")}` : ""
          return base + desc + strat
        })() },
      ],
    },
    {
      type: "free",
      num: "III", label: "하늘의 설계", accent: C.lavender,
      tag: "별자리", tagColor: C.plum, tagText: C.lavender,
      title: "태어난 순간 별들이\n이미 다 정해놨어.",
      subtitle: "별자리 네이탈",
      blocks: loadingAstro
        ? [{ h: "분석 중", text: "모라가 별자리를 읽고 있어. 잠깐만 기다려줘..." }]
        : [
          { h: `태양 ${sunSign || ""}`, text: sunSign ? cleanText(a.sunDesc || a.triangle || "분석 중") : "별자리 분석을 불러오는 중이야." },
          { h: `달 ${moonSign || ""} · 상승 ${ascSign || ""}`, text: moonSign ? cleanText(a.moonDesc || "분석 중") : "잠시 후 나타나." },
          ...(a.stellium ? [{ h: "집중 에너지", text: cleanText(a.stellium) }] : []),
        ],
    },
    {
      type: "free",
      num: "IV", label: "타고난 에너지", accent: C.sand,
      tag: `생명경로수 ${t.lifePath || ""}`, tagColor: C.mahogany, tagText: C.sand,
      title: "숫자 하나가 삶 전체를\n관통하고 있어.",
      subtitle: "타로수비학",
      blocks: [
        { h: `생명경로수 ${t.lifePath || ""}`, text: cleanText(t.lifePathDesc || tarotSys.desc || "분석 중") },
        { h: `${t.lifePathCard || "본명 카드"}`, text: cleanText(tarotAI?.soulDesc || t.soulDesc || "분석 중") },
      ],
    },
    {
      type: "free",
      num: "V", label: "성향", accent: C.caramel,
      tag: mbtiSys.key || "", tagColor: C.walnut, tagText: C.parchment,
      title: `${mbtiSys.key || "MBTI"}.\n한 줄로 이렇게 설명돼.`,
      subtitle: "MBTI 사주 교차 분석",
      blocks: [
        { h: "기질", text: cleanText(mbtiSys.desc || "분석 중") },
        { h: "사주로 보면", text: d.mbti?.basis || cleanText(d.summary?.persona?.charPhrase || "사주 오행과 MBTI가 교차 분석된 결과야.") },
      ],
    },
  ]

  const lockedChapters = [
    { type: "locked", num: "VI", label: "재물 구조", title: "돈이 어떻게 들어오고\n어디서 새는지 다 보여.", teaser: "재성 구조, 용신 방향, 재물운이 터지는 시기까지. 지금 당신의 돈 흐름이 어느 방향으로 가고 있는지 정확하게 짚어줄게." },
    { type: "locked", num: "VII", label: "연애 관계", title: "매번 같은 패턴에\n걸리는 이유가 있어.", teaser: "이상형 구조, 관계에서 반복되는 패턴, 지금 시기에 어떤 사람을 만나는지. 사주가 말하는 진짜 관계 설계도야." },
    { type: "locked", num: "VIII", label: "운명 흐름", title: "언제 치고 나가고\n언제 버텨야 하는지.", teaser: "10년 단위 대운과 연도별 세운. 지금 당신이 어느 구간에 있는지, 앞으로 어떤 흐름이 오는지 전부 펼쳐줄게." },
    { type: "locked", num: "IX", label: "손금 관상", title: "얼굴과 손이\n사주를 확인해줘.", teaser: "이미지를 올리면 관상과 손금을 읽어줘. 사주에서 나온 기운이 실제 외형에 어떻게 드러나는지 교차 분석해." },
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
          ? <LockedCard num={ch.num} label={ch.label} title={ch.title} teaser={ch.teaser} />
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
