'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

// Admin emaillar — faqat shu emaillar admin panelga kira oladi
const ADMIN_EMAILS = ['admin@shartnoma.uz', 'alisherallayorov98@gmail.com']

type OrgRow = {
  id: string; name: string; inn: string; user_id: string
  created_at: string; user_email?: string
}
type SubRow = {
  id: string; organization_id: string; plan: string
  contracts_used: number; period_end: string; is_active: boolean
  org_name?: string; org_inn?: string; user_email?: string
}

export default function AdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'subscriptions'|'organizations'|'stats'>('subscriptions')
  const [subs, setSubs] = useState<SubRow[]>([])
  const [orgs, setOrgs] = useState<OrgRow[]>([])
  const [stats, setStats] = useState({ totalUsers: 0, totalOrgs: 0, totalContracts: 0, paidOrgs: 0 })
  const [editSub, setEditSub] = useState<SubRow | null>(null)
  const [editForm, setEditForm] = useState({ plan: 'standard', period_end: '', is_active: true })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => { checkAdmin() }, [])

  async function checkAdmin() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session || !ADMIN_EMAILS.includes(session.user.email || '')) {
      router.push('/dashboard')
      return
    }
    await loadAll()
    setLoading(false)
  }

  async function loadAll() {
    await Promise.all([loadSubs(), loadOrgs(), loadStats()])
  }

  async function loadSubs() {
    const { data: subsData } = await supabase
      .from('subscriptions')
      .select('*, organizations(name, inn, user_id)')
      .order('created_at', { ascending: false })

    if (subsData) {
      const enriched = await Promise.all(subsData.map(async (s: any) => {
        let email = ''
        if (s.organizations?.user_id) {
          const { data: profile } = await supabase
            .from('profiles').select('full_name').eq('id', s.organizations.user_id).single()
          email = profile?.full_name || s.organizations.user_id.slice(0, 8) + '...'
        }
        return {
          ...s,
          org_name: s.organizations?.name,
          org_inn: s.organizations?.inn,
          user_email: email
        }
      }))
      setSubs(enriched)
    }
  }

  async function loadOrgs() {
    const { data } = await supabase.from('organizations').select('*').order('created_at', { ascending: false })
    setOrgs(data || [])
  }

  async function loadStats() {
    const [{ count: users }, { count: orgsCount }, { count: contracts }, { count: paid }] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('organizations').select('*', { count: 'exact', head: true }),
      supabase.from('contracts').select('*', { count: 'exact', head: true }),
      supabase.from('subscriptions').select('*', { count: 'exact', head: true }).neq('plan', 'free').eq('is_active', true),
    ])
    setStats({ totalUsers: users||0, totalOrgs: orgsCount||0, totalContracts: contracts||0, paidOrgs: paid||0 })
  }

  async function updateSubscription(e: React.FormEvent) {
    e.preventDefault()
    if (!editSub) return
    setSaving(true)
    await supabase.from('subscriptions').update({
      plan: editForm.plan,
      period_end: editForm.period_end,
      is_active: editForm.is_active,
      contracts_used: 0
    }).eq('id', editSub.id)
    setMsg(`✓ ${editSub.org_name} uchun tarif yangilandi`)
    setEditSub(null)
    setSaving(false)
    setTimeout(() => setMsg(''), 3000)
    loadSubs()
  }

  async function createSubForOrg(orgId: string) {
    const endDate = new Date(Date.now() + 30*24*60*60*1000).toISOString()
    const { data: { session } } = await supabase.auth.getSession()
    const existing = subs.find(s => s.organization_id === orgId)
    if (existing) {
      await supabase.from('subscriptions').update({ plan: 'standard', is_active: true, period_end: endDate, contracts_used: 0 }).eq('id', existing.id)
    } else {
      const org = orgs.find(o => o.id === orgId)
      await supabase.from('subscriptions').insert({
        organization_id: orgId, user_id: org?.user_id,
        plan: 'standard', contracts_used: 0, period_end: endDate, is_active: true
      })
    }
    setMsg('✓ Standart tarif faollashtirildi (30 kun)')
    setTimeout(() => setMsg(''), 3000)
    loadSubs()
  }

  const filteredSubs = subs.filter(s =>
    !search ||
    s.org_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.org_inn?.includes(search)
  )

  const inp = "w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
  const lbl = "block text-xs font-medium text-gray-400 mb-1.5"

  const planColor = (plan: string) => ({
    free: 'bg-gray-700 text-gray-300',
    standard: 'bg-blue-900 text-blue-300',
    ai_pro: 'bg-purple-900 text-purple-300',
  }[plan] || 'bg-gray-700 text-gray-300')

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"/>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center font-bold text-sm">A</div>
          <div>
            <span className="font-bold">Shartnoma.uz</span>
            <span className="text-red-400 text-xs ml-2 bg-red-900/30 px-2 py-0.5 rounded">ADMIN PANEL</span>
          </div>
        </div>
        <button onClick={() => router.push('/dashboard')}
          className="text-gray-400 hover:text-white text-sm flex items-center gap-2 transition">
          ← Dashboardga qaytish
        </button>
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {msg && (
          <div className="bg-emerald-900/40 border border-emerald-700 text-emerald-300 px-4 py-3 rounded-xl text-sm">
            {msg}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Jami foydalanuvchi", value: stats.totalUsers, icon: '👥', color: 'from-blue-600 to-blue-900' },
            { label: "Jami tashkilot", value: stats.totalOrgs, icon: '🏢', color: 'from-purple-600 to-purple-900' },
            { label: "Jami shartnoma", value: stats.totalContracts, icon: '📄', color: 'from-emerald-600 to-emerald-900' },
            { label: "To'lovli obuna", value: stats.paidOrgs, icon: '💳', color: 'from-orange-600 to-orange-900' },
          ].map((s, i) => (
            <div key={i} className={`bg-gradient-to-br ${s.color} rounded-xl p-5 shadow-lg`}>
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="text-3xl font-bold">{s.value}</div>
              <div className="text-sm opacity-80 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-800 pb-0">
          {[
            { key: 'subscriptions', label: 'Obunalar' },
            { key: 'organizations', label: 'Tashkilotlar' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as any)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition -mb-px ${
                tab === t.key ? 'border-blue-500 text-white' : 'border-transparent text-gray-400 hover:text-white'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tashkilot nomi yoki STR bo'yicha..."
            className="w-full bg-gray-900 border border-gray-800 text-white rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"/>
        </div>

        {/* Subscriptions table */}
        {tab === 'subscriptions' && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-800/50">
                  {['TASHKILOT', 'STR (INN)', 'FOYDALANUVCHI', 'TARIF', 'MUDDAT', 'ISHLATILGAN', 'HOLAT', 'AMAL'].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-gray-400 px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredSubs.map(s => {
                  const isExpired = new Date(s.period_end) < new Date()
                  return (
                    <tr key={s.id} className="hover:bg-gray-800/40 transition">
                      <td className="px-4 py-3.5 text-sm font-medium text-white">{s.org_name||'—'}</td>
                      <td className="px-4 py-3.5 text-sm font-mono text-gray-400">{s.org_inn||'—'}</td>
                      <td className="px-4 py-3.5 text-sm text-gray-400">{s.user_email||'—'}</td>
                      <td className="px-4 py-3.5">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${planColor(s.plan)}`}>
                          {s.plan === 'free' ? 'Bepul' : s.plan === 'standard' ? 'Standart' : 'AI Pro'}
                        </span>
                      </td>
                      <td className={`px-4 py-3.5 text-sm ${isExpired ? 'text-red-400' : 'text-gray-300'}`}>
                        {new Date(s.period_end).toLocaleDateString('uz-UZ')}
                        {isExpired && <span className="text-xs text-red-500 ml-1">(Muddati o'tgan)</span>}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-gray-300">{s.contracts_used}</td>
                      <td className="px-4 py-3.5">
                        <span className={`text-xs px-2 py-1 rounded-full ${s.is_active ? 'bg-emerald-900 text-emerald-300' : 'bg-red-900 text-red-300'}`}>
                          {s.is_active ? 'Faol' : 'Nofaol'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex gap-2">
                          <button
                            onClick={() => createSubForOrg(s.organization_id)}
                            className="text-xs bg-emerald-800 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded-lg transition whitespace-nowrap"
                            title="30 kunlik Standart tarif berish">
                            +30 kun
                          </button>
                          <button
                            onClick={() => {
                              setEditSub(s)
                              setEditForm({
                                plan: s.plan,
                                period_end: s.period_end.split('T')[0],
                                is_active: s.is_active
                              })
                            }}
                            className="text-xs bg-blue-900 hover:bg-blue-800 text-white px-2.5 py-1.5 rounded-lg transition">
                            ✏️
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filteredSubs.length === 0 && (
              <div className="p-10 text-center text-gray-500 text-sm">Ma'lumot topilmadi</div>
            )}
          </div>
        )}

        {/* Organizations table */}
        {tab === 'organizations' && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-800/50">
                  {['TASHKILOT', 'STR (INN)', 'MANZIL', 'YARATILGAN', 'TARIF', 'AMAL'].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-gray-400 px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {orgs.filter(o => !search || o.name.toLowerCase().includes(search.toLowerCase()) || o.inn?.includes(search)).map(org => {
                  const sub = subs.find(s => s.organization_id === org.id)
                  return (
                    <tr key={org.id} className="hover:bg-gray-800/40 transition">
                      <td className="px-4 py-3.5 text-sm font-medium text-white">{org.name}</td>
                      <td className="px-4 py-3.5 text-sm font-mono text-gray-400">{org.inn||'—'}</td>
                      <td className="px-4 py-3.5 text-sm text-gray-400 max-w-[150px] truncate">{(org as any).address||'—'}</td>
                      <td className="px-4 py-3.5 text-sm text-gray-400 whitespace-nowrap">
                        {new Date(org.created_at).toLocaleDateString('uz-UZ')}
                      </td>
                      <td className="px-4 py-3.5">
                        {sub ? (
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${planColor(sub.plan)}`}>
                            {sub.plan === 'free' ? 'Bepul' : sub.plan === 'standard' ? 'Standart' : 'AI Pro'}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-600">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <button onClick={() => createSubForOrg(org.id)}
                          className="text-xs bg-blue-900 hover:bg-blue-800 text-white px-3 py-1.5 rounded-lg transition whitespace-nowrap">
                          Tarif berish
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit modal */}
      {editSub && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-800">
              <h2 className="font-semibold">{editSub.org_name} — Tarifni tahrirlash</h2>
              <button onClick={() => setEditSub(null)} className="text-gray-400 hover:text-white text-xl w-8 h-8 flex items-center justify-center hover:bg-gray-800 rounded-lg">×</button>
            </div>
            <form onSubmit={updateSubscription} className="p-6 space-y-4">
              <div>
                <label className={lbl}>Tarif rejasi</label>
                <select className={inp} value={editForm.plan} onChange={e => setEditForm({...editForm, plan: e.target.value})}>
                  <option value="free">Bepul</option>
                  <option value="standard">Standart (50,000 so'm/oy)</option>
                  <option value="ai_pro">AI Pro (199,000 so'm/oy)</option>
                </select>
              </div>
              <div>
                <label className={lbl}>Muddat tugash sanasi</label>
                <input type="date" className={inp} value={editForm.period_end}
                  onChange={e => setEditForm({...editForm, period_end: e.target.value})}/>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={editForm.is_active}
                  onChange={e => setEditForm({...editForm, is_active: e.target.checked})}
                  className="w-4 h-4 accent-blue-500"/>
                <span className="text-sm text-gray-300">Faol holat</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditSub(null)}
                  className="flex-1 border border-gray-700 text-gray-300 py-2.5 rounded-lg text-sm hover:bg-gray-800 transition">
                  Bekor qilish
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-semibold transition">
                  {saving ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
