import fs from "fs";
import path from "path";
import { getDb, withDb, newId, hashPassword } from "../src/lib/clinicDb";
import { generateClinicalPdfBuffer } from "../src/lib/pdfGenerator";

// Ensure outputs dir exists
const OUTPUTS_DIR = path.join(process.cwd(), "simulation_reports_pdf");
if (!fs.existsSync(OUTPUTS_DIR)) {
  fs.mkdirSync(OUTPUTS_DIR, { recursive: true });
}

interface AgentConfig {
  agentIndex: number;
  lang: "ar" | "tr" | "en";
  patient: {
    fullName: string;
    identityNo: string;
    phone: string;
    email: string;
    bloodType: string;
    emergencyContact: string;
  };
  doctorId: string;
  appointmentDate: string;
  slotTime: string;
  chiefComplaint: string;
  diagnosis: string;
  clinicalNotes: string;
  prescriptions: { itemName: string; dosage: string; quantity: number }[];
  labTests: { testName: string; status: string; resultData?: string }[];
}

const AGENTS: AgentConfig[] = [
  // ================= 10 ARABIC AGENTS =================
  {
    agentIndex: 1,
    lang: "ar",
    patient: {
      fullName: "فاطمة الزهراء المحمد",
      identityNo: "99100100001",
      phone: "+963 991 300001",
      email: "fatima.mohammad@menapatient.sy",
      bloodType: "A+",
      emergencyContact: "الزوج: أحمد المحمد - +963 991 300091",
    },
    doctorId: "doc-gastro-horo", // هضمية : د. رستم هورو
    appointmentDate: "2026-10-26",
    slotTime: "09:30",
    chiefComplaint: "ألم متكرر في رأس المعدة وحرقة شديدة بعد تناول الطعام.",
    diagnosis: "K29.7 - التهاب المعدة الحاد وعسر الهضم الوظيفي (Acute Gastritis)",
    clinicalNotes: "S: تعاني المريضة من حرقة فؤاد وألم شرسوفي منذ 3 أسابيع.\nO: بطن لين مع إيلام خفيف في الشرسوف، علامة بلومبرغ سلبية.\nA: التهاب مخاطية المعدة مع قلس مريئي خفيف.\nP: بدء علاج بمثبط مضخة البروتون وحمية غذائية.",
    prescriptions: [
      { itemName: "Nexium 40mg (Esomeprazole)", dosage: "حبة واحدة صباحاً قبل الإفطار بنصف ساعة", quantity: 2 },
      { itemName: "Gaviscon Advance Suspension", dosage: "10 مل بعد الوجبات وقبل النوم", quantity: 1 }
    ],
    labTests: [
      { testName: "فحص جرثومة المعدة H. Pylori Stool Antigen", status: "COMPLETED", resultData: "Positive (+ve) إيجابي" }
    ]
  },
  {
    agentIndex: 2,
    lang: "ar",
    patient: {
      fullName: "عمر فاروق الحلبي",
      identityNo: "99100100002",
      phone: "+963 991 300002",
      email: "omar.halabi@menapatient.sy",
      bloodType: "O+",
      emergencyContact: "الأخ: وليد الحلبي - +963 991 300092",
    },
    doctorId: "doc-cardio-chebb", // قلبية : د. عبدالرحمن الشب
    appointmentDate: "2026-10-26",
    slotTime: "10:00",
    chiefComplaint: "خفقان في القلب مع دوخة خفيفة عند بذل مجهود بدني متوسط.",
    diagnosis: "I47.1 - تسرع قلب جيبي فوق بطيني متقطع (Supraventricular Tachycardia)",
    clinicalNotes: "S: خفقان قلب متسارع يظهر فجأة ويستمر لعدة دقائق.\nO: ضغط الدم: 125/80 mmHg، النبض: 88 bpm. أصوات القلب منتظمة.\nA: تسرع قلب انفعالي مع قلق خفيف.\nP: هولتر 24 ساعة، وإعطاء جرعة مخففة من حاصرات بيتا.",
    prescriptions: [
      { itemName: "Concor 2.5mg (Bisoprolol)", dosage: "حبة واحدة صباحاً يومياً", quantity: 1 },
      { itemName: "Magnesium B6 Forte", dosage: "حبة مساءً بعد العشاء", quantity: 1 }
    ],
    labTests: [
      { testName: "تخطيط قلب كهربائي EKG 12-Lead", status: "COMPLETED", resultData: "Sinus Rhythm with occasional PACs - No ST elevation" },
      { testName: "فحص هرمونات الغدة الدرقية TSH & Free T4", status: "COMPLETED", resultData: "TSH: 2.1 mIU/L (طبيعي)" }
    ]
  },
  {
    agentIndex: 3,
    lang: "ar",
    patient: {
      fullName: "يوسف أحمد النجار",
      identityNo: "99100100003",
      phone: "+963 991 300003",
      email: "youssef.najjar@menapatient.sy",
      bloodType: "B+",
      emergencyContact: "الوالد: أحمد النجار - +963 991 300093",
    },
    doctorId: "doc-cardio-horo", // قلبية : د. برخدان هورو
    appointmentDate: "2026-10-26",
    slotTime: "10:30",
    chiefComplaint: "ضغط دم مرتفع وثقل في خلف الرأس في الصباح الباكر.",
    diagnosis: "I10 - ارتفاع ضغط الدم الشرياني الأولي (Essential Hypertension Stage 1)",
    clinicalNotes: "S: صداع قفوي صباحي مع شعور بالإجهاد.\nO: قياس الضغط: 148/92 mmHg، معدل النبض: 76 bpm.\nA: فرط ضغط شرياني، الحاجة لضبط دوائي وتعديل نمط الحياة.\nP: مونوبريل 10 ملغ ومراقبة الضغط لسبعة أيام متتالية.",
    prescriptions: [
      { itemName: "Exforge 5/80mg (Amlodipine/Valsartan)", dosage: "حبة واحدة صباحاً مع كأس ماء", quantity: 1 }
    ],
    labTests: [
      { testName: "تحليل وظائف الكلى Urea & Serum Creatinine", status: "COMPLETED", resultData: "Creatinine: 0.9 mg/dL, eGFR > 90 (طبيعي)" }
    ]
  },
  {
    agentIndex: 4,
    lang: "ar",
    patient: {
      fullName: "مريم خالد الباشا",
      identityNo: "99100100004",
      phone: "+963 991 300004",
      email: "maryam.basha@menapatient.sy",
      bloodType: "AB+",
      emergencyContact: "الابن: طارق الباشا - +963 991 300094",
    },
    doctorId: "doc-ortho-takko", // عظمية: د. فؤاد طكو
    appointmentDate: "2026-10-26",
    slotTime: "11:00",
    chiefComplaint: "ألم في الركبة اليمنى وصعوبة في صعود الدرج وصوت فرقعة مفصلية.",
    diagnosis: "M17.1 - فصال عظمي أولي في مفصل الركبة اليمنى (Right Knee Osteoarthritis)",
    clinicalNotes: "S: آلام متزايدة بالمفصل عند المشي والوقوف الطويل.\nO: تورم طفيف حول الركبة، تحديد خفيف في العطف الأقصى.\nA: تنكس مفصلي درجة ثانية مع خشونة غضروفية.\nP: مركب الجلوكوزامين والكوندرويتين وتمارين تقوية العضلة مربعة الرؤوس.",
    prescriptions: [
      { itemName: "Celebrex 200mg (Celecoxib)", dosage: "حبة واحدة يومياً بعد وجبة الغداء عند اللزوم", quantity: 1 },
      { itemName: "Osteocare Joint Glucosamine", dosage: "قرص مرتين يومياً مع الوجبات", quantity: 2 }
    ],
    labTests: [
      { testName: "تصوير شعاعي بسيط للركبتين واقفاً X-Ray Bilateral Knees", status: "COMPLETED", resultData: "Narrowing of medial joint space, early osteophytes" }
    ]
  },
  {
    agentIndex: 5,
    lang: "ar",
    patient: {
      fullName: "عبدالكريم الصالح",
      identityNo: "99100100005",
      phone: "+963 991 300005",
      email: "abdulkarim.saleh@menapatient.sy",
      bloodType: "A-",
      emergencyContact: "الأخت: هدى الصالح - +963 991 300095",
    },
    doctorId: "doc-uro-razzaq", // بولية: د. احمد عبدالرزاق
    appointmentDate: "2026-10-26",
    slotTime: "11:30",
    chiefComplaint: "ألم حاد مفاجئ في الخاصرة اليسرى يمتد للمنطقة الإربية.",
    diagnosis: "N20.1 - حصاة في الحالب الأيسر مسببة لمغص كلوي (Left Ureteral Calculus)",
    clinicalNotes: "S: مغص كلوي حاد متقطع مع غثيان.\nO: إيلام شديد بالجس في الزاوية الضلعية الفقرية اليسرى.\nA: اشتباه حصاة حالبية دقيقة، حالة إفراغية مستقرة.\nP: مسكن تشنجي ومدر بولي ودفع سوائل بكميات كافية (3 لتر يومياً).",
    prescriptions: [
      { itemName: "Rowatinex Capsules", dosage: "كبسولتان قبل الأكل 3 مرات يومياً", quantity: 2 },
      { itemName: "Voltaren 75mg Ampoule / Suppository", dosage: "عند هجمة الألم الشديد فقط", quantity: 1 }
    ],
    labTests: [
      { testName: "فحص بول وراسب كامل Routine Urinalysis", status: "COMPLETED", resultData: "RBC: 25-30 / HPF (Microscopic Hematuria)" },
      { testName: "إيكو الكليتين والمثانة KUB Ultrasound", status: "COMPLETED", resultData: "4.5mm calculus in lower 1/3 left ureter, mild hydronephrosis" }
    ]
  },
  {
    agentIndex: 6,
    lang: "ar",
    patient: {
      fullName: "سارة مصطفى قدور",
      identityNo: "99100100006",
      phone: "+963 991 300006",
      email: "sara.qaddour@menapatient.sy",
      bloodType: "O-",
      emergencyContact: "الوالدة: ميساء قدور - +963 991 300096",
    },
    doctorId: "doc-uro-qadi", // بولية: د. عبداللطيف قاضي
    appointmentDate: "2026-10-26",
    slotTime: "13:30",
    chiefComplaint: "حرقة بولية متكررة وإلحاح في التبول مع شعور بعدم الارتياح.",
    diagnosis: "N30.0 - التهاب المثانة الحاد الجرثومي (Acute Bacterial Cystitis)",
    clinicalNotes: "S: عسرة تبول حادة مع تكرار الذهاب للحمام.\nO: ألم خفيف فوق العانة، لا يوجد حرارة جهازية.\nA: إنتان بولي سفلي غير معقد.\nP: مضاد حيوي موجه مع مطهر مسالك بولية ومدر طبيعي.",
    prescriptions: [
      { itemName: "Monuril 3g Sachet (Fosfomycin)", dosage: "كيس واحد يحل بكأس ماء قبل النوم لمرة واحدة", quantity: 1 },
      { itemName: "Urispas 200mg (Flavoxate)", dosage: "قرص 3 مرات يومياً لتسكين التشنج البولي", quantity: 1 }
    ],
    labTests: [
      { testName: "زرع بول وتحسس Urine Culture & Sensitivity", status: "COMPLETED", resultData: "E. Coli > 100,000 CFU/mL - Sensitive to Fosfomycin" }
    ]
  },
  {
    agentIndex: 7,
    lang: "ar",
    patient: {
      fullName: "ريم حسان كردي",
      identityNo: "99100100007",
      phone: "+963 991 300007",
      email: "reem.kurdi@menapatient.sy",
      bloodType: "B-",
      emergencyContact: "الزوج: فراس كردي - +963 991 300097",
    },
    doctorId: "doc-derma-haddad", // جلدية: د. لوديا حداد
    appointmentDate: "2026-10-26",
    slotTime: "14:00",
    chiefComplaint: "بقع حمراء متقشرة على فروة الرأس والجبين مع حكة مزعجة.",
    diagnosis: "L21.9 - التهاب الجلد المثي والصدفية الموضعية (Seborrheic Dermatitis)",
    clinicalNotes: "S: قشور دهنية بيضاء وصفراء مع احمرار بالجلد وحكة.\nO: حمامى حرشفية في حافة شعر الرأس وثنايا الأنف.\nA: إكزيما دهنية مترافقة مع نشاط خمائر الملاسيزيا.\nP: شامبو طبي ومحلول كورتيكويد موضعي خفيف.",
    prescriptions: [
      { itemName: "Nizoral 2% Medicated Shampoo (Ketoconazole)", dosage: "غسيل فروة الرأس مرتين أسبوعياً لمدة شهر", quantity: 1 },
      { itemName: "Elocom 0.1% Scalp Lotion (Mometasone)", dosage: "بضع قطرات مساءً على المواضع المصابة لـ 10 أيام", quantity: 1 }
    ],
    labTests: [
      { testName: "فحص الفطريات المجهري المباشر KOH Mount", status: "COMPLETED", resultData: "Malassezia furfur spores detected, no dermatophytes" }
    ]
  },
  {
    agentIndex: 8,
    lang: "ar",
    patient: {
      fullName: "بلال محمود عثمان",
      identityNo: "99100100008",
      phone: "+963 991 300008",
      email: "bilal.othman@menapatient.sy",
      bloodType: "A+",
      emergencyContact: "الابن: محمد عثمان - +963 991 300098",
    },
    doctorId: "doc-vasc-arr", // وعائية: د. فادي العر
    appointmentDate: "2026-10-26",
    slotTime: "14:30",
    chiefComplaint: "ثقل وتورم في الساقين مع ظهور أوردة زرقاء متعرجة بارزة.",
    diagnosis: "I83.9 - قصور وريدي سطحي ودوالي الأطراف السفلية (Varicose Veins Lower Limbs)",
    clinicalNotes: "S: تعب وثقل في الساقين بنهاية النهار بعد الوقوف الطويل.\nO: توسعات وريدية متعرجة في مسار الوريد الصافن الكبير الأيمن.\nA: دوالي وريدية درجة C2 وفق تصنيف CEAP.\nP: جوارب ضاغطة طبية وعلاج فلافونويدي مقوي لجدران الأوردة.",
    prescriptions: [
      { itemName: "Daflon 500mg (Micronized Flavonoid)", dosage: "قرصان يومياً مع وجبة الغداء", quantity: 2 },
      { itemName: "Medical Compression Stockings Class II", dosage: "ارتداء الجوارب صباحاً قبل النهوض من الفراش", quantity: 1 }
    ],
    labTests: [
      { testName: "إيكو دوبلر ملون للأوردة Venous Duplex Lower Limbs", status: "COMPLETED", resultData: "Reflux > 0.5s in Great Saphenous Vein junction, deep veins patent" }
    ]
  },
  {
    agentIndex: 9,
    lang: "ar",
    patient: {
      fullName: "الطفل حمزة زياد الجاسم",
      identityNo: "99100100009",
      phone: "+963 991 300009",
      email: "ziad.jassem@menapatient.sy",
      bloodType: "O+",
      emergencyContact: "الأب: زياد الجاسم - +963 991 300099",
    },
    doctorId: "doc-ped-ahmad", // اطفال: د. حسين الاحمد
    appointmentDate: "2026-10-26",
    slotTime: "15:30",
    chiefComplaint: "سعال نباحي حاد في الليل مع صعوبة خفيفة في التنفس وحرارة 38.2°.",
    diagnosis: "J05.0 - الخناق الحنجري الفيروسي الحاد (Acute Laryngotracheobronchitis - Croup)",
    clinicalNotes: "S: سعال أجش مع صرير تنفسي شهيقي خفيف عند البكاء.\nO: درجة الحرارة 38.1°C، تشبع الأكسجين 98%، لا يوجد زرقة أو سحب صدري.\nA: التهاب حنجرة ورغامى فيروسي متوسط الشدة.\nP: جرعة وحيدة ديكساميثازون وجلسات رذاذ بارد مع ترطيب الغرفة.",
    prescriptions: [
      { itemName: "Dexamethasone Oral Solution 2mg", dosage: "جرعة فموية وحيدة بالعيادة", quantity: 1 },
      { itemName: "Paracetamol Syrup 120mg/5ml", dosage: "5 مل كل 6 ساعات عند ارتفاع الحرارة", quantity: 1 }
    ],
    labTests: [
      { testName: "فحص البروتين الارتكاسي التفاعلي CRP & CBC", status: "COMPLETED", resultData: "WBC: 8.2 K/uL (Lymphocytic predominance), CRP: 6 mg/L (Viral profile)" }
    ]
  },
  {
    agentIndex: 10,
    lang: "ar",
    patient: {
      fullName: "الطفلة جنى بشار السعيد",
      identityNo: "99100100010",
      phone: "+963 991 300010",
      email: "bashar.saeed@menapatient.sy",
      bloodType: "A+",
      emergencyContact: "الأم: نور السعيد - +963 991 300100",
    },
    doctorId: "doc-pedcardio-azzawi", // قلبية اطفال : د. احمد عزاوي
    appointmentDate: "2026-10-26",
    slotTime: "16:00",
    chiefComplaint: "سماع نفخة قلبية عرضية أثناء الفحص الروتيني للطفلة مع نمو جيد.",
    diagnosis: "Q21.0 - نفخة قلبية بريئة دون تشوه ولادي (Innocent Still's Murmur)",
    clinicalNotes: "S: الطفلة نشيطة، رضاعتها ممتازة، لا تعاني من تعرق أو زرقة شفتين.\nO: نفخة انقباضية موسيقية الدرجة 2/6 على الحافة القصية اليسرى تتراجع بالجلوس.\nA: نفخة وظيفية حميدة تماماً، قلب سليم بنيوياً.\nP: طمأنة الأهل، لا داعي لأي تقييد للنشاط البدني أو أدوية.",
    prescriptions: [],
    labTests: [
      { testName: "إيكو قلب دوبلر أطفال Pediatric Echocardiography", status: "COMPLETED", resultData: "Normal cardiac anatomy, intact septa, normal biventricular function EF 68%" }
    ]
  },

  // ================= 5 TURKISH AGENTS =================
  {
    agentIndex: 11,
    lang: "tr",
    patient: {
      fullName: "Zeynep Kaya",
      identityNo: "99200200001",
      phone: "+90 532 1000001",
      email: "zeynep.kaya@menapatient.com",
      bloodType: "A+",
      emergencyContact: "Eşi: Ahmet Kaya - +90 532 1000091",
    },
    doctorId: "doc-dental-shamoun", // اسنان : د. ماجد شمعون
    appointmentDate: "2026-10-26",
    slotTime: "09:30",
    chiefComplaint: "Alt azı dişinde soğuk ve tatlı yiyeceklerle tetiklenen keskin sızı.",
    diagnosis: "K02.1 - Dentin Çürüğü ve Reversibl Pulpitis (Dental Caries in Dentin)",
    clinicalNotes: "S: Hasta sağ alt 6 numaralı dişte termal hassasiyetten şikayetçi.\nO: Oklüzal fissürde derin kavitasyon, perküsyon hassasiyeti negatif.\nA: Reversibl pulpa hiperemisi, pulpa canlı.\nP: Çürük temizliği, kuafaj ve ışınlı kompozit estetik dolgu yapıldı.",
    prescriptions: [
      { itemName: "Sensodyne Hızlı Rahatlama Diş Macunu", dosage: "Günde 2 kez yumuşak fırçayla", quantity: 1 },
      { itemName: "Apranax Fort 550mg (Naproksen)", dosage: "Şiddetli sızı durumunda tok karna 1 tablet", quantity: 1 }
    ],
    labTests: [
      { testName: "Dijital Periapikal Dental Röntgen", status: "COMPLETED", resultData: "Periapikal radyolusensi saptanmadı, kök kanalları intakt" }
    ]
  },
  {
    agentIndex: 12,
    lang: "tr",
    patient: {
      fullName: "Mehmet Emre Yıldız",
      identityNo: "99200200002",
      phone: "+90 532 1000002",
      email: "mehmet.yildiz@menapatient.com",
      bloodType: "O+",
      emergencyContact: "Kardeşi: Can Yıldız - +90 532 1000092",
    },
    doctorId: "doc-gastro-horo", // هضمية : د. رستم هورو
    appointmentDate: "2026-10-26",
    slotTime: "10:00",
    chiefComplaint: "Yemeklerden sonra göğüs arkasında yanma ve ağıza asitli sıvı gelmesi.",
    diagnosis: "K21.0 - Gastroözofageal Reflü Hastalığı ve Özofajit (GERD with Esophagitis)",
    clinicalNotes: "S: Özellikle gece yatarken artan retrosternal pyrozis ve kuru öksürük.\nO: Batın palpasyonda rahat, karaciğer ve dalak non-palpabl.\nA: Grade A reflü özofajit tablosu.\nP: Diyet düzenlemesi, başucunun yükseltilmesi ve PPI tedavisi.",
    prescriptions: [
      { itemName: "Pantpas 40mg (Pantoprazol)", dosage: "Her sabah aç karnına 1 tablet", quantity: 2 },
      { itemName: "Rennie Çiğneme Tableti", dosage: "Yanma hissi olduğunda 1-2 tablet çiğnenir", quantity: 1 }
    ],
    labTests: [
      { testName: "Gaitada Gizli Kan Testi (FOBT)", status: "COMPLETED", resultData: "Negatif (Kanama bulgusu saptanmadı)" }
    ]
  },
  {
    agentIndex: 13,
    lang: "tr",
    patient: {
      fullName: "Ayşe Demirkan",
      identityNo: "99200200003",
      phone: "+90 532 1000003",
      email: "ayse.demirkan@menapatient.com",
      bloodType: "B+",
      emergencyContact: "Kızı: Elif Demirkan - +90 532 1000093",
    },
    doctorId: "doc-cardio-chebb", // قلبية : د. عبدالرحمن الشب
    appointmentDate: "2026-10-26",
    slotTime: "10:30",
    chiefComplaint: "Yürüyüş yaparken çabuk yorulma ve ayak bileklerinde akşama doğru şişlik.",
    diagnosis: "I50.9 - Kronik Kalp Yetersizliği Evre II (NYHA Class II Heart Failure)",
    clinicalNotes: "S: İki kat merdiven çıkınca nefes darlığı hissi.\nO: TA: 130/80 mmHg, Nabız: 72 bpm. Pretibial +1 gode bırakan ödem.\nA: Korunmuş ejeksiyon fraksiyonlu kalp yetmezliği.\nP: Düşük doz diüretik ve ACE inhibitörü kombinasyonu, tuz kısıtlaması.",
    prescriptions: [
      { itemName: "Lasix 40mg (Furosemid)", dosage: "Günde 1 kez sabah aç karna yarım tablet", quantity: 1 },
      { itemName: "Triplixam 5/1.25/5mg", dosage: "Sabahları 1 tablet", quantity: 1 }
    ],
    labTests: [
      { testName: "NT-proBNP Kardiyak Biyobelirteç", status: "COMPLETED", resultData: "245 pg/mL (Hafif kardiyak yük artışı)" },
      { testName: "Serum Elektrolitleri (Na, K, Cl)", status: "COMPLETED", resultData: "K: 4.3 mmol/L, Na: 140 mmol/L (Normal sınırlar)" }
    ]
  },
  {
    agentIndex: 14,
    lang: "tr",
    patient: {
      fullName: "Burak Şahin",
      identityNo: "99200200004",
      phone: "+90 532 1000004",
      email: "burak.sahin@menapatient.com",
      bloodType: "AB-",
      emergencyContact: "Babası: Ali Şahin - +90 532 1000094",
    },
    doctorId: "doc-ortho-takko", // عظمية: د. فؤاد طكو
    appointmentDate: "2026-10-26",
    slotTime: "11:00",
    chiefComplaint: "Halı saha maçında sağ ayak bileğinin burkulması sonrası şişlik ve morarma.",
    diagnosis: "S93.4 - Sağ Ayak Bileği Lateral Ligaman Burkulması (Ankle Sprain Grade II)",
    clinicalNotes: "S: Ayağın içe dönmesiyle akut burkulma ve şiddetli acı hissi.\nO: Dış malleol çevresinde hematom ve ödem, kemik hassasiyeti yok.\nA: Ön talofibuler ligamanda parsiyel yırtık şüphesi.\nP: RICE protokolü (İstirahat, buz, elastik bandaj, elevasyon) ve stabilizasyon.",
    prescriptions: [
      { itemName: "Diclomec Jel %1 (Diklofenak)", dosage: "Günde 3 kez burkulan bölgeye hafifçe sürülür", quantity: 1 },
      { itemName: "Muscoril 8mg Kapsül (Tiyokolşikozit)", dosage: "Günde 2 kez tok karnına 1 kapsül", quantity: 1 }
    ],
    labTests: [
      { testName: "Sağ Ayak Bileği İki Yönlü Grafi", status: "COMPLETED", resultData: "Kemiksel korteks devamlılığı tam, avülsiyon veya fraktür izlenmedi" }
    ]
  },
  {
    agentIndex: 15,
    lang: "tr",
    patient: {
      fullName: "Elif Çelik",
      identityNo: "99200200005",
      phone: "+90 532 1000005",
      email: "elif.celik@menapatient.com",
      bloodType: "A+",
      emergencyContact: "Annesi: Fatma Çelik - +90 532 1000095",
    },
    doctorId: "doc-derma-haddad", // جلدية: د. لوديا حداد
    appointmentDate: "2026-10-26",
    slotTime: "11:30",
    chiefComplaint: "Yüz bölgesinde T-bölgesinde çıkan iltihaplı sivilceler ve kızarıklık.",
    diagnosis: "L70.0 - Akne Vulgaris ve Sebase Hiperaktivite (Papulopustular Acne)",
    clinicalNotes: "S: Son aylarda strese bağlı çene ve alın bölgesinde artan komedon ve püstüller.\nO: Yüzde eritemli papüller ve açık/kapalı komedonlar, kistik nodül yok.\nA: Orta şiddette papülopüstüler akne.\nP: Topikal benzoil peroksit + klindamisin jeli ve yağsız güneş koruyucu.",
    prescriptions: [
      { itemName: "Clindoxyl Jel (Klindamisin + Benzoil Peroksit)", dosage: "Akşamları temiz cilde ince tabaka", quantity: 1 },
      { itemName: "La Roche-Posay Effaclar Jel Yüz Yıkama", dosage: "Sabah ve akşam cildi kurutmadan arındırma", quantity: 1 }
    ],
    labTests: [
      { testName: "Total Testosteron & DHEA-SO4 Hormon Paneli", status: "COMPLETED", resultData: "Hormon seviyeleri referans aralıklar içerisinde normal" }
    ]
  },

  // ================= 5 ENGLISH AGENTS =================
  {
    agentIndex: 16,
    lang: "en",
    patient: {
      fullName: "Alexander Wright",
      identityNo: "99300300001",
      phone: "+44 770 0900001",
      email: "alex.wright@menapatient.org",
      bloodType: "O+",
      emergencyContact: "Spouse: Catherine Wright - +44 770 0900091",
    },
    doctorId: "doc-vasc-arr", // وعائية: د. فادي العر
    appointmentDate: "2026-10-26",
    slotTime: "13:30",
    chiefComplaint: "Intermittent cramping pain in calf muscles while walking uphill.",
    diagnosis: "I73.9 - Peripheral Arterial Occlusive Disease & Claudication (PAD Fontaine IIa)",
    clinicalNotes: "S: Cramping calf pain after walking approximately 400 meters, relieved with rest.\nO: Posterior tibial and dorsalis pedis pulses diminished bilaterally. Ankle-Brachial Index (ABI): 0.82.\nA: Mild to moderate lower limb peripheral arterial insufficiency.\nP: Supervised walking program, smoking cessation, antiplatelet and statin therapy.",
    prescriptions: [
      { itemName: "Plavix 75mg (Clopidogrel)", dosage: "One tablet daily with water", quantity: 1 },
      { itemName: "Crestor 20mg (Rosuvastatin)", dosage: "One tablet every evening", quantity: 1 }
    ],
    labTests: [
      { testName: "Arterial Duplex Ultrasound of Lower Extremities", status: "COMPLETED", resultData: "Superficial femoral artery 45% stenosis, patent distal runoff" },
      { testName: "Comprehensive Lipid Profile", status: "COMPLETED", resultData: "LDL: 154 mg/dL, HDL: 38 mg/dL, Triglycerides: 198 mg/dL" }
    ]
  },
  {
    agentIndex: 17,
    lang: "en",
    patient: {
      fullName: "Sarah Jenkins",
      identityNo: "99300300002",
      phone: "+44 770 0900002",
      email: "sarah.jenkins@menapatient.org",
      bloodType: "A-",
      emergencyContact: "Sister: Emily Jenkins - +44 770 0900092",
    },
    doctorId: "doc-uro-qadi", // بولية: د. عبداللطيف قاضي
    appointmentDate: "2026-10-26",
    slotTime: "14:00",
    chiefComplaint: "Urgency and involuntary leakage of urine during coughing or laughing.",
    diagnosis: "N39.3 - Stress Urinary Incontinence (Mild SUI)",
    clinicalNotes: "S: Sensation of bladder pressure and stress incontinence during physical exertion.\nO: Pelvic exam demonstrates intact mucosal support, positive cough stress test.\nA: Genuine stress urinary incontinence related to pelvic floor weakness.\nP: Kegel pelvic floor muscle training and lifestyle modification.",
    prescriptions: [
      { itemName: "Vesicare 5mg (Solifenacin Succinate)", dosage: "Take 1 tablet daily with food", quantity: 1 }
    ],
    labTests: [
      { testName: "Urodynamic Pressure Flow Study & Post-Void Residual", status: "COMPLETED", resultData: "Post-void residual volume: 15 mL (Normal/Adequate emptying)" }
    ]
  },
  {
    agentIndex: 18,
    lang: "en",
    patient: {
      fullName: "Michael Davis (Guardian of Oliver Davis)",
      identityNo: "99300300003",
      phone: "+44 770 0900003",
      email: "michael.davis@menapatient.org",
      bloodType: "B+",
      emergencyContact: "Father: Michael Davis - +44 770 0900003",
    },
    doctorId: "doc-ped-ahmad", // اطفال: د. حسين الاحمد
    appointmentDate: "2026-10-26",
    slotTime: "14:30",
    chiefComplaint: "4-year-old child with persistent dry cough and wheezing following a common cold.",
    diagnosis: "J45.0 - Early Childhood Reactive Airway Disease & Viral Wheeze",
    clinicalNotes: "S: Night-time coughing fits, child is playful during the day.\nO: Respiration rate: 24 bpm, bilateral expiratory wheezes on chest auscultation.\nA: Post-viral bronchial hyperreactivity.\nP: Inhaled corticosteroid and short-acting bronchodilator via spacer chamber.",
    prescriptions: [
      { itemName: "Ventolin Inhaler 100mcg (Salbutamol)", dosage: "2 puffs via spacer every 4-6 hours as needed", quantity: 1 },
      { itemName: "Flixotide 50mcg (Fluticasone)", dosage: "1 puff twice daily for 2 weeks", quantity: 1 }
    ],
    labTests: [
      { testName: "Pulse Oximetry & Peak Flow Screening", status: "COMPLETED", resultData: "SpO2: 99% on room air, good air entry bilaterally" }
    ]
  },
  {
    agentIndex: 19,
    lang: "en",
    patient: {
      fullName: "Emma Watson (Guardian of Liam Watson)",
      identityNo: "99300300004",
      phone: "+44 770 0900004",
      email: "emma.watson@menapatient.org",
      bloodType: "O-",
      emergencyContact: "Mother: Emma Watson - +44 770 0900004",
    },
    doctorId: "doc-pedcardio-azzawi", // قلبية اطفال : د. احمد عزاوي
    appointmentDate: "2026-10-26",
    slotTime: "15:30",
    chiefComplaint: "Cardiac follow-up checkup for 7-year-old schoolboy participating in sports.",
    diagnosis: "Z00.1 - Pre-participation Pediatric Cardiovascular Screening (Normal)",
    clinicalNotes: "S: Asymptomatic young athlete, no family history of sudden cardiac event.\nO: BP: 102/64 mmHg, regular sinus rhythm at 80 bpm, normal heart sounds S1 and S2.\nA: Fit and cleared for all competitive school athletics and swimming.\nP: Annual routine checkup recommended.",
    prescriptions: [],
    labTests: [
      { testName: "Pediatric 12-Lead Electrocardiogram (ECG)", status: "COMPLETED", resultData: "Normal PR interval, normal QTc 410ms, no repolarization abnormalities" }
    ]
  },
  {
    agentIndex: 20,
    lang: "en",
    patient: {
      fullName: "David Miller",
      identityNo: "99300300005",
      phone: "+44 770 0900005",
      email: "david.miller@menapatient.org",
      bloodType: "AB+",
      emergencyContact: "Brother: John Miller - +44 770 0900095",
    },
    doctorId: "doc-dental-shamoun", // اسنان : د. ماجد شمعون
    appointmentDate: "2026-10-26",
    slotTime: "16:00",
    chiefComplaint: "Routine dental plaque scaling and examination for dental implant in upper premolar.",
    diagnosis: "K05.1 - Chronic Marginal Gingivitis and Missing Tooth 24 (Dental Implant Planning)",
    clinicalNotes: "S: Desires scaling and professional cleaning, interested in dental implant restoration.\nO: Supragingival calculus on lingual lower incisors, edentulous site at upper left first premolar.\nA: Localized gingivitis resolved post-scaling, adequate bone width for single implant.\nP: Ultrasonic scaling, dental prophylaxis polishing, scheduled for implant 3D CBCT scan.",
    prescriptions: [
      { itemName: "Corsodyl 0.2% Chlorhexidine Mouthwash", dosage: "Rinse 10ml twice daily after brushing for 7 days", quantity: 1 }
    ],
    labTests: [
      { testName: "Panoramic Digital Orthopantomogram (OPG)", status: "COMPLETED", resultData: "Sufficient alveolar ridge height (>12mm) in region 24, sinus floor intact" }
    ]
  }
];

