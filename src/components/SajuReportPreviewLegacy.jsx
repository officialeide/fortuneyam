// components/SajuReportPreviewLegacy.jsx
// 예전 7체계 탭 UI (MoraReport 전환 이전, ~2026-07-15 이전 저장 리포트용)
import React, { useState } from 'react';
import { S } from './ui.jsx';
import TabSummary from './TabSummary.jsx';
import TabSaju from './TabSaju.jsx';
import TabInner from './TabInner.jsx';
import TabTojung from './TabTojung.jsx';
import TabAstro from './TabAstro.jsx';
import TabMBTI from './TabMBTI.jsx';

function SajuReport_PreviewLegacy({ data }) {
  const [tab, setTab] = useState("요약");
  const [previewAstroAI, setPreviewAstroAI] = useState(data?._astroAI || null);
  const [previewTarotAI, setPreviewTarotAI] = useState(data?._tarotAI || null);
  const [previewInnerAI, setPreviewInnerAI] = useState(data?._innerAI || null);
  const TABS = ["요약", "사주", "토정·주역", "별자리·타로수비학", "MBTI", "내면 해부"];
  if (!data) return <div style={{ padding: 20, color: "#aaa" }}>데이터 없음</div>;
  return (
    <div style={{ maxWidth: 480, margin: "0 auto" }}>
      <div style={{ padding: "10px 16px", background: "#fff3e0", fontSize: 11, color: "#e65100", textAlign: "center", fontWeight: 700 }}>
        관리자 미리보기 (예전 버전): {data.name} ({data.birth})
      </div>
      <div style={{ ...S.tabBar, overflowX: "auto" }}>
        {TABS.map(t => <button key={t} onClick={() => setTab(t)} style={{ ...S.tab, whiteSpace: "nowrap", ...(tab === t ? S.tabA : {}) }}>{t}</button>)}
      </div>
      <div style={S.content}>
        {tab === "요약" && <TabSummary d={data} changeTab={setTab} />}
        {tab === "사주" && <TabSaju d={data} reportData={data} />}
        {tab === "내면 해부" && <TabInner d={data} parentInnerAI={previewInnerAI} setParentInnerAI={setPreviewInnerAI} />}
        {tab === "토정·주역" && <TabTojung d={data} />}
        {tab === "별자리·타로수비학" && <TabAstro d={data} parentAstroAI={previewAstroAI} setParentAstroAI={setPreviewAstroAI} parentTarotAI={previewTarotAI} setParentTarotAI={setPreviewTarotAI} />}
        {tab === "MBTI" && <TabMBTI d={data} />}
      </div>
    </div>
  );
}

export { SajuReport_PreviewLegacy };
