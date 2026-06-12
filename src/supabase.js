import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 사용자 저장 또는 기존 사용자 찾기
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function saveUser(formInput) {
  const { name, year, month, day, hour, minute, gender, city } = formInput
  const birth_date = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`
  const birth_time = `${String(hour).padStart(2,'0')}:${String(minute||'0').padStart(2,'0')}`

  // 동일한 사용자 있으면 기존 반환
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('name', name)
    .eq('birth_date', birth_date)
    .eq('birth_time', birth_time)
    .maybeSingle()

  if (existing) return { userId: existing.id, isNew: false }

  // 없으면 새로 저장
  const { data, error } = await supabase
    .from('users')
    .insert({ name, gender, birth_date, birth_time, city })
    .select('id')
    .single()

  if (error) throw error
  return { userId: data.id, isNew: true }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 분석 결과 저장
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function saveReport(userId, reportData) {
  const { pillars, pillarsB, ohaengDist, sinsal, daeun, summary, ...rest } = reportData

  const { data, error } = await supabase
    .from('reports')
    .insert({
      user_id: userId,
      pillars_json: { pillars, pillarsB },
      ohaeng_json: ohaengDist,
      sinsal_json: sinsal,
      daeun_json: daeun,
      summary_json: summary,
      full_data_json: reportData,
    })
    .select('id')
    .single()

  if (error) throw error
  return data.id
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 기존 리포트 불러오기 (이름+생년월일 기준)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function loadReport(name, birthDate, birthTime) {
  const { data, error } = await supabase
    .from('users')
    .select(`
      id, name, gender, birth_date, birth_time, city,
      reports (id, full_data_json, created_at)
    `)
    .eq('name', name)
    .eq('birth_date', birthDate)
    .eq('birth_time', birthTime)
    .maybeSingle()

  if (error || !data) return null
  if (!data.reports || data.reports.length === 0) return null

  // 가장 최근 리포트 반환
  const latest = data.reports.sort((a, b) =>
    new Date(b.created_at) - new Date(a.created_at)
  )[0]

  return latest.full_data_json
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 최근 분석 목록 (홈 화면용)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function getRecentReports(limit = 5) {
  const { data, error } = await supabase
    .from('reports')
    .select(`
      id, created_at,
      users (name, birth_date, gender)
    `)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return []
  return data
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 동일 생년월일+시간+성별+도시 캐시 조회 (1년 이내)
// formInput: { year, month, day, hour, minute, gender, city }
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function findCachedReport(formInput) {
  const { year, month, day, hour, minute, gender, city } = formInput
  const birth_date = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`
  const birth_time = `${String(hour).padStart(2,'0')}:${String(minute||'0').padStart(2,'0')}`
  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

  const { data, error } = await supabase
    .from('users')
    .select(`
      id,
      reports (id, full_data_json, created_at)
    `)
    .eq('birth_date', birth_date)
    .eq('birth_time', birth_time)
    .eq('gender', gender)
    .eq('city', city)
    .maybeSingle()

  if (error || !data) return null
  if (!data.reports || data.reports.length === 0) return null

  // 1년 이내 리포트만, 가장 최근 것
  const recent = data.reports
    .filter(r => new Date(r.created_at) > oneYearAgo)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]

  return recent ? recent.full_data_json : null
}
