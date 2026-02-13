'use client'

import { useState, useEffect, useRef } from 'react'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

/* ═══════════════════════════════════════════════════════════
   Points Calculator
   ═══════════════════════════════════════════════════════════ */
function calcPoints(age: string, english: string, exp: string, edu: string) {
  const a: Record<string, number> = { '18-24': 25, '25-32': 30, '33-39': 25, '40-44': 15, '45+': 0 }
  const e: Record<string, number> = { superior: 20, proficient: 10, competent: 0 }
  const x: Record<string, number> = { '8+': 15, '5-7': 10, '3-4': 5, '0-2': 0 }
  const d: Record<string, number> = { phd: 20, masters: 15, bachelor: 15, trade: 10, highschool: 0 }
  return (a[age] || 0) + (e[english] || 0) + (x[exp] || 0) + (d[edu] || 0)
}

/* ═══════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════ */
type Situation = '' | 'experienced' | 'student' | 'partner' | 'whv'

interface Profile {
  situation: Situation
  age: string
  english: string
  experience: string
  education: string
  partnerType: string
  location: string
  studyLevel: string
}

const EMPTY: Profile = {
  situation: '', age: '', english: '', experience: '', education: '',
  partnerType: '', location: '', studyLevel: '',
}

interface Rec {
  type: string
  name: string
  pct: number
  emoji: string
  tips: string[]
  journey: string[]
  catId: string
}

/* ═══════════════════════════════════════════════════════════
   Recommendation Engine
   ═══════════════════════════════════════════════════════════ */
function recommend(p: Profile): Rec[] {
  const r: Rec[] = []

  if (p.situation === 'experienced') {
    const pts = calcPoints(p.age, p.english, p.experience, p.education)

    r.push({
      type: '482→186', name: 'Employer Sponsored (TSS→PR)', pct: 88, emoji: '💼',
      tips: ['ไม่ต้องใช้คะแนน Points เลย!', 'IELTS ขั้นต่ำ 5.0 เท่านั้น', 'ได้เริ่มทำงาน+รายได้ทันที', 'เส้นทาง PR ชัด: ทำงาน 2 ปี → 186 PR'],
      journey: ['หางาน AU+sponsor', '3-6 เดือน ได้วีซ่า', 'ทำงาน 2 ปี', 'ยื่น 186 PR', '🏠 ได้ PR!'],
      catId: 'employer',
    })

    if (pts >= 85) {
      r.push({
        type: '189', name: 'Skilled Independent', pct: pts >= 95 ? 93 : 82, emoji: '🎯',
        tips: [`คะแนน ${pts} — สูง! 🔥`, 'PR ทันที ไม่ผูกนายจ้าง/รัฐ', 'เลือกอยู่ที่ไหนก็ได้ใน AU', 'แข่งขันสูง — cut-off จริง 85-95+'],
        journey: ['Skills Assessment', 'ยื่น EOI (SkillSelect)', 'รอ Invitation', 'ยื่น Application', '🏠 ได้ PR!'],
        catId: 'skilled',
      })
    }

    if (pts >= 65) {
      r.push({
        type: '190', name: 'Skilled Nominated (+5 จากรัฐ)', pct: pts >= 85 ? 88 : pts >= 75 ? 76 : 65, emoji: '🏛️',
        tips: [`คะแนน ${pts} + รัฐ +5 = ${pts + 5}`, 'ได้ PR ทันที', 'ต้องอยู่รัฐที่ nominate 2 ปี', 'cut-off ต่ำกว่า 189'],
        journey: ['Skills Assessment', 'State Nomination', 'ยื่น EOI', 'ได้ Invitation', '🏠 ได้ PR!'],
        catId: 'skilled',
      })
    }

    if (pts < 65) {
      const rPts = pts + 15
      if (rPts >= 65) {
        r.push({
          type: '491→191', name: 'Skilled Regional (+15 คะแนน)', pct: 72, emoji: '🌾',
          tips: [`คะแนน ${pts} + Regional +15 = ${rPts} ✅`, 'ค่าครองชีพถูกกว่าเมืองใหญ่', 'อยู่ regional 3 ปี → 191 PR'],
          journey: ['Skills Assessment', 'Regional Nomination', 'อยู่ Regional 3 ปี', 'ยื่น 191', '🏠 ได้ PR!'],
          catId: 'skilled',
        })
      }
    }

    if (['18-24', '25-32'].includes(p.age)) {
      r.push({
        type: '462', name: 'Work & Holiday (ทดลอง)', pct: 40, emoji: '🏖️',
        tips: ['ค่าวีซ่าถูกมาก $640', 'เข้า AU ได้เร็ว ทดลองชีวิตจริง', 'ใช้หา employer sponsor → 482'],
        journey: ['สมัคร 462', 'ทำงาน+หา sponsor', 'เปลี่ยน 482', '2 ปี → 186', '🏠 ได้ PR!'],
        catId: 'whv',
      })
    }
  }

  if (p.situation === 'student') {
    const durLabel = p.studyLevel === 'phd' ? '4 ปี' : p.studyLevel === 'masters' ? '3 ปี' : '2 ปี'
    r.push({
      type: '500→485', name: 'Student → Graduate → PR', pct: 85, emoji: '🎓',
      tips: ['เริ่มต้นได้เลยไม่ต้องมีประสบการณ์', `จบแล้ว 485 ทำงานได้ ${durLabel}`, 'ได้วุฒิ AU +5 คะแนน Points', 'ระหว่าง 485 หา employer sponsor → PR'],
      journey: ['เรียน (500)', `จบ → 485 (${durLabel})`, 'ทำงาน full-time', '482→186 หรือ 189/190', '🏠 ได้ PR!'],
      catId: 'student',
    })
    r.push({
      type: '482→186', name: 'Employer Sponsored (หลังจบ)', pct: 68, emoji: '💼',
      tips: ['จบแล้วหา employer sponsor', 'ไม่ต้องใช้คะแนน Points', 'IELTS 5.0 พอ', 'เส้นทาง PR: 482 → 2 ปี → 186'],
      journey: ['เรียนจบ', '485 หางาน', 'Employer → 482', '2 ปี → 186', '🏠 ได้ PR!'],
      catId: 'employer',
    })
    if (['18-24', '25-32'].includes(p.age)) {
      r.push({
        type: '462', name: 'WHV ก่อนเรียน (ลองก่อน)', pct: 50, emoji: '🏖️',
        tips: ['ลองไปอยู่ AU ก่อนลงทุนค่าเทอม', 'ค่าวีซ่าถูก $640', 'ได้ข้อมูลจริง ก่อนตัดสินใจ'],
        journey: ['462 → ทำงาน 1 ปี', 'ตัดสินใจ → เรียน (500)', 'จบ → 485', 'หา sponsor → PR'],
        catId: 'whv',
      })
    }
  }

  if (p.situation === 'partner') {
    const onshore = p.location === 'australia'
    const vn = onshore ? '820/801' : '309/100'
    const nm = onshore ? 'Partner Visa (Onshore)' : 'Partner Visa (Offshore)'
    const tip3 = p.partnerType === 'married' ? 'แต่งงานแล้ว — หลักฐานชัดเจน' : 'De facto — เตรียมหลักฐานความสัมพันธ์ให้ดี'
    r.push({
      type: vn, name: nm, pct: 95, emoji: onshore ? '💑' : '💍',
      tips: ['ไม่ต้องมี skills/points/English!', onshore ? 'ได้ bridging visa ทำงานได้ทันที' : 'สมัครจากไทยได้เลย', tip3, 'ค่าวีซ่า $9,095 — แต่ได้ PR แน่นอน'],
      journey: ['เตรียมเอกสาร', `ยื่น ${vn.split('/')[0]}`, 'รอ 12-24 เดือน', onshore ? 'Bridging → ทำงาน' : 'ย้ายไป AU', `🏠 ${vn.split('/')[1]} PR!`],
      catId: 'partner',
    })
  }

  if (p.situation === 'whv') {
    if (['18-24', '25-32'].includes(p.age)) {
      r.push({
        type: '462', name: 'Work & Holiday', pct: 95, emoji: '🏖️',
        tips: ['ค่าวีซ่าถูกที่สุด $640!', 'IELTS 4.5 ง่ายมาก', 'ทำงานเต็มเวลาได้ทุกอาชีพ', 'ต่อได้ถึง 3 ปี (regional work)', 'สร้างประสบการณ์ → 482 → PR'],
        journey: ['สมัคร 462', 'ไป AU ทำงาน', 'หา employer sponsor', '482 → 2 ปี', '🏠 186 PR!'],
        catId: 'whv',
      })
      r.push({
        type: '500', name: 'Student Visa (ทางเลือก)', pct: 50, emoji: '🎓',
        tips: ['ได้วุฒิ AU (+5 คะแนน)', 'ทำงานพาร์ทไทม์ได้', 'จบแล้ว 485 ทำงานต่อ 2-4 ปี'],
        journey: ['เรียน (500)', 'จบ → 485', 'หา sponsor', '482 → 186', '🏠 PR!'],
        catId: 'student',
      })
    } else {
      r.push({
        type: '482', name: 'Employer Sponsored (แทน WHV)', pct: 80, emoji: '💼',
        tips: ['⚠️ อายุเกิน 30 — สมัคร WHV ไม่ได้', '482 รับถึงอายุ 45', 'ไม่ต้องใช้คะแนน Points', 'เส้นทาง PR: 482 → 2 ปี → 186'],
        journey: ['หางาน AU + sponsor', 'ได้ 482', 'ทำงาน 2 ปี', 'ยื่น 186', '🏠 ได้ PR!'],
        catId: 'employer',
      })
      r.push({
        type: '500', name: 'Student Visa', pct: 60, emoji: '🎓',
        tips: ['ไม่จำกัดอายุ (ถึง 50 ปี)', 'เรียน + ทำงานพาร์ทไทม์', 'จบแล้วได้ 485 ทำงานต่อ'],
        journey: ['เรียน (500)', 'จบ → 485', 'หา sponsor', '482 → 186', '🏠 PR!'],
        catId: 'student',
      })
    }
  }

  r.sort((a, b) => b.pct - a.pct)
  return r
}

