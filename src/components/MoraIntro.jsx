import { useState, useEffect, useRef } from 'react'
import { lunarToSolar, getLeapMonth } from '../utils/lunar.js'

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

const REGIONS = {
  "서울특별시":[],
  "부산광역시":[],
  "대구광역시":[],
  "인천광역시":[],
  "광주광역시":[],
  "대전광역시":[],
  "울산광역시":[],
  "세종특별자치시":[],
  "경기도":["가평군","고양시","과천시","광명시","광주시","구리시","군포시","김포시","남양주시","동두천시","부천시","성남시","수원시","시흥시","안산시","안성시","안양시","양주시","양평군","여주시","연천군","오산시","용인시","의왕시","의정부시","이천시","파주시","평택시","포천시","하남시","화성시"],
  "강원특별자치도":["강릉시","고성군","동해시","삼척시","속초시","양구군","양양군","영월군","원주시","인제군","정선군","철원군","춘천시","태백시","평창군","홍천군","화천군","횡성군"],
  "충청북도":["괴산군","단양군","보은군","영동군","옥천군","음성군","제천시","증평군","진천군","청주시","충주시"],
  "충청남도":["계룡시","공주시","금산군","논산시","당진시","보령시","부여군","서산시","서천군","아산시","예산군","천안시","청양군","태안군","홍성군"],
  "전북특별자치도":["고창군","군산시","김제시","남원시","무주군","부안군","순창군","완주군","익산시","임실군","장수군","전주시","정읍시","진안군"],
  "전라남도":["강진군","고흥군","곡성군","광양시","구례군","나주시","담양군","목포시","무안군","보성군","순천시","신안군","여수시","영광군","영암군","완도군","장성군","장흥군","진도군","함평군","해남군","화순군"],
  "경상북도":["경산시","경주시","고령군","구미시","김천시","문경시","봉화군","상주시","성주군","안동시","영덕군","영양군","영주시","영천시","예천군","울릉군","울진군","의성군","청도군","청송군","칠곡군","포항시"],
  "경상남도":["거제시","거창군","고성군","김해시","남해군","밀양시","사천시","산청군","양산시","의령군","진주시","창녕군","창원시","통영시","하동군","함안군","함양군","합천군"],
  "제주특별자치도":["서귀포시","제주시"],
}

const CITY_MAP = {
  "서울특별시":"서울","부산광역시":"부산","대구광역시":"대구","인천광역시":"인천",
  "광주광역시":"광주","대전광역시":"대전","울산광역시":"울산","세종특별자치시":"세종",
  "경기도":"경기","강원특별자치도":"강원","충청북도":"충북","충청남도":"충남",
  "전북특별자치도":"전북","전라남도":"전남","경상북도":"경북","경상남도":"경남",
  "제주특별자치도":"제주",
}

// 업종 → 회사 오행(목적 기준). "" = 미지정
const INDUSTRY = [
  { label: "의료·제약·바이오", oh: "금" },
  { label: "미용·뷰티·에스테틱", oh: "화" },
  { label: "IT·전자·게임", oh: "화" },
  { label: "금융·법률·회계", oh: "금" },
  { label: "교육·출판·연구", oh: "목" },
  { label: "건설·부동산", oh: "토" },
  { label: "유통·무역·여행", oh: "수" },
  { label: "제조·기계·중공업", oh: "금" },
  { label: "농업·식품·환경", oh: "토" },
  { label: "서비스·컨설팅·기타", oh: "" },
]

const MESSAGES = [
  "뭔가 항상 한 박자 어긋나.",
  "분명히 열심히 했는데.",
  "거슬러 왔던 거야, 처음부터.",
  "네 잘못이 아니야.\n이제 알면 달라져.",
  "내가 알려줄게.",
]

