// MoraReport.jsx — 챕터형 리포트 (모라 무드)
import React, { useState } from 'react'
import { cleanText } from '../data/constants.js'

const C = {
  void: "#0D0A0F",
  dusk: "#1A1220",
  ember: "#241830",
  mahogany: "#3D2016",
  walnut: "#6B3A2A",
  caramel: "#A0522D",
  sand: "#C8956C",
  abyss: "#1E1028",
  plum: "#4A2060",
  iris: "#7B4FA6",
  lavender: "#B89FCC",
  parchment: "#F0E8DC",
  ash: "#9E8F8A",
  fog: "#5C5158",
}

const ROMAN = ["I","II","III","IV","V","VI","VII","VIII","IX"]

// 유료 잠김 챕터 컴포넌트
function LockedChapter({ num, label, title, onUnlock }) {
  return (
    <div style={{
      background: C.dusk,
      border: `1px solid ${C.ember}`,
      borderRadius: 16,
      overflow: "hidden",
      minHeight: 200,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 28px",
      textAlign: "center",
      position: "relative",
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0,
        padding: "16px 20px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        borderBottom: `1px solid ${C.ember}`,
      }}>
        <div style={{ fontSize: 10, letterSpacing: 4, color: C.fog, textTransform: "uppercase", fontFamily: "sans-serif" }}>
          {label}
        </div>
        <div style={{
          background: C.plum, borderRadius: 20, padding: "3px 10px",
          fontSize: 11, color: C.lavender, fontFamily: "sans-serif",
        }}>
          🔒 유료
        </div>
      </div>
      <div style={{ fontSize: 28, color: C.fog, marginBottom: 12, opacity: 0.3 }}>{num}</div>
      <div style={{ fontSize: 16, color: C.fog, marginBottom: 24, lineHeight: 1.6, whiteSpace: "pre-line" }}>{title}</div>
      <button
        onClick={onUnlock}
        style={{
          background: C.walnut, border: `1px solid ${C.caramel}`,
          borderRadius: 8, padding: "12px 28px",
          color: C.parchment, fontSize: 13, cursor: "pointer",
          fontFamily: "sans-serif", letterSpacing: 1,
          transition: "all 0.2s",
        }}
      >
        열어보기
      </button>
    </div>
  )
}