async function runSingleAgent(agent: AgentConfig) {
  const startTime = Date.now();
  console.log(`[Agent ${agent.agentIndex.toString().padStart(2, "0")}] [${agent.lang.toUpperCase()}] Starting simulation for: ${agent.patient.fullName}`);

  // Step 1: Patient registration & database upsert
  const patientId = `pat-${agent.patient.identityNo}`;
  await withDb((db) => {
    let p = db.patients.find((item) => item.id === patientId || item.identityNo === agent.patient.identityNo);
    if (!p) {
      p = {
        id: patientId,
        fullName: agent.patient.fullName,
        identityNo: agent.patient.identityNo,
        phone: agent.patient.phone,
        email: agent.patient.email,
        bloodType: agent.patient.bloodType,
        emergencyContact: agent.patient.emergencyContact,
        preferredLang: agent.lang,
        createdAt: new Date().toISOString(),
      };
      db.patients.push(p);
    }
  });

  // Step 2: Book appointment
  const apptId = `app-sim-${Date.now()}-${agent.agentIndex}`;
  let appointmentRecord: any = null;

  await withDb((db) => {
    const doctor = db.doctors.find((d) => d.id === agent.doctorId) || db.doctors[0];
    const patient = db.patients.find((p) => p.id === patientId)!;

    const queueNumber = db.appointments.filter(
      (a) => a.doctorId === doctor.id && a.dateStr === agent.appointmentDate && a.status !== "CANCELLED"
    ).length + 1;

    appointmentRecord = {
      id: apptId,
      patientId: patient.id,
      doctorId: doctor.id,
      slotTime: `${agent.appointmentDate}T${agent.slotTime}:00`,
      timeStr: agent.slotTime,
      dateStr: agent.appointmentDate,
      queueNumber,
      status: "COMPLETED", // Examination completed
      notes: agent.chiefComplaint,
      patient: {
        fullName: patient.fullName,
        phone: patient.phone,
        identityNo: patient.identityNo,
        bloodType: patient.bloodType,
      },
      doctor: {
        fullName: doctor.fullName,
        email: doctor.email,
        specialty: doctor.specialty,
      },
      departmentName: doctor.department?.name || doctor.specialty,
      createdAt: new Date().toISOString(),
    };

    db.appointments.push(appointmentRecord);
  });

  // Step 3: Record Medical Consultation & Examination Results
  const recordId = `rec-sim-${Date.now()}-${agent.agentIndex}`;
  let medicalRecord: any = null;

  await withDb((db) => {
    const doctor = db.doctors.find((d) => d.id === agent.doctorId) || db.doctors[0];
    const patient = db.patients.find((p) => p.id === patientId)!;

    medicalRecord = {
      id: recordId,
      patientId: patient.id,
      doctorId: doctor.id,
      appointmentId: apptId,
      diagnosis: agent.diagnosis,
      clinicalNotes: agent.clinicalNotes,
      prescriptionItems: agent.prescriptions,
      labTests: agent.labTests,
      amendments: [],
      createdAt: new Date().toISOString(),
      doctor: {
        fullName: doctor.fullName,
        specialty: doctor.specialty,
      },
      patient: {
        fullName: patient.fullName,
        identityNo: patient.identityNo,
        phone: patient.phone,
        bloodType: patient.bloodType,
      }
    };

    if (!db.medicalRecords) db.medicalRecords = [];
    db.medicalRecords.unshift(medicalRecord);
  });

  // Step 4: Generate Doctor PDF Examination Report
  const db = getDb();
  const doc = db.doctors.find((d) => d.id === agent.doctorId) || db.doctors[0];
  const pat = db.patients.find((p) => p.id === patientId)!;

  const pdfData = {
    reportId: recordId,
    clinicName: "Mena Clinic Aleppo - HIS/EMR",
    clinicAddress: "Al-Aziziyah District, Aleppo, Syria",
    doctorName: doc.fullName,
    specialty: doc.specialty,
    patientName: pat.fullName,
    patientIdentity: pat.identityNo,
    patientPhone: pat.phone,
    bloodType: pat.bloodType || "O+",
    date: agent.appointmentDate,
    diagnosis: agent.diagnosis,
    clinicalNotes: agent.clinicalNotes,
    prescriptions: agent.prescriptions,
    labTests: agent.labTests,
  };

  const pdfBuffer = generateClinicalPdfBuffer(pdfData);

  // Validate PDF integrity
  const isPdfHeaderValid = pdfBuffer.slice(0, 8).toString("utf-8").startsWith("%PDF-1.");
  const isPdfTrailerValid = pdfBuffer.toString("utf-8").includes("%%EOF");
  const pdfSizeBytes = pdfBuffer.length;

  // Save PDF file to simulation_reports_pdf
  const pdfFilePath = path.join(OUTPUTS_DIR, `mena_report_agent_${agent.agentIndex.toString().padStart(2, "0")}_${agent.lang}.pdf`);
  fs.writeFileSync(pdfFilePath, pdfBuffer);

  const durationMs = Date.now() - startTime;

  console.log(`[Agent ${agent.agentIndex.toString().padStart(2, "0")}] [${agent.lang.toUpperCase()}] SUCCESS in ${durationMs}ms | Doctor: ${doc.fullName} | Queue: #${appointmentRecord.queueNumber} | PDF: ${pdfSizeBytes} bytes [Valid: ${isPdfHeaderValid && isPdfTrailerValid}]`);

  return {
    agentIndex: agent.agentIndex,
    lang: agent.lang,
    patientName: agent.patient.fullName,
    identityNo: agent.patient.identityNo,
    doctorName: doc.fullName,
    department: doc.department?.name || doc.specialty,
    slotTime: `${agent.appointmentDate} ${agent.slotTime}`,
    queueNumber: appointmentRecord.queueNumber,
    diagnosis: agent.diagnosis,
    prescriptionCount: agent.prescriptions.length,
    labTestCount: agent.labTests.length,
    pdfValid: isPdfHeaderValid && isPdfTrailerValid,
    pdfSize: pdfSizeBytes,
    pdfPath: pdfFilePath,
    durationMs
  };
}

