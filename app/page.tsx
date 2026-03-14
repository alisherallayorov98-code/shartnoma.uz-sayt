import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* ── HEADER ── */}
      <header className="border-b border-gray-800 sticky top-0 bg-gray-950/95 backdrop-blur-sm z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-sm shadow-lg shadow-blue-900/50">S</div>
            <span className="text-xl font-bold">Shartnoma.uz</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <a href="#features" className="hover:text-white transition">Imkoniyatlar</a>
            <a href="#how" className="hover:text-white transition">Qanday ishlaydi</a>
            <a href="#pricing" className="hover:text-white transition">Narxlar</a>
          </nav>
          <div className="flex gap-3">
            <Link href="/login" className="px-4 py-2 text-sm text-gray-300 hover:text-white transition">Kirish</Link>
            <Link href="/signup" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition shadow-lg shadow-blue-900/30">
              Bepul boshlash
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-900/30 border border-blue-800 text-blue-300 text-xs px-4 py-2 rounded-full mb-8">
          ✨ O'zbekistondagi birinchi online shartnoma generatori
        </div>
        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          Shartnomalarni <br/>
          <span className="text-blue-400">tez, to'g'ri</span> va{' '}
          <span className="text-emerald-400">professional</span> yarating
        </h1>
        <p className="text-xl text-gray-400 mb-10 max-w-3xl mx-auto leading-relaxed">
          Word'da vaqt sarflashni bas qiling. Rekvizitlarni bir marta kiriting —
          barcha shartnomalar avtomatik to'lsin. PDF tayyor.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/signup"
            className="px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl text-lg font-semibold transition shadow-xl shadow-blue-900/40">
            Bepul boshlash →
          </Link>
          <Link href="#how"
            className="px-8 py-4 border border-gray-700 hover:border-gray-500 rounded-xl text-lg transition text-gray-300 hover:text-white">
            Qanday ishlaydi?
          </Link>
        </div>
        <p className="text-sm text-gray-600 mt-4">Oyiga 5 ta shartnoma — bepul. Kredit karta kerak emas.</p>
      </section>

      {/* ── STATS ── */}
      <section className="border-y border-gray-800 py-12">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-8 text-center">
          {[
            { value: '8+', label: "Shartnoma turi" },
            { value: '5 min', label: "O'rtacha yaratish vaqti" },
            { value: '100%', label: "Ma'lumotlar xavfsizligi" },
          ].map((s, i) => (
            <div key={i}>
              <div className="text-4xl font-bold text-blue-400 mb-2">{s.value}</div>
              <div className="text-gray-400 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Nima uchun Shartnoma.uz?</h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Word hujjatlaridan farqli ravishda, tizim xatolarni kamaytiradi va vaqtingizni tejaydi
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: '⚡', title: "Tezkor yaratish", desc: "8 tur shartnomadan birini tanlang, ma'lumotlar avtomatik to'ldiriladi. 5 daqiqada tayyor.", color: 'border-yellow-800' },
            { icon: '🏢', title: "Ko'p tashkilot", desc: "Bitta hisobda bir nechta tashkilotni boshqaring. Buxgalterlar uchun ideal.", color: 'border-blue-800' },
            { icon: '🤝', title: "Kontragentlar bazasi", desc: "STR yoki nom bo'yicha qidiring. Har safar qayta to'ldirmang.", color: 'border-purple-800' },
            { icon: '📄', title: "Professional PDF", desc: "A4 formatda toza, imzo va muhr bilan professional ko'rinishdagi PDF.", color: 'border-emerald-800' },
            { icon: '📋', title: "Nusxa olish", desc: "Avvalgi shartnomadan bir tugma bilan yangi nusxa yarating va o'zgartiring.", color: 'border-orange-800' },
            { icon: '🔒', title: "Xavfsizlik", desc: "Har bir foydalanuvchi faqat o'z ma'lumotlarini ko'radi. Supabase RLS himoyasi.", color: 'border-red-800' },
          ].map((f, i) => (
            <div key={i} className={`bg-gray-900 border ${f.color} rounded-xl p-6 hover:bg-gray-800/50 transition`}>
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-semibold mb-2 text-white">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="bg-gray-900/50 border-y border-gray-800 py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Qanday ishlaydi?</h2>
            <p className="text-gray-400">3 oddiy qadam — shartnoma tayyor</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: "Ro'yxatdan o'ting", desc: "Bepul hisob oching. Tashkilot ma'lumotlaringizni bir marta kiriting." },
              { step: '02', title: "Kontragent qo'shing", desc: "Kontragent ma'lumotlarini kiritng. Keyingisida STR bo'yicha topiladi." },
              { step: '03', title: "Shartnoma yarating", desc: "Turni tanlang, raqam va summa kiriting — PDF tayyor!" },
            ].map((s, i) => (
              <div key={i} className="relative text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg shadow-blue-900/40">
                  {s.step}
                </div>
                <h3 className="text-lg font-semibold mb-3">{s.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 left-[calc(50%+40px)] right-[calc(-50%+40px)] h-0.5 bg-gradient-to-r from-blue-600 to-gray-700"/>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTRACT TYPES ── */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Shartnoma turlari</h2>
          <p className="text-gray-400">Eng ko'p ishlatiladigan shartnoma turlari tayyor</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            'Oldi-sotdi shartnomasi',
            "Xizmat ko'rsatish",
            'Ijara shartnomasi',
            'Pudrat shartnomasi',
            "Qo'shimcha shartnoma",
            'Moliyaviy yordam',
            'Daval shartnomasi',
            'Xalqaro shartnoma',
          ].map((t, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 hover:border-blue-700 rounded-xl p-4 text-center text-sm text-gray-300 hover:text-white transition cursor-default">
              📄 {t}
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="bg-gray-900/50 border-y border-gray-800 py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Narxlar</h2>
            <p className="text-gray-400">Har bir tashkilot uchun alohida tarif</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {[
              {
                name: 'Bepul',
                price: '0',
                period: '/oy',
                desc: 'Sinab ko\'rish uchun',
                features: [
                  'Oyiga 5 ta shartnoma',
                  '8 tur shartnoma',
                  'PDF yuklab olish',
                  'Kontragentlar bazasi',
                  'Shartnoma.uz belgisi bilan PDF',
                ],
                cta: "Bepul boshlash",
                href: '/signup',
                highlight: false,
              },
              {
                name: 'Standart',
                price: '50,000',
                period: ' so\'m/oy',
                desc: 'Har bir tashkilot uchun',
                features: [
                  'Cheksiz shartnomalar',
                  '8 tur shartnoma',
                  'Reklama belgisisiz PDF',
                  'Imzo va muhr avtomatik',
                  'Nusxa olish funksiyasi',
                  'Bir nechta bank hisob',
                  'Ustunlik qo\'llab-quvvatlash',
                ],
                cta: "Boshlash →",
                href: '/signup',
                highlight: true,
              },
            ].map((p, i) => (
              <div key={i} className={`rounded-2xl p-8 border ${p.highlight ? 'bg-blue-600 border-blue-500 shadow-xl shadow-blue-900/30' : 'bg-gray-900 border-gray-800'}`}>
                <div className="mb-6">
                  <div className="text-sm font-medium opacity-80 mb-1">{p.name}</div>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-bold">{p.price}</span>
                    <span className={`text-sm mb-1 ${p.highlight ? 'text-blue-200' : 'text-gray-400'}`}>{p.period}</span>
                  </div>
                  <div className={`text-sm mt-1 ${p.highlight ? 'text-blue-200' : 'text-gray-500'}`}>{p.desc}</div>
                </div>
                <ul className="space-y-3 mb-8">
                  {p.features.map((f, j) => (
                    <li key={j} className={`flex items-center gap-2 text-sm ${p.highlight ? 'text-blue-100' : 'text-gray-400'}`}>
                      <span className={p.highlight ? 'text-white' : 'text-emerald-400'}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href={p.href}
                  className={`block w-full text-center py-3 rounded-xl font-semibold transition ${
                    p.highlight
                      ? 'bg-white text-blue-600 hover:bg-blue-50'
                      : 'border border-gray-700 text-white hover:bg-gray-800'
                  }`}>
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h2 className="text-4xl font-bold mb-6">Bugun boshlang</h2>
        <p className="text-gray-400 text-lg mb-10">
          Word hujjatlariga sarflangan vaqtni biznesni rivojlantirishga sarflang.
        </p>
        <Link href="/signup"
          className="inline-flex items-center gap-2 px-10 py-5 bg-blue-600 hover:bg-blue-500 rounded-2xl text-xl font-bold transition shadow-2xl shadow-blue-900/40">
          Bepul ro'yxatdan o'tish →
        </Link>
        <p className="text-gray-600 text-sm mt-4">Kredit karta talab qilinmaydi</p>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-gray-800 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center font-bold text-xs">S</div>
            <span className="font-semibold">Shartnoma.uz</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="/login" className="hover:text-white transition">Kirish</Link>
            <Link href="/signup" className="hover:text-white transition">Ro'yxatdan o'tish</Link>
          </div>
          <p className="text-gray-600 text-sm">© 2026 Shartnoma.uz</p>
        </div>
      </footer>
    </div>
  )
}