const FloatText = ({ text, isLast, onDone }) => {
  const [state, setState] = useState("in")

  useEffect(() => {
    const t1 = setTimeout(() => setState("hold"), 100)
    const t2 = setTimeout(() => setState("out"), 1000)
    const t3 = setTimeout(() => onDone(), 1800)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  const style = {
    in:   { opacity: 1, transform: "translateY(8px) scale(1)", filter: "blur(20px)" },
    hold: { opacity: 1, transform: "translateY(0px) scale(1)", filter: "blur(0px)" },
    out:  { opacity: 0, transform: "translateY(6px) scale(1)", filter: "blur(20px)" },
  }[state]

  return (
    <div style={{
      fontSize: 22,
      color: C.parchment,
      textAlign: "center",
      lineHeight: 1.9,
      whiteSpace: "pre-line",
      letterSpacing: 0.5,
      ...style,
      transition: state === "in"
        ? "opacity 1.2s ease, transform 1.2s ease, filter 1.4s ease"
        : state === "out"
        ? "opacity 0.8s ease, transform 0.8s ease, filter 1s ease"
        : "none",
    }}>
      {text}
    </div>
  )
}

export default function MoraIntro({ onEnter }) {
  const [phase, setPhase] = useState("intro")
  const [msgIndex, setMsgIndex] = useState(0)
  const [showBtn, setShowBtn] = useState(false)

  // 폼 상태
  const [calType, setCalType] = useState("solar")
  const [isLeap, setIsLeap] = useState(false)
  const [form, setForm] = useState({
    name: "", birthRaw: "", year: "", month: "", day: "",
    hour: "12", minute: "00", gender: "여", sido: "", sigungu: "", loveStatus: "솔로", noTime: false, noPlace: false, joinRaw: "", industry: "", foundRaw: "",
  })
  const [err, setErr] = useState({})
  const timeRef = useRef(null)
  const nameRef = useRef(null)
  const foundRef = useRef(null)

  const isLast = msgIndex === MESSAGES.length - 1

  const handleDone = () => {
    if (msgIndex >= MESSAGES.length - 1) {
      setTimeout(() => setShowBtn(true), 400)
    } else {
      setMsgIndex(i => i + 1)
    }
  }

  const up = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleBirthChange = (val) => {
    const raw = val.replace(/\D/g, "")
    let fmt = raw
    if (raw.length > 2) fmt = raw.slice(0, 2) + "." + raw.slice(2)
    if (raw.length > 4) fmt = raw.slice(0, 2) + "." + raw.slice(2, 4) + "." + raw.slice(4)
    up("birthRaw", fmt)
    if (raw.length >= 6) {
      const yy = parseInt(raw.slice(0, 2))
      up("year", String(yy <= 30 ? 2000 + yy : 1900 + yy))
      up("month", String(parseInt(raw.slice(2, 4))))
      up("day", String(parseInt(raw.slice(4, 6))))
      setIsLeap(false)
      if (raw.length === 6) setTimeout(() => timeRef.current?.focus(), 100)
    }
  }

  const handleTimeChange = (val) => {
    const digits = val.replace(/\D/g, "").slice(0, 4)
    let fmt = digits
    if (digits.length >= 3) fmt = digits.slice(0, 2) + ":" + digits.slice(2)
    const h = parseInt(digits.slice(0, 2) || "12")
    const m = parseInt(digits.slice(2) || "0")
    up("hour", String(isNaN(h) ? 12 : h))
    up("minute", String(isNaN(m) ? 0 : m))
    up("timeRaw", fmt)
  }

  const leapMonths = (form.year && form.month) ? getLeapMonth(parseInt(form.year), parseInt(form.month)) : false

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = "이름을 알려줘"
    const y = parseInt(form.year), m = parseInt(form.month), d = parseInt(form.day)
    if (!form.year || !form.birthRaw || y < 1931 || y > 2030) e.birth = "생년월일 6자리를 입력해줘"
    if (!form.noPlace) {
      if (!form.sido) e.sido = "태어난 곳을 알려줘"
    }
    if (!Object.keys(e).length && calType === "lunar") {
      const converted = lunarToSolar(y, m, d, isLeap)
      if (!converted) {
        e.birth = isLeap ? `${m}월에는 윤달이 없어` : "음력 날짜를 변환할 수 없어"
      } else {
        up("year", String(converted.year))
        up("month", String(converted.month))
        up("day", String(converted.day))
      }
    }
    setErr(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    let city
    if (form.noPlace) {
      city = "서울"
    } else {
      const sido = form.sido
      const cityShort = CITY_MAP[sido] || sido.slice(0, 2)
      city = cityShort
    }

    onEnter({
      name: form.name,
      year: parseInt(form.year),
      month: parseInt(form.month),
      day: parseInt(form.day),
      hour: parseInt(form.hour) || 12,
      minute: parseInt(form.minute) || 0,
      gender: form.gender === "여" ? "여" : "남",
      city,
      isSolo: form.loveStatus !== "연애중",
      noTime: form.noTime === true,
      joinDate: (() => {
        const m = (form.joinRaw || "").match(/(\d{4})\.?(\d{1,2})?/)
        if (!m) return null
        const jy = parseInt(m[1]); const jmo = m[2] ? parseInt(m[2]) : 1
        if (jy < 1900 || jy > 2035 || jmo < 1 || jmo > 12) return null
        return { year: jy, month: jmo }
      })(),
      companyElement: (INDUSTRY.find(it => it.label === form.industry)?.oh) || "",
      foundDate: (() => {
        const fm = (form.foundRaw || "").match(/(\d{4})\.?(\d{1,2})?/)
        if (!fm) return null
        const fy = parseInt(fm[1]); const fmo = fm[2] ? parseInt(fm[2]) : 1
        if (fy < 1900 || fy > 2035 || fmo < 1 || fmo > 12) return null
        return { year: fy, month: fmo }
      })(),
    })
  }

  const sigunguList = REGIONS[form.sido] || []

  return (
    <div style={{
      background: C.void,
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 20px",
      fontFamily: "'Georgia', serif",
      color: C.parchment,
    }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .mora-input::placeholder { color: #5C5158; }
        .mora-input:focus { border-color: #6B3A2A; outline: none; }
        .mora-select option { background: #1A1220; color: #F0E8DC; }
      `}</style>

      {/* 인트로 */}
      {phase === "intro" && (
        <div style={{
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", minHeight: "50vh",
        }}>
          <FloatText
            key={msgIndex}
            text={MESSAGES[msgIndex]}
            isLast={isLast}
            onDone={handleDone}
          />
          {showBtn && (
            <button
              onClick={() => setPhase("form")}
              style={{
                marginTop: 52,
                background: "transparent",
                border: `1px solid ${C.walnut}`,
                borderRadius: 8,
                padding: "13px 40px",
                color: C.sand,
                fontSize: 13,
                cursor: "pointer",
                fontFamily: "sans-serif",
                letterSpacing: 3,
                textTransform: "uppercase",
                animation: "fadeUp 0.8s ease forwards",
                transition: "background 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = C.ember}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              입장
            </button>
          )}
        </div>
      )}

      {/* 폼 */}
      {phase === "form" && (
        <div style={{
          width: "100%", maxWidth: 400,
          animation: "fadeUp 0.9s ease forwards",
          overflowY: "auto", maxHeight: "90vh", paddingBottom: 24,
        }}>
          {/* Mora 로고 */}
          <div style={{
            textAlign: "center", marginBottom: 36,
            fontSize: 11, letterSpacing: 5, color: C.iris,
            textTransform: "uppercase", fontFamily: "sans-serif",
          }}>
            Mora
          </div>

          {/* 이 우주가 너를 받아들인 순간 */}
          <div style={{ marginBottom: 36 }}>
            <div style={qStyle}>이 우주가 너를 받아들인 순간이 언제야?</div>

            {/* 양력/음력 */}
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              {["solar", "lunar"].map(t => (
                <button key={t}
                  onClick={() => { setCalType(t); if (t === "solar") setIsLeap(false) }}
                  style={{
                    flex: 1, padding: "9px", borderRadius: 8,
                    border: `1px solid ${calType === t ? C.caramel : C.fog}`,
                    background: calType === t ? C.mahogany : "transparent",
                    color: calType === t ? C.sand : C.fog,
                    fontSize: 13, cursor: "pointer", fontFamily: "sans-serif",
                    transition: "all 0.2s",
                  }}
                >
                  {t === "solar" ? "양력" : "음력"}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input
                className="mora-input"
                type="text" inputMode="numeric"
                placeholder="생년월일  예) 900101"
                value={form.birthRaw || ""}
                onChange={e => handleBirthChange(e.target.value)}
                maxLength={8}
                style={iStyle(!!err.birth)}
              />
              {err.birth && <div style={errStyle}>{err.birth}</div>}

              {/* 윤달 토글 */}
              {calType === "lunar" && leapMonths && (
                <div style={{ display: "flex", gap: 8 }}>
                  {["평달", `윤${form.month}월`].map((l, i) => (
                    <button key={l}
                      onClick={() => setIsLeap(i === 1)}
                      style={{
                        flex: 1, padding: "9px", borderRadius: 8,
                        border: `1px solid ${isLeap === (i === 1) ? C.caramel : C.fog}`,
                        background: isLeap === (i === 1) ? C.mahogany : "transparent",
                        color: isLeap === (i === 1) ? C.sand : C.fog,
                        fontSize: 13, cursor: "pointer", fontFamily: "sans-serif",
                      }}
                    >{l}</button>
                  ))}
                </div>
              )}

              <input
                ref={timeRef}
                className="mora-input"
                type="text" inputMode="numeric"
                placeholder="태어난 시간  예) 23:28"
                value={form.timeRaw || ""}
                onChange={e => handleTimeChange(e.target.value)}
                maxLength={5}
                disabled={form.noTime}
                style={{ ...iStyle(false), opacity: form.noTime ? 0.4 : 1 }}
              />
              <div
                onClick={() => up("noTime", !form.noTime)}
                style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", margin: "4px 2px 0" }}
              >
                <span style={{
                  width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                  border: `1px solid ${form.noTime ? C.caramel : C.fog}`,
                  background: form.noTime ? C.mahogany : "transparent",
                  color: C.sand, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center",
                }}>{form.noTime ? "✓" : ""}</span>
                <span style={{ fontSize: 13, color: C.ash, fontFamily: "sans-serif" }}>태어난 시간을 몰라요</span>
              </div>

              <select
                className="mora-select"
                value={form.sido}
                onChange={e => { up("sido", e.target.value); up("sigungu", "") }}
                disabled={form.noPlace}
                style={{ ...sStyle(!!err.sido), opacity: form.noPlace ? 0.4 : 1 }}
              >
                <option value="" disabled>태어난 곳  시/도 선택</option>
                {Object.keys(REGIONS).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {err.sido && <div style={errStyle}>{err.sido}</div>}

              <div
                onClick={() => up("noPlace", !form.noPlace)}
                style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", margin: "4px 2px 0" }}
              >
                <span style={{
                  width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                  border: `1px solid ${form.noPlace ? C.caramel : C.fog}`,
                  background: form.noPlace ? C.mahogany : "transparent",
                  color: C.sand, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center",
                }}>{form.noPlace ? "✓" : ""}</span>
                <span style={{ fontSize: 13, color: C.ash, fontFamily: "sans-serif" }}>태어난 곳을 몰라요</span>
              </div>
            </div>
          </div>

          {/* 성별 */}
          <div style={{ marginBottom: 36 }}>
            <div style={qStyle}>어떤 성별로 태어났어?</div>
            <div style={{ display: "flex", gap: 10 }}>
              {["여", "남"].map(g => (
                <button key={g}
                  onClick={() => up("gender", g)}
                  style={{
                    flex: 1, padding: "13px", borderRadius: 8,
                    border: `1px solid ${form.gender === g ? C.caramel : C.fog}`,
                    background: form.gender === g ? C.mahogany : "transparent",
                    color: form.gender === g ? C.sand : C.fog,
                    fontSize: 14, cursor: "pointer", fontFamily: "sans-serif",
                    transition: "all 0.2s",
                  }}
                >
                  {g === "여" ? "여성" : "남성"}
                </button>
              ))}
            </div>
          </div>

          {/* 연애 상태 */}
          <div style={{ marginBottom: 36 }}>
            <div style={qStyle}>지금 연애 중이야, 혼자야?</div>
            <div style={{ display: "flex", gap: 10 }}>
              {["솔로", "연애중"].map(s => (
                <button key={s}
                  onClick={() => up("loveStatus", s)}
                  style={{
                    flex: 1, padding: "13px", borderRadius: 8,
                    border: `1px solid ${form.loveStatus === s ? C.caramel : C.fog}`,
                    background: form.loveStatus === s ? C.mahogany : "transparent",
                    color: form.loveStatus === s ? C.sand : C.fog,
                    fontSize: 14, cursor: "pointer", fontFamily: "sans-serif",
                    transition: "all 0.2s",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* 입사일 (선택) */}
          <div style={{ marginBottom: 36 }}>
            <div style={qStyle}>지금 다니는 회사 입사일{"\n"}알려줄 수 있어? (선택)</div>
            <input
              className="mora-input"
              type="text" inputMode="numeric"
              placeholder="입사 연월  예) 2021.03  (없으면 비워둬)"
              value={form.joinRaw || ""}
              onChange={e => {
                let digits = e.target.value.replace(/[^0-9]/g, "").slice(0, 6)
                let v = digits.length > 4 ? digits.slice(0, 4) + "." + digits.slice(4) : digits
                up("joinRaw", v)
                if (digits.length === 6) foundRef.current?.focus()  // 입사일 채우면 창립일로
              }}
              maxLength={7}
              style={iStyle(false)}
            />
            <div style={{ fontSize: 12, color: C.fog, fontFamily: "sans-serif", margin: "4px 2px 0" }}>
              입사일을 넣으면 지금 회사와의 궁합을, 비워두면 취업운을 봐줄게.
            </div>
          </div>

          {/* 회사 창립일·업종 (선택) */}
          <div style={{ marginBottom: 36 }}>
            <div style={qStyle}>회사 창립 연월과 업종도{"\n"}알면 궁합이 더 정확해져. (선택)</div>
            <input
              ref={foundRef}
              className="mora-input"
              type="text" inputMode="numeric"
              placeholder="창립 연월  예) 2015.06  (없으면 비워둬)"
              value={form.foundRaw || ""}
              onChange={e => {
                let digits = e.target.value.replace(/[^0-9]/g, "").slice(0, 6)
                let v = digits.length > 4 ? digits.slice(0, 4) + "." + digits.slice(4) : digits
                up("foundRaw", v)
                if (digits.length === 6) nameRef.current?.focus()  // 창립일 채우면 이름으로
              }}
              maxLength={7}
              style={iStyle(false)}
            />
            <select
              className="mora-select"
              value={form.industry}
              onChange={e => up("industry", e.target.value)}
              style={{ ...sStyle(false), marginTop: 10 }}
            >
              <option value="">회사 업종 선택 (선택 안 함)</option>
              {INDUSTRY.map(it => <option key={it.label} value={it.label}>{it.label}</option>)}
            </select>
            <div style={{ fontSize: 12, color: C.fog, fontFamily: "sans-serif", margin: "4px 2px 0" }}>
              업종은 내가 하는 일이나 만드는 결과물을 기준으로 골라줘. 창립 연월은 회사의 나이를, 업종은 회사의 기운을 봐서 나와의 궁합을 맞춰볼게.
            </div>
          </div>

          {/* 이름 */}
          <div style={{ marginBottom: 48 }}>
            <div style={qStyle}>
              이 우주에서 선물받은 이름,{"\n"}나한테도 알려줄 수 있어?
            </div>
            <input
              ref={nameRef}
              className="mora-input"
              type="text"
              placeholder="이름"
              value={form.name}
              onChange={e => up("name", e.target.value)}
              style={iStyle(!!err.name)}
            />
            {err.name && <div style={errStyle}>{err.name}</div>}
          </div>

          <button
            onClick={handleSubmit}
            style={{
              width: "100%",
              background: C.walnut,
              border: `1px solid ${C.caramel}`,
              borderRadius: 10,
              padding: "16px",
              color: C.parchment,
              fontSize: 14,
              cursor: "pointer",
              fontFamily: "sans-serif",
              letterSpacing: 2,
              transition: "all 0.2s",
            }}
          >
            보내기
          </button>
        </div>
      )}
    </div>
  )
}

const qStyle = {
  fontSize: 16, color: "#F0E8DC", marginBottom: 16,
  lineHeight: 1.8, letterSpacing: 0.3, whiteSpace: "pre-line",
}

const iStyle = (hasErr) => ({
  width: "100%", background: "#1A1220",
  border: `1px solid ${hasErr ? "#7B4FA6" : "#3D2016"}`,
  borderRadius: 8, padding: "14px 16px",
  color: "#F0E8DC", fontSize: 14, fontFamily: "sans-serif",
  outline: "none", boxSizing: "border-box", letterSpacing: 0.3,
  transition: "border-color 0.2s",
})

const sStyle = (hasErr) => ({
  ...iStyle(hasErr),
  appearance: "none", WebkitAppearance: "none", cursor: "pointer",
})

const errStyle = {
  fontSize: 11, color: "#B89FCC", marginTop: 4, fontFamily: "sans-serif",
}
