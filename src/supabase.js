import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 캐시 사용 여부 (환경변수 VITE_DISABLE_CACHE=true 면 비활성화)
// 개발/테스트 중 항상 새로 계산하려면 Netlify에 VITE_DISABLE_CACHE=true 추가
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const CACHE_ENABLED = import.meta.env.VITE_DISABLE_CACHE !== 'true'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 사용자 저장 또는 기존 사용자 찾기
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function saveUser(formInput) {
  const { name, year, month, day, hour, minute, gender, city } = formInput
  const birth_date = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`
  const birth_time = `${String(hour).padStart(2,'0')}:${String(minute||'0').padStart(2,'0')}`

  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('name', name)
    .eq('birth_date', birth_date)
    .eq('birth_time', birth_time)
    .limit(1)

  if (existing && existing.length > 0) return { userId: existing[0].id, isNew: false }

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
  const { pillars, pillarsB, ohaengDist, sinsal, daeun, summary } = reportData

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
// 동일 생년월일+시간+성별+도시 캐시 조회 (1년 이내)
// CACHE_ENABLED=false 면 항상 null (새로 계산)
// 같은 조건 유저가 둘 이상이어도 .limit() 으로 안전 처리 (maybeSingle은 에러남)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function findCachedReport(formInput) {
  if (!CACHE_ENABLED) return null

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
    .limit(5)

  if (error || !data || data.length === 0) return null

  const allReports = data.flatMap(u => u.reports || [])
  const recent = allReports
    .filter(r => new Date(r.created_at) > oneYearAgo)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]

  return recent ? recent.full_data_json : null
}