// 챕터 카드 컴포넌트
function Chapter({ num, label, tag, tagColor, tagText, accent, title, subtitle, blocks, flipping, flipDir }) {
  return (
    <div style={{
      background: C.dusk,
      border: `1px solid ${C.mahogany}`,
      borderRadius: 16,
      overflow: "hidden",
      transform: flipping
        ? flipDir > 0 ? "rotateY(-15deg) scale(0.96)" : "rotateY(15deg) scale(0.96)"
        : "rotateY(0deg) scale(1)",
      transition: "transform 0.4s cubic-bezier(0.4,0,0.2,1)",
      transformOrigin: flipDir > 0 ? "left center" : "right center",
      boxShadow: `0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px ${C.ember}`,
      minHeight: 520,
    }}>
      {/* 챕터 헤더 */}
      <div style={{
        background: `linear-gradient(135deg, ${C.mahogany} 0%, ${C.abyss} 100%)`,
        padding: "28px 28px 20px",
        borderBottom: `1px solid ${C.ember}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ fontSize: 10, letterSpacing: 4, color: accent, textTransform: "uppercase", fontFamily: "sans-serif" }}>
            {label}
          </div>
          {tag && (
            <div style={{ background: tagColor, borderRadius: 20, padding: "3px 10px", fontSize: 11, color: tagText, fontFamily: "sans-serif" }}>
              {tag}
            </div>
          )}
        </div>
        <div style={{ fontSize: 32, color: C.sand, marginBottom: 6, fontWeight: 400, opacity: 0.4 }}>{num}</div>
        <div style={{ fontSize: 20, color: C.parchment, lineHeight: 1.5, whiteSpace: "pre-line", fontWeight: 400 }}>{title}</div>
        {subtitle && (
          <div style={{ fontSize: 12, color: C.ash, marginTop: 8, fontFamily: "sans-serif", letterSpacing: 1 }}>{subtitle}</div>
        )}
      </div>

      {/* 본문 */}
      <div style={{ padding: "24px 28px 28px" }}>
        {blocks.map((block, i) => (
          <div key={i} style={{
            marginBottom: i < blocks.length - 1 ? 24 : 0,
            paddingBottom: i < blocks.length - 1 ? 24 : 0,
            borderBottom: i < blocks.length - 1 ? `1px solid ${C.ember}` : "none",
          }}>
            <div style={{
              fontSize: 10, letterSpacing: 3, color: accent,
              textTransform: "uppercase", fontFamily: "sans-serif", marginBottom: 10,
            }}>
              {block.heading}
            </div>
            <div style={{ fontSize: 15, color: C.parchment, lineHeight: 1.85, fontWeight: 400 }}>
              {block.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function MoraReport({ d, onHome }) {
  const [current, setCurrent] = useState(0)
  const [flipping, setFlipping] = useState(false)
  const [flipDir, setFlipDir] = useState(null)

  const goTo = (dir) => {
    if (flipping) return
    const next = current + dir
    if (next < 0 || next >= CHAPTERS.length) return
    setFlipDir(dir)
    setFlipping(true)
    setTimeout(() => {
      setCurrent(next)
      setFlipping(false)
      setFlipDir(null)
    }, 400)
  }

  // 데이터에서 필요한 것만 뽑기
  const bnd = d.boundary
  const isBoundary = bnd?.isBoundary
  const iljuKey = d.pillars?.[2]?.ji?.ko ? `${d.pillars[2].gan.ko}${d.pillars[2].ji.ko}` : ""
  const ss = d.summary?.sixSystems || []
  const sajuSys = ss.find(s => s.system === "사주") || {}
  const tojungSys = ss.find(s => s.system === "토정비결") || {}
  const juyeokSys = ss.find(s => s.system === "주역") || {}
  const tarotSys = ss.find(s => s.system === "타로수비학") || {}
  const mbtiSys = ss.find(s => s.system === "MBTI") || {}
  const dansajuSys = ss.find(s => s.system === "당사주") || {}

  // 경계 사주 텍스트
  const boundaryChapter = isBoundary ? {
    num: "序",
    label: "경계의 사주",
    title: "넌 특별한 사주야.",
    subtitle: "두 일주의 기운을 동시에 품고 태어났어.",
    accent: C.iris,
    tag: "경계 사주",
    tagColor: C.plum,
    tagText: C.lavender,
    blocks: [
      {
        heading: "두 기운을 동시에",
        text: "태어난 시간이 자정 경계에 걸쳐 있어. 어떤 학파는 한쪽으로, 어떤 학파는 다른 쪽으로 읽어. 틀린 게 아니야. 두 기운을 동시에 품고 태어났다는 뜻이야.",
      },
      {
        heading: "어느 쪽이 맞을까",
        text: "둘 다 읽어봐. 어느 쪽이 더 내 얘기처럼 느껴지는지 본인이 제일 잘 알아. 아니면 둘 다 맞는 경우도 있어. 그게 경계 사주의 특징이야.",
      },
      {
        heading: "공통된 흐름",
        text: cleanText(bnd?.standardDesc || "") + " " + cleanText(bnd?.midnightDesc || ""),
      },
    ],
  } : null

  // 챕터 I — 일주 본질
  const chapterI = {
    num: ROMAN[0],
    label: "일주 본질",
    title: `${sajuSys.key || ""}.\n태어날 때부터 이렇게 설계됐어.`,
    subtitle: "사주",
    accent: C.caramel,
    tag: sajuSys.key || "",
    tagColor: C.mahogany,
    tagText: C.sand,
    blocks: [
      {
        heading: "본질",
        text: cleanText(d.boundary?.standardDesc || sajuSys.desc || "분석 중"),
      },
      {
        heading: "신살",
        text: d.sinsal?.length
          ? d.sinsal.map(s => `${s.name}: ${s.desc || s.kw || ""}`).join("\n")
          : "특별한 신살 없이 안정적인 구조야. 튀지 않는 대신 오래 가.",
      },
      {
        heading: "당사주",
        text: cleanText(dansajuSys.desc || "분석 중"),
      },
    ],
  }

  // 챕터 II — 내면 구조
  const chapterII = {
    num: ROMAN[1],
    label: "내면 구조",
    title: "겉으로 보이는 게 전부가 아니야.",
    subtitle: "토정비결 · 주역",
    accent: C.iris,
    tag: tojungSys.key || "",
    tagColor: C.abyss,
    tagText: C.lavender,
    blocks: [
      {
        heading: "토정비결",
        text: cleanText(tojungSys.key || "") + ". " + cleanText(tojungSys.desc || "분석 중"),
      },
      {
        heading: "주역",
        text: cleanText(juyeokSys.key || "") + ". " + cleanText(juyeokSys.desc || "분석 중"),
      },
    ],
  }

  // 챕터 III — 하늘의 설계
  const chapterIII = {
    num: ROMAN[2],
    label: "하늘의 설계",
    title: "태어난 순간 별들이\n이미 다 정해놨어.",
    subtitle: "별자리 네이탈",
    accent: C.lavender,
    tag: "점성술",
    tagColor: C.plum,
    tagText: C.lavender,
    blocks: [
      {
        heading: "태양",
        text: d.astro?.sun !== "분석 중"
          ? `태양 ${d.astro?.sun}. ${cleanText(d.astro?.sunDesc || "")}`
          : "별자리 분석은 AI가 리포트에서 직접 읽어줘.",
      },
      {
        heading: "달과 상승궁",
        text: d.astro?.moon !== "분석 중"
          ? `달 ${d.astro?.moon}, 상승궁 ${d.astro?.asc}. ${cleanText(d.astro?.moonDesc || "")}`
          : "달과 상승궁은 리포트 별자리 탭에서 확인할 수 있어.",
      },
    ],
  }

  // 챕터 IV — 타고난 에너지
  const chapterIV = {
    num: ROMAN[3],
    label: "타고난 에너지",
    title: "숫자 하나가 삶 전체를\n관통하고 있어.",
    subtitle: "타로수비학",
    accent: C.sand,
    tag: `생명경로수 ${d.tarot?.lifePath || ""}`,
    tagColor: C.mahogany,
    tagText: C.sand,
    blocks: [
      {
        heading: "생명경로수",
        text: cleanText(tarotSys.key || "") + ". " + cleanText(d.tarot?.lifePathDesc || tarotSys.desc || "분석 중"),
      },
      {
        heading: "본명 카드",
        text: cleanText(d.tarot?.lifePathCard || "") + ". " + cleanText(d.tarot?.soulDesc || "분석 중"),
      },
    ],
  }

  // 챕터 V — 성향
  const chapterV = {
    num: ROMAN[4],
    label: "성향",
    title: `${mbtiSys.key || "MBTI"}.\n한 줄로 이렇게 설명돼.`,
    subtitle: "MBTI 사주 교차 분석",
    accent: C.caramel,
    tag: mbtiSys.key || "",
    tagColor: C.walnut,
    tagText: C.parchment,
    blocks: [
      {
        heading: "기질",
        text: cleanText(mbtiSys.desc || "분석 중"),
      },
      {
        heading: "사주 교차",
        text: d.mbti?.basis || "사주 오행 비율과 MBTI 교차 분석 결과야.",
      },
    ],
  }

  // 유료 챕터들
  const lockedChapters = [
    { num: ROMAN[5], label: "재물 구조", title: "돈이 어떻게 들어오고\n어디서 새는지 다 보여." },
    { num: ROMAN[6], label: "연애 관계", title: "매번 같은 패턴에\n걸리는 이유가 있어." },
    { num: ROMAN[7], label: "운명 흐름", title: "언제 치고 나가고\n언제 버텨야 하는지." },
    { num: ROMAN[8], label: "손금 관상", title: "얼굴과 손이\n사주를 확인해줘." },
  ]

  const freeChapters = [
    ...(boundaryChapter ? [boundaryChapter] : []),
    chapterI, chapterII, chapterIII, chapterIV, chapterV,
  ]

  const CHAPTERS = [...freeChapters, ...lockedChapters]
  const ch = CHAPTERS[current]
  const isLocked = current >= freeChapters.length

  return (
    <div style={{
      background: C.void,
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "16px 16px 40px",
      fontFamily: "'Georgia', serif",
      color: C.parchment,
      userSelect: "none",
    }}>
      {/* 헤더 */}
      <div style={{
        width: "100%", maxWidth: 480,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: 16, padding: "8px 0",
      }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: C.caramel, textTransform: "uppercase", fontFamily: "sans-serif" }}>
          Mora
        </div>
        <div style={{ fontSize: 12, color: C.ash, fontFamily: "sans-serif", textAlign: "center" }}>
          <div>{d.name}</div>
          <div style={{ fontSize: 10, color: C.fog }}>{d.gender}성</div>
        </div>
        <button
          onClick={onHome}
          style={{
            background: "none", border: "none", color: C.caramel,
            fontSize: 18, cursor: "pointer", padding: 0,
          }}
        >
          🏠
        </button>
      </div>

      {/* 진행 표시 */}
      <div style={{
        width: "100%", maxWidth: 480,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: 16,
      }}>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {CHAPTERS.map((_, i) => (
            <div key={i} style={{
              width: i === current ? 20 : 6,
              height: 4,
              borderRadius: 2,
              background: i >= freeChapters.length
                ? C.fog
                : i === current ? C.caramel : C.ember,
              transition: "all 0.3s ease",
            }} />
          ))}
        </div>
        <div style={{ fontSize: 11, color: C.fog, fontFamily: "sans-serif" }}>
          {current + 1} / {CHAPTERS.length}
        </div>
      </div>

      {/* 챕터 카드 */}
      <div style={{ width: "100%", maxWidth: 480, perspective: 1200, flex: 1 }}>
        {isLocked ? (
          <LockedChapter
            num={ch.num}
            label={ch.label}
            title={ch.title}
            onUnlock={() => alert("준비 중이에요.")}
          />
        ) : (
          <Chapter
            {...ch}
            flipping={flipping}
            flipDir={flipDir}
          />
        )}
      </div>

      {/* 네비게이션 */}
      <div style={{
        width: "100%", maxWidth: 480,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginTop: 24,
      }}>
        <button
          onClick={() => goTo(-1)}
          disabled={current === 0}
          style={{
            background: current === 0 ? "transparent" : C.ember,
            border: `1px solid ${current === 0 ? C.fog : C.walnut}`,
            borderRadius: 10, padding: "12px 20px",
            color: current === 0 ? C.fog : C.sand,
            fontSize: 14, cursor: current === 0 ? "default" : "pointer",
            fontFamily: "sans-serif", transition: "all 0.2s",
          }}
        >
          이전
        </button>

        <div style={{ fontSize: 11, color: C.fog, fontFamily: "sans-serif", textAlign: "center" }}>
          {ch.label}
        </div>

        <button
          onClick={() => goTo(1)}
          disabled={current === CHAPTERS.length - 1}
          style={{
            background: current === CHAPTERS.length - 1 ? "transparent" : C.walnut,
            border: `1px solid ${current === CHAPTERS.length - 1 ? C.fog : C.caramel}`,
            borderRadius: 10, padding: "12px 20px",
            color: current === CHAPTERS.length - 1 ? C.fog : C.parchment,
            fontSize: 14, cursor: current === CHAPTERS.length - 1 ? "default" : "pointer",
            fontFamily: "sans-serif", transition: "all 0.2s",
          }}
        >
          다음
        </button>
      </div>

      {current === 0 && (
        <div style={{
          marginTop: 12, fontSize: 11, color: C.fog,
          fontFamily: "sans-serif", letterSpacing: 1, textAlign: "center",
        }}>
          버튼을 눌러 챕터를 넘겨봐요
        </div>
      )}
    </div>
  )
}