async function main() {
  console.log("================================================================================");
  console.log("🚀 STARTING 20 CONCURRENT PATIENT AGENTS SIMULATION (10 AR, 5 TR, 5 EN)");
  console.log("================================================================================");

  const overallStart = Date.now();

  // Run all 20 agents concurrently
  const results = await Promise.all(AGENTS.map((agent) => runSingleAgent(agent)));

  const overallDuration = Date.now() - overallStart;

  console.log("\n================================================================================");
  console.log("📊 SIMULATION COMPLETE - VERIFYING GLOBAL DATABASE INTEGRITY");
  console.log("================================================================================");

  const finalDb = getDb();
  console.log(`Total Doctors Registered: ${finalDb.doctors.length}`);
  console.log(`Total Staff Accounts:     ${finalDb.staff.length}`);
  console.log(`Total Patients in DB:     ${finalDb.patients.length}`);
  console.log(`Total Appointments in DB: ${finalDb.appointments.length}`);
  console.log(`Total Medical Records:    ${finalDb.medicalRecords.length}`);

  // Verify all 20 agents' data exists in DB
  let allPatientsFound = true;
  let allAppointmentsFound = true;
  let allRecordsFound = true;
  let allPdfsValid = true;

  for (const res of results) {
    const hasPatient = finalDb.patients.some((p) => p.identityNo === res.identityNo);
    const hasAppt = finalDb.appointments.some((a) => a.patient.identityNo === res.identityNo);
    const hasRec = finalDb.medicalRecords.some((r) => r.patientId === finalDb.patients.find(p => p.identityNo === res.identityNo)?.id);
    
    if (!hasPatient) allPatientsFound = false;
    if (!hasAppt) allAppointmentsFound = false;
    if (!hasRec) allRecordsFound = false;
    if (!res.pdfValid || res.pdfSize < 1000) allPdfsValid = false;
  }

  console.log("\n======================== INTEGRITY VERIFICATION ========================");
  console.log(`All 20 Patients Saved in Database:     ${allPatientsFound ? "✅ PASSED (100%)" : "❌ FAILED"}`);
  console.log(`All 20 Appointments Processed:         ${allAppointmentsFound ? "✅ PASSED (100%)" : "❌ FAILED"}`);
  console.log(`All 20 Medical Results Created:        ${allRecordsFound ? "✅ PASSED (100%)" : "❌ FAILED"}`);
  console.log(`All 20 Binary PDFs Generated/Exported: ${allPdfsValid ? "✅ PASSED (100%)" : "❌ FAILED"}`);
  console.log(`Concurrency Execution Total Time:      ${overallDuration}ms (Average per agent: ${Math.round(overallDuration / 20)}ms)`);
  console.log("========================================================================\n");

  // Output full summary table
  console.table(results.map((r) => ({
    Agent: `#${r.agentIndex} (${r.lang.toUpperCase()})`,
    Patient: r.patientName,
    ID: r.identityNo,
    Doctor: r.doctorName,
    Queue: `#${r.queueNumber}`,
    Diagnosis: r.diagnosis.slice(0, 35) + "...",
    Rx: `${r.prescriptionCount} items`,
    Labs: `${r.labTestCount} tests`,
    PDF_Size: `${(r.pdfSize / 1024).toFixed(1)} KB`,
    PDF_Status: r.pdfValid ? "VALID PDF-1.4" : "INVALID"
  })));

  if (!allPatientsFound || !allAppointmentsFound || !allRecordsFound || !allPdfsValid) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Simulation failed:", err);
  process.exit(1);
});
