// components/SajuReportPreview.jsx
import React from 'react';
import MoraReport from './MoraReport.jsx';
import { SajuReport_PreviewLegacy } from './SajuReportPreviewLegacy.jsx';

// MoraReport 전환 시점(2026-07-15) 이전 저장 리포트는 예전 탭 UI로,
// 이후 저장 리포트는 라이브와 동일한 MoraReport로 렌더
const MORA_CUTOFF = new Date("2026-07-15T10:37:20+09:00").getTime();

function SajuReport_Preview({ data, createdAt, onBack }) {
  if (!data) return <div style={{ padding: 20, color: "#aaa" }}>데이터 없음</div>;

  const ts = createdAt ? new Date(createdAt).getTime() : null;
  const isLegacy = ts !== null && !Number.isNaN(ts) && ts < MORA_CUTOFF;

  if (isLegacy) return <SajuReport_PreviewLegacy data={data} />;

  return (
    <div style={{ maxWidth: 480, margin: "0 auto" }}>
      <div style={{ padding: "10px 16px", background: "#fff3e0", fontSize: 11, color: "#e65100", textAlign: "center", fontWeight: 700 }}>
        관리자 미리보기 (읽기 전용)
      </div>
      <MoraReport
        d={data}
        onHome={onBack}
        onSavePDF={null}
        pdfLoading={false}
        parentAstroAI={data?._astroAI || null}
        setParentAstroAI={() => {}}
        parentTarotAI={data?._tarotAI || null}
        setParentTarotAI={() => {}}
      />
    </div>
  );
}

export { SajuReport_Preview };
