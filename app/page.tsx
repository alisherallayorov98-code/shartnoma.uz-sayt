import Link from 'next/link'
import {
  FileText, Building2, Users, Download, Copy, Shield,
  CheckCircle, ArrowRight, Zap, Star, Crown, Sparkles,
  Clock, TrendingUp, Lock, ChevronRight
} from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">

      {/* ── BACKGROUND GRADIENTS ── */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"/>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl"/>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-cyan-600/10 rounded-full blur-3xl"/>
      </div>

      {/* ── HEADER ── */}
      <header className="relative border-b border-white/5 sticky top-0 bg-[#0a0a0f]/80 backdrop-blur-xl z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center font-bold text-sm shadow-lg shadow-blue-900/50">
              S
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Shartnoma.uz
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <a href="#features" className="hover:text-white transition">Imkoniyatlar</a>
            <a href="#how" className="hover:text-white transition">Qanday ishlaydi</a>
            <a href="#pricing" className="hover:text-white transition">Narxlar</a>
          </nav>
          <div className="flex gap-3 items-center">
            <Link href="/login" className="px-4 py-2 text-sm text-gray-400 hover:text-white transition">
              Kirish
            </Link>
            <Link href="/signup"
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-xl text-sm font-semibold transition shadow-lg shadow-blue-900/40 flex items-center gap-2">
              Bepul boshlash <ArrowRight className="w-4 h-4"/>
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative max-w-7xl mx-auto px-6 pt-28 pb-24 text-center">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-700/30 text-blue-300 text-xs px-5 py-2.5 rounded-full mb-10 backdrop-blur-sm">
          <Sparkles className="w-3.5 h-3.5"/>
          O'zbekistondagi birinchi professional shartnoma generatori
        </div>

        <h1 className="text-6xl md:text-7xl font-black mb-8 leading-[1.05] tracking-tight">
          <span className="bg-gradient-to-b from-white to-gray-300 bg-clip-text text-transparent">
            Shartnomalarni
          </span>
          <br/>
          <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-300 bg-clip-text text-transparent">
            tez
          </span>
          <span className="bg-gradient-to-b from-white to-gray-300 bg-clip-text text-transparent"> va </span>
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-300 bg-clip-text text-transparent">
            professional
          </span>
          <br/>
          <span className="bg-gradient-to-b from-white to-gray-300 bg-clip-text text-transparent">
            yarating
          </span>
        </h1>

        <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
          Word'da vaqt sarflashni bas qiling. Rekvizitlarni bir marta kiriting —
          barcha shartnomalar avtomatik to'lsin. PDF tayyor.
        </p>

        <div className="flex gap-4 justify-center flex-wrap mb-16">
          <Link href="/signup"
            className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-cyan-500 rounded-2xl text-lg font-bold transition shadow-2xl shadow-blue-900/50 flex items-center gap-3">
            Bepul boshlash
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform"/>
          </Link>
          <a href="#how"
            className="px-8 py-4 border border-white/10 hover:border-white/25 bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-2xl text-lg transition text-gray-300 hover:text-white">
            Qanday ishlaydi?
          </a>
        </div>

        <p className="text-sm text-gray-600">Oyiga 5 ta shartnoma — bepul. Kredit karta kerak emas.</p>

        {/* Dashboard preview */}
        <div className="relative mt-20 mx-auto max-w-5xl">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent z-10 pointer-events-none" style={{top:'60%'}}/>
          <div className="bg-gradient-to-b from-gray-800/50 to-gray-900/50 border border-white/10 rounded-3xl p-6 backdrop-blur-sm shadow-2xl">
            <div className="flex gap-2 mb-5">
              <div className="w-3 h-3 rounded-full bg-red-500"/>
              <div className="w-3 h-3 rounded-full bg-yellow-500"/>
              <div className="w-3 h-3 rounded-full bg-green-500"/>
              <div className="flex-1 bg-gray-700/50 rounded-full h-3 ml-4"/>
            </div>
            <div className="grid grid-cols-4 gap-3 mb-4">
              {[
                { label: 'Shartnomalar', val: '24', color: 'from-blue-600 to-blue-800' },
                { label: 'Faol', val: '12', color: 'from-emerald-600 to-emerald-800' },
                { label: 'Tashkilotlar', val: '3', color: 'from-purple-600 to-purple-800' },
                { label: 'Kontragentlar', val: '18', color: 'from-orange-600 to-orange-800' },
              ].map((c, i) => (
                <div key={i} className={`bg-gradient-to-br ${c.color} rounded-xl p-4 text-left`}>
                  <div className="text-2xl font-bold">{c.val}</div>
                  <div className="text-xs opacity-75 mt-1">{c.label}</div>
                </div>
              ))}
            </div>
            <div className="bg-gray-800/60 rounded-xl p-4">
              <div className="flex gap-3 mb-3">
                <div className="h-3 bg-gray-600 rounded-full w-24"/>
                <div className="h-3 bg-gray-700 rounded-full w-16"/>
              </div>
              {[1,2,3].map(i => (
                <div key={i} className="flex items-center gap-3 py-2.5 border-b border-gray-700/50 last:border-0">
                  <div className="w-8 h-8 bg-blue-900/60 rounded-lg"/>
                  <div className="flex-1 space-y-1.5">
                    <div className="h-2.5 bg-gray-600 rounded-full w-32"/>
                    <div className="h-2 bg-gray-700 rounded-full w-48"/>
                  </div>
                  <div className="h-6 bg-emerald-900/60 rounded-full w-16"/>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="relative border-y border-white/5 py-14 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-8 text-center">
          {[
            { value: '8+', label: "Shartnoma turi", icon: <FileText className="w-5 h-5"/> },
            { value: '5 min', label: "O'rtacha yaratish vaqti", icon: <Clock className="w-5 h-5"/> },
            { value: '100%', label: "Ma'lumotlar xavfsizligi", icon: <Shield className="w-5 h-5"/> },
          ].map((s, i) => (
            <div key={i} className="group">
              <div className="flex justify-center mb-3 text-blue-400 opacity-60 group-hover:opacity-100 transition">{s.icon}</div>
              <div className="text-4xl font-black bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent mb-2">{s.value}</div>
              <div className="text-gray-500 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="relative max-w-7xl mx-auto px-6 py-28">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 text-blue-400 text-sm font-medium mb-4">
            <Zap className="w-4 h-4"/> IMKONIYATLAR
          </div>
          <h2 className="text-5xl font-black mb-6 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
            Nima uchun Shartnoma.uz?
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Word hujjatlaridan farqli — xatolarni kamaytiradi, vaqtingizni tejaydi
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              icon: <Zap className="w-7 h-7"/>,
              title: "Tezkor yaratish",
              desc: "8 tur shartnomadan birini tanlang, ma'lumotlar avtomatik to'ldiriladi. 5 daqiqada tayyor.",
              gradient: "from-yellow-500/20 to-orange-500/10",
              border: "border-yellow-500/20",
              iconColor: "text-yellow-400",
              iconBg: "bg-yellow-500/10"
            },
            {
              icon: <Building2 className="w-7 h-7"/>,
              title: "Ko'p tashkilot",
              desc: "Bitta hisobda bir nechta tashkilotni boshqaring. Buxgalterlar uchun ideal yechim.",
              gradient: "from-blue-500/20 to-cyan-500/10",
              border: "border-blue-500/20",
              iconColor: "text-blue-400",
              iconBg: "bg-blue-500/10"
            },
            {
              icon: <Users className="w-7 h-7"/>,
              title: "Kontragentlar bazasi",
              desc: "STR yoki nom bo'yicha qidiring. Bir marta kiriting — har safar tayyor.",
              gradient: "from-purple-500/20 to-pink-500/10",
              border: "border-purple-500/20",
              iconColor: "text-purple-400",
              iconBg: "bg-purple-500/10"
            },
            {
              icon: <Download className="w-7 h-7"/>,
              title: "Professional PDF",
              desc: "A4 formatda toza, imzo va muhr bilan professional ko'rinishdagi PDF hujjat.",
              gradient: "from-emerald-500/20 to-teal-500/10",
              border: "border-emerald-500/20",
              iconColor: "text-emerald-400",
              iconBg: "bg-emerald-500/10"
            },
            {
              icon: <Copy className="w-7 h-7"/>,
              title: "Nusxa olish",
              desc: "Avvalgi shartnomadan bir tugma bilan yangi nusxa yarating va o'zgartiring.",
              gradient: "from-cyan-500/20 to-blue-500/10",
              border: "border-cyan-500/20",
              iconColor: "text-cyan-400",
              iconBg: "bg-cyan-500/10"
            },
            {
              icon: <Shield className="w-7 h-7"/>,
              title: "To'liq xavfsizlik",
              desc: "Har bir foydalanuvchi faqat o'z ma'lumotlarini ko'radi. Shifrlangan saqlash.",
              gradient: "from-red-500/20 to-rose-500/10",
              border: "border-red-500/20",
              iconColor: "text-red-400",
              iconBg: "bg-red-500/10"
            },
          ].map((f, i) => (
            <div key={i} className={`group relative bg-gradient-to-br ${f.gradient} border ${f.border} rounded-2xl p-7 hover:scale-[1.02] transition-all duration-300 backdrop-blur-sm`}>
              <div className={`w-14 h-14 ${f.iconBg} rounded-2xl flex items-center justify-center ${f.iconColor} mb-6`}>
                {f.icon}
              </div>
              <h3 className="text-lg font-bold mb-3 text-white">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="relative py-28 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 text-purple-400 text-sm font-medium mb-4">
              <TrendingUp className="w-4 h-4"/> QANDAY ISHLAYDI
            </div>
            <h2 className="text-5xl font-black mb-4 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
              3 qadam — shartnoma tayyor
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px bg-gradient-to-r from-blue-600/50 via-purple-600/50 to-pink-600/50"/>
            {[
              { num: '01', title: "Ro'yxatdan o'ting", desc: "Bepul hisob oching. Tashkilot rekvizitlarini bir marta kiriting.", color: "from-blue-600 to-cyan-600", shadow: "shadow-blue-900/40" },
              { num: '02', title: "Kontragent qo'shing", desc: "Kontragent ma'lumotlarini kiriting. Keyingisida STR bo'yicha tez topiladi.", color: "from-purple-600 to-pink-600", shadow: "shadow-purple-900/40" },
              { num: '03', title: "Shartnoma yarating", desc: "Turni tanlang, raqam va summa kiriting — PDF bir daqiqada tayyor!", color: "from-emerald-600 to-teal-600", shadow: "shadow-emerald-900/40" },
            ].map((s, i) => (
              <div key={i} className="relative text-center group">
                <div className={`w-20 h-20 bg-gradient-to-br ${s.color} rounded-3xl flex items-center justify-center text-2xl font-black mx-auto mb-8 shadow-xl ${s.shadow} group-hover:scale-110 transition-transform duration-300`}>
                  {s.num}
                </div>
                <h3 className="text-xl font-bold mb-4 text-white">{s.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTRACT TYPES ── */}
      <section className="relative max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-black mb-4 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
            Shartnoma turlari
          </h2>
          <p className="text-gray-400">Eng ko'p ishlatiladigan 8 tur tayyor</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { name: 'Oldi-sotdi', icon: <TrendingUp className="w-5 h-5"/> },
            { name: "Xizmat ko'rsatish", icon: <Zap className="w-5 h-5"/> },
            { name: 'Ijara', icon: <Building2 className="w-5 h-5"/> },
            { name: 'Pudrat', icon: <FileText className="w-5 h-5"/> },
            { name: "Qo'shimcha", icon: <Copy className="w-5 h-5"/> },
            { name: 'Moliyaviy yordam', icon: <Star className="w-5 h-5"/> },
            { name: 'Daval', icon: <Shield className="w-5 h-5"/> },
            { name: 'Xalqaro', icon: <Crown className="w-5 h-5"/> },
          ].map((t, i) => (
            <div key={i} className="group flex items-center gap-3 bg-white/[0.03] border border-white/8 hover:border-blue-500/40 hover:bg-blue-500/5 rounded-xl p-4 transition-all duration-300 cursor-default">
              <div className="text-blue-400 opacity-60 group-hover:opacity-100 transition flex-shrink-0">{t.icon}</div>
              <span className="text-sm text-gray-300 group-hover:text-white transition font-medium">{t.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="relative py-28 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 text-emerald-400 text-sm font-medium mb-4">
              <Star className="w-4 h-4"/> NARXLAR
            </div>
            <h2 className="text-5xl font-black mb-4 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
              Har bir tashkilot uchun
            </h2>
            <p className="text-gray-400 text-lg">Arzon, shaffof, adolatli narx</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* FREE */}
            <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-all duration-300">
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-gray-300"/>
                  </div>
                  <span className="font-bold text-gray-300">Bepul</span>
                </div>
                <div className="text-5xl font-black text-white mb-2">0</div>
                <div className="text-gray-500 text-sm">so'm / oyiga</div>
                <p className="text-gray-500 text-sm mt-3">Sinab ko'rish uchun</p>
              </div>
              <ul className="space-y-3 mb-8">
                {["Oyiga 5 ta shartnoma", "8 tur shartnoma", "PDF yuklab olish", "Kontragentlar bazasi", "Shartnoma.uz belgili PDF"].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-400">
                    <CheckCircle className="w-4 h-4 text-gray-600 flex-shrink-0"/>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="block w-full text-center py-3.5 border border-white/10 hover:border-white/25 hover:bg-white/5 rounded-xl text-sm font-semibold transition text-gray-300">
                Bepul boshlash
              </Link>
            </div>

            {/* STANDARD */}
            <div className="relative bg-gradient-to-b from-blue-600/20 to-blue-900/10 border border-blue-500/30 rounded-3xl p-8 shadow-2xl shadow-blue-900/20 scale-[1.02]">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xs font-bold px-5 py-2 rounded-full shadow-lg">
                🔥 Mashhur
              </div>
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white"/>
                  </div>
                  <span className="font-bold text-white">Standart</span>
                </div>
                <div className="text-5xl font-black text-white mb-2">50,000</div>
                <div className="text-blue-300 text-sm">so'm / oyiga</div>
                <p className="text-gray-400 text-sm mt-3">Har bir tashkilot uchun</p>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  "Cheksiz shartnomalar",
                  "8 tur shartnoma",
                  "Reklama belgisisiz PDF",
                  "Imzo va muhr avtomatik",
                  "Nusxa olish funksiyasi",
                  "Bir nechta bank hisob",
                  "Ustunlik qo'llab-quvvatlash",
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                    <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0"/>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup"
                className="block w-full text-center py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl text-sm font-bold transition shadow-lg shadow-blue-900/40">
                Boshlash →
              </Link>
            </div>

            {/* AI PRO */}
            <div className="relative bg-gradient-to-b from-purple-600/20 to-purple-900/10 border border-purple-500/30 rounded-3xl p-8 hover:border-purple-500/50 transition-all duration-300">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-5 py-2 rounded-full shadow-lg">
                ✨ Tez kutda
              </div>
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                    <Crown className="w-4 h-4 text-white"/>
                  </div>
                  <span className="font-bold text-white">AI Pro</span>
                </div>
                <div className="text-5xl font-black text-white mb-2">199,000</div>
                <div className="text-purple-300 text-sm">so'm / oyiga</div>
                <p className="text-gray-400 text-sm mt-3">Korporativ va professional uchun</p>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  "Standart tarifning hammasi",
                  "AI shartnoma tahlili",
                  "Word fayldan shablon yaratish",
                  "Yuridik xavf aniqlash",
                  "Grammatika tekshiruvi",
                  "Avtomatic matn to'ldirish",
                  "Ustuvor qo'llab-quvvatlash",
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                    <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0"/>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup"
                className="block w-full text-center py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl text-sm font-bold transition shadow-lg shadow-purple-900/40">
                Ro'yxatdan o'tish →
              </Link>
            </div>
          </div>

          <p className="text-center text-gray-600 text-sm mt-10">
            To'lov: bank o'tkazma orqali. Aktivatsiya 24 soat ichida.
          </p>
        </div>
      </section>

      {/* ── TRUST ── */}
      <section className="relative max-w-5xl mx-auto px-6 py-24 text-center">
        <h2 className="text-4xl font-black mb-6 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
          Ishonch asosida qurilgan
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14">
          {[
            { icon: <Lock className="w-8 h-8"/>, title: "Ma'lumotlar xavfsiz", desc: "Har bir foydalanuvchi faqat o'z ma'lumotlarini ko'radi. Supabase RLS himoyasi.", color: "text-emerald-400", bg: "bg-emerald-500/10" },
            { icon: <Shield className="w-8 h-8"/>, title: "Shifrlangan saqlash", desc: "Barcha ma'lumotlar shifrlangan holda saqlanadi. Uchinchi shaxs kirа olmaydi.", color: "text-blue-400", bg: "bg-blue-500/10" },
            { icon: <Star className="w-8 h-8"/>, title: "Doim mavjud", desc: "99.9% uptime kafolati. Vercel va Supabase infratuzilmasi asosida.", color: "text-yellow-400", bg: "bg-yellow-500/10" },
          ].map((t, i) => (
            <div key={i} className="bg-white/[0.03] border border-white/8 rounded-2xl p-7 text-center">
              <div className={`w-16 h-16 ${t.bg} rounded-2xl flex items-center justify-center ${t.color} mx-auto mb-5`}>
                {t.icon}
              </div>
              <h3 className="font-bold text-white mb-3">{t.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/10 to-transparent pointer-events-none"/>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="text-6xl mb-8">🚀</div>
          <h2 className="text-5xl font-black mb-6 bg-gradient-to-b from-white to-gray-300 bg-clip-text text-transparent">
            Bugun boshlang
          </h2>
          <p className="text-gray-400 text-xl mb-12 leading-relaxed">
            Word hujjatlariga sarflangan vaqtni biznesni rivojlantirishga sarflang.
            Minglab tashkilotlar allaqachon tejash yo'lida.
          </p>
          <Link href="/signup"
            className="inline-flex items-center gap-3 px-12 py-5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 rounded-2xl text-xl font-black transition shadow-2xl shadow-blue-900/50">
            Bepul ro'yxatdan o'tish
            <ChevronRight className="w-6 h-6"/>
          </Link>
          <p className="text-gray-600 text-sm mt-6">Kredit karta talab qilinmaydi · O'rnatish shart emas</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center font-bold text-xs">S</div>
            <span className="font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Shartnoma.uz</span>
          </div>
          <div className="flex gap-8 text-sm text-gray-500">
            <a href="#features" className="hover:text-white transition">Imkoniyatlar</a>
            <a href="#pricing" className="hover:text-white transition">Narxlar</a>
            <Link href="/login" className="hover:text-white transition">Kirish</Link>
            <Link href="/signup" className="hover:text-white transition">Ro'yxatdan o'tish</Link>
          </div>
          <p className="text-gray-600 text-sm">© 2026 Shartnoma.uz</p>
        </div>
      </footer>
    </div>
  )
}
