'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { CONTRACT_TEMPLATES, CONTRACT_TYPE_NAMES, fillTemplate } from '@/lib/contractTemplates'
import { getStructure, structureToText, numberToWords, ContractStructure } from '@/lib/contractStructures'

// ─── Types ───────────────────────────────────────────────
type Org = {
  id: string; name: string; inn: string; director_name: string
  bank_name: string; bank_account: string; mfo: string; address: string
  stamp_url?: string; signature_url?: string
}
type BankAccount = {
  id: string; organization_id: string; bank_name: string
  account_number: string; mfo: string; is_default: boolean
}
type Counterparty = {
  id: string; name: string; inn: string; director_name: string
  bank_name: string; bank_account: string; mfo: string; address: string
}
type Contract = {
  id: string; contract_number: string; contract_date: string
  contract_type: string; amount: number; status: string
  organization_id: string; counterparty_id: string
  organizations?: Org; counterparties?: Counterparty; created_at: string
  content?: string; city?: string; product_name?: string
  spec_items?: SpecItem[]
}
type SpecItem = {
  nomi: string; birlik: string; miqdori: number; narxi: number; summa: number
}
type Subscription = {
  id: string; organization_id: string; plan: string
  contracts_used: number; period_end: string; is_active: boolean
}

// ─── Constants ───────────────────────────────────────────
const STATUSES = {
  draft:     { label: 'Qoralama',       bg: 'bg-gray-700',    text: 'text-gray-300' },
  active:    { label: 'Faol',           bg: 'bg-emerald-900', text: 'text-emerald-300' },
  completed: { label: 'Bajarilgan',     bg: 'bg-blue-900',    text: 'text-blue-300' },
  cancelled: { label: 'Bekor qilingan', bg: 'bg-red-900',     text: 'text-red-300' },
}
const CONTRACT_TYPES: Record<string, string> = {
  oldi_sotdi: 'Oldi-sotdi shartnomasi',
  xizmat: "Xizmat ko'rsatish shartnomasi",
  ijara: 'Ijara shartnomasi',
  pudrat: 'Pudrat shartnomasi',
  qoshimcha: "Qo'shimcha shartnoma",
  moliyaviy: 'Moliyaviy yordam shartnomasi',
  daval: 'Daval shartnomasi',
  xalqaro: 'Xalqaro shartnoma',
  boshqa: 'Boshqa',
}
const FREE_LIMIT = 5
const NAV = [
  { key: 'overview',       icon: '▣',  label: "Umumiy ko'rinish" },
  { key: 'contracts',      icon: '📄', label: 'Shartnomalar' },
  { key: 'organizations',  icon: '🏢', label: 'Tashkilotlarim' },
  { key: 'counterparties', icon: '🤝', label: 'Kontragentlar' },
  { key: 'profile',        icon: '👤', label: 'Profil' },
]

