export type Band = { matn: string }
export type Bolim = { sarlavha: string; bandlar: Band[] }
export type ContractStructure = { bolimlar: Bolim[] }

// Shablonni to'ldirish uchun ma'lumotlar
export type TemplateData = {
  contract_number: string
  contract_date: string
  city: string
  org_name: string
  org_inn: string
  org_director: string
  cp_name: string
  cp_inn: string
  cp_director: string
  amount: number
  amount_text: string
}

function fill(text: string, d: Partial<TemplateData>): string {
  return text
    .replace(/\[RAQAM\]/g, d.contract_number || '___')
    .replace(/\[SANA\]/g, d.contract_date || '___')
    .replace(/\[SHAHAR\]/g, d.city || 'Toshkent')
    .replace(/\[BUYURTMACHI\]/g, d.org_name || '_________________')
    .replace(/\[BUYURTMACHI_INN\]/g, d.org_inn || '___')
    .replace(/\[BUYURTMACHI_RAHBAR\]/g, d.org_director || '___')
    .replace(/\[IJROCHI\]/g, d.cp_name || '_________________')
    .replace(/\[IJROCHI_INN\]/g, d.cp_inn || '___')
    .replace(/\[IJROCHI_RAHBAR\]/g, d.cp_director || '___')
    .replace(/\[SUMMA\]/g, d.amount?.toLocaleString() || '___')
    .replace(/\[SUMMA_MATN\]/g, d.amount_text || '___')
}

// Summani so'zga aylantirish
export function numberToWords(num: number): string {
  if (!num || isNaN(num)) return 'nol'
  const ones = ["", "bir", "ikki", "uch", "to'rt", "besh", "olti", "yetti", "sakkiz", "to'qqiz"]
  const tens = ["", "o'n", "yigirma", "o'ttiz", "qirq", "ellik", "oltmish", "yetmish", "sakson", "to'qson"]
  const scales = ["", "ming", "million", "milliard"]

  function chunk(n: number): string {
    if (n === 0) return ""
    if (n < 10) return ones[n]
    if (n < 100) return tens[Math.floor(n/10)] + (n%10 ? " " + ones[n%10] : "")
    return ones[Math.floor(n/100)] + " yuz" + (n%100 ? " " + chunk(n%100) : "")
  }

  const parts: string[] = []
  let rem = Math.floor(num)
  let i = 0
  while (rem > 0) {
    const c = rem % 1000
    if (c) parts.unshift(chunk(c) + (scales[i] ? " " + scales[i] : ""))
    rem = Math.floor(rem / 1000)
    i++
  }
  return parts.join(" ") || "nol"
}