/* ═══════════════════════════════════════════════════════════
   Visa Data (for full explorer)
   ═══════════════════════════════════════════════════════════ */
const VISA_CATEGORIES = [
  {
    id: 'skilled',
    title: '🎯 Points-Based Skilled',
    subtitle: 'ต้องมี 65+ คะแนน — เหมาะกับคนมีประสบการณ์+วุฒิ',
    bg: 'from-indigo-50 to-blue-50',
    border: 'border-indigo-200',
    visas: [
      {
        type: '189', name: 'Skilled Independent',
        tagline: '🏆 PR ทันที ไม่ต้อง sponsor',
        howItWorks: 'ยื่น EOI ใน SkillSelect → รอ Invitation → สมัคร → ได้ PR',
        requirements: ['คะแนน 65+ (จริงๆ cut-off สูงกว่า 85-95+)', 'อาชีพอยู่ใน MLTSSL', 'Skills Assessment ผ่าน', 'IELTS 6.0+'],
        pros: ['ไม่ผูกกับนายจ้าง/รัฐ', 'เลือกอยู่ที่ไหนก็ได้', 'ได้ PR ทันที'],
        cons: ['แข่งขันสูงมาก', 'Cut-off จริง 85-95+ คะแนน', 'รอนาน 12-18 เดือน'],
        cost: '$4,640', timeline: '12-18 เดือน', prPath: '✅ ได้ PR ทันที',
        highlight: false,
      },
      {
        type: '190', name: 'Skilled Nominated',
        tagline: '🏛️ รัฐ nominate +5 คะแนน',
        howItWorks: 'สมัคร nomination จากรัฐ (NSW/VIC/QLD ฯลฯ) → ได้ +5 → ยื่น EOI → สมัคร',
        requirements: ['คะแนน 65+ (รวม +5 จาก state)', 'อาชีพอยู่ใน state list', 'Skills Assessment ผ่าน', 'IELTS 6.0+'],
        pros: ['ง่ายกว่า 189 (cut-off ต่ำกว่า)', '+5 คะแนนฟรีจากรัฐ', 'ได้ PR ทันที'],
        cons: ['ต้องอยู่รัฐนั้น 2 ปี', 'แต่ละรัฐมี list ต่างกัน'],
        cost: '$4,640', timeline: '12-18 เดือน', prPath: '✅ ได้ PR ทันที (อยู่รัฐนั้น 2 ปี)',
        highlight: false,
      },
      {
        type: '491', name: 'Skilled Work Regional',
        tagline: '🌾 +15 คะแนน! อยู่ Regional',
        howItWorks: 'ได้ nomination จาก regional area → +15 คะแนน → สมัคร → อยู่ regional 3 ปี → PR',
        requirements: ['คะแนน 65+ (รวม +15 จาก regional)', 'อาชีพอยู่ใน regional list', 'Skills Assessment ผ่าน'],
        pros: ['+15 คะแนนเยอะมาก!', 'คะแนนเริ่มต้น 50 ก็สมัครได้', 'ค่าครองชีพถูกกว่าเมืองใหญ่'],
        cons: ['ต้องอยู่ regional 3 ปี', 'ตัวเลือกงานน้อยกว่าเมืองใหญ่', 'ได้ provisional ก่อน ไม่ใช่ PR ทันที'],
        cost: '$4,640', timeline: '8-12 เดือน', prPath: '🔄 อยู่ 3 ปี → สมัคร 191 → PR',
        highlight: false,
      },
    ],
  },
  {
    id: 'employer',
    title: '💼 Employer Sponsored',
    subtitle: 'ไม่ต้องใช้คะแนน! — นายจ้างออสสนับสนุน',
    bg: 'from-green-50 to-emerald-50',
    border: 'border-green-200',
    visas: [
      {
        type: '482', name: 'Temporary Skill Shortage (TSS)',
        tagline: '🔥 ทางลัดยอดนิยม! ไม่ต้องใช้คะแนน',
        howItWorks: 'หา employer ใน AU → employer ยื่น sponsor → คุณได้ work visa → ทำงาน 2-4 ปี → สมัคร 186 PR',
        requirements: ['มี job offer จาก AU employer', 'ประสบการณ์ 2+ ปีในสาขา', 'IELTS 5.0+ (ต่ำกว่า skilled!)', 'อาชีพอยู่ใน occupation list'],
        pros: ['ไม่ต้องใช้คะแนนเลย!', 'IELTS ขั้นต่ำ 5.0 เท่านั้น', 'ได้เริ่มทำงานได้เลย', 'เส้นทาง PR ชัดเจน (482 → 186)'],
        cons: ['ต้องหา employer ที่ willing to sponsor', 'ผูกกับนายจ้าง (เปลี่ยนได้แต่ต้องทำเรื่อง)', 'นายจ้างต้องจ่าย SAF levy เพิ่ม'],
        cost: '$3,035', timeline: '3-6 เดือน (ถ้ามี job offer)', prPath: '🔄 ทำ 2 ปี → สมัคร 186 → PR',
        highlight: true,
      },
      {
        type: '186', name: 'Employer Nomination Scheme',
        tagline: '🎯 PR จาก Employer โดยตรง',
        howItWorks: 'Direct Entry: มีประสบการณ์ 3 ปี + employer nominate → PR ทันที\nTransition: จาก 482 ทำ 2 ปี → employer nominate → PR',
        requirements: ['Employer ใน AU nominate ให้', 'อายุต่ำกว่า 45 ปี', 'Skills Assessment (Direct Entry)', 'IELTS 6.0+ (Competent)'],
        pros: ['ได้ PR ทันที', 'Transition stream ง่ายกว่า (จาก 482)', 'ไม่ต้องมี points score'],
        cons: ['ต้องมี employer willing to nominate', 'Direct Entry ต้อง 3 ปีประสบการณ์', 'นายจ้างจ่าย SAF levy'],
        cost: '$4,640', timeline: '6-12 เดือน', prPath: '✅ ได้ PR ทันที',
        highlight: false,
      },
    ],
  },
  {
    id: 'student',
    title: '🎓 Student → Graduate',
    subtitle: 'เรียนจบ → ทำงาน → PR — เหมาะนักเรียน/คนเปลี่ยนสาย',
    bg: 'from-blue-50 to-cyan-50',
    border: 'border-blue-200',
    visas: [
      {
        type: '500', name: 'Student Visa',
        tagline: '📚 เรียน + ทำงานพาร์ทไทม์ได้',
        howItWorks: 'สมัครเรียน (TAFE/Uni) → ได้ CoE → สมัครวีซ่า → เรียน + ทำงานได้ 48 ชม./2 สัปดาห์',
        requirements: ['ได้รับ CoE จากสถาบันที่ลงทะเบียน', 'GTE (Genuine Temporary Entrant)', 'เงินเพียงพอ ($29,710/ปี + ค่าเทอม)', 'OSHC ประกันสุขภาพนักเรียน', 'IELTS 5.5-6.5+ (แล้วแต่สถาบัน)'],
        pros: ['เริ่มต้นได้เลยไม่ต้องมีประสบการณ์', 'ทำงานพาร์ทไทม์ได้', 'จบแล้วสมัคร 485 ต่อได้', 'ได้วุฒิ AU เพิ่มคะแนนวีซ่า +5'],
        cons: ['ค่าเทอมแพง $20,000-50,000/ปี', 'ต้องเรียนจริง attendance ครบ', 'ไม่ได้ PR โดยตรง'],
        cost: '$1,600 + ค่าเทอม $20K-50K/ปี', timeline: '1-3 เดือน', prPath: '🔄 จบ → 485 → 189/190/482 → PR',
        highlight: false,
      },
      {
        type: '485', name: 'Temporary Graduate',
        tagline: '🎓 จบ AU แล้ว ทำงานต่อ 2-4 ปี',
        howItWorks: 'จบการศึกษาจาก AU → สมัคร 485 → ได้ full work rights → หางาน → สมัคร PR',
        requirements: ['จบ ป.ตรี+ จากสถาบันใน AU', 'อายุต่ำกว่า 50 ปี', 'IELTS 6.0 (Overall)', 'สมัครภายใน 6 เดือนหลังจบ'],
        pros: ['Full-time work rights ไม่จำกัด', 'เวลาเยอะในการหางาน/sponsor', 'ป.ตรี=2ปี, ป.โท=3ปี, ป.เอก=4ปี'],
        cons: ['ต้องจบจาก AU เท่านั้น', 'ไม่ได้ PR โดยตรง', 'ต้อง plan ดีๆ ว่าจะไป PR ยังไง'],
        cost: '$1,895', timeline: 'สมัครได้เลยหลังจบ', prPath: '🔄 หางาน → 482/189/190 → PR',
        highlight: false,
      },
    ],
  },
  {
    id: 'whv',
    title: '🏖️ Working Holiday',
    subtitle: 'อายุ 18-30 — ไทยมีข้อตกลงกับ AU!',
    bg: 'from-orange-50 to-yellow-50',
    border: 'border-orange-200',
    visas: [
      {
        type: '462', name: 'Work and Holiday Visa',
        tagline: '✈️ ทำงาน+เที่ยว 12 เดือน!',
        howItWorks: 'ไทย 🇹🇭 มี agreement กับ AU → สมัครออนไลน์ → ได้วีซ่า 12 เดือน → ต่อได้ถึง 3 ปี!',
        requirements: ['อายุ 18-30 ปี ณ วันสมัคร', 'หนังสือเดินทางไทย', 'IELTS 4.5+ (ง่ายมาก)', 'ป.ตรี หรือ เรียนจบ 2+ ปี', 'เงินเพียงพอ ~$5,000 AUD', 'First-come first-served (ไม่มีโควต้า)'],
        pros: ['ค่าวีซ่าถูกมาก $640!', 'ทำงานเต็มเวลาได้ทุกอาชีพ', 'ต่อได้ถึง 3 ปี (ทำงาน regional)', 'ใช้หาประสบการณ์ AU → เปลี่ยนวีซ่า', 'ไม่ต้องมี skill assessment'],
        cons: ['อายุ 31+ สมัครไม่ได้', 'ไม่ได้ PR โดยตรง', 'ทำงานกับนายจ้างเดียวกันได้ 6 เดือน'],
        cost: '$640', timeline: '1-3 เดือน', prPath: '🔄 หาประสบการณ์ → 482/employer sponsor → PR',
        highlight: true,
      },
    ],
  },
  {
    id: 'partner',
    title: '💑 Partner / Family',
    subtitle: 'มีคู่สมรส/แฟนเป็น AU citizen/PR',
    bg: 'from-pink-50 to-rose-50',
    border: 'border-pink-200',
    visas: [
      {
        type: '309/100', name: 'Partner Visa (Offshore)',
        tagline: '💍 สมัครจากไทย → PR ผ่านคู่สมรส',
        howItWorks: 'คู่สมรส/แฟน AU sponsor ให้ → สมัครจากนอก AU → ได้ 309 temp → อีก 2 ปี ได้ 100 permanent',
        requirements: ['คู่สมรสเป็น AU citizen/PR', 'ความสัมพันธ์จริง (de facto 12+ เดือน หรือ แต่งงาน)', 'ตรวจสุขภาพ + ประวัติอาชญากรรม'],
        pros: ['ไม่ต้องมี skills/points/English!', 'ได้ work rights ทันที (bridging visa)', 'PR ภายใน 2 ปี'],
        cons: ['แพงที่สุด $9,095!', 'รอนาน 12-24 เดือน', 'ต้องพิสูจน์ความสัมพันธ์จริง'],
        cost: '$9,095', timeline: '12-24 เดือน', prPath: '🔄 309 temp → 100 permanent (2 ปี)',
        highlight: false,
      },
      {
        type: '820/801', name: 'Partner Visa (Onshore)',
        tagline: '💑 อยู่ AU แล้ว สมัครใน AU',
        howItWorks: 'เหมือน 309/100 แต่สมัครขณะอยู่ใน AU → ได้ bridging visa E ระหว่างรอ → ทำงานได้',
        requirements: ['เหมือน 309/100', 'ต้องอยู่ใน AU ตอนสมัคร'],
        pros: ['ได้ bridging visa ทำงานได้ทันที', 'ไม่ต้องออกนอก AU', 'ผลเหมือน 309/100'],
        cons: ['แพงเท่ากัน $9,095', 'รอนาน 12-24 เดือน'],
        cost: '$9,095', timeline: '12-24 เดือน', prPath: '🔄 820 temp → 801 permanent (2 ปี)',
        highlight: false,
      },
    ],
  },
]