// ─── Main Component ───────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter()
  const [tab, setTab] = useState('overview')
  const [userEmail, setUserEmail] = useState('')
  const [userId, setUserId] = useState('')
  const [orgs, setOrgs] = useState<Org[]>([])
  const [activeOrg, setActiveOrg] = useState<Org | null>(null)
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [cps, setCps] = useState<Counterparty[]>([])
  const [contracts, setContracts] = useState<Contract[]>([])
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [cpSearch, setCpSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [orgDropdown, setOrgDropdown] = useState(false)

  const [modal, setModal] = useState<null|'org'|'cp'|'contract'|'viewContract'|'bankAccount'|'upgrade'>(null)
  const [viewContract, setViewContract] = useState<Contract | null>(null)
  const [saving, setSaving] = useState(false)

  const emptyOrg = { name:'', inn:'', director_name:'', bank_name:'', bank_account:'', mfo:'', address:'' }
  const emptyCp  = { name:'', inn:'', director_name:'', bank_name:'', bank_account:'', mfo:'', address:'' }
  const emptyContract = {
    contract_number:'', contract_date: new Date().toISOString().split('T')[0],
    contract_type:'oldi_sotdi', amount:'', organization_id:'', counterparty_id:'',
    status:'draft', content:'', city:'Toshkent', product_name:'', spec_items: [] as SpecItem[],
    qqs_enabled: false, qqs_rate: 12
  }
  const emptyBank = { bank_name:'', account_number:'', mfo:'', is_default: false }

  const [orgForm, setOrgForm] = useState(emptyOrg)
  const [cpForm, setCpForm]   = useState(emptyCp)
  const [contractForm, setContractForm] = useState(emptyContract)
  const [bankForm, setBankForm] = useState(emptyBank)

  const [profile, setProfile] = useState({
    full_name:'', phone:'', company_name:'', company_inn:'',
    company_director:'', company_bank:'', company_account:'', company_mfo:'', company_address:''
  })
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMsg, setProfileMsg] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [pwdMsg, setPwdMsg] = useState('')

  const stampRef = useRef<HTMLInputElement>(null)
  const signatureRef = useRef<HTMLInputElement>(null)

  useEffect(() => { init() }, [])

  async function init() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/login'); return }
    setUserEmail(session.user.email || '')
    setUserId(session.user.id)
    await Promise.all([loadOrgs(), loadCps(), loadContracts(), loadProfile(session.user.id)])
    setLoading(false)
  }

  async function loadOrgs() {
    const { data } = await supabase.from('organizations').select('*').order('created_at', { ascending: false })
    const list = data || []
    setOrgs(list)
    if (list.length > 0) {
      setActiveOrg(prev => prev ? (list.find(o => o.id === prev.id) || list[0]) : list[0])
    }
  }

  async function loadBankAccounts(orgId: string) {
    const { data } = await supabase.from('bank_accounts').select('*').eq('organization_id', orgId).order('is_default', { ascending: false })
    setBankAccounts(data || [])
  }

  async function loadSubscription(orgId: string) {
    const { data } = await supabase.from('subscriptions').select('*')
      .eq('organization_id', orgId).eq('is_active', true).single()
    setSubscription(data || null)
  }

  async function loadCps() {
    const { data } = await supabase.from('counterparties').select('*').order('created_at', { ascending: false })
    setCps(data || [])
  }

  async function loadContracts() {
    const { data } = await supabase.from('contracts').select('*, organizations(*), counterparties(*)').order('created_at', { ascending: false })
    setContracts(data || [])
  }

  async function loadProfile(uid: string) {
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).single()
    if (data) setProfile({
      full_name: data.full_name||'', phone: data.phone||'',
      company_name: data.company_name||'', company_inn: data.company_inn||'',
      company_director: data.company_director||'', company_bank: data.company_bank||'',
      company_account: data.company_account||'', company_mfo: data.company_mfo||'',
      company_address: data.company_address||''
    })
  }

  useEffect(() => {
    if (activeOrg) {
      loadBankAccounts(activeOrg.id)
      loadSubscription(activeOrg.id)
    }
  }, [activeOrg])

  async function switchOrg(org: Org) {
    setActiveOrg(org)
    setOrgDropdown(false)
  }

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // ── Quota check ──
  function canCreateContract(): boolean {
    if (!subscription) return (contracts.filter(c => c.organization_id === activeOrg?.id).length < FREE_LIMIT)
    if (subscription.plan === 'free') return subscription.contracts_used < FREE_LIMIT
    return true
  }

  function getQuotaInfo() {
    if (!activeOrg) return null
    const orgContracts = contracts.filter(c => c.organization_id === activeOrg.id)
    if (!subscription || subscription.plan === 'free') {
      const used = subscription?.contracts_used ?? orgContracts.length
      return { plan: 'Bepul', used, limit: FREE_LIMIT, percent: Math.min((used / FREE_LIMIT) * 100, 100) }
    }
    return { plan: subscription.plan === 'standard' ? 'Standart' : 'AI Pro', used: null, limit: null, percent: null }
  }

  // ── Save org ──
  async function saveOrg(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    const { data: { session } } = await supabase.auth.getSession()
    const { data: newOrg } = await supabase.from('organizations').insert({ ...orgForm, user_id: session!.user.id }).select().single()
    if (newOrg) {
      // Create free subscription for new org
      await supabase.from('subscriptions').insert({
        organization_id: newOrg.id, user_id: session!.user.id,
        plan: 'free', contracts_used: 0,
        period_end: new Date(Date.now() + 30*24*60*60*1000).toISOString()
      })
    }
    setModal(null); setOrgForm(emptyOrg); setSaving(false); loadOrgs()
  }

  async function saveCp(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    const { data: { session } } = await supabase.auth.getSession()
    await supabase.from('counterparties').insert({ ...cpForm, user_id: session!.user.id })
    setModal(null); setCpForm(emptyCp); setSaving(false); loadCps()
  }

  async function saveContract(e: React.FormEvent) {
    e.preventDefault()
    if (!canCreateContract()) { setModal('upgrade'); return }
    setSaving(true)
    const { data: { session } } = await supabase.auth.getSession()
    await supabase.from('contracts').insert({
      contract_number: contractForm.contract_number,
      contract_date: contractForm.contract_date,
      contract_type: contractForm.contract_type,
      amount: parseFloat(contractForm.amount)||0,
      organization_id: contractForm.organization_id,
      counterparty_id: contractForm.counterparty_id,
      status: contractForm.status,
      content: contractForm.content,
      city: contractForm.city,
      product_name: contractForm.product_name || null,
      spec_items: contractForm.spec_items?.length ? contractForm.spec_items : null,
      qqs_enabled: contractForm.qqs_enabled || false,
      qqs_rate: contractForm.qqs_rate || 12,
      user_id: session!.user.id
    })
    if (subscription) {
      await supabase.from('subscriptions').update({ contracts_used: subscription.contracts_used + 1 }).eq('id', subscription.id)
    }
    setModal(null); setContractForm(emptyContract); setSaving(false)
    loadContracts(); if (activeOrg) loadSubscription(activeOrg.id)
  }

  async function saveBankAccount(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (bankForm.is_default && activeOrg) {
      await supabase.from('bank_accounts').update({ is_default: false }).eq('organization_id', activeOrg.id)
    }
    await supabase.from('bank_accounts').insert({ ...bankForm, organization_id: activeOrg!.id, user_id: session!.user.id })
    setModal(null); setBankForm(emptyBank); setSaving(false); loadBankAccounts(activeOrg!.id)
  }

  async function copyContract(c: Contract) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!canCreateContract()) { setModal('upgrade'); return }
    const newNum = c.contract_number + '-NUSXA'
    await supabase.from('contracts').insert({
      contract_number: newNum, contract_date: new Date().toISOString().split('T')[0],
      contract_type: c.contract_type, amount: c.amount, status: 'draft',
      organization_id: c.organization_id, counterparty_id: c.counterparty_id,
      user_id: session!.user.id
    })
    loadContracts()
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from('contracts').update({ status }).eq('id', id)
    loadContracts()
  }

  async function deleteContract(id: string) {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return
    await supabase.from('contracts').delete().eq('id', id)
    loadContracts()
  }

  async function deleteBankAccount(id: string) {
    await supabase.from('bank_accounts').delete().eq('id', id)
    if (activeOrg) loadBankAccounts(activeOrg.id)
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault(); setProfileSaving(true); setProfileMsg('')
    const { data: { session } } = await supabase.auth.getSession()
    await supabase.from('profiles').upsert({ id: session!.user.id, ...profile, updated_at: new Date().toISOString() })
    setProfileMsg('Profil saqlandi ✓'); setProfileSaving(false)
    setTimeout(() => setProfileMsg(''), 3000)
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault(); setPwdMsg('')
    if (newPassword.length < 8) { setPwdMsg("Parol kamida 8 belgi bo'lishi kerak"); return }
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) setPwdMsg('Xatolik: ' + error.message)
    else { setPwdMsg("Parol muvaffaqiyatli o'zgartirildi ✓"); setNewPassword('') }
    setTimeout(() => setPwdMsg(''), 4000)
  }

  async function uploadImage(file: File, field: 'stamp_url' | 'signature_url') {
    if (!activeOrg) return
    const ext = file.name.split('.').pop()
    const path = `${userId}/${activeOrg.id}/${field}.${ext}`
    const { error: upErr } = await supabase.storage.from('org-assets').upload(path, file, { upsert: true })
    if (upErr) { alert('Yuklash xatosi: ' + upErr.message); return }
    const { data } = supabase.storage.from('org-assets').getPublicUrl(path)
    await supabase.from('organizations').update({ [field]: data.publicUrl }).eq('id', activeOrg.id)
    loadOrgs()
  }

  async function loadImageAsBase64(url: string): Promise<string | null> {
    try {
      const res = await fetch(url)
      const blob = await res.blob()
      return await new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = () => resolve(null)
        reader.readAsDataURL(blob)
      })
    } catch { return null }
  }

  async function generatePDF(c: Contract) {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const margin = 20
    const pageW = 210
    const pageH = 297
    const contentW = pageW - margin * 2
    const content = c.content || ''

    // Org rasm URL larini olish (contracts join qilmagan, shuning uchun orgs listidan izlaymiz)
    const orgData = orgs.find(o => o.id === c.organization_id)
    const [stampB64, signB64] = await Promise.all([
      orgData?.stamp_url ? loadImageAsBase64(orgData.stamp_url) : Promise.resolve(null),
      orgData?.signature_url ? loadImageAsBase64(orgData.signature_url) : Promise.resolve(null),
    ])

    // ─── Spesifikatsiya jadvali yordamchi funksiya ───
    function drawSpecTable(startY: number): number {
      const items = c.spec_items || []
      if (!items.length) return startY
      let y = startY + 6
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.setTextColor(20, 20, 20)
      doc.text('SPESIFIKATSIYA (1-ILOVA)', margin, y)
      y += 6
      // Jadval sarlavhasi
      const cols = [7, 75, 20, 20, 25, 28] // x positions
      const headers = ['№', 'Mahsulot/xizmat nomi', 'Birlik', 'Miqdori', 'Narxi', 'Summa']
      doc.setFillColor(240, 242, 245)
      doc.rect(margin, y - 4, contentW, 7, 'F')
      doc.setDrawColor(200, 200, 200)
      doc.rect(margin, y - 4, contentW, 7, 'S')
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.setTextColor(60, 60, 60)
      let cx = margin + 2
      headers.forEach((h, i) => { doc.text(h, cx, y); cx += cols[i] })
      y += 5
      // Qatorlar
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(20, 20, 20)
      items.forEach((item, idx) => {
        if (y > pageH - 30) { doc.addPage(); y = margin + 10 }
        doc.setDrawColor(220, 220, 220)
        doc.line(margin, y + 2, margin + contentW, y + 2)
        cx = margin + 2
        const row = [
          String(idx + 1),
          item.nomi,
          item.birlik,
          String(item.miqdori),
          item.narxi.toLocaleString(),
          item.summa.toLocaleString()
        ]
        row.forEach((cell, i) => {
          const maxW = cols[i] - 2
          const truncated = doc.splitTextToSize(cell, maxW)[0] as string
          doc.text(truncated, cx, y); cx += cols[i]
        })
        y += 5
      })
      // Jami qatorlar
      const total = items.reduce((s, item) => s + item.summa, 0)
      const hasQqs = (c as any).qqs_enabled
      const qRate = (c as any).qqs_rate || 12
      const qSum = hasQqs ? Math.round(total * qRate / 100) : 0
      const grand = total + qSum
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.setFillColor(245, 245, 245)
      if (hasQqs) {
        doc.rect(margin, y - 3, contentW, 18, 'F')
        doc.setTextColor(80, 80, 80)
        doc.text(`Soliqsiz jami: ${total.toLocaleString()} so'm`, margin + contentW - 2, y + 1, { align: 'right' })
        doc.text(`QQS (${qRate}%): ${qSum.toLocaleString()} so'm`, margin + contentW - 2, y + 6, { align: 'right' })
        doc.setTextColor(20, 20, 20)
        doc.text(`QQS bilan jami: ${grand.toLocaleString()} so'm`, margin + contentW - 2, y + 12, { align: 'right' })
        y += 18
      } else {
        doc.rect(margin, y - 3, contentW, 6, 'F')
        doc.setTextColor(20, 20, 20)
        doc.text(`Jami: ${total.toLocaleString()} so'm`, margin + contentW - 2, y + 1, { align: 'right' })
        y += 8
      }
      return y
    }

    // ─── Imzo va muhr bloki ───
    async function drawSignatures(y: number) {
      // Yetarli joy bormi?
      if (y > pageH - 55) { doc.addPage(); y = margin }
      y += 8
      doc.setDrawColor(200, 200, 200)
      doc.line(margin, y, margin + contentW, y)
      y += 8
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(30, 30, 30)
      doc.text('BUYURTMACHI:', margin, y)
      doc.text('IJROCHI:', margin + 95, y)
      y += 5
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(80, 80, 80)
      if (c.organizations) {
        const o = c.organizations
        doc.text(o.name || '', margin, y)
        doc.text(`INN: ${o.inn || '—'}`, margin, y + 5)
        doc.text(`Rahbar: ${o.director_name || '—'}`, margin, y + 10)
      }
      if (c.counterparties) {
        const cp = c.counterparties
        doc.text(cp.name || '', margin + 95, y)
        doc.text(`INN: ${cp.inn || '—'}`, margin + 95, y + 5)
        doc.text(`Rahbar: ${cp.director_name || '—'}`, margin + 95, y + 10)
      }
      y += 18
      // Imzo chiziqlari
      doc.setDrawColor(150, 150, 150)
      doc.line(margin, y, margin + 60, y)
      doc.line(margin + 95, y, margin + 155, y)
      doc.setFontSize(7)
      doc.setTextColor(150, 150, 150)
      doc.text('Imzo', margin + 30, y + 4, { align: 'center' })
      doc.text('Imzo', margin + 125, y + 4, { align: 'center' })
      y += 12
      // Muhr va imzo rasmlari
      try {
        if (signB64) {
          doc.addImage(signB64, 'PNG', margin, y - 22, 30, 15)
        }
        if (stampB64) {
          doc.addImage(stampB64, 'PNG', margin + 5, y - 18, 25, 25)
        }
      } catch { /* rasm yuklanmadi */ }
      // Footer
      doc.setFontSize(7)
      doc.setTextColor(180, 180, 180)
      const totalPages = doc.getNumberOfPages()
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p)
        doc.text('Shartnoma.uz — Online shartnoma generatori', pageW / 2, pageH - 6, { align: 'center' })
        doc.text(`${p} / ${totalPages}`, pageW - margin, pageH - 6, { align: 'right' })
      }
    }

    if (content) {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(20, 20, 20)
      const lines = doc.splitTextToSize(content, contentW)
      let y = margin
      const lineHeight = 5.5
      for (let i = 0; i < lines.length; i++) {
        if (y + lineHeight > pageH - margin) { doc.addPage(); y = margin }
        const line = lines[i] as string
        if (
          line.match(/^\d+\.\s[A-Z]/) ||
          line.match(/^[A-ZА-ЯЎҚҒҲ\s]{6,}$/) ||
          line.includes('SHARTNOMA') || line.includes('REKVIZIT')
        ) {
          doc.setFont('helvetica', 'bold'); doc.setFontSize(10)
        } else {
          doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5)
        }
        doc.text(line, margin, y)
        y += lineHeight
      }
      // Spesifikatsiya
      if ((c.spec_items || []).length > 0) {
        if (y > pageH - 60) { doc.addPage(); y = margin }
        y = drawSpecTable(y + 5)
      }
      await drawSignatures(y)
    } else {
      // Matn yo'q — asosiy info
      const t = (text: string, x: number, y: number, size = 11) => {
        doc.setFontSize(size); doc.text(String(text || ''), x, y)
      }
      doc.setFillColor(30, 41, 59); doc.rect(0, 0, 210, 40, 'F')
      doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold')
      t('SHARTNOMA', 105, 16, 20)
      doc.setFont('helvetica', 'normal')
      t(`№ ${c.contract_number}  |  ${c.contract_date}  |  ${c.city || 'Toshkent'}`, 105, 27, 10)
      doc.setTextColor(0, 0, 0); doc.setDrawColor(200, 200, 200)
      doc.rect(10, 48, 90, 65); doc.rect(110, 48, 90, 65)
      doc.setFontSize(8); doc.setTextColor(100, 100, 100)
      doc.text('BUYURTMACHI', 55, 54, { align: 'center' })
      doc.text('IJROCHI', 155, 54, { align: 'center' })
      doc.setTextColor(0, 0, 0)
      if (c.organizations) {
        const o = c.organizations
        t(o.name, 13, 62, 9); t(`INN: ${o.inn || '—'}`, 13, 70, 8)
        t(`Rahbar: ${o.director_name || '—'}`, 13, 78, 8)
        t(`Bank: ${o.bank_name || '—'}`, 13, 86, 8)
        t(`H/r: ${o.bank_account || '—'}`, 13, 94, 8)
        t(`MFO: ${o.mfo || '—'}`, 13, 102, 8)
      }
      if (c.counterparties) {
        const cp = c.counterparties
        t(cp.name, 113, 62, 9); t(`INN: ${cp.inn || '—'}`, 113, 70, 8)
        t(`Rahbar: ${cp.director_name || '—'}`, 113, 78, 8)
        t(`Bank: ${cp.bank_name || '—'}`, 113, 86, 8)
        t(`H/r: ${cp.bank_account || '—'}`, 113, 94, 8)
        t(`MFO: ${cp.mfo || '—'}`, 113, 102, 8)
      }
      doc.line(10, 122, 200, 122)
      t(`Tur: ${CONTRACT_TYPE_NAMES[c.contract_type as keyof typeof CONTRACT_TYPE_NAMES] || c.contract_type}`, 10, 132, 9)
      let infoY = 140
      if (c.product_name) { t(`Mahsulot/xizmat: ${c.product_name}`, 10, infoY, 9); infoY += 8 }
      t(`Summa: ${c.amount?.toLocaleString()} so'm`, 10, infoY, 9)
      let nextY = infoY + 12
      if ((c.spec_items || []).length > 0) nextY = drawSpecTable(nextY)
      await drawSignatures(nextY)
    }

    doc.save(`shartnoma-${c.contract_number.replace(/\//g, '-')}.pdf`)
  }

  // ── Filters ──
  const filteredContracts = contracts.filter(c => {
    const s = search.toLowerCase()
    const matchSearch = !search || c.contract_number.toLowerCase().includes(s) ||
      c.organizations?.name.toLowerCase().includes(s) || c.counterparties?.name.toLowerCase().includes(s)
    const matchStatus = statusFilter === 'all' || c.status === statusFilter
    return matchSearch && matchStatus
  })

  const filteredCps = cps.filter(cp => {
    const s = cpSearch.toLowerCase()
    return !cpSearch || cp.name.toLowerCase().includes(s) || cp.inn?.toLowerCase().includes(s)
  })

  const totalActive = contracts.filter(c => c.status === 'active').reduce((s,c) => s+(c.amount||0), 0)
  const quota = getQuotaInfo()

  // ── Styles ──
  const inp = "w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-500"
  const lbl = "block text-xs font-medium text-gray-400 mb-1.5"

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"/>
        <div className="text-gray-400 text-sm">Yuklanmoqda...</div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 flex text-white">

      {/* ── SIDEBAR ── */}
      <aside className={`${sidebarOpen?'w-64':'w-16'} bg-gray-900 border-r border-gray-800 flex flex-col flex-shrink-0 transition-all duration-300`}>

        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-gray-800 gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-sm shadow-lg shadow-blue-900/50">S</div>
          {sidebarOpen && <span className="text-lg font-bold">Shartnoma.uz</span>}
        </div>

        {/* Org Switcher */}
        {sidebarOpen && orgs.length > 0 && (
          <div className="px-3 pt-3 relative">
            <button
              onClick={() => setOrgDropdown(!orgDropdown)}
              className="w-full flex items-center gap-2 bg-gray-800 hover:bg-gray-750 border border-gray-700 rounded-lg px-3 py-2.5 transition text-left"
            >
              <div className="w-7 h-7 bg-blue-900 rounded-md flex items-center justify-center text-xs font-bold text-blue-300 flex-shrink-0">
                {activeOrg?.name[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-white truncate">{activeOrg?.name}</div>
                <div className="text-xs text-gray-500">INN: {activeOrg?.inn||'—'}</div>
              </div>
              <svg className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${orgDropdown?'rotate-180':''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
              </svg>
            </button>
            {orgDropdown && (
              <div className="absolute left-3 right-3 top-full mt-1 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
                {orgs.map(org => (
                  <button key={org.id} onClick={() => switchOrg(org)}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-gray-700 transition text-sm ${activeOrg?.id===org.id?'bg-blue-900/30 text-blue-300':'text-gray-300'}`}>
                    <div className="w-6 h-6 bg-gray-700 rounded flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {org.name[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-medium">{org.name}</div>
                      <div className="text-xs text-gray-500">{org.inn}</div>
                    </div>
                    {activeOrg?.id===org.id && <span className="ml-auto text-blue-400 text-xs">●</span>}
                  </button>
                ))}
                <div className="border-t border-gray-700">
                  <button onClick={() => { setModal('org'); setOrgDropdown(false) }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-gray-700 transition text-sm text-blue-400">
                    <span>+</span> Yangi tashkilot
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quota bar */}
        {sidebarOpen && quota && (
          <div className="px-3 pt-3">
            <div className="bg-gray-800 rounded-lg px-3 py-2.5">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-gray-400">Tarif: <span className="text-white font-medium">{quota.plan}</span></span>
                {quota.limit && <span className="text-gray-400">{quota.used}/{quota.limit}</span>}
              </div>
              {quota.limit && (
                <>
                  <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${quota.percent! >= 100 ? 'bg-red-500' : quota.percent! >= 80 ? 'bg-yellow-500' : 'bg-blue-500'}`}
                      style={{ width: `${quota.percent}%` }}/>
                  </div>
                  {quota.percent! >= 80 && (
                    <button onClick={() => setModal('upgrade')} className="text-xs text-yellow-400 mt-1.5 hover:text-yellow-300">
                      ⚡ Tarifni yaxshilash →
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 mt-2 overflow-hidden">
          {NAV.map(item => (
            <button key={item.key} onClick={() => setTab(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                tab===item.key ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}>
              <span className="text-base flex-shrink-0">{item.icon}</span>
              {sidebarOpen && <span className="flex-1 text-left font-medium">{item.label}</span>}
              {sidebarOpen && item.key==='contracts' && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab===item.key?'bg-blue-500':'bg-gray-700 text-gray-400'}`}>
                  {contracts.length}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-gray-800 space-y-2">
          {sidebarOpen && (
            <div className="px-3 py-2 rounded-lg bg-gray-800">
              <div className="text-xs text-gray-500">Hisob</div>
              <div className="text-sm text-white truncate font-medium mt-0.5">{userEmail}</div>
            </div>
          )}
          <button onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-red-900/30 hover:text-red-400 transition">
            <span className="flex-shrink-0">🚪</span>
            {sidebarOpen && <span>Chiqish</span>}
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Topbar */}
        <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center px-6 gap-4 flex-shrink-0">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-gray-800 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
          <h1 className="text-base font-semibold flex-1">{NAV.find(n=>n.key===tab)?.label}</h1>
          {['contracts','organizations','counterparties'].includes(tab) && (
            <button
              onClick={() => {
                if (tab==='contracts') { if (!canCreateContract()) { setModal('upgrade'); return } setModal('contract') }
                if (tab==='organizations') setModal('org')
                if (tab==='counterparties') setModal('cp')
              }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-lg shadow-blue-900/30"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
              </svg>
              Yangi qo'shish
            </button>
          )}
        </header>

        <main className="flex-1 overflow-auto p-6 bg-gray-950">

          {/* ─── OVERVIEW ─── */}
          {tab==='overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label:'Jami shartnoma', value:contracts.length, icon:'📄', from:'from-blue-600', to:'to-blue-900' },
                  { label:'Faol shartnoma', value:contracts.filter(c=>c.status==='active').length, icon:'✅', from:'from-emerald-600', to:'to-emerald-900' },
                  { label:'Tashkilotlar', value:orgs.length, icon:'🏢', from:'from-purple-600', to:'to-purple-900' },
                  { label:'Kontragentlar', value:cps.length, icon:'🤝', from:'from-orange-600', to:'to-orange-900' },
                ].map((s,i) => (
                  <div key={i} className={`bg-gradient-to-br ${s.from} ${s.to} rounded-xl p-5 shadow-lg`}>
                    <div className="text-2xl mb-3">{s.icon}</div>
                    <div className="text-3xl font-bold">{s.value}</div>
                    <div className="text-sm opacity-80 mt-1">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                  <div className="text-sm text-gray-400 mb-2">Faol shartnomalar summasi</div>
                  <div className="text-3xl font-bold text-emerald-400">{totalActive.toLocaleString()} <span className="text-xl text-gray-500 font-normal">so'm</span></div>
                </div>
                {quota && quota.limit && (
                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <div className="text-sm text-gray-400 mb-2">Oylik kvota — {quota.plan} tarif</div>
                    <div className="text-3xl font-bold">{quota.used} <span className="text-xl text-gray-500 font-normal">/ {quota.limit}</span></div>
                    <div className="mt-3 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${quota.percent!>=100?'bg-red-500':quota.percent!>=80?'bg-yellow-500':'bg-blue-500'}`}
                        style={{width:`${quota.percent}%`}}/>
                    </div>
                    {quota.percent!>=80 && (
                      <button onClick={()=>setModal('upgrade')} className="text-xs text-yellow-400 mt-2 hover:underline">⚡ Tarifni yaxshilash</button>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-xl">
                <div className="flex justify-between items-center p-5 border-b border-gray-800">
                  <h2 className="font-semibold">So'nggi shartnomalar</h2>
                  <button onClick={()=>setTab('contracts')} className="text-blue-400 text-sm hover:text-blue-300">Hammasini ko'rish →</button>
                </div>
                {contracts.length===0 ? (
                  <div className="p-10 text-center text-gray-500 text-sm">Hali shartnoma yo'q</div>
                ) : (
                  <div className="divide-y divide-gray-800">
                    {contracts.slice(0,6).map(c => (
                      <div key={c.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-800/40 transition">
                        <div className="w-9 h-9 bg-blue-900/60 rounded-lg flex items-center justify-center text-xs font-bold text-blue-300 flex-shrink-0">
                          {c.contract_number.slice(0,2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium">#{c.contract_number}</div>
                          <div className="text-xs text-gray-400 truncate">{c.organizations?.name} → {c.counterparties?.name}</div>
                        </div>
                        <div className="text-right flex-shrink-0 space-y-0.5">
                          <div className="text-sm font-medium">{c.amount?.toLocaleString()} so'm</div>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${STATUSES[c.status as keyof typeof STATUSES]?.bg} ${STATUSES[c.status as keyof typeof STATUSES]?.text}`}>
                            {STATUSES[c.status as keyof typeof STATUSES]?.label}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { label:'Shartnoma yaratish', icon:'📄', action:()=>{ if(!canCreateContract()){setModal('upgrade');return}; setTab('contracts'); setModal('contract') } },
                  { label:"Tashkilot qo'shish", icon:'🏢', action:()=>{ setTab('organizations'); setModal('org') } },
                  { label:"Kontragent qo'shish", icon:'🤝', action:()=>{ setTab('counterparties'); setModal('cp') } },
                ].map((a,i) => (
                  <button key={i} onClick={a.action}
                    className="bg-gray-900 border border-gray-800 hover:border-blue-600 hover:bg-gray-800 rounded-xl p-5 text-center transition group">
                    <div className="text-3xl mb-3">{a.icon}</div>
                    <div className="text-sm font-medium text-gray-300 group-hover:text-white">{a.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ─── CONTRACTS ─── */}
          {tab==='contracts' && (
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                  <input value={search} onChange={e=>setSearch(e.target.value)}
                    placeholder="Shartnoma raqami, tashkilot yoki kontragent..."
                    className="w-full bg-gray-900 border border-gray-800 text-white rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"/>
                </div>
                <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}
                  className="bg-gray-900 border border-gray-800 text-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500">
                  <option value="all">Barcha holat</option>
                  <option value="draft">Qoralama</option>
                  <option value="active">Faol</option>
                  <option value="completed">Bajarilgan</option>
                  <option value="cancelled">Bekor qilingan</option>
                </select>
              </div>

              {filteredContracts.length===0 ? (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-16 text-center">
                  <div className="text-5xl mb-4">📄</div>
                  <p className="text-gray-400 font-medium">Shartnoma topilmadi</p>
                </div>
              ) : (
                <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-800 bg-gray-800/50">
                        {['RAQAM','SANA','TUR','TASHKILOT','KONTRAGENT','SUMMA','HOLAT','AMALLAR'].map(h => (
                          <th key={h} className="text-left text-xs font-medium text-gray-400 px-4 py-3 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {filteredContracts.map(c => (
                        <tr key={c.id} className="hover:bg-gray-800/40 transition group">
                          <td className="px-4 py-3.5">
                            <span className="font-mono text-sm font-semibold text-blue-400">#{c.contract_number}</span>
                          </td>
                          <td className="px-4 py-3.5 text-sm text-gray-400 whitespace-nowrap">{c.contract_date}</td>
                          <td className="px-4 py-3.5 text-xs text-gray-400 max-w-[120px] truncate">{CONTRACT_TYPES[c.contract_type]||c.contract_type}</td>
                          <td className="px-4 py-3.5 text-sm text-white max-w-[120px] truncate">{c.organizations?.name||'—'}</td>
                          <td className="px-4 py-3.5 text-sm text-white max-w-[120px] truncate">{c.counterparties?.name||'—'}</td>
                          <td className="px-4 py-3.5 text-sm font-medium whitespace-nowrap">{c.amount?.toLocaleString()} so'm</td>
                          <td className="px-4 py-3.5">
                            <select value={c.status} onChange={e=>updateStatus(c.id,e.target.value)}
                              className={`text-xs px-2.5 py-1 rounded-full border-0 cursor-pointer focus:outline-none font-medium ${STATUSES[c.status as keyof typeof STATUSES]?.bg} ${STATUSES[c.status as keyof typeof STATUSES]?.text}`}>
                              <option value="draft">Qoralama</option>
                              <option value="active">Faol</option>
                              <option value="completed">Bajarilgan</option>
                              <option value="cancelled">Bekor qilingan</option>
                            </select>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                              <button onClick={()=>{setViewContract(c);setModal('viewContract')}}
                                className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded text-xs" title="Ko'rish">👁</button>
                              <button onClick={()=>copyContract(c)}
                                className="p-1.5 bg-blue-900 hover:bg-blue-800 rounded text-xs" title="Nusxa">📋</button>
                              <button onClick={()=>generatePDF(c)}
                                className="p-1.5 bg-emerald-800 hover:bg-emerald-700 rounded text-xs" title="PDF">📥</button>
                              <button onClick={()=>deleteContract(c.id)}
                                className="p-1.5 bg-red-900 hover:bg-red-800 rounded text-xs" title="O'chirish">🗑</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="px-5 py-3 border-t border-gray-800 flex justify-between text-xs text-gray-500">
                    <span>{filteredContracts.length} ta shartnoma</span>
                    <span>Jami: {filteredContracts.reduce((s,c)=>s+(c.amount||0),0).toLocaleString()} so'm</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── ORGANIZATIONS ─── */}
          {tab==='organizations' && (
            <div className="space-y-4">
              {orgs.length===0 ? (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-16 text-center">
                  <div className="text-5xl mb-4">🏢</div>
                  <p className="text-gray-400 font-medium">Tashkilot qo'shilmagan</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orgs.map(org => (
                    <div key={org.id} className={`bg-gray-900 border rounded-xl p-5 transition cursor-pointer ${activeOrg?.id===org.id?'border-blue-600':'border-gray-800 hover:border-gray-700'}`}
                      onClick={()=>setActiveOrg(org)}>
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 bg-purple-900 rounded-xl flex items-center justify-center text-purple-300 font-bold text-xl flex-shrink-0">
                          {org.name[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-white">{org.name}</h3>
                            {activeOrg?.id===org.id && <span className="text-xs bg-blue-900 text-blue-300 px-2 py-0.5 rounded-full">Faol</span>}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">INN: {org.inn||'—'}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs mb-4">
                        {[['Rahbar',org.director_name],['Bank',org.bank_name],['Hisob raqam',org.bank_account],['MFO',org.mfo]].map(([l,v])=>(
                          <div key={l}><span className="text-gray-500">{l}: </span><span className="text-gray-300">{v||'—'}</span></div>
                        ))}
                        <div className="col-span-2"><span className="text-gray-500">Manzil: </span><span className="text-gray-300">{org.address||'—'}</span></div>
                      </div>

                      {/* Bank accounts section */}
                      {activeOrg?.id===org.id && (
                        <div className="border-t border-gray-800 pt-4 mt-2">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Bank hisob raqamlari</span>
                            <button onClick={e=>{e.stopPropagation();setModal('bankAccount')}}
                              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                              + Qo'shish
                            </button>
                          </div>
                          {bankAccounts.length===0 ? (
                            <p className="text-xs text-gray-600">Hisob raqam qo'shilmagan</p>
                          ) : (
                            <div className="space-y-2">
                              {bankAccounts.map(ba => (
                                <div key={ba.id} className="flex items-center gap-3 bg-gray-800 rounded-lg px-3 py-2.5" onClick={e=>e.stopPropagation()}>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm text-white font-mono">{ba.account_number}</span>
                                      {ba.is_default && <span className="text-xs bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded">Asosiy</span>}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-0.5">{ba.bank_name} | MFO: {ba.mfo||'—'}</div>
                                  </div>
                                  <button onClick={()=>deleteBankAccount(ba.id)}
                                    className="text-red-500 hover:text-red-400 text-xs p-1">🗑</button>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Stamp & Signature */}
                          <div className="border-t border-gray-800 pt-4 mt-4">
                            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Imzo va Muhr</span>
                            <div className="grid grid-cols-2 gap-3 mt-3">
                              <div>
                                <div className="text-xs text-gray-500 mb-2">Imzo rasmi</div>
                                {org.signature_url ? (
                                  <div className="relative group">
                                    <img src={org.signature_url} alt="Imzo" className="h-16 object-contain bg-white rounded-lg p-1"/>
                                    <button onClick={()=>signatureRef.current?.click()} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-lg text-xs text-white transition flex items-center justify-center">
                                      O'zgartirish
                                    </button>
                                  </div>
                                ) : (
                                  <button onClick={()=>signatureRef.current?.click()}
                                    className="w-full h-16 border-2 border-dashed border-gray-700 rounded-lg text-xs text-gray-500 hover:border-blue-600 hover:text-blue-400 transition flex items-center justify-center gap-2">
                                    📤 Yuklash
                                  </button>
                                )}
                                <input ref={signatureRef} type="file" accept="image/*" className="hidden"
                                  onChange={e=>{if(e.target.files?.[0]) uploadImage(e.target.files[0],'signature_url')}}/>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500 mb-2">Muhr rasmi</div>
                                {org.stamp_url ? (
                                  <div className="relative group">
                                    <img src={org.stamp_url} alt="Muhr" className="h-16 object-contain bg-white rounded-lg p-1"/>
                                    <button onClick={()=>stampRef.current?.click()} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-lg text-xs text-white transition flex items-center justify-center">
                                      O'zgartirish
                                    </button>
                                  </div>
                                ) : (
                                  <button onClick={()=>stampRef.current?.click()}
                                    className="w-full h-16 border-2 border-dashed border-gray-700 rounded-lg text-xs text-gray-500 hover:border-blue-600 hover:text-blue-400 transition flex items-center justify-center gap-2">
                                    📤 Yuklash
                                  </button>
                                )}
                                <input ref={stampRef} type="file" accept="image/*" className="hidden"
                                  onChange={e=>{if(e.target.files?.[0]) uploadImage(e.target.files[0],'stamp_url')}}/>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ─── COUNTERPARTIES ─── */}
          {tab==='counterparties' && (
            <div className="space-y-4">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <input value={cpSearch} onChange={e=>setCpSearch(e.target.value)}
                  placeholder="Tashkilot nomi yoki STR (INN) raqami bo'yicha qidirish..."
                  className="w-full bg-gray-900 border border-gray-800 text-white rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"/>
              </div>

              {filteredCps.length===0 ? (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-16 text-center">
                  <div className="text-5xl mb-4">🤝</div>
                  <p className="text-gray-400 font-medium">{cpSearch ? 'Kontragent topilmadi' : "Kontragent qo'shilmagan"}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredCps.map(cp => (
                    <div key={cp.id} className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-5 transition">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-11 h-11 bg-orange-900 rounded-xl flex items-center justify-center text-orange-300 font-bold text-xl flex-shrink-0">
                          {cp.name[0]?.toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{cp.name}</h3>
                          <p className="text-xs text-gray-500 mt-0.5 font-mono">STR: {cp.inn||'—'}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                        {[['Rahbar',cp.director_name],['Bank',cp.bank_name],['Hisob raqam',cp.bank_account],['MFO',cp.mfo]].map(([l,v])=>(
                          <div key={l}><span className="text-gray-500">{l}: </span><span className="text-gray-300">{v||'—'}</span></div>
                        ))}
                        <div className="col-span-2"><span className="text-gray-500">Manzil: </span><span className="text-gray-300">{cp.address||'—'}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ─── PROFILE ─── */}
          {tab==='profile' && (
            <div className="max-w-2xl space-y-6">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex items-center gap-5">
                <div className="w-16 h-16 bg-blue-700 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0">
                  {userEmail[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="text-lg font-semibold text-white">{profile.full_name||'Ism kiritilmagan'}</div>
                  <div className="text-sm text-gray-400 mt-0.5">{userEmail}</div>
                  <div className="text-xs text-gray-600 mt-1">{profile.phone||'Telefon kiritilmagan'}</div>
                </div>
              </div>

              <form onSubmit={saveProfile} className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Shaxsiy ma'lumotlar</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={lbl}>To'liq ism</label>
                    <input className={inp} placeholder="Alisher Karimov" value={profile.full_name} onChange={e=>setProfile({...profile,full_name:e.target.value})}/></div>
                  <div><label className={lbl}>Telefon</label>
                    <input className={inp} placeholder="+998901234567" value={profile.phone} onChange={e=>setProfile({...profile,phone:e.target.value})}/></div>
                </div>
                {profileMsg && <div className="bg-emerald-900/40 border border-emerald-700 text-emerald-300 text-sm px-4 py-2.5 rounded-lg">{profileMsg}</div>}
                <button type="submit" disabled={profileSaving}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-semibold transition">
                  {profileSaving?'Saqlanmoqda...':'Saqlash'}
                </button>
              </form>

              <form onSubmit={changePassword} className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Parolni o'zgartirish</h2>
                <div><label className={lbl}>Yangi parol</label>
                  <input type="password" className={inp} placeholder="Kamida 8 belgi" value={newPassword} onChange={e=>setNewPassword(e.target.value)}/></div>
                {pwdMsg && <div className={`text-sm px-4 py-2.5 rounded-lg ${pwdMsg.includes('✓')?'bg-emerald-900/40 border border-emerald-700 text-emerald-300':'bg-red-900/40 border border-red-700 text-red-300'}`}>{pwdMsg}</div>}
                <button type="submit" className="w-full border border-gray-700 text-gray-300 hover:bg-gray-800 py-2.5 rounded-lg text-sm font-medium transition">
                  Parolni o'zgartirish
                </button>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* ─── MODALS ─── */}

      {modal==='org' && (
        <Modal title="Tashkilot qo'shish" onClose={()=>setModal(null)}>
          <form onSubmit={saveOrg} className="space-y-4">
            <div><label className={lbl}>Tashkilot nomi *</label>
              <input className={inp} required placeholder="Alfa Texnologiya MChJ" value={orgForm.name} onChange={e=>setOrgForm({...orgForm,name:e.target.value})}/></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={lbl}>STR (INN)</label>
                <input className={inp} placeholder="123456789" value={orgForm.inn} onChange={e=>setOrgForm({...orgForm,inn:e.target.value})}/></div>
              <div><label className={lbl}>Rahbar ismi</label>
                <input className={inp} placeholder="F.I.O" value={orgForm.director_name} onChange={e=>setOrgForm({...orgForm,director_name:e.target.value})}/></div>
              <div><label className={lbl}>Bank nomi</label>
                <input className={inp} placeholder="Xalq banki" value={orgForm.bank_name} onChange={e=>setOrgForm({...orgForm,bank_name:e.target.value})}/></div>
              <div><label className={lbl}>Hisob raqami</label>
                <input className={inp} placeholder="20208000..." value={orgForm.bank_account} onChange={e=>setOrgForm({...orgForm,bank_account:e.target.value})}/></div>
              <div><label className={lbl}>MFO</label>
                <input className={inp} placeholder="00873" value={orgForm.mfo} onChange={e=>setOrgForm({...orgForm,mfo:e.target.value})}/></div>
              <div><label className={lbl}>Manzil</label>
                <input className={inp} placeholder="Toshkent, ..." value={orgForm.address} onChange={e=>setOrgForm({...orgForm,address:e.target.value})}/></div>
            </div>
            <ModalActions onClose={()=>setModal(null)} saving={saving}/>
          </form>
        </Modal>
      )}

      {modal==='cp' && (
        <Modal title="Kontragent qo'shish" onClose={()=>setModal(null)}>
          <form onSubmit={saveCp} className="space-y-4">
            <div><label className={lbl}>Tashkilot nomi *</label>
              <input className={inp} required placeholder="Beta Qurilish MChJ" value={cpForm.name} onChange={e=>setCpForm({...cpForm,name:e.target.value})}/></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={lbl}>STR (INN)</label>
                <input className={inp} placeholder="123456789" value={cpForm.inn} onChange={e=>setCpForm({...cpForm,inn:e.target.value})}/></div>
              <div><label className={lbl}>Rahbar ismi</label>
                <input className={inp} placeholder="F.I.O" value={cpForm.director_name} onChange={e=>setCpForm({...cpForm,director_name:e.target.value})}/></div>
              <div><label className={lbl}>Bank nomi</label>
                <input className={inp} placeholder="Ipoteka banki" value={cpForm.bank_name} onChange={e=>setCpForm({...cpForm,bank_name:e.target.value})}/></div>
              <div><label className={lbl}>Hisob raqami</label>
                <input className={inp} placeholder="20208000..." value={cpForm.bank_account} onChange={e=>setCpForm({...cpForm,bank_account:e.target.value})}/></div>
              <div><label className={lbl}>MFO</label>
                <input className={inp} placeholder="00869" value={cpForm.mfo} onChange={e=>setCpForm({...cpForm,mfo:e.target.value})}/></div>
              <div><label className={lbl}>Manzil</label>
                <input className={inp} placeholder="Samarqand, ..." value={cpForm.address} onChange={e=>setCpForm({...cpForm,address:e.target.value})}/></div>
            </div>
            <ModalActions onClose={()=>setModal(null)} saving={saving}/>
          </form>
        </Modal>
      )}

      {modal==='bankAccount' && (
        <Modal title="Bank hisob raqami qo'shish" onClose={()=>setModal(null)}>
          <form onSubmit={saveBankAccount} className="space-y-4">
            <div><label className={lbl}>Bank nomi *</label>
              <input className={inp} required placeholder="Xalq banki" value={bankForm.bank_name} onChange={e=>setBankForm({...bankForm,bank_name:e.target.value})}/></div>
            <div><label className={lbl}>Hisob raqami *</label>
              <input className={inp} required placeholder="20208000000000000000" value={bankForm.account_number} onChange={e=>setBankForm({...bankForm,account_number:e.target.value})}/></div>
            <div><label className={lbl}>MFO</label>
              <input className={inp} placeholder="00873" value={bankForm.mfo} onChange={e=>setBankForm({...bankForm,mfo:e.target.value})}/></div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={bankForm.is_default} onChange={e=>setBankForm({...bankForm,is_default:e.target.checked})}
                className="w-4 h-4 accent-blue-500"/>
              <span className="text-sm text-gray-300">Asosiy hisob raqam sifatida belgilash</span>
            </label>
            <ModalActions onClose={()=>setModal(null)} saving={saving}/>
          </form>
        </Modal>
      )}

      {modal==='contract' && (
        <ContractModal
          orgs={orgs}
          cps={cps}
          form={contractForm}
          setForm={setContractForm}
          onSave={saveContract}
          onClose={()=>setModal(null)}
          saving={saving}
          inp={inp}
          lbl={lbl}
        />
      )}

      {modal==='viewContract' && viewContract && (
        <Modal title={`Shartnoma #${viewContract.contract_number}`} onClose={()=>setModal(null)} wide>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Raqam',`#${viewContract.contract_number}`],
                ['Sana',viewContract.contract_date],
                ['Tur',CONTRACT_TYPES[viewContract.contract_type]],
                ['Summa',`${viewContract.amount?.toLocaleString()} so'm`],
                ['Holat',STATUSES[viewContract.status as keyof typeof STATUSES]?.label],
              ].map(([l,v])=>(
                <div key={l} className="bg-gray-800 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">{l}</div>
                  <div className="text-white font-medium text-sm">{v}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {viewContract.organizations && (
                <div className="bg-gray-800 rounded-xl p-4">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Buyurtmachi</div>
                  <div className="text-white font-semibold text-sm">{viewContract.organizations.name}</div>
                  <div className="text-gray-400 text-xs mt-1 space-y-0.5">
                    <div>STR: {viewContract.organizations.inn}</div>
                    <div>Rahbar: {viewContract.organizations.director_name}</div>
                    <div>Bank: {viewContract.organizations.bank_name}</div>
                  </div>
                </div>
              )}
              {viewContract.counterparties && (
                <div className="bg-gray-800 rounded-xl p-4">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Ijrochi</div>
                  <div className="text-white font-semibold text-sm">{viewContract.counterparties.name}</div>
                  <div className="text-gray-400 text-xs mt-1 space-y-0.5">
                    <div>STR: {viewContract.counterparties.inn}</div>
                    <div>Rahbar: {viewContract.counterparties.director_name}</div>
                    <div>Bank: {viewContract.counterparties.bank_name}</div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={()=>copyContract(viewContract)}
                className="flex-1 bg-blue-800 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2">
                📋 Nusxa olish
              </button>
              <button onClick={()=>generatePDF(viewContract)}
                className="flex-1 bg-emerald-700 hover:bg-emerald-600 text-white py-2.5 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2">
                📥 PDF yuklab olish
              </button>
            </div>
          </div>
        </Modal>
      )}

      {modal==='upgrade' && (
        <Modal title="Tarifni yaxshilash" onClose={()=>setModal(null)}>
          <div className="space-y-4 text-center">
            <div className="text-5xl">⚡</div>
            <p className="text-gray-300">Bepul tarif limitiga yetdingiz <strong className="text-white">({FREE_LIMIT} ta/oy)</strong></p>
            <div className="bg-gray-800 rounded-xl p-5 text-left space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-white">Standart tarif</span>
                <span className="text-blue-400 font-bold text-lg">50,000 so'm/oy</span>
              </div>
              <ul className="text-sm text-gray-400 space-y-1.5">
                <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Cheksiz shartnomalar</li>
                <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Reklama belgisisiz PDF</li>
                <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Barcha shartnoma turlari</li>
                <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Imzo va muhr avtomatik</li>
              </ul>
            </div>
            <div className="bg-gray-800 rounded-xl p-4 text-sm text-gray-400 text-left">
              <p className="font-medium text-white mb-2">To'lov qilish uchun:</p>
              <p>Bank orqali pul o'tkazing, xabar yuboring — 24 soat ichida faollashtiramiz.</p>
            </div>
            <button onClick={()=>setModal(null)}
              className="w-full border border-gray-700 text-gray-300 hover:bg-gray-800 py-2.5 rounded-lg text-sm transition">
              Yopish
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function Modal({ title, onClose, children, wide }: {
  title: string; onClose: ()=>void; children: React.ReactNode; wide?: boolean
}) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`bg-gray-900 border border-gray-800 rounded-2xl w-full ${wide?'max-w-2xl':'max-w-lg'} max-h-[90vh] flex flex-col shadow-2xl`}>
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-800 flex-shrink-0">
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition text-xl">×</button>
        </div>
        <div className="overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  )
}

function ModalActions({ onClose, saving }: { onClose: ()=>void; saving: boolean }) {
  return (
    <div className="flex gap-3 pt-2">
      <button type="button" onClick={onClose} className="flex-1 border border-gray-700 text-gray-300 py-2.5 rounded-lg text-sm hover:bg-gray-800 transition">
        Bekor qilish
      </button>
      <button type="submit" disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-semibold transition">
        {saving?'Saqlanmoqda...':'Saqlash'}
      </button>
    </div>
  )
}

// ─── Contract Modal ───────────────────────────────────────
function ContractModal({ orgs, cps, form, setForm, onSave, onClose, saving, inp, lbl }: {
  orgs: Org[]; cps: Counterparty[]
  form: any; setForm: (f: any) => void
  onSave: (e: React.FormEvent) => void
  onClose: () => void; saving: boolean
  inp: string; lbl: string
}) {
  const [step, setStep] = useState<1|2|3>(1)
  const [useTemplate, setUseTemplate] = useState(true)
  const [structure, setStructure] = useState<ContractStructure>({ bolimlar: [] })
  const [specItems, setSpecItems] = useState<SpecItem[]>(form.spec_items || [])
  const [qqs, setQqsState] = useState(false)
  const [qqsRate] = useState(12)
  function setQqs(val: boolean) { setQqsState(val); setForm({ ...form, qqs_enabled: val }) }

  const BIRLIKLAR = [
    'dona','juft','komplekt',"to'plam","o'ram",'rull','quti','xalta','paket',"bo'lak",'varaq',
    'kg','g','tonna','sentner',
    'litr','ml','dekalitr',
    'metr','sm','mm','km',
    'm²','m³','sm²','sm³',
    'gektar','sotix',
    'soat','kun','hafta','oy','yil',
    'ta','marta','xizmat','loyiha','bosqich','tur',
  ]

  const emptySpecItem = (): SpecItem => ({ nomi: '', birlik: 'dona', miqdori: 1, narxi: 0, summa: 0 })

  function addSpecItem() {
    const updated = [...specItems, emptySpecItem()]
    setSpecItems(updated)
    setForm({ ...form, spec_items: updated })
  }
  function removeSpecItem(i: number) {
    const updated = specItems.filter((_, idx) => idx !== i)
    setSpecItems(updated)
    setForm({ ...form, spec_items: updated })
  }
  function updateSpecItem(i: number, field: keyof SpecItem, value: string | number) {
    const updated = specItems.map((item, idx) => {
      if (idx !== i) return item
      const next = { ...item, [field]: value }
      if (field === 'miqdori' || field === 'narxi') {
        next.summa = Number(next.miqdori) * Number(next.narxi)
      }
      return next
    })
    setSpecItems(updated)
    setForm({ ...form, spec_items: updated })
  }
  const specTotal = specItems.reduce((s, item) => s + item.summa, 0)
  const qqsSum = qqs ? Math.round(specTotal * qqsRate / 100) : 0
  const specGrand = specTotal + qqsSum

  function buildOrgCp(f: any) {
    const org = orgs.find(o => o.id === f.organization_id) || null
    const cp  = cps.find(c => c.id === f.counterparty_id) || null
    return { org, cp }
  }

  function syncToContent(s: ContractStructure, f: any) {
    const { org, cp } = buildOrgCp(f)
    const typeName = CONTRACT_TYPE_NAMES[f.contract_type as keyof typeof CONTRACT_TYPE_NAMES] || f.contract_type
    const text = structureToText(s, {
      type_name: typeName,
      number: f.contract_number,
      date: f.contract_date,
      city: f.city || 'Toshkent',
      org, cp,
    })
    setForm({ ...f, content: text })
  }

  function applyStructure(s: ContractStructure) {
    setStructure(s)
    syncToContent(s, form)
  }

  const EMPTY_STRUCTURE: ContractStructure = { bolimlar: [{ sarlavha: '', bandlar: [{ matn: '' }] }] }

  function goToStep2() {
    if (useTemplate) {
      const { org, cp } = buildOrgCp(form)
      const amount = parseFloat(form.amount) || 0
      const tplData = {
        contract_number: form.contract_number,
        contract_date: form.contract_date,
        city: form.city || 'Toshkent',
        org_name: org?.name, org_inn: org?.inn, org_director: org?.director_name,
        cp_name: cp?.name, cp_inn: cp?.inn, cp_director: cp?.director_name,
        amount, amount_text: numberToWords(amount),
      }
      const s = getStructure(form.contract_type, tplData)
      setStructure(s)
      const typeName = CONTRACT_TYPE_NAMES[form.contract_type as keyof typeof CONTRACT_TYPE_NAMES] || form.contract_type
      const text = structureToText(s, {
        type_name: typeName,
        number: form.contract_number,
        date: form.contract_date,
        city: form.city || 'Toshkent',
        org, cp,
      })
      setForm({ ...form, content: text })
    } else {
      setStructure(EMPTY_STRUCTURE)
      setForm({ ...form, content: '' })
    }
    setStep(2)
  }

  function reloadStructure() {
    const { org, cp } = buildOrgCp(form)
    const amount = parseFloat(form.amount) || 0
    const tplData = {
      contract_number: form.contract_number,
      contract_date: form.contract_date,
      city: form.city || 'Toshkent',
      org_name: org?.name, org_inn: org?.inn, org_director: org?.director_name,
      cp_name: cp?.name, cp_inn: cp?.inn, cp_director: cp?.director_name,
      amount, amount_text: numberToWords(amount),
    }
    const s = getStructure(form.contract_type, tplData)
    applyStructure(s)
  }

  function handleFieldChange(field: string, value: string) {
    setForm({ ...form, [field]: value })
  }

  function addBand(bi: number) {
    applyStructure({
      bolimlar: structure.bolimlar.map((b, i) =>
        i === bi ? { ...b, bandlar: [...b.bandlar, { matn: '' }] } : b
      )
    })
  }

  function removeBand(bi: number, bdi: number) {
    applyStructure({
      bolimlar: structure.bolimlar.map((b, i) =>
        i === bi ? { ...b, bandlar: b.bandlar.filter((_, j) => j !== bdi) } : b
      )
    })
  }

  function updateBand(bi: number, bdi: number, value: string) {
    applyStructure({
      bolimlar: structure.bolimlar.map((b, i) =>
        i === bi ? { ...b, bandlar: b.bandlar.map((band, j) => j === bdi ? { matn: value } : band) } : b
      )
    })
  }

  function updateSarlavha(bi: number, value: string) {
    applyStructure({
      bolimlar: structure.bolimlar.map((b, i) => i === bi ? { ...b, sarlavha: value } : b)
    })
  }

  function addBolim() {
    applyStructure({
      bolimlar: [...structure.bolimlar, { sarlavha: '', bandlar: [{ matn: '' }] }]
    })
  }

  function removeBolim(bi: number) {
    applyStructure({ bolimlar: structure.bolimlar.filter((_, i) => i !== bi) })
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-base font-semibold text-white">Shartnoma yaratish</h2>
            <div className="flex gap-1 bg-gray-800 rounded-lg p-0.5">
              <button type="button" onClick={() => setStep(1)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition ${step===1 ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}>
                1. Ma&apos;lumotlar
              </button>
              <button type="button" onClick={goToStep2}
                className={`px-3 py-1 rounded-md text-xs font-medium transition ${step===2 ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}>
                2. Bo&apos;limlar
              </button>
              <button type="button" onClick={() => setStep(3)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition ${step===3 ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}>
                3. Spesifikatsiya
              </button>
            </div>
          </div>
          <button type="button" onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition text-xl">×</button>
        </div>

        <form onSubmit={onSave} className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-6">

            {/* ── 1-QADAM: Ma'lumotlar ── */}
            {step === 1 && (
              <div className="space-y-5">

                {/* Raqam / Sana / Shahar */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className={lbl}>Shartnoma raqami *</label>
                    <input className={inp} required placeholder="2026/001"
                      value={form.contract_number}
                      onChange={e => handleFieldChange('contract_number', e.target.value)}/>
                  </div>
                  <div>
                    <label className={lbl}>Sana *</label>
                    <input type="date" className={inp} required
                      value={form.contract_date}
                      onChange={e => handleFieldChange('contract_date', e.target.value)}/>
                  </div>
                  <div>
                    <label className={lbl}>Shahar</label>
                    <input className={inp} placeholder="Toshkent"
                      value={form.city}
                      onChange={e => handleFieldChange('city', e.target.value)}/>
                  </div>
                </div>

                {/* Shartnoma turi — ixcham select */}
                <div>
                  <label className={lbl}>Shartnoma turi *</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {Object.entries(CONTRACT_TYPE_NAMES).map(([k,v]) => (
                      <button key={k} type="button"
                        onClick={() => handleFieldChange('contract_type', k)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition whitespace-nowrap ${
                          form.contract_type === k
                            ? 'border-blue-500 bg-blue-900/40 text-blue-300'
                            : 'border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white'
                        }`}>
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mahsulot/xizmat nomi + Summa + Holat */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className={lbl}>Mahsulot yoki xizmat nomi</label>
                    <input className={inp} placeholder="Masalan: Qurilish materiallari yoki Dasturiy ta'minot yaratish"
                      value={form.product_name || ''}
                      onChange={e => handleFieldChange('product_name', e.target.value)}/>
                  </div>
                  <div>
                    <label className={lbl}>Umumiy summa (so&apos;m)</label>
                    <input type="number" className={inp} placeholder="5000000"
                      value={form.amount}
                      onChange={e => handleFieldChange('amount', e.target.value)}/>
                  </div>
                  <div>
                    <label className={lbl}>Holat</label>
                    <select className={inp} value={form.status}
                      onChange={e => handleFieldChange('status', e.target.value)}>
                      <option value="draft">Qoralama</option>
                      <option value="active">Faol</option>
                      <option value="completed">Bajarilgan</option>
                      <option value="cancelled">Bekor qilingan</option>
                    </select>
                  </div>
                </div>

                {/* Tomonlar */}
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 space-y-3">
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Tomonlar</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={lbl}>Buyurtmachi *</label>
                      <select className={inp} required value={form.organization_id}
                        onChange={e => handleFieldChange('organization_id', e.target.value)}>
                        <option value="">— Tashkilot tanlang —</option>
                        {orgs.map(o => <option key={o.id} value={o.id}>{o.name}{o.inn ? ` (${o.inn})` : ''}</option>)}
                      </select>
                      {orgs.length===0 && <p className="text-xs text-yellow-500 mt-1">⚠ Avval tashkilot qo&apos;shing</p>}
                    </div>
                    <div>
                      <label className={lbl}>Kontragent (2-tomon) *</label>
                      <select className={inp} required value={form.counterparty_id}
                        onChange={e => handleFieldChange('counterparty_id', e.target.value)}>
                        <option value="">— Kontragent tanlang —</option>
                        {cps.map(c => <option key={c.id} value={c.id}>{c.name}{c.inn ? ` (${c.inn})` : ''}</option>)}
                      </select>
                      {cps.length===0 && <p className="text-xs text-yellow-500 mt-1">⚠ Avval kontragent qo&apos;shing</p>}
                    </div>
                  </div>
                </div>

                {/* Shablon tanlash */}
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-3">Shartnoma tuzilmasi</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => setUseTemplate(true)}
                      className={`flex items-start gap-3 p-3 rounded-xl border text-left transition ${
                        useTemplate
                          ? 'border-emerald-500 bg-emerald-900/20 text-white'
                          : 'border-gray-700 text-gray-400 hover:border-gray-600'
                      }`}>
                      <span className={`mt-0.5 text-base flex-shrink-0 ${useTemplate ? 'text-emerald-400' : 'text-gray-600'}`}>
                        {useTemplate ? '●' : '○'}
                      </span>
                      <div>
                        <div className="text-sm font-medium">Shablon orqali</div>
                        <div className="text-xs text-gray-500 mt-0.5">Tanlangan shartnoma turiga mos bo&apos;limlar avtomatik to&apos;ldiriladi</div>
                      </div>
                    </button>
                    <button type="button" onClick={() => setUseTemplate(false)}
                      className={`flex items-start gap-3 p-3 rounded-xl border text-left transition ${
                        !useTemplate
                          ? 'border-blue-500 bg-blue-900/20 text-white'
                          : 'border-gray-700 text-gray-400 hover:border-gray-600'
                      }`}>
                      <span className={`mt-0.5 text-base flex-shrink-0 ${!useTemplate ? 'text-blue-400' : 'text-gray-600'}`}>
                        {!useTemplate ? '●' : '○'}
                      </span>
                      <div>
                        <div className="text-sm font-medium">O&apos;zim yozaman</div>
                        <div className="text-xs text-gray-500 mt-0.5">Bo&apos;sh tuzilma ochiladi, barcha matnlarni o&apos;zingiz kiritasiz</div>
                      </div>
                    </button>
                  </div>
                </div>

                <button type="button" onClick={goToStep2}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2">
                  {useTemplate ? 'Shablonni yuklash va tahrirlash →' : 'Bo\'sh tuzilmani ochish →'}
                </button>
              </div>
            )}

            {/* ── 2-QADAM: Bo'limlar va bandlar ── */}
            {step === 2 && (
              <div className="space-y-4">

                {/* Status bar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {useTemplate ? (
                      <span className="inline-flex items-center gap-1.5 text-xs bg-emerald-900/30 border border-emerald-700/50 text-emerald-400 px-2.5 py-1 rounded-full">
                        <span>✓</span> Shablon qo&apos;llanildi
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs bg-blue-900/30 border border-blue-700/50 text-blue-400 px-2.5 py-1 rounded-full">
                        <span>✎</span> Qo&apos;lda to&apos;ldirilmoqda
                      </span>
                    )}
                    <span className="text-xs text-gray-600">{structure.bolimlar.length} bo&apos;lim</span>
                  </div>
                  {useTemplate && (
                    <button type="button" onClick={reloadStructure}
                      className="text-xs text-gray-400 hover:text-blue-300 border border-gray-700 hover:border-blue-700 px-3 py-1.5 rounded-lg transition">
                      ↺ Qayta yuklash
                    </button>
                  )}
                </div>

                {/* Bo'limlar */}
                {structure.bolimlar.map((bolim, bi) => (
                  <div key={bi} className="bg-gray-800/40 border border-gray-700 rounded-xl overflow-hidden">

                    {/* Sarlavha */}
                    <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-800/80 border-b border-gray-700">
                      <span className="text-blue-400 font-bold text-sm w-7 flex-shrink-0 select-none">{bi+1}.</span>
                      <input
                        value={bolim.sarlavha}
                        onChange={e => updateSarlavha(bi, e.target.value)}
                        className="flex-1 bg-transparent text-white text-sm font-semibold focus:outline-none placeholder-gray-600 min-w-0"
                        placeholder="Bo'lim sarlavhasi (masalan: SHARTNOMA PREDMETI)"
                      />
                      <button type="button" onClick={() => removeBolim(bi)}
                        className="w-7 h-7 flex items-center justify-center rounded text-gray-600 hover:text-red-400 hover:bg-red-900/30 transition text-lg flex-shrink-0"
                        title="Bo'limni o'chirish">×</button>
                    </div>

                    {/* Bandlar */}
                    <div className="p-3 space-y-2">
                      {bolim.bandlar.map((band, bdi) => (
                        <div key={bdi} className="flex gap-2 items-start">
                          <span className="text-gray-600 text-xs font-mono w-9 pt-2.5 flex-shrink-0 text-right select-none">
                            {bi+1}.{bdi+1}.
                          </span>
                          <textarea
                            value={band.matn}
                            onChange={e => updateBand(bi, bdi, e.target.value)}
                            rows={2}
                            className="flex-1 bg-gray-800 border border-gray-700/80 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 resize-none leading-relaxed min-w-0"
                            placeholder="Band matni..."
                          />
                          <button type="button" onClick={() => removeBand(bi, bdi)}
                            className="w-7 h-7 flex items-center justify-center rounded text-gray-700 hover:text-red-400 hover:bg-red-900/20 transition text-base flex-shrink-0 mt-1"
                            title="Bandni o'chirish">×</button>
                        </div>
                      ))}
                      <button type="button" onClick={() => addBand(bi)}
                        className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 px-2 py-1.5 rounded-lg hover:bg-blue-900/20 transition ml-11 font-medium">
                        + Band qo&apos;shish
                      </button>
                    </div>
                  </div>
                ))}

                {/* Bo'lim qo'shish */}
                <button type="button" onClick={addBolim}
                  className="w-full border-2 border-dashed border-gray-700 hover:border-blue-600 text-gray-500 hover:text-blue-400 py-3 rounded-xl text-sm font-medium transition flex items-center justify-center gap-2">
                  + Bo&apos;lim qo&apos;shish
                </button>
                <div className="flex justify-end pt-2">
                  <button type="button" onClick={() => setStep(3)}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition">
                    Spesifikatsiya →
                  </button>
                </div>
              </div>
            )}

            {/* ── 3-QADAM: Spesifikatsiya ── */}
            {step === 3 && (
              <div className="space-y-4">

                {/* datalist — birlik autocomplete */}
                <datalist id="birliklar-list">
                  {BIRLIKLAR.map(b => <option key={b} value={b}/>)}
                </datalist>

                {/* Sarlavha + QQS toggle */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-white font-medium">Mahsulot/xizmatlar ro&apos;yxati</p>
                    <p className="text-xs text-gray-500 mt-0.5">Ixtiyoriy. PDFga 1-ilova sifatida qo&apos;shiladi.</p>
                  </div>
                  {/* QQS toggle */}
                  <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-0.5 flex-shrink-0">
                    <button type="button" onClick={() => setQqs(false)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${!qqs ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-white'}`}>
                      QQSsiz
                    </button>
                    <button type="button" onClick={() => setQqs(true)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${qqs ? 'bg-orange-600 text-white' : 'text-gray-400 hover:text-white'}`}>
                      QQS 12%
                    </button>
                  </div>
                </div>

                {/* Jadval */}
                {specItems.length > 0 && (
                  <div className="overflow-x-auto rounded-xl border border-gray-700">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-gray-800 text-gray-400 text-left">
                          <th className="px-3 py-2 w-7">№</th>
                          <th className="px-2 py-2">Nomi</th>
                          <th className="px-2 py-2 w-20">O&apos;lchov</th>
                          <th className="px-2 py-2 w-16 text-right">Miqdori</th>
                          <th className="px-2 py-2 w-24 text-right">Narxi (so&apos;m)</th>
                          <th className="px-2 py-2 w-24 text-right">Summa</th>
                          <th className="px-2 py-2 w-7"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {specItems.map((item, i) => (
                          <tr key={i} className="border-t border-gray-700/60 hover:bg-gray-800/20">
                            <td className="px-3 py-1.5 text-gray-500">{i+1}</td>
                            <td className="px-2 py-1.5">
                              <input
                                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white focus:outline-none focus:border-blue-500 text-xs"
                                value={item.nomi} placeholder="Mahsulot yoki xizmat nomi"
                                onChange={e => updateSpecItem(i, 'nomi', e.target.value)}/>
                            </td>
                            <td className="px-2 py-1.5">
                              <input
                                list="birliklar-list"
                                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white focus:outline-none focus:border-blue-500 text-xs"
                                value={item.birlik} placeholder="dona"
                                onChange={e => updateSpecItem(i, 'birlik', e.target.value)}/>
                            </td>
                            <td className="px-2 py-1.5">
                              <input type="number"
                                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white focus:outline-none focus:border-blue-500 text-xs text-right"
                                value={item.miqdori} min={0} step="any"
                                onChange={e => updateSpecItem(i, 'miqdori', parseFloat(e.target.value)||0)}/>
                            </td>
                            <td className="px-2 py-1.5">
                              <input type="number"
                                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white focus:outline-none focus:border-blue-500 text-xs text-right"
                                value={item.narxi} min={0}
                                onChange={e => updateSpecItem(i, 'narxi', parseFloat(e.target.value)||0)}/>
                            </td>
                            <td className="px-2 py-1.5 text-right text-gray-200 font-medium">
                              {item.summa.toLocaleString()}
                            </td>
                            <td className="px-2 py-1.5">
                              <button type="button" onClick={() => removeSpecItem(i)}
                                className="w-6 h-6 flex items-center justify-center rounded text-gray-600 hover:text-red-400 hover:bg-red-900/20 transition">×</button>
                            </td>
                          </tr>
                        ))}

                        {/* Footer */}
                        <tr className="border-t border-gray-700 bg-gray-800/30">
                          <td colSpan={5} className="px-3 py-2 text-right text-gray-400 text-xs">
                            {qqs ? 'Soliqsiz summa:' : 'Jami summa:'}
                          </td>
                          <td className="px-2 py-2 text-right text-white font-semibold text-xs">{specTotal.toLocaleString()}</td>
                          <td></td>
                        </tr>
                        {qqs && (
                          <>
                            <tr className="bg-orange-900/10">
                              <td colSpan={5} className="px-3 py-2 text-right text-orange-400 text-xs">
                                QQS ({qqsRate}%):
                              </td>
                              <td className="px-2 py-2 text-right text-orange-300 font-semibold text-xs">{qqsSum.toLocaleString()}</td>
                              <td></td>
                            </tr>
                            <tr className="border-t border-orange-700/40 bg-orange-900/10">
                              <td colSpan={5} className="px-3 py-2 text-right text-white font-bold text-xs">
                                QQS bilan jami:
                              </td>
                              <td className="px-2 py-2 text-right text-orange-300 font-bold text-sm">{specGrand.toLocaleString()}</td>
                              <td></td>
                            </tr>
                          </>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                <button type="button" onClick={addSpecItem}
                  className="w-full border-2 border-dashed border-gray-700 hover:border-emerald-600 text-gray-500 hover:text-emerald-400 py-3 rounded-xl text-sm font-medium transition flex items-center justify-center gap-2">
                  + Mahsulot/xizmat qo&apos;shish
                </button>

                {specItems.length === 0 && (
                  <p className="text-center text-gray-600 text-xs py-2">
                    Spesifikatsiya ixtiyoriy — qo&apos;shmasangiz PDFda jadval bo&apos;lmaydi.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-800 flex gap-3 flex-shrink-0">
            {(step === 2 || step === 3) && (
              <button type="button" onClick={() => setStep(step === 3 ? 2 : 1)}
                className="px-4 py-2.5 border border-gray-700 text-gray-300 rounded-lg text-sm hover:bg-gray-800 transition">
                ← Orqaga
              </button>
            )}
            <button type="button" onClick={onClose}
              className="px-4 py-2.5 border border-gray-700 text-gray-300 rounded-lg text-sm hover:bg-gray-800 transition">
              Bekor qilish
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-semibold transition">
              {saving ? 'Saqlanmoqda...' : '💾 Shartnomani saqlash'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