// Tuzilmali shablonlar
const STRUCTURES: Record<string, (d: Partial<TemplateData>) => ContractStructure> = {

  oldi_sotdi: (d) => ({ bolimlar: [
    { sarlavha: "SHARTNOMA PREDMETI", bandlar: [
      { matn: `[BUYURTMACHI] (keyingi o'rinlarda "Xaridor") va [IJROCHI] (keyingi o'rinlarda "Sotuvchi") o'rtasida ushbu oldi-sotdi shartnomasi tuzildi.` },
      { matn: "Sotuvchi Xaridorga tovarlarni sotish, Xaridor esa ushbu tovarlarni qabul qilib to'lash majburiyatini oladi." },
      { matn: "Tovarning nomi, miqdori va narxi ushbu shartnomaga ilova qilinadigan Spesifikatsiyada ko'rsatiladi." },
    ]},
    { sarlavha: "NARX VA UMUMIY SUMMA", bandlar: [
      { matn: `Ushbu shartnoma bo'yicha tovarlarning umumiy qiymati [SUMMA] ([SUMMA_MATN]) so'mni tashkil etadi.` },
      { matn: "Tovar narxi O'zbekiston Respublikasi milliy valyutasida — so'mda belgilangan." },
      { matn: "QQS amaldagi qonunchilikka muvofiq hisoblab qo'shiladi." },
    ]},
    { sarlavha: "TO'LOV TARTIBI", bandlar: [
      { matn: "Xaridor tovarni qabul qilib olgandan so'ng 10 (o'n) bank ishi kuni ichida to'lovni amalga oshiradi." },
      { matn: "To'lov naqd pulsiz bank o'tkazma yo'li bilan amalga oshiriladi." },
      { matn: "To'lov sanasi — Sotuvchining bank hisobvarag'iga pul tushgan sana hisoblanadi." },
    ]},
    { sarlavha: "TOVARNI YETKAZIB BERISH", bandlar: [
      { matn: "Tovarni yetkazib berish muddati: shartnoma imzolanganidan keyin 30 (o'ttiz) kalendar kuni ichida." },
      { matn: "Tovar yetkazib berish joyi: Xaridorning yuridik manzili yoki tomonlar kelishgan joy." },
      { matn: "Tovar topshirilganda Xaridor tovar-pul hujjatlariga imzo qo'yadi." },
    ]},
    { sarlavha: "TOMONLARNING HUQUQ VA MAJBURIYATLARI", bandlar: [
      { matn: "Sotuvchi: belgilangan muddatda va sifatda tovarni yetkazib berishi; tovar bilan barcha kerakli hujjatlarni taqdim etishi shart." },
      { matn: "Xaridor: tovarni belgilangan muddatda qabul qilishi; to'lovni o'z vaqtida amalga oshirishi shart." },
      { matn: "Tovar nuqsonli bo'lsa, Sotuvchi uni almashtirish yoki narxini qaytarish majburiyatini oladi." },
    ]},
    { sarlavha: "MAS'ULIYAT", bandlar: [
      { matn: "Tomonlar ushbu shartnoma bo'yicha o'z majburiyatlarini bajarmaslik uchun amaldagi qonunchilikka muvofiq javobgar bo'ladi." },
      { matn: "To'lovni kechiktirganlik uchun Xaridor har kechiktirilgan kun uchun kechiktirilgan summaning 0,1% miqdorida penya to'laydi." },
      { matn: "Tovar yetkazib berishni kechiktirganlik uchun Sotuvchi ham xuddi shunday miqdorda penya to'laydi." },
    ]},
    { sarlavha: "FORS-MAJOR", bandlar: [
      { matn: "Tomonlar o'z nazoratidan tashqarida bo'lgan holatlar (tabiiy ofat, urush, epidemiya va h.k.) natijasida yuzaga keladigan majburiyatlarni bajara olmaslik uchun javobgar emas." },
      { matn: "Fors-major holat yuzaga kelganda, ta'sirlangan tomon boshqa tomonga 5 (besh) kalendar kuni ichida yozma xabar berishi shart." },
    ]},
    { sarlavha: "NIZOLARNI HAL ETISH", bandlar: [
      { matn: "Ushbu shartnoma bo'yicha yuzaga keladigan nizolar muzokaralar yo'li bilan hal etiladi." },
      { matn: "Muzokaralar natija bermasa, nizolar O'zbekiston Respublikasining amaldagi qonunchiligiga muvofiq sudda hal etiladi." },
    ]},
    { sarlavha: "SHARTNOMANING AMAL QILISH MUDDATI", bandlar: [
      { matn: "Ushbu shartnoma imzolangan kundan kuchga kiradi va majburiyatlar to'liq bajarilgunga qadar amal qiladi." },
      { matn: "Tomonlardan biri shartnomani bekor qilmoqchi bo'lsa, boshqa tomonga kamida 30 (o'ttiz) kun oldin yozma xabar berishi kerak." },
    ]},
  ]}),

  xizmat: (d) => ({ bolimlar: [
    { sarlavha: "SHARTNOMA PREDMETI", bandlar: [
      { matn: `[IJROCHI] (keyingi o'rinlarda "Ijrochi") [BUYURTMACHI] (keyingi o'rinlarda "Buyurtmachi") ga xizmatlarni ko'rsatish majburiyatini oladi.` },
      { matn: "Ko'rsatiladigan xizmatlarning to'liq ro'yxati va tavsifi ushbu shartnomaga ilova qilinadigan Texnik topshiriqda belgilanadi." },
      { matn: "Xizmatlar amaldagi qonunchilik va tomonlar kelishgan talablarga muvofiq ko'rsatiladi." },
    ]},
    { sarlavha: "XIZMAT NARXI VA TO'LOV TARTIBI", bandlar: [
      { matn: `Ko'rsatilgan xizmatlar uchun umumiy to'lov miqdori [SUMMA] ([SUMMA_MATN]) so'mni tashkil etadi.` },
      { matn: "Shartnoma imzolanganidan keyin 3 (uch) ish kuni ichida 50% avans to'lovi amalga oshiriladi." },
      { matn: "Xizmatlar to'liq ko'rsatilgandan va qabul dalolatnomasiga imzo qo'yilgandan keyin 5 (besh) ish kuni ichida qolgan 50% to'lanadi." },
    ]},
    { sarlavha: "XIZMAT KO'RSATISH MUDDATI", bandlar: [
      { matn: "Xizmat ko'rsatishning boshlanish sanasi: shartnoma imzolanganidan keyin 3 (uch) ish kuni." },
      { matn: "Xizmat ko'rsatishning tugash muddati: tomonlar qo'shimcha kelishuvi bilan belgilanadi." },
    ]},
    { sarlavha: "TOMONLARNING MAJBURIYATLARI", bandlar: [
      { matn: "Ijrochi: xizmatlarni belgilangan sifat va muddatda ko'rsatishi; xizmat ko'rsatish davomida olingan maxfiy ma'lumotlarni oshkor etmasligi shart." },
      { matn: "Buyurtmachi: xizmat ko'rsatish uchun zarur sharoit yaratishi; to'lovni belgilangan muddatda amalga oshirishi; xizmatlarni o'z vaqtida qabul qilib dalolatnomani imzolashi shart." },
    ]},
    { sarlavha: "XIZMATLARNI QABUL QILISH", bandlar: [
      { matn: "Ijrochi xizmatlarni ko'rsatib bo'lgach, Buyurtmachiga qabul-topshiriq dalolatnomasini taqdim etadi." },
      { matn: "Buyurtmachi 3 (uch) ish kuni ichida dalolatnomani imzolaydi yoki asosli rad etishni yozma ravishda bildiradi." },
    ]},
    { sarlavha: "KONFIDENSIALLIK", bandlar: [
      { matn: "Tomonlar ushbu shartnoma doirasida olgan barcha ma'lumotlarni maxfiy saqlab, uchinchi shaxslarga oshkor etmaslik majburiyatini oladilar." },
      { matn: "Ushbu band shartnoma tugaganidan keyin ham 3 (uch) yil davomida kuchda qoladi." },
    ]},
    { sarlavha: "MAS'ULIYAT", bandlar: [
      { matn: "To'lovni kechiktirganlik uchun Buyurtmachi kechiktirilgan har bir kun uchun 0,1% miqdorida penya to'laydi." },
      { matn: "Xizmat ko'rsatishni kechiktirganlik uchun Ijrochi kechiktirilgan har bir kun uchun 0,1% miqdorida penya to'laydi." },
    ]},
    { sarlavha: "NIZOLARNI HAL ETISH", bandlar: [
      { matn: "Nizolar muzokara yo'li bilan hal etiladi, hal bo'lmasa O'zbekiston Respublikasi sudlari orqali." },
    ]},
  ]}),

  ijara: (d) => ({ bolimlar: [
    { sarlavha: "SHARTNOMA PREDMETI", bandlar: [
      { matn: `[IJROCHI] (keyingi o'rinlarda "Ijaraberuvchi") [BUYURTMACHI] (keyingi o'rinlarda "Ijarachi") ga mol-mulkni vaqtincha foydalanish uchun beradi.` },
      { matn: "Ijara ob'ekti: manzil / tavsifi: _____________________, maydoni: _____________________ ." },
      { matn: "Ijara ob'ekti ushbu shartnoma imzolanganida ko'rsatilgan holda topshiriladi." },
    ]},
    { sarlavha: "IJARA MUDDATI", bandlar: [
      { matn: "Ijara muddati: shartnoma imzolanganidan boshlab 12 (o'n ikki) oy." },
      { matn: "Ijara muddati tugagandan keyin tomonlar kelishgan holda shartnoma uzaytirilishi mumkin." },
    ]},
    { sarlavha: "IJARA HAQI", bandlar: [
      { matn: `Ijara haqi oyiga [SUMMA] ([SUMMA_MATN]) so'mni tashkil etadi.` },
      { matn: "Ijara haqi har oyning 5 (beshinchi) kuniga qadar to'lanadi." },
      { matn: "Kommunal xizmatlar (elektr, gaz, suv) Ijarachi tomonidan alohida to'lanadi." },
    ]},
    { sarlavha: "TOMONLARNING MAJBURIYATLARI", bandlar: [
      { matn: "Ijaraberuvchi: ijara ob'ektini kelishilgan holda topshirishi; ijara muddati davomida foydalanishga to'sqinlik qilmasligi shart." },
      { matn: "Ijarachi: ijara haqini belgilangan muddatda to'lashi; ob'ektni ehtiyotkorlik bilan saqlashi; ijara muddati tugagach dastlabki holatda qaytarishi shart." },
    ]},
    { sarlavha: "SHARTNOMANI BEKOR QILISH", bandlar: [
      { matn: "Tomonlardan biri shartnomani muddatidan oldin bekor qilmoqchi bo'lsa, 30 (o'ttiz) kun oldin yozma ogohlantirish berishi shart." },
      { matn: "Ijara haqi 2 (ikki) oydan ko'p kechiktirilsa, Ijaraberuvchi shartnomani bir tomonlama bekor qilish huquqiga ega." },
    ]},
    { sarlavha: "MAS'ULIYAT", bandlar: [
      { matn: "Ijara haqini kechiktirganlik uchun Ijarachi kechiktirilgan har bir kun uchun 0,1% penya to'laydi." },
      { matn: "Ijara ob'ektiga yetkazilgan zarar uchun Ijarachi to'liq javob beradi." },
    ]},
    { sarlavha: "NIZOLARNI HAL ETISH", bandlar: [
      { matn: "Nizolar muzokara yo'li bilan hal etiladi, hal bo'lmasa O'zbekiston Respublikasi sudlari orqali." },
    ]},
  ]}),

  pudrat: (d) => ({ bolimlar: [
    { sarlavha: "SHARTNOMA PREDMETI", bandlar: [
      { matn: `[IJROCHI] (keyingi o'rinlarda "Pudratchi") [BUYURTMACHI] (keyingi o'rinlarda "Buyurtmachi") ning topshirig'iga binoan ishlarni bajarish majburiyatini oladi.` },
      { matn: "Ishning nomi va hajmi: _____________________. Ish joyi (ob'ekt): _____________________." },
      { matn: "Texnik talablar: ushbu shartnomaga ilova qilinadigan Texnik topshiriqqa muvofiq." },
    ]},
    { sarlavha: "ISH BAJARISH MUDDATI", bandlar: [
      { matn: "Ishlarni boshlash sanasi: shartnoma imzolanganidan keyin 5 (besh) ish kuni ichida." },
      { matn: "Ishlarni yakunlash muddati: _____________________." },
    ]},
    { sarlavha: "NARX VA TO'LOV TARTIBI", bandlar: [
      { matn: `Ishlarning umumiy narxi [SUMMA] ([SUMMA_MATN]) so'mni tashkil etadi.` },
      { matn: "Shartnoma imzolanganida 30% avans to'lovi amalga oshiriladi." },
      { matn: "Ishlar 50% bajarilganda qo'shimcha 40% to'lanadi. Ishlar to'liq qabul qilinganida qolgan 30% to'lanadi." },
    ]},
    { sarlavha: "TOMONLARNING MAJBURIYATLARI", bandlar: [
      { matn: "Pudratchi: ishlarni belgilangan muddatda va sifatda bajarishi; xavfsizlik texnikasi qoidalariga rioya qilishi shart." },
      { matn: "Buyurtmachi: ishlar uchun zarur sharoit yaratishi; bajarilgan ishlarni o'z vaqtida qabul qilishi; to'lovni jadval asosida amalga oshirishi shart." },
    ]},
    { sarlavha: "KAFOLAT", bandlar: [
      { matn: "Bajarilgan ishlar sifatiga kafolat muddati 12 (o'n ikki) oy." },
      { matn: "Kafolat muddatida yuzaga kelgan nuqsonlar Pudratchi tomonidan bepul bartaraf etiladi." },
    ]},
    { sarlavha: "MAS'ULIYAT", bandlar: [
      { matn: "Ishlarni kechiktirganlik uchun Pudratchi kechiktirilgan har bir kun uchun shartnoma summasining 0,1% miqdorida penya to'laydi." },
      { matn: "To'lovni kechiktirganlik uchun Buyurtmachi ham xuddi shunday penya to'laydi." },
    ]},
    { sarlavha: "NIZOLARNI HAL ETISH", bandlar: [
      { matn: "Nizolar muzokara yo'li bilan hal etiladi, hal bo'lmasa O'zbekiston Respublikasi sudlari orqali." },
    ]},
  ]}),

  qoshimcha: (d) => ({ bolimlar: [
    { sarlavha: "ASOSIY SHARTNOMA MA'LUMOTLARI", bandlar: [
      { matn: "Ushbu qo'shimcha shartnoma _______ raqamli _______ sanasida tuzilgan asosiy shartnomaning ajralmas qismi hisoblanadi." },
    ]},
    { sarlavha: "O'ZGARTIRISHLAR", bandlar: [
      { matn: "Asosiy shartnomaning ___ bandiga quyidagi o'zgartirish kiritilsin: eski tahrir o'rniga yangi tahrir qabul qilinsin." },
      { matn: "O'zgartirishning mazmuni: _____________________." },
    ]},
    { sarlavha: "MOLIYAVIY O'ZGARISHLAR", bandlar: [
      { matn: `Ushbu qo'shimcha shartnoma asosida tomonlar o'rtasidagi hisob-kitob summasi [SUMMA] ([SUMMA_MATN]) so'mni tashkil etadi.` },
      { matn: "To'lov tartibi asosiy shartnomada belgilangan tartibda amalga oshiriladi." },
    ]},
    { sarlavha: "KUCHGA KIRISH", bandlar: [
      { matn: "Ushbu qo'shimcha shartnoma ikki tomon imzolagan kundan kuchga kiradi." },
      { matn: "Asosiy shartnomaning ushbu qo'shimchada zikr etilmagan barcha qolgan bandlari o'z kuchini saqlaydi." },
    ]},
  ]}),

  moliyaviy: (d) => ({ bolimlar: [
    { sarlavha: "SHARTNOMA PREDMETI", bandlar: [
      { matn: `[BUYURTMACHI] (keyingi o'rinlarda "Qarz beruvchi") [IJROCHI] (keyingi o'rinlarda "Qarz oluvchi") ga moliyaviy yordam sifatida [SUMMA] ([SUMMA_MATN]) so'm miqdorida qarz beradi.` },
      { matn: "Ushbu qarz foizsiz beriladi (yoki: yillik ____% foiz bilan beriladi)." },
      { matn: "Qarz maqsadi: _____________________." },
    ]},
    { sarlavha: "QARZNI BERISH TARTIBI", bandlar: [
      { matn: "Qarz shartnoma imzolanganidan keyin 5 (besh) bank ishi kuni ichida Qarz oluvchining hisob raqamiga o'tkaziladi." },
      { matn: "Pul o'tkazilgandan keyin Qarz oluvchi qabul qilganini tasdiqlovchi hujjat imzolaydi." },
    ]},
    { sarlavha: "QARZNI QAYTARISH TARTIBI", bandlar: [
      { matn: "Qarz oluvchi qarzni ___ oy (yil) ichida to'liq qaytarish majburiyatini oladi." },
      { matn: "Qaytarish jadvalı: har oyning ___ kuniga qadar oylik to'lov: _______ so'm." },
      { matn: "Muddatidan oldin qaytarish mumkin, bu haqda 3 (uch) kun oldin xabar berish kerak." },
    ]},
    { sarlavha: "MAS'ULIYAT", bandlar: [
      { matn: "Qarzni qaytarishni kechiktirganlik uchun Qarz oluvchi kechiktirilgan summaning kuniga 0,05% miqdorida penya to'laydi." },
    ]},
    { sarlavha: "NIZOLARNI HAL ETISH", bandlar: [
      { matn: "Nizolar muzokara yo'li bilan hal etiladi, hal bo'lmasa O'zbekiston Respublikasi sudlari orqali." },
    ]},
  ]}),

  daval: (d) => ({ bolimlar: [
    { sarlavha: "SHARTNOMA PREDMETI", bandlar: [
      { matn: `[BUYURTMACHI] (keyingi o'rinlarda "Buyurtmachi") [IJROCHI] (keyingi o'rinlarda "Qayta ishlovchi") ga xom ashyo (daval material) beradi, Qayta ishlovchi esa uni qayta ishlab tayyor mahsulot sifatida qaytaradi.` },
      { matn: "Daval material turi va miqdori: _____________________." },
      { matn: "Tayyor mahsulot turi va hajmi: _____________________." },
    ]},
    { sarlavha: "TOMONLARNING MAJBURIYATLARI", bandlar: [
      { matn: "Buyurtmachi: xom ashyoni kelishilgan miqdor va muddatda yetkazib berishi; xom ashyo sifatiga doir hujjatlarni taqdim etishi shart." },
      { matn: "Qayta ishlovchi: xom ashyoni belgilangan texnologiya asosida qayta ishlashi; tayyor mahsulotni kelishilgan muddatda topshirishi; xom ashyo yo'qolishi yoki buzilishi uchun javob berishi shart." },
    ]},
    { sarlavha: "NARX VA TO'LOV", bandlar: [
      { matn: `Qayta ishlash xizmati narxi [SUMMA] ([SUMMA_MATN]) so'mni tashkil etadi.` },
      { matn: "To'lov tayyor mahsulot topshirilganidan keyin 10 (o'n) ish kuni ichida amalga oshiriladi." },
    ]},
    { sarlavha: "MAS'ULIYAT", bandlar: [
      { matn: "Qayta ishlovchi xom ashyoni yo'qotish yoki shikastlash uchun uning to'liq qiymatini qoplash majburiyatini oladi." },
      { matn: "Kechikishlar uchun kechiktirilgan har bir kun uchun 0,1% penya to'lanadi." },
    ]},
    { sarlavha: "NIZOLARNI HAL ETISH", bandlar: [
      { matn: "Nizolar muzokara orqali, hal bo'lmasa O'zbekiston Respublikasi sudlari orqali hal etiladi." },
    ]},
  ]}),

  xalqaro: (d) => ({ bolimlar: [
    { sarlavha: "SUBJECT OF THE CONTRACT / SHARTNOMA PREDMETI", bandlar: [
      { matn: `[BUYURTMACHI] (hereinafter "Buyer") and [IJROCHI] (hereinafter "Seller") have concluded this international trade contract.` },
      { matn: "The Seller agrees to supply and the Buyer agrees to accept and pay for the goods in accordance with the terms of this Contract." },
      { matn: "Goods description, quantity and specifications are defined in the Annex (Specification) to this Contract." },
    ]},
    { sarlavha: "TOTAL VALUE / SHARTNOMA SUMMASI", bandlar: [
      { matn: `The total value of this Contract is [SUMMA] ([SUMMA_MATN]) UZS.` },
      { matn: "All payments shall be made by bank transfer." },
    ]},
    { sarlavha: "DELIVERY TERMS / YETKAZIB BERISH", bandlar: [
      { matn: "Delivery terms: _______ (Incoterms 2020). Delivery period: within ______ days from signing." },
      { matn: "Place of delivery: _____________________." },
    ]},
    { sarlavha: "PAYMENT TERMS / TO'LOV", bandlar: [
      { matn: "Payment method: Bank Transfer / Letter of Credit." },
      { matn: "Payment due: within ______ banking days after shipment documents are provided." },
    ]},
    { sarlavha: "FORCE MAJEURE / FORS-MAJOR", bandlar: [
      { matn: "Neither party shall be liable for failure to perform its obligations due to force majeure circumstances." },
      { matn: "The affected party must notify the other party within 5 days." },
    ]},
    { sarlavha: "DISPUTE RESOLUTION / NIZOLARNI HAL ETISH", bandlar: [
      { matn: "All disputes shall be settled through negotiations, then through arbitration under ICC rules or courts of the Republic of Uzbekistan." },
    ]},
  ]}),

  boshqa: (d) => ({ bolimlar: [
    { sarlavha: "SHARTNOMA PREDMETI", bandlar: [
      { matn: `[BUYURTMACHI] (keyingi o'rinlarda "1-tomon") va [IJROCHI] (keyingi o'rinlarda "2-tomon") o'rtasida ushbu shartnoma tuzildi.` },
      { matn: "Shartnoma predmeti: _____________________." },
    ]},
    { sarlavha: "NARX VA TO'LOV TARTIBI", bandlar: [
      { matn: `Shartnoma summasi: [SUMMA] ([SUMMA_MATN]) so'm.` },
      { matn: "To'lov tartibi: _____________________." },
    ]},
    { sarlavha: "TOMONLARNING MAJBURIYATLARI", bandlar: [
      { matn: "1-tomon majburiyatlari: _____________________." },
      { matn: "2-tomon majburiyatlari: _____________________." },
    ]},
    { sarlavha: "MAS'ULIYAT", bandlar: [
      { matn: "Tomonlar ushbu shartnomani bajarmaslik uchun amaldagi qonunchilikka muvofiq javobgar bo'ladi." },
    ]},
    { sarlavha: "NIZOLARNI HAL ETISH", bandlar: [
      { matn: "Nizolar muzokara yo'li bilan, hal bo'lmasa O'zbekiston Respublikasi sudlari orqali hal etiladi." },
    ]},
  ]}),
}