/* ═══════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════ */
export function VisaExplorer() {
  const [step, setStep] = useState(0)
  const [profile, setProfile] = useState<Profile>({ ...EMPTY })
  const [recs, setRecs] = useState<Rec[]>([])
  const [showAll, setShowAll] = useState(false)
  const [analyzeMsg, setAnalyzeMsg] = useState('')
  const resultRef = useRef<HTMLDivElement>(null)
  const [expandedVisa, setExpandedVisa] = useState<string | null>(null)

  // Animated match percentages
  const [animPcts, setAnimPcts] = useState<number[]>([])
  useEffect(() => {
    if (step === 3 && recs.length > 0) {
      setAnimPcts(recs.map(() => 0))
      const frames = 30
      let frame = 0
      const timer = setInterval(() => {
        frame++
        const eased = 1 - Math.pow(1 - Math.min(frame / frames, 1), 3)
        setAnimPcts(recs.map(rc => Math.round(rc.pct * eased)))
        if (frame >= frames) clearInterval(timer)
      }, 40)
      return () => clearInterval(timer)
    }
  }, [step, recs])

  useEffect(() => {
    if (step === 3 && resultRef.current) {
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    }
  }, [step])

  function pickSituation(s: Situation) {
    setProfile(p => ({ ...p, situation: s }))
    setStep(1)
  }

  function analyze() {
    setStep(2)
    const msgs = ['กำลังเช็คข้อมูล...', 'เทียบวีซ่า 10 ประเภท...', 'วิเคราะห์เส้นทาง PR...', 'เจอแล้ว! 🎉']
    msgs.forEach((m, i) => setTimeout(() => setAnalyzeMsg(m), i * 600))
    setTimeout(() => { setRecs(recommend(profile)); setStep(3) }, 2500)
  }

  function isComplete() {
    switch (profile.situation) {
      case 'experienced': return !!(profile.age && profile.english && profile.experience && profile.education)
      case 'student': return !!(profile.age && profile.studyLevel)
      case 'partner': return !!(profile.partnerType && profile.location)
      case 'whv': return !!profile.age
      default: return false
    }
  }

  function reset() {
    setStep(0); setProfile({ ...EMPTY }); setRecs([]); setShowAll(false); setAnimPcts([])
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const set = (key: keyof Profile, val: string) => setProfile(p => ({ ...p, [key]: val }))

  /* ─── Chip Selector ─── */
  const Chips = ({ label, options, value, field }: {
    label: string; options: { id: string; text: string; sub?: string }[]; value: string; field: keyof Profile
  }) => (
    <div className="mb-4">
      <div className="text-xs font-semibold text-gray-500 mb-2">{label}</div>
      <div className="flex flex-wrap gap-2">
        {options.map(o => (
          <button key={o.id} onClick={() => set(field, o.id)}
            className={`px-3 py-2 rounded-xl text-sm transition-all border-2 ${
              value === o.id
                ? 'bg-blue-600 text-white border-blue-600 shadow-lg scale-[1.05]'
                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 active:scale-95'
            }`}>
            {o.text}
            {o.sub && <span className="block text-[10px] mt-0.5 opacity-75">{o.sub}</span>}
          </button>
        ))}
      </div>
    </div>
  )

  /* ═══════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════ */
  return (
    <div className="space-y-4">
      {/* Back */}
      <div className="flex items-center gap-3 mb-2">
        <a href={`${basePath}/`} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors bg-white/70 rounded-full px-4 py-2 shadow-sm border border-blue-100">
          ← กลับหน้าเลือกประเทศ
        </a>
      </div>

      {/* ═══ VISA ADVISOR (Steps 0-2) ═══ */}
      {step < 3 && (
        <div className="card">
          <div className="text-center mb-5">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 mb-3">
              <span className="text-3xl">🤖</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Visa Advisor</h2>
            <p className="text-sm text-gray-500 mt-1">ตอบ 2-3 คำถาม แล้วเราจะหาเส้นทางที่ดีที่สุดให้คุณ</p>
          </div>

          {/* Progress */}
          <div className="flex justify-center gap-2 mb-6">
            {[0, 1, 2].map(i => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${
                i < step ? 'w-16 bg-blue-500' : i === step ? 'w-16 bg-blue-400 animate-pulse' : 'w-16 bg-gray-200'
              }`} />
            ))}
          </div>

          {/* ─── Step 0: Situation ─── */}
          {step === 0 && (
            <div className="animate-fade-in">
              <div className="flex gap-2 mb-5">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-sm">🤖</div>
                <div className="bg-blue-50 rounded-2xl rounded-tl-lg p-3 max-w-[85%]">
                  <p className="text-sm text-gray-700">สวัสดี! 👋 เรามาหาวีซ่าที่เหมาะกับคุณกัน<br/>ตอนนี้สถานะของคุณเป็นยังไง?</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { id: 'experienced' as Situation, emoji: '💼', text: 'ทำงานมาแล้ว', sub: 'มีประสบการณ์ 2+ ปี' },
                  { id: 'student' as Situation, emoji: '🎓', text: 'จบใหม่/อยากเรียนต่อ', sub: 'ยังไม่มี exp มาก' },
                  { id: 'partner' as Situation, emoji: '💑', text: 'มีแฟน AU citizen/PR', sub: 'สมัครผ่านคู่สมรส' },
                  { id: 'whv' as Situation, emoji: '🏖️', text: 'อยากลอง Work & Holiday', sub: 'ทำงาน+เที่ยว' },
                ] as const).map(s => (
                  <button key={s.id} onClick={() => pickSituation(s.id)}
                    className="p-4 rounded-2xl border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all bg-white text-left group active:scale-95">
                    <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform">{s.emoji}</span>
                    <span className="text-sm font-bold text-gray-800 block leading-tight">{s.text}</span>
                    <span className="text-[11px] text-gray-400 mt-1 block">{s.sub}</span>
                  </button>
                ))}
              </div>
              <button onClick={() => { setStep(3); setShowAll(true) }}
                className="mt-4 text-xs text-gray-400 underline mx-auto block hover:text-gray-600 transition-colors">
                ข้ามไปดูวีซ่าทั้งหมดเลย →
              </button>
            </div>
          )}

          {/* ─── Step 1: Profile ─── */}
          {step === 1 && (
            <div className="animate-fade-in">
              <div className="flex gap-2 mb-5">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-sm">🤖</div>
                <div className="bg-blue-50 rounded-2xl rounded-tl-lg p-3 max-w-[85%]">
                  <p className="text-sm text-gray-700">
                    {profile.situation === 'experienced' ? 'เยี่ยม! 💪 ขอข้อมูลเพิ่มเพื่อคำนวณ Points — กดเลือกได้เลย' :
                     profile.situation === 'student' ? 'ดีเลย! 📚 ขอถามอีกนิดเดียว' :
                     profile.situation === 'partner' ? 'เข้าใจแล้ว! 💕 ขอถามเพิ่มอีก 2 ข้อ' :
                     'สนุกแน่! ✈️ ขอเช็คอายุก่อนนะ — กดเลือกเลย'}
                  </p>
                </div>
              </div>

              {/* Experienced */}
              {profile.situation === 'experienced' && (<>
                <Chips label="📅 อายุ" field="age" value={profile.age} options={[
                  { id: '18-24', text: '18-24', sub: '25 คะแนน' }, { id: '25-32', text: '25-32', sub: '30 คะแนน' },
                  { id: '33-39', text: '33-39', sub: '25 คะแนน' }, { id: '40-44', text: '40-44', sub: '15 คะแนน' },
                  { id: '45+', text: '45+', sub: '0 คะแนน' },
                ]} />
                <Chips label="🗣️ ภาษาอังกฤษ (IELTS)" field="english" value={profile.english} options={[
                  { id: 'superior', text: '8.0+ Superior', sub: '20 คะแนน' },
                  { id: 'proficient', text: '7.0-7.9 Proficient', sub: '10 คะแนน' },
                  { id: 'competent', text: '6.0-6.9 Competent', sub: '0 คะแนน' },
                ]} />
                <Chips label="💼 ประสบการณ์ทำงาน (นอก AU)" field="experience" value={profile.experience} options={[
                  { id: '8+', text: '8+ ปี', sub: '15 คะแนน' }, { id: '5-7', text: '5-7 ปี', sub: '10 คะแนน' },
                  { id: '3-4', text: '3-4 ปี', sub: '5 คะแนน' }, { id: '0-2', text: '0-2 ปี', sub: '0 คะแนน' },
                ]} />
                <Chips label="🎓 วุฒิการศึกษาสูงสุด" field="education" value={profile.education} options={[
                  { id: 'phd', text: 'ป.เอก', sub: '20 คะแนน' }, { id: 'masters', text: 'ป.โท', sub: '15 คะแนน' },
                  { id: 'bachelor', text: 'ป.ตรี', sub: '15 คะแนน' }, { id: 'trade', text: 'Diploma', sub: '10 คะแนน' },
                  { id: 'highschool', text: 'มัธยม', sub: '0 คะแนน' },
                ]} />
                {profile.age && profile.english && profile.experience && profile.education && (() => {
                  const pts = calcPoints(profile.age, profile.english, profile.experience, profile.education)
                  return (
                    <div className={`rounded-2xl p-4 mb-2 text-center animate-fade-in ${
                      pts >= 65 ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300'
                      : pts >= 50 ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300'
                      : 'bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300'
                    }`}>
                      <div className="text-xs text-gray-500 mb-1">คะแนน Skilled Migration เบื้องต้น</div>
                      <div className={`text-5xl font-black ${
                        pts >= 65 ? 'text-green-600' : pts >= 50 ? 'text-yellow-600' : 'text-red-500'
                      }`}>{pts}</div>
                      {pts >= 65 && <div className="text-sm text-green-700 font-bold mt-2">✅ ผ่าน 65 คะแนน! สมัคร Skilled ได้</div>}
                      {pts >= 50 && pts < 65 && <div className="text-sm text-yellow-700 font-bold mt-2">⚠️ ใกล้แล้ว! 491 Regional (+15) = {pts + 15}</div>}
                      {pts < 50 && <div className="text-sm text-red-600 font-bold mt-2">คะแนน Skilled ยังต่ำ — แต่มีเส้นทางอื่น!</div>}
                      <div className="text-[10px] mt-1 text-gray-400">* ยังไม่รวม Partner/AU Study/NAATI ที่เพิ่มได้ 5-40 คะแนน</div>
                    </div>
                  )
                })()}
              </>)}

              {/* Student */}
              {profile.situation === 'student' && (<>
                <Chips label="📅 อายุ" field="age" value={profile.age} options={[
                  { id: '18-24', text: '18-24' }, { id: '25-32', text: '25-32' },
                  { id: '33-39', text: '33-39' }, { id: '40+', text: '40+' },
                ]} />
                <Chips label="🎓 ระดับที่จะเรียน" field="studyLevel" value={profile.studyLevel} options={[
                  { id: 'trade', text: 'TAFE/Diploma', sub: '485 ได้ 2 ปี' },
                  { id: 'bachelor', text: 'ป.ตรี', sub: '485 ได้ 2 ปี' },
                  { id: 'masters', text: 'ป.โท', sub: '485 ได้ 3 ปี' },
                  { id: 'phd', text: 'ป.เอก', sub: '485 ได้ 4 ปี' },
                ]} />
              </>)}

              {/* Partner */}
              {profile.situation === 'partner' && (<>
                <Chips label="💍 สถานะความสัมพันธ์" field="partnerType" value={profile.partnerType} options={[
                  { id: 'married', text: '💒 แต่งงานแล้ว' },
                  { id: 'defacto', text: '🏠 อยู่ด้วยกัน 12+ เดือน' },
                ]} />
                <Chips label="📍 ตอนนี้อยู่ที่ไหน?" field="location" value={profile.location} options={[
                  { id: 'thailand', text: '🇹🇭 อยู่ไทย', sub: 'สมัคร Offshore' },
                  { id: 'australia', text: '🇦🇺 อยู่ AU แล้ว', sub: 'สมัคร Onshore' },
                ]} />
              </>)}

              {/* WHV */}
              {profile.situation === 'whv' && (<>
                <Chips label="📅 อายุ" field="age" value={profile.age} options={[
                  { id: '18-24', text: '18-24 ✅', sub: 'สมัครได้!' },
                  { id: '25-32', text: '25-30 ✅', sub: 'สมัครได้!' },
                  { id: '33-39', text: '31-39', sub: '❌ เกินอายุ WHV' },
                  { id: '40+', text: '40+', sub: '❌ เกินอายุ WHV' },
                ]} />
                {(profile.age === '33-39' || profile.age === '40+') && (
                  <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-3 animate-fade-in">
                    <p className="text-sm text-amber-800 font-medium">⚠️ WHV 462 รับเฉพาะอายุ 18-30</p>
                    <p className="text-xs text-amber-600 mt-1">แต่ไม่ต้องกังวล — เรามีเส้นทางอื่นแนะนำให้!</p>
                  </div>
                )}
              </>)}

              {/* Buttons */}
              <div className="flex gap-2 mt-4">
                <button onClick={() => { setStep(0); setProfile({ ...EMPTY }) }}
                  className="px-4 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-gray-100 transition-colors">
                  ← ย้อนกลับ
                </button>
                {isComplete() && (
                  <button onClick={analyze}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all animate-fade-in active:scale-95">
                    🔍 วิเคราะห์เส้นทางวีซ่า
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ─── Step 2: Analyzing ─── */}
          {step === 2 && (
            <div className="text-center py-10 animate-fade-in">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 mb-4">
                <span className="text-4xl animate-bounce">🔍</span>
              </div>
              <p className="text-sm text-gray-600 font-medium h-5">{analyzeMsg}</p>
              <div className="flex justify-center gap-1.5 mt-4">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ RESULTS (Step 3 with recommendations) ═══ */}
      {step === 3 && recs.length > 0 && (
        <div ref={resultRef} className="space-y-4 animate-fade-in">
          <div className="card">
            <div className="text-center mb-5">
              <h2 className="text-xl font-bold text-gray-800">🎯 เส้นทางที่แนะนำสำหรับคุณ</h2>
              <p className="text-xs text-gray-500 mt-1">
                เรียงตามความเหมาะสม
                {profile.situation === 'experienced' && ` • คะแนน Skilled: ${calcPoints(profile.age, profile.english, profile.experience, profile.education)}`}
              </p>
            </div>

            {recs.map((rec, i) => (
              <div key={rec.type}
                className={`mb-4 rounded-2xl border-2 overflow-hidden transition-all ${
                  i === 0 ? 'border-blue-300 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 shadow-lg' : 'border-gray-100 bg-white'
                }`}>
                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${i === 0 ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        <span className="text-2xl">{rec.emoji}</span>
                      </div>
                      <div className="min-w-0">
                        {i === 0 && <span className="inline-block text-[10px] bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-2.5 py-0.5 rounded-full font-bold mb-1">⭐ แนะนำอันดับ 1</span>}
                        <div className="text-sm font-bold text-gray-800 leading-tight">{rec.name}</div>
                        <div className="text-xs text-gray-500">Subclass {rec.type}</div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <div className={`text-3xl font-black tabular-nums ${
                        rec.pct >= 80 ? 'text-green-600' : rec.pct >= 60 ? 'text-blue-600' : 'text-gray-400'
                      }`}>{animPcts[i] ?? rec.pct}%</div>
                      <div className="text-[10px] text-gray-400 font-medium">เหมาะสม</div>
                    </div>
                  </div>

                  {/* Match bar */}
                  <div className="w-full h-2 bg-gray-100 rounded-full mb-3 overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-1000 ease-out ${
                      rec.pct >= 80 ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                      : rec.pct >= 60 ? 'bg-gradient-to-r from-blue-400 to-indigo-500' : 'bg-gray-300'
                    }`} style={{ width: `${animPcts[i] ?? rec.pct}%` }} />
                  </div>

                  {/* Tips */}
                  <div className="space-y-1.5 mb-4">
                    {rec.tips.map((t, j) => (
                      <div key={j} className="flex items-start gap-2 text-xs text-gray-600">
                        <span className={`mt-0.5 ${i === 0 ? 'text-blue-500' : 'text-gray-400'}`}>✦</span>
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>

                  {/* Journey */}
                  <div className={`rounded-xl p-3 ${i === 0 ? 'bg-white/80 border border-blue-100' : 'bg-gray-50 border border-gray-100'}`}>
                    <div className="text-[10px] font-bold text-gray-400 mb-2.5 uppercase tracking-wider">🗺️ เส้นทาง</div>
                    <div className="flex items-center overflow-x-auto pb-1 gap-1">
                      {rec.journey.map((s, j) => (
                        <div key={j} className="flex items-center shrink-0">
                          <div className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium ${
                            j === rec.journey.length - 1 ? 'bg-green-100 text-green-700 border border-green-200 font-bold'
                            : j === 0 ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                          }`}>{s}</div>
                          {j < rec.journey.length - 1 && <span className="text-gray-300 mx-0.5 text-xs">→</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex items-center gap-3 mt-2">
              <button onClick={reset} className="px-4 py-2 text-xs text-blue-600 font-medium hover:bg-blue-50 rounded-xl transition-colors">
                🔄 เริ่มใหม่
              </button>
              <span className="text-gray-300">|</span>
              <a href="https://immi.homeaffairs.gov.au" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                🔗 เช็คข้อมูลที่ Home Affairs
              </a>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="card">
            <h3 className="text-lg font-bold text-gray-800 mb-3">📊 เปรียบเทียบเส้นทางทั้งหมด</h3>
            <div className="overflow-x-auto -mx-2">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-2 rounded-tl-lg">เส้นทาง</th>
                    <th className="text-center p-2">ค่าวีซ่า</th>
                    <th className="text-center p-2">ภาษาอังกฤษ</th>
                    <th className="text-center p-2">เวลา→PR</th>
                    <th className="text-center p-2 rounded-tr-lg">ความยาก</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    { p: '🎯 189 Skilled', c: '$4,640', e: 'IELTS 6+', t: '12-18 เดือน', d: '⭐⭐⭐⭐⭐', h: false },
                    { p: '🏛️ 190 State', c: '$4,640', e: 'IELTS 6+', t: '12-18 เดือน', d: '⭐⭐⭐⭐', h: false },
                    { p: '🌾 491 Regional', c: '$4,640', e: 'IELTS 6+', t: '3-5 ปี', d: '⭐⭐⭐', h: false },
                    { p: '💼 482→186', c: '$3,035→$4,640', e: 'IELTS 5+', t: '2-4 ปี', d: '⭐⭐', h: true },
                    { p: '🎓 500→485→PR', c: '$1,600+เทอม', e: 'IELTS 5.5+', t: '4-6 ปี', d: '⭐⭐', h: false },
                    { p: '🏖️ 462 WHV', c: '$640', e: 'IELTS 4.5+', t: 'ไม่มี PR ตรง', d: '⭐', h: true },
                    { p: '💑 309/820 Partner', c: '$9,095', e: 'ไม่ต้อง', t: '2 ปี', d: '⭐⭐', h: false },
                  ].map((row, idx) => (
                    <tr key={idx} className={row.h ? 'bg-green-50/50' : ''}>
                      <td className="p-2 font-medium">{row.p}</td>
                      <td className="text-center p-2">{row.c}</td>
                      <td className="text-center p-2">{row.e}</td>
                      <td className="text-center p-2">{row.t}</td>
                      <td className="text-center p-2">{row.d}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="text-[10px] text-gray-400 mt-2">ความยาก: ⭐=ง่าย ⭐⭐⭐⭐⭐=ยากมาก | ค่าวีซ่า=ผู้สมัครหลัก Feb 2026</div>
          </div>

          {/* Toggle full explorer */}
          <button onClick={() => setShowAll(!showAll)}
            className="card w-full text-center py-4 text-sm font-medium text-gray-500 hover:text-gray-800 hover:shadow-md transition-all active:scale-[0.98]">
            {showAll ? '▲ ซ่อนวีซ่าทั้งหมด' : '📚 ดูรายละเอียดวีซ่าทั้งหมด (10 ประเภท)'}
          </button>
        </div>
      )}

      {/* ═══ SKIP (Step 3, no recs = user skipped advisor) ═══ */}
      {step === 3 && recs.length === 0 && (
        <div className="card mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800">📋 วีซ่า & เส้นทางไปออสเตรเลีย</h2>
              <p className="text-xs text-gray-500 mt-1">ดูวีซ่าทั้งหมด 10 ประเภท</p>
            </div>
            <button onClick={reset} className="text-xs text-blue-600 font-medium hover:bg-blue-50 px-3 py-2 rounded-xl transition-colors">
              🤖 ใช้ Advisor
            </button>
          </div>
        </div>
      )}

      {/* ═══ FULL VISA EXPLORER ═══ */}
      {showAll && (
        <div className="space-y-4 animate-fade-in">
          {VISA_CATEGORIES.map(cat => (
            <div key={cat.id} className="card overflow-hidden">
              <div className={`bg-gradient-to-r ${cat.bg} -mx-4 sm:-mx-6 -mt-4 sm:-mt-6 px-4 sm:px-6 py-4 mb-4 ${cat.border} border-b`}>
                <h3 className="text-lg font-bold text-gray-800">{cat.title}</h3>
                <p className="text-xs text-gray-600 mt-0.5">{cat.subtitle}</p>
              </div>
              <div className="space-y-3">
                {cat.visas.map(visa => {
                  const isExpanded = expandedVisa === visa.type
                  const matchedRec = recs.find(rc => rc.type.includes(visa.type))
                  return (
                    <div key={visa.type}
                      className={`rounded-xl border-2 transition-all ${
                        matchedRec ? 'border-blue-300 bg-blue-50/30 shadow-sm'
                        : visa.highlight ? 'border-green-200 bg-green-50/30 shadow-sm'
                        : 'border-gray-100 bg-white hover:border-gray-200'
                      }`}>
                      <button onClick={() => setExpandedVisa(isExpanded ? null : visa.type)} className="w-full text-left p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-black text-gray-800">Subclass {visa.type}</span>
                              <span className="text-xs font-medium text-gray-500">— {visa.name}</span>
                              {matchedRec && <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold">✨ แนะนำสำหรับคุณ</span>}
                              {visa.highlight && !matchedRec && <span className="text-[10px] bg-orange-500 text-white px-2 py-0.5 rounded-full font-bold">แนะนำ</span>}
                            </div>
                            <div className="text-sm mt-1">{visa.tagline}</div>
                            <div className="flex flex-wrap gap-2 mt-2 text-[11px]">
                              <span className="bg-gray-100 px-2 py-0.5 rounded-md">💰 {visa.cost}</span>
                              <span className="bg-gray-100 px-2 py-0.5 rounded-md">⏱️ {visa.timeline}</span>
                              <span className="bg-gray-100 px-2 py-0.5 rounded-md">{visa.prPath}</span>
                            </div>
                          </div>
                          <span className="text-gray-400 text-lg ml-2">{isExpanded ? '▲' : '▼'}</span>
                        </div>
                      </button>
                      {isExpanded && (
                        <div className="px-4 pb-4 space-y-3 animate-fade-in border-t border-gray-100 pt-3">
                          <div>
                            <div className="text-xs font-bold text-gray-700 mb-1">📋 วิธีการ:</div>
                            <div className="text-sm text-gray-600 whitespace-pre-line">{visa.howItWorks}</div>
                          </div>
                          <div>
                            <div className="text-xs font-bold text-gray-700 mb-1">✅ เงื่อนไข:</div>
                            <ul className="text-xs text-gray-600 space-y-0.5">
                              {visa.requirements.map((req, idx) => <li key={idx}>• {req}</li>)}
                            </ul>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="bg-green-50 rounded-lg p-2.5">
                              <div className="text-xs font-bold text-green-700 mb-1">👍 ข้อดี</div>
                              <ul className="text-xs text-green-600 space-y-0.5">
                                {visa.pros.map((pro, idx) => <li key={idx}>✓ {pro}</li>)}
                              </ul>
                            </div>
                            <div className="bg-red-50 rounded-lg p-2.5">
                              <div className="text-xs font-bold text-red-700 mb-1">👎 ข้อจำกัด</div>
                              <ul className="text-xs text-red-600 space-y-0.5">
                                {visa.cons.map((con, idx) => <li key={idx}>✗ {con}</li>)}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Comparison table for skip-advisor mode */}
          {recs.length === 0 && (
            <div className="card">
              <h3 className="text-lg font-bold text-gray-800 mb-3">📊 เปรียบเทียบเส้นทาง</h3>
              <div className="overflow-x-auto -mx-2">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left p-2 rounded-tl-lg">เส้นทาง</th>
                      <th className="text-center p-2">ค่าวีซ่า</th>
                      <th className="text-center p-2">ภาษาอังกฤษ</th>
                      <th className="text-center p-2">เวลา→PR</th>
                      <th className="text-center p-2 rounded-tr-lg">ความยาก</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr><td className="p-2 font-medium">🎯 189 Skilled</td><td className="text-center p-2">$4,640</td><td className="text-center p-2">IELTS 6+</td><td className="text-center p-2">12-18 เดือน</td><td className="text-center p-2">⭐⭐⭐⭐⭐</td></tr>
                    <tr><td className="p-2 font-medium">🏛️ 190 State</td><td className="text-center p-2">$4,640</td><td className="text-center p-2">IELTS 6+</td><td className="text-center p-2">12-18 เดือน</td><td className="text-center p-2">⭐⭐⭐⭐</td></tr>
                    <tr><td className="p-2 font-medium">🌾 491 Regional</td><td className="text-center p-2">$4,640</td><td className="text-center p-2">IELTS 6+</td><td className="text-center p-2">3-5 ปี</td><td className="text-center p-2">⭐⭐⭐</td></tr>
                    <tr className="bg-green-50"><td className="p-2 font-medium">💼 482→186</td><td className="text-center p-2">$3,035→$4,640</td><td className="text-center p-2">IELTS 5+</td><td className="text-center p-2">2-4 ปี</td><td className="text-center p-2">⭐⭐</td></tr>
                    <tr><td className="p-2 font-medium">🎓 500→485→PR</td><td className="text-center p-2">$1,600+เทอม</td><td className="text-center p-2">IELTS 5.5+</td><td className="text-center p-2">4-6 ปี</td><td className="text-center p-2">⭐⭐</td></tr>
                    <tr className="bg-orange-50"><td className="p-2 font-medium">🏖️ 462 WHV</td><td className="text-center p-2">$640</td><td className="text-center p-2">IELTS 4.5+</td><td className="text-center p-2">ไม่มี PR ตรง</td><td className="text-center p-2">⭐</td></tr>
                    <tr><td className="p-2 font-medium">💑 309/820 Partner</td><td className="text-center p-2">$9,095</td><td className="text-center p-2">ไม่ต้อง</td><td className="text-center p-2">2 ปี</td><td className="text-center p-2">⭐⭐</td></tr>
                  </tbody>
                </table>
              </div>
              <div className="text-[10px] text-gray-400 mt-2">ความยาก: ⭐=ง่าย ⭐⭐⭐⭐⭐=ยากมาก | ค่าวีซ่า=ผู้สมัครหลัก Feb 2026</div>
            </div>
          )}
        </div>
      )}

      {/* ═══ SOURCES & LINKS ═══ */}
      <div className="card">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-xs text-blue-700 font-medium mb-2">📊 แหล่งข้อมูล:</p>
          <div className="text-xs text-blue-600 space-y-0.5">
            <div>• <a href="https://immi.homeaffairs.gov.au/visas/working-in-australia/skillselect" target="_blank" rel="noopener noreferrer" className="underline">Home Affairs — SkillSelect & Points Table</a></div>
            <div>• <a href="https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing" target="_blank" rel="noopener noreferrer" className="underline">Home Affairs — Visa Listing (ค่าธรรมเนียม)</a></div>
            <div>• <a href="https://immi.homeaffairs.gov.au/what-we-do/whm-program/latest-news/thai" target="_blank" rel="noopener noreferrer" className="underline">Home Affairs — Work and Holiday 462 (ไทย)</a></div>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mt-3">
          <p className="text-xs text-amber-700">
            ⚠️ ข้อมูลเป็นการสรุปเบื้องต้น อาจเปลี่ยนแปลงได้ กรุณาตรวจสอบจาก{' '}
            <a href="https://immi.homeaffairs.gov.au" target="_blank" rel="noopener noreferrer" className="underline font-medium">Home Affairs</a>{' '}
            ก่อนตัดสินใจ และปรึกษา Migration Agent ที่ได้รับอนุญาตก่อนยื่นวีซ่าจริง
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 mt-3">
          <a href={`${basePath}/sim`} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 text-center text-sm text-green-700 font-medium hover:shadow-md transition-all">
            🇦🇺 จำลองชีวิตในออส →
          </a>
          <a href={`${basePath}/`} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 text-center text-sm text-blue-700 font-medium hover:shadow-md transition-all">
            🌍 เลือกประเทศที่เหมาะ →
          </a>
        </div>
      </div>
    </div>
  )
}