export function getStructure(type: string, data: Partial<TemplateData>): ContractStructure {
  const fn = STRUCTURES[type] || STRUCTURES['boshqa']
  const structure = fn(data)
  // Fill placeholders in all band texts
  return {
    bolimlar: structure.bolimlar.map(b => ({
      sarlavha: b.sarlavha,
      bandlar: b.bandlar.map(band => ({
        matn: fill(band.matn, data)
      }))
    }))
  }
}

export function structureToText(
  structure: ContractStructure,
  header: { type_name: string; number: string; date: string; city: string; org: any; cp: any }
): string {
  const lines: string[] = []
  lines.push(header.type_name.toUpperCase())
  lines.push(`№ ${header.number}`)
  lines.push('')
  lines.push(`${header.city} shahri${' '.repeat(40)}"${header.date}"`)
  lines.push('')

  structure.bolimlar.forEach((bolim, bi) => {
    lines.push(`${bi + 1}. ${bolim.sarlavha}`)
    lines.push('')
    bolim.bandlar.forEach((band, bdi) => {
      lines.push(`${bi + 1}.${bdi + 1}. ${band.matn}`)
      lines.push('')
    })
  })

  lines.push('TOMONLARNING REKVIZITLARI')
  lines.push('')
  if (header.org) {
    lines.push(`BUYURTMACHI: ${header.org.name}`)
    lines.push(`INN: ${header.org.inn || '—'}`)
    lines.push(`Rahbar: ${header.org.director_name || '—'}`)
    lines.push(`Bank: ${header.org.bank_name || '—'}`)
    lines.push(`H/r: ${header.org.bank_account || '—'}, MFO: ${header.org.mfo || '—'}`)
    lines.push(`Manzil: ${header.org.address || '—'}`)
  }
  lines.push('')
  if (header.cp) {
    lines.push(`IJROCHI: ${header.cp.name}`)
    lines.push(`INN: ${header.cp.inn || '—'}`)
    lines.push(`Rahbar: ${header.cp.director_name || '—'}`)
    lines.push(`Bank: ${header.cp.bank_name || '—'}`)
    lines.push(`H/r: ${header.cp.bank_account || '—'}, MFO: ${header.cp.mfo || '—'}`)
    lines.push(`Manzil: ${header.cp.address || '—'}`)
  }
  lines.push('')
  lines.push('_________________ / ' + (header.org?.director_name || '___'))
  lines.push('        M.O.')
  lines.push('')
  lines.push('_________________ / ' + (header.cp?.director_name || '___'))
  lines.push('        M.O.')

  return lines.join('\n')
}
