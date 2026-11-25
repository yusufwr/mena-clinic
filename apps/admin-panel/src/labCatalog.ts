export type SpecimenCategory = "BLOOD" | "URINE" | "MICROBIOLOGY";

export interface LabParameterDef {
  code: string;
  name: string;
  unit: string;
  referenceText: string;
  inputType: "number" | "qualitative" | "text";
  min?: number;
  max?: number;
  qualitativeOptions?: string[];
  normalQualitative?: string;
  step?: string;
  placeholder?: string;
}

export interface LabPanelDef {
  id: string;
  specimen: SpecimenCategory;
  sectionHeaderEn: string;
  titleTr: string;
  titleAr: string;
  titleEn: string;
  keywords: string[];
  parameters: LabParameterDef[];
}

export interface EvaluatedLabResult {
  code: string;
  name: string;
  sectionTitle: string;
  value: string;
  unit: string;
  referenceText: string;
  min?: number;
  max?: number;
  normalQualitative?: string;
  flag: "NORMAL" | "HIGH" | "LOW" | "ABNORMAL";
}

export const SPECIMEN_CATEGORIES: {
  id: SpecimenCategory;
  titleTr: string;
  titleAr: string;
  titleEn: string;
  subtitleTr: string;
  subtitleAr: string;
  subtitleEn: string;
  badge: string;
  badgeAr: string;
  badgeEn: string;
}[] = [
  {
    id: "BLOOD",
    titleTr: "Kan Tahlilleri (Hematoloji, Biyokimya, Hormon, Seroloji)",
    titleAr: "تحاليل الدم (الدمويات، الكيمياء الحيوية، الهرمونات، المصول)",
    titleEn: "Blood Tests (Hematology, Biochemistry, Hormones, Serology)",
    subtitleTr: "CBC Tam Kan Sayımı, Koagülasyon, Biyokimya, Hormon, Hepatit ve Tümör Belirteçleri",
    subtitleAr: "تعداد الدم الكامل CBC، التخثر، الكيمياء الحيوية، الهرمونات، التهاب الكبد والواسمات الورمية",
    subtitleEn: "Complete Blood Count (CBC), Coagulation, Biochemistry, Hormones, Hepatitis & Tumor Markers",
    badge: "🩸 Kan Numunesi",
    badgeAr: "🩸 عينة دم",
    badgeEn: "🩸 Blood Specimen",
  },
  {
    id: "URINE",
    titleTr: "İdrar Tahlilleri (Tam İdrar & Mikroskobi)",
    titleAr: "تحاليل البول (فحص البول الكامل والراسب المجهري)",
    titleEn: "Urine Tests (Complete Urinalysis & Microscopy)",
    subtitleTr: "Fiziksel, Kimyasal Strip ve Mikroskobik İdrar İncelemesi",
    subtitleAr: "الفحص الفيزيائي والكيميائي والراسب المجهري للبول",
    subtitleEn: "Macroscopic, Chemical Strip, and Microscopic Urine Examination",
    badge: "🧪 İdrar Numunesi",
    badgeAr: "🧪 عينة بول",
    badgeEn: "🧪 Urine Specimen",
  },
  {
    id: "MICROBIOLOGY",
    titleTr: "Gaita & Hızlı Antijen Tahlilleri",
    titleAr: "تحاليل البراز والمستضدات السريعة",
    titleEn: "Stool & Rapid Antigen Tests",
    subtitleTr: "H. Pylori Antijeni, Gaitada Gizli Kan ve Mikroskobi",
    subtitleAr: "مستضد جرثومة المعدة H. Pylori، الدم الخفي في البراز والفحص المجهري",
    subtitleEn: "H. Pylori Antigen, Fecal Occult Blood, and Microscopy",
    badge: "🦠 Gaita / Antijen",
    badgeAr: "🦠 عينة براز / مستضد",
    badgeEn: "🦠 Stool / Antigen",
  },
];

export const LAB_PANELS_CATALOG: LabPanelDef[] = [
  // =========================================================================
  // 1. BLOOD: CBC - COMPLETE BLOOD COUNT (Matches Analyzer Printout Photo)
  // =========================================================================
  {
    id: "cbc_hematology",
    specimen: "BLOOD",
    sectionHeaderEn: "HEMATOLOGY ANALYSIS REPORT (CBC)",
    titleTr: "Tam Kan Sayımı (CBC / Hemogram - 25 Parametre)",
    titleAr: "تعداد الدم الكامل (CBC - 25 مؤشراً)",
    titleEn: "Complete Blood Count (CBC - 25 Parameters)",
    keywords: ["cbc", "hemogram", "tam kan", "wbc", "hgb", "plt", "kan sayımı", "دم كامل"],
    parameters: [
      { code: "WBC", name: "WBC", unit: "10^3/uL", referenceText: "4.0 - 10.0", inputType: "number", min: 4.0, max: 10.0, step: "0.01" },
      { code: "Neu#", name: "Neu#", unit: "10^3/uL", referenceText: "2.0 - 7.0", inputType: "number", min: 2.0, max: 7.0, step: "0.01" },
      { code: "Lym#", name: "Lym#", unit: "10^3/uL", referenceText: "0.8 - 4.0", inputType: "number", min: 0.8, max: 4.0, step: "0.01" },
      { code: "Mon#", name: "Mon#", unit: "10^3/uL", referenceText: "0.12 - 1.20", inputType: "number", min: 0.12, max: 1.2, step: "0.01" },
      { code: "Eos#", name: "Eos#", unit: "10^3/uL", referenceText: "0.02 - 0.50", inputType: "number", min: 0.02, max: 0.5, step: "0.01" },
      { code: "Bas#", name: "Bas#", unit: "10^3/uL", referenceText: "0.00 - 0.10", inputType: "number", min: 0.0, max: 0.1, step: "0.01" },
      { code: "Neu%", name: "Neu%", unit: "%", referenceText: "50.0 - 70.0", inputType: "number", min: 50.0, max: 70.0, step: "0.1" },
      { code: "Lym%", name: "Lym%", unit: "%", referenceText: "20.0 - 40.0", inputType: "number", min: 20.0, max: 40.0, step: "0.1" },
      { code: "Mon%", name: "Mon%", unit: "%", referenceText: "3.0 - 12.0", inputType: "number", min: 3.0, max: 12.0, step: "0.1" },
      { code: "Eos%", name: "Eos%", unit: "%", referenceText: "0.5 - 5.0", inputType: "number", min: 0.5, max: 5.0, step: "0.1" },
      { code: "Bas%", name: "Bas%", unit: "%", referenceText: "0.0 - 1.0", inputType: "number", min: 0.0, max: 1.0, step: "0.1" },
      { code: "RBC", name: "RBC", unit: "10^6/uL", referenceText: "4.00 - 5.50", inputType: "number", min: 4.0, max: 5.5, step: "0.01" },
      { code: "HGB", name: "HGB", unit: "g/dL", referenceText: "12.0 - 16.0", inputType: "number", min: 12.0, max: 16.0, step: "0.1" },
      { code: "HCT", name: "HCT", unit: "%", referenceText: "37.0 - 50.0", inputType: "number", min: 37.0, max: 50.0, step: "0.1" },
      { code: "MCV", name: "MCV", unit: "um^3", referenceText: "80.0 - 100.0", inputType: "number", min: 80.0, max: 100.0, step: "0.1" },
      { code: "MCH", name: "MCH", unit: "pg", referenceText: "27.0 - 34.0", inputType: "number", min: 27.0, max: 34.0, step: "0.1" },
      { code: "MCHC", name: "MCHC", unit: "g/dL", referenceText: "32.0 - 36.0", inputType: "number", min: 32.0, max: 36.0, step: "0.1" },
      { code: "RDW-CV", name: "RDW-CV", unit: "%", referenceText: "11.0 - 16.0", inputType: "number", min: 11.0, max: 16.0, step: "0.1" },
      { code: "RDW-SD", name: "RDW-SD", unit: "um^3", referenceText: "35.0 - 56.0", inputType: "number", min: 35.0, max: 56.0, step: "0.1" },
      { code: "PLT", name: "PLT", unit: "10^3/uL", referenceText: "150 - 450", inputType: "number", min: 150, max: 450, step: "1" },
      { code: "MPV", name: "MPV", unit: "um^3", referenceText: "6.5 - 12.0", inputType: "number", min: 6.5, max: 12.0, step: "0.1" },
      { code: "PDW", name: "PDW", unit: "(10GSD)", referenceText: "9.0 - 17.0", inputType: "number", min: 9.0, max: 17.0, step: "0.1" },
      { code: "PCT", name: "PCT", unit: "%", referenceText: "0.108 - 0.282", inputType: "number", min: 0.108, max: 0.282, step: "0.001" },
      { code: "P-LCC", name: "P-LCC", unit: "10^3/uL", referenceText: "30 - 90", inputType: "number", min: 30, max: 90, step: "1" },
      { code: "P-LCR", name: "P-LCR", unit: "%", referenceText: "11.0 - 45.0", inputType: "number", min: 11.0, max: 45.0, step: "0.1" },
    ],
  },

  // =========================================================================
  // 2. BLOOD: HEMATOLOGY - COAGULATION (Matches PDF Page 1)
  // =========================================================================
  {
    id: "hematology_coagulation",
    specimen: "BLOOD",
    sectionHeaderEn: "HEMATOLOGY - COAGULATION",
    titleTr: "Koagülasyon & Sedimantasyon (D-Dimer, ESR, PTT)",
    titleAr: "تخثر الدم وسرعة التثفل (D-Dimer, ESR, PTT)",
    titleEn: "Coagulation & ESR (D-Dimer, ESR, PTT, Bleeding Time)",
    keywords: ["d-dimer", "esr", "sedim", "ptt", "bleeding", "coagulation", "تثفل", "تخثر"],
    parameters: [
      { code: "D_DIMER", name: "D-Dimer", unit: "ug/mL", referenceText: "0.1 - 0.5", inputType: "number", min: 0.1, max: 0.5, step: "0.01" },
      { code: "ESR_1HR", name: "ESR (1 hr)", unit: "mm", referenceText: "Male: 0-15 | Female: 0-20", inputType: "number", min: 0, max: 20, step: "1" },
      { code: "ESR_2HR", name: "ESR (2 hr)", unit: "mm", referenceText: "0 - 35", inputType: "number", min: 0, max: 35, step: "1" },
      { code: "BLEEDING_TIME", name: "Bleeding Time", unit: "min.", referenceText: "Up To 5.0", inputType: "number", min: 0, max: 5.0, step: "0.1" },
      { code: "COAG_TIME", name: "Coagulation Time", unit: "min.", referenceText: "4.0 - 10 (L.W Method)", inputType: "number", min: 4.0, max: 10.0, step: "0.1" },
      { code: "PTT_PATIENT", name: "PTT (Patient)", unit: "Sec.", referenceText: "Control: 24 - 38 Sec.", inputType: "number", min: 24, max: 38, step: "0.1" },
    ],
  },

  // =========================================================================
  // 3. BLOOD: BIOCHEMISTRY I (Matches PDF Page 2)
  // =========================================================================
  {
    id: "biochemistry_1",
    specimen: "BLOOD",
    sectionHeaderEn: "BIOCHEMISTRY",
    titleTr: "Biyokimya I (Glucose, Urea, Creatinine, Cholesterol, Elektrolitler & Fe)",
    titleAr: "الكيمياء الحيوية 1 (Glucose, Urea, Creatinine, Lipid, Electrolytes)",
    titleEn: "Biochemistry I (Glucose, Renal, Lipid Profile, Electrolytes & Iron)",
    keywords: ["glucose", "şeker", "urea", "üre", "creatinine", "kreatinin", "cholesterol", "kolesterol", "ldl", "hdl", "triglycerides", "sodium", "potassium", "calcium", "iron", "demir", "biyokimya"],
    parameters: [
      { code: "CA_ION", name: "Ca++ (Ionized Calcium)", unit: "mmol/ml", referenceText: "1.1 - 1.3", inputType: "number", min: 1.1, max: 1.3, step: "0.01" },
      { code: "GLUCOSE_F", name: "Glucose (Fasting)", unit: "mg/dl", referenceText: "70 - 110", inputType: "number", min: 70, max: 110, step: "1" },
      { code: "UREA", name: "Urea", unit: "mg/dl", referenceText: "5 - 40", inputType: "number", min: 5, max: 40, step: "1" },
      { code: "CREATININE", name: "Creatinine", unit: "mg/dl", referenceText: "0.6 - 1.3", inputType: "number", min: 0.6, max: 1.3, step: "0.01" },
      { code: "URIC_ACID", name: "Uric Acid", unit: "mg/dl", referenceText: "3.5 - 7.2", inputType: "number", min: 3.5, max: 7.2, step: "0.1" },
      { code: "CHOL_TOT", name: "Cholesterol (Total)", unit: "mg/dl", referenceText: "Desirable below 200", inputType: "number", min: 0, max: 200, step: "1" },
      { code: "CHOL_HDL", name: "Cholesterol-HDL", unit: "mg/dl", referenceText: "More than 40", inputType: "number", min: 40, step: "1" },
      { code: "CHOL_LDL", name: "Cholesterol-LDL", unit: "mg/dl", referenceText: "50 - 155", inputType: "number", min: 50, max: 155, step: "1" },
      { code: "TRIGLYCERIDES", name: "Triglycerides", unit: "mg/dl", referenceText: "Desirable below 150", inputType: "number", min: 0, max: 150, step: "1" },
      { code: "SODIUM", name: "Sodium (Na)", unit: "mmol/L", referenceText: "134 - 150", inputType: "number", min: 134, max: 150, step: "1" },
      { code: "POTASSIUM", name: "Potassium (K)", unit: "mmol/L", referenceText: "3.5 - 5.5", inputType: "number", min: 3.5, max: 5.5, step: "0.1" },
      { code: "CHLORIDE", name: "Chloride (Cl)", unit: "mmol/L", referenceText: "95 - 110", inputType: "number", min: 95, max: 110, step: "1" },
      { code: "CALCIUM", name: "Calcium (Ca)", unit: "mg/dl", referenceText: "8.5 - 10.5", inputType: "number", min: 8.5, max: 10.5, step: "0.1" },
      { code: "PHOSPHORUS", name: "Phosphorus (Inor.)", unit: "mg/dl", referenceText: "2.7 - 4.5", inputType: "number", min: 2.7, max: 4.5, step: "0.1" },
      { code: "MAGNESIUM", name: "Magnesium (Mg)", unit: "mg/dl", referenceText: "1.7 - 2.5", inputType: "number", min: 1.7, max: 2.5, step: "0.1" },
      { code: "IRON", name: "Iron (Fe)", unit: "ug/dl", referenceText: "50 - 158", inputType: "number", min: 50, max: 158, step: "1" },
    ],
  },

  // =========================================================================
  // 4. BLOOD: BIOCHEMISTRY II (Matches PDF Pages 2 & 3)
  // =========================================================================
  {
    id: "biochemistry_2",
    specimen: "BLOOD",
    sectionHeaderEn: "BIOCHEMISTRY",
    titleTr: "Biyokimya II (ALT, AST, Bilirubin, Amylase, Lipase, HbA1c, B12, D3, Ferritin)",
    titleAr: "الكيمياء الحيوية 2 (ALT, AST, Bilirubin, HbA1c, Vitamin B12, D3, Ferritin)",
    titleEn: "Biochemistry II (Hepatic, Bilirubin, Pancreatic, HbA1c, B12, D3, Ferritin)",
    keywords: ["alt", "ast", "alp", "bilirubin", "amylase", "lipase", "cpk", "ldh", "ferritin", "b12", "hba1c", "d3", "vitamin"],
    parameters: [
      { code: "ALT", name: "ALT (SGPT)", unit: "U/L", referenceText: "5 - 45", inputType: "number", min: 5, max: 45, step: "1" },
      { code: "AST", name: "AST (SGOT)", unit: "U/L", referenceText: "5 - 40", inputType: "number", min: 5, max: 40, step: "1" },
      { code: "ALP", name: "ALP, Alkaline Phosphatase", unit: "U/L", referenceText: "0 - 279", inputType: "number", min: 0, max: 279, step: "1" },
      { code: "BIL_TOT", name: "Bilirubin (Tot.)", unit: "mg/dl", referenceText: "0 - 1.0", inputType: "number", min: 0, max: 1.0, step: "0.01" },
      { code: "BIL_DIR", name: "Bilirubin Direct", unit: "mg/dl", referenceText: "0 - 0.25", inputType: "number", min: 0, max: 0.25, step: "0.01" },
      { code: "BIL_IND", name: "Bilirubin Indirect", unit: "mg/dl", referenceText: "0 - 0.75", inputType: "number", min: 0, max: 0.75, step: "0.01" },
      { code: "AMYLASE", name: "Amylase", unit: "U/L", referenceText: "22 - 80", inputType: "number", min: 22, max: 80, step: "1" },
      { code: "LIPASE", name: "Lipase", unit: "U/L", referenceText: "Up to 60", inputType: "number", min: 0, max: 60, step: "1" },
      { code: "CPK", name: "CPK", unit: "U/L", referenceText: "0 - 174", inputType: "number", min: 0, max: 174, step: "1" },
      { code: "LDH", name: "LDH", unit: "U/L", referenceText: "210 - 480", inputType: "number", min: 210, max: 480, step: "1" },
      { code: "FERRITIN", name: "Ferritin", unit: "ng/ml", referenceText: "24 - 350", inputType: "number", min: 24, max: 350, step: "0.1" },
      { code: "VIT_B12", name: "Vitamin B12", unit: "pg/ml", referenceText: "191 - 771", inputType: "number", min: 191, max: 771, step: "1" },
      { code: "HBA1C", name: "Glycosylated HbA1c", unit: "%", referenceText: "4.0 - 6.5", inputType: "number", min: 4.0, max: 6.5, step: "0.1" },
      { code: "VIT_D3", name: "25-Hydroxyvitamin D3", unit: "ng/ml", referenceText: "Sufficiency: 30 - 100 (<10 Def., 10-30 Insuff.)", inputType: "number", min: 30, max: 100, step: "0.1" },
    ],
  },

  // =========================================================================
  // 5. BLOOD: HORMONES (Matches PDF Page 1)
  // =========================================================================
  {
    id: "hormones",
    specimen: "BLOOD",
    sectionHeaderEn: "HORMONES",
    titleTr: "Hormon Tahlilleri (TSH, Free T4, Prolactin, BHCG)",
    titleAr: "تحاليل الهرمونات (TSH, FT4, Prolactin, BHCG)",
    titleEn: "Hormone Panel (TSH, Free T4, Prolactin, BHCG)",
    keywords: ["tsh", "ft4", "t4", "prolactin", "bhcg", "hormon", "tiroid", "هرمون"],
    parameters: [
      { code: "TSH", name: "TSHs", unit: "uIU/ml", referenceText: "0.35 - 5.1", inputType: "number", min: 0.35, max: 5.1, step: "0.01" },
      { code: "FT4", name: "Free T4, Free Thyroxin", unit: "ng/dl", referenceText: "Euthyroid: 0.87 - 1.85", inputType: "number", min: 0.87, max: 1.85, step: "0.01" },
      { code: "PROLACTIN", name: "Prolactin", unit: "ng/ml", referenceText: "3.1 - 15.0", inputType: "number", min: 3.1, max: 15.0, step: "0.1" },
      { code: "BHCG", name: "BHCG, Human Chorionic Gonadotropin", unit: "mIU/ml", referenceText: "Non-pregnant: 0 - 5.0", inputType: "number", min: 0, max: 5.0, step: "0.1" },
    ],
  },

  // =========================================================================
  // 6. BLOOD: SEROLOGY (Matches PDF Page 1)
  // =========================================================================
  {
    id: "serology",
    specimen: "BLOOD",
    sectionHeaderEn: "SEROLOGY",
    titleTr: "Seroloji (Wright, Widal, ASLO, RF, CRP)",
    titleAr: "المصول (Wright, Widal, CRP, RF, ASLO)",
    titleEn: "Serology Panel (Wright, Widal, ASLO, RF, CRP)",
    keywords: ["crp", "rf", "aslo", "wright", "widal", "seroloji", "brusella", "رايت", "فيدال"],
    parameters: [
      { code: "WRIGHT_ABORTUS", name: "Wright T. (B. Abortus)", unit: "", referenceText: "Neg.", inputType: "qualitative", qualitativeOptions: ["Neg.", "Pos. 1/80", "Pos. 1/160", "Pos. 1/320", "Pos. 1/640"], normalQualitative: "Neg." },
      { code: "WRIGHT_MELIT", name: "Wright T. (B. Melitensis)", unit: "", referenceText: "Neg.", inputType: "qualitative", qualitativeOptions: ["Neg.", "Pos. 1/80", "Pos. 1/160", "Pos. 1/320", "Pos. 1/640"], normalQualitative: "Neg." },
      { code: "WIDAL_TO", name: "Widal T. — Typhi (O)", unit: "", referenceText: "Neg.", inputType: "qualitative", qualitativeOptions: ["Neg.", "Pos. 1/80", "Pos. 1/160", "Pos. 1/320"], normalQualitative: "Neg." },
      { code: "WIDAL_TH", name: "Widal T. — Typhi (H)", unit: "", referenceText: "Neg.", inputType: "qualitative", qualitativeOptions: ["Neg.", "Pos. 1/80", "Pos. 1/160", "Pos. 1/320"], normalQualitative: "Neg." },
      { code: "WIDAL_PA", name: "Widal T. — Para A (H)", unit: "", referenceText: "Neg.", inputType: "qualitative", qualitativeOptions: ["Neg.", "Pos. 1/80", "Pos. 1/160", "Pos. 1/320"], normalQualitative: "Neg." },
      { code: "WIDAL_PB", name: "Widal T. — Para B (H)", unit: "", referenceText: "Neg.", inputType: "qualitative", qualitativeOptions: ["Neg.", "Pos. 1/80", "Pos. 1/160", "Pos. 1/320"], normalQualitative: "Neg." },
      { code: "ASLO", name: "ASLO, Antistreptolysin O (Quantitative)", unit: "IU/ml", referenceText: "0 - 200", inputType: "number", min: 0, max: 200, step: "1" },
      { code: "RF", name: "RF (Rheumatoid Factor)", unit: "IU/ml", referenceText: "less than 20", inputType: "number", min: 0, max: 20, step: "0.1" },
      { code: "CRP", name: "CRP (Quantitative)", unit: "mg/L", referenceText: "0 - 6.0", inputType: "number", min: 0, max: 6.0, step: "0.1" },
    ],
  },

  // =========================================================================
  // 7. BLOOD: IMMUNOCHEMISTRY & HEPATITIS PROFILE (Matches PDF Page 3)
  // =========================================================================
  {
    id: "immunochemistry_hepatitis",
    specimen: "BLOOD",
    sectionHeaderEn: "IMMUNOCHEMISTRY & HEPATITIS PROFILE",
    titleTr: "İmmünokimya & Hepatit Profili (HAV, HBsAg, HCV, Anti-CCP, tTG-IgA)",
    titleAr: "المناعة والتهاب الكبد الفيروسي (HAV, HBsAg, HCV, Anti-CCP)",
    titleEn: "Immunochemistry & Hepatitis Profile (HAV, HBsAg, HCV, Anti-CCP, tTG-IgA)",
    keywords: ["hbsag", "hbs", "hcv", "hav", "hepatit", "anti-ccp", "transglutaminase", "التهاب الكبد"],
    parameters: [
      { code: "TTG_IGA", name: "Transglutaminase IgA Ab", unit: "U/L", referenceText: "Negative < 20 | Positive > 20", inputType: "number", min: 0, max: 20, step: "0.1" },
      { code: "ANTI_CCP", name: "Cyclic Citrullinated Peptide Ab (Anti-CCP)", unit: "U/ml", referenceText: "Up to 10", inputType: "number", min: 0, max: 10, step: "0.1" },
      { code: "HAV_IGM", name: "HAV Ab IgM", unit: "Index", referenceText: "Negative < 0.9 | Positive > 1.2", inputType: "number", min: 0, max: 0.9, step: "0.01" },
      { code: "HBS_AG", name: "HBs Ag", unit: "Index", referenceText: "Negative < 0.1 | Positive > 0.1", inputType: "number", min: 0, max: 0.1, step: "0.01" },
      { code: "HCV_AB", name: "HCV Ab", unit: "Index", referenceText: "Negative < 1.0 | Positive > 1.0", inputType: "number", min: 0, max: 1.0, step: "0.01" },
    ],
  },

  // =========================================================================
  // 8. BLOOD: TUMOR MARKERS (Matches PDF Page 4)
  // =========================================================================
  {
    id: "tumor_markers",
    specimen: "BLOOD",
    sectionHeaderEn: "TUMOR MARKERS",
    titleTr: "Tümör Belirteçleri (AFP, CEA, PSA Total, CA 15-3, CA 19-9, CA 125)",
    titleAr: "الواسمات الورمية (AFP, CEA, PSA Total, CA 15-3, CA 19-9, CA 125)",
    titleEn: "Tumor Markers (AFP, CEA, PSA Total, CA 15-3, CA 19-9, CA 125)",
    keywords: ["afp", "cea", "psa", "ca125", "ca19", "ca15", "tumor", "tümör"],
    parameters: [
      { code: "AFP", name: "Alpha-Fetoprotein (AFP)", unit: "IU/ml", referenceText: "up to 10.9", inputType: "number", min: 0, max: 10.9, step: "0.1" },
      { code: "CEA", name: "CEA, Carcino Embryonic Antigen", unit: "ng/ml", referenceText: "Non-Smokers: Up to 3.0 | Smokers: Up to 9.8", inputType: "number", min: 0, max: 3.0, step: "0.1" },
      { code: "PSA_TOT", name: "PSA Total", unit: "ng/ml", referenceText: "Healthy Men: Up to 4.0", inputType: "number", min: 0, max: 4.0, step: "0.01" },
      { code: "CA15_3", name: "CA 15-3", unit: "U/ml", referenceText: "Up to 25", inputType: "number", min: 0, max: 25, step: "0.1" },
      { code: "CA19_9", name: "CA 19-9", unit: "U/ml", referenceText: "Up to 34.0", inputType: "number", min: 0, max: 34.0, step: "0.1" },
      { code: "CA125", name: "CA 125", unit: "U/ml", referenceText: "0.0 - 35.0", inputType: "number", min: 0, max: 35.0, step: "0.1" },
    ],
  },

  // =========================================================================
  // 9. URINE: COMPLETE URINALYSIS (TIT - Macroscopic, Strip & Microscopy)
  // =========================================================================
  {
    id: "urine_complete",
    specimen: "URINE",
    sectionHeaderEn: "URINALYSIS - COMPLETE URINE EXAMINATION",
    titleTr: "Tam İdrar Tahlili (TİT — Kimyasal Strip & Mikroskobi)",
    titleAr: "تحليل البول الكامل والراسب المجهري (Urinalysis)",
    titleEn: "Complete Urinalysis (Chemical Strip & Microscopy)",
    keywords: ["idrar", "tit", "urine", "بول"],
    parameters: [
      { code: "U_COLOR", name: "Color", unit: "", referenceText: "Yellow", inputType: "qualitative", qualitativeOptions: ["Yellow", "Pale Yellow", "Dark Amber", "Red / Hematuric"], normalQualitative: "Yellow" },
      { code: "U_APPEAR", name: "Appearance", unit: "", referenceText: "Clear", inputType: "qualitative", qualitativeOptions: ["Clear", "Slightly Cloudy", "Turbid"], normalQualitative: "Clear" },
      { code: "U_SG", name: "Specific Gravity", unit: "", referenceText: "1.005 - 1.030", inputType: "number", min: 1.005, max: 1.03, step: "0.001" },
      { code: "U_PH", name: "pH", unit: "", referenceText: "4.5 - 8.0", inputType: "number", min: 4.5, max: 8.0, step: "0.1" },
      { code: "U_PROTEIN", name: "Protein (Albumin)", unit: "", referenceText: "Neg.", inputType: "qualitative", qualitativeOptions: ["Neg.", "Trace", "+1", "+2", "+3", "+4"], normalQualitative: "Neg." },
      { code: "U_GLUCOSE", name: "Glucose", unit: "", referenceText: "Neg.", inputType: "qualitative", qualitativeOptions: ["Neg.", "Trace", "+1", "+2", "+3", "+4"], normalQualitative: "Neg." },
      { code: "U_KETONE", name: "Ketones", unit: "", referenceText: "Neg.", inputType: "qualitative", qualitativeOptions: ["Neg.", "+1", "+2", "+3"], normalQualitative: "Neg." },
      { code: "U_BIL", name: "Bilirubin", unit: "", referenceText: "Neg.", inputType: "qualitative", qualitativeOptions: ["Neg.", "+1", "+2", "+3"], normalQualitative: "Neg." },
      { code: "U_BLOOD", name: "Blood / Hemoglobin", unit: "", referenceText: "Neg.", inputType: "qualitative", qualitativeOptions: ["Neg.", "Trace", "+1", "+2", "+3"], normalQualitative: "Neg." },
      { code: "U_NITRITE", name: "Nitrite", unit: "", referenceText: "Neg.", inputType: "qualitative", qualitativeOptions: ["Neg.", "Pos."], normalQualitative: "Neg." },
      { code: "U_LEUK_EST", name: "Leukocyte Esterase", unit: "", referenceText: "Neg.", inputType: "qualitative", qualitativeOptions: ["Neg.", "+1", "+2", "+3"], normalQualitative: "Neg." },
      { code: "U_WBC_HPF", name: "WBC (Microscopy)", unit: "/HPF", referenceText: "0 - 5", inputType: "number", min: 0, max: 5, step: "1" },
      { code: "U_RBC_HPF", name: "RBC (Microscopy)", unit: "/HPF", referenceText: "0 - 3", inputType: "number", min: 0, max: 3, step: "1" },
      { code: "U_EPITH", name: "Epithelial Cells", unit: "/HPF", referenceText: "0 - 5", inputType: "number", min: 0, max: 5, step: "1" },
      { code: "U_BACTERIA", name: "Bacteria", unit: "", referenceText: "Neg.", inputType: "qualitative", qualitativeOptions: ["Neg.", "Few (+)", "Moderate (++)", "Abundant (+++)"], normalQualitative: "Neg." },
      { code: "U_CRYSTALS", name: "Crystals", unit: "", referenceText: "Neg.", inputType: "qualitative", qualitativeOptions: ["Neg.", "Calcium Oxalate (+)", "Uric Acid (+)", "Amorphous Urates (+)"], normalQualitative: "Neg." },
    ],
  },

  // =========================================================================
  // 10. MICROBIOLOGY / STOOL: H. PYLORI & STOOL EXAM
  // =========================================================================
  {
    id: "stool_microbiology",
    specimen: "MICROBIOLOGY",
    sectionHeaderEn: "STOOL & RAPID ANTIGEN EXAMINATION",
    titleTr: "Gaita & H. Pylori Antijen Testleri",
    titleAr: "فحص البراز وجرثومة المعدة (H. Pylori Antigen)",
    titleEn: "Stool & H. Pylori Antigen Examination",
    keywords: ["pylori", "gaita", "gizli kan", "stool", "براز", "جرثومة"],
    parameters: [
      { code: "H_PYLORI_AG", name: "H. Pylori Stool Antigen", unit: "", referenceText: "Neg.", inputType: "qualitative", qualitativeOptions: ["Neg.", "Pos."], normalQualitative: "Neg." },
      { code: "FOBT", name: "Fecal Occult Blood (FOBT)", unit: "", referenceText: "Neg.", inputType: "qualitative", qualitativeOptions: ["Neg.", "Pos."], normalQualitative: "Neg." },
      { code: "STOOL_PARASITE", name: "Parasite / Ova / Cyst", unit: "", referenceText: "Neg.", inputType: "qualitative", qualitativeOptions: ["Neg.", "Entamoeba histolytica (+)", "Giardia lamblia (+)"], normalQualitative: "Neg." },
      { code: "STOOL_WBC", name: "Stool Leukocytes (WBC)", unit: "/HPF", referenceText: "0 - 2", inputType: "number", min: 0, max: 2, step: "1" },
      { code: "STOOL_RBC", name: "Stool Erythrocytes (RBC)", unit: "/HPF", referenceText: "0 - 1", inputType: "number", min: 0, max: 1, step: "1" },
    ],
  },
];

/**
 * Evaluates a single parameter value against its reference range:
 * - Numeric: < min -> "LOW", > max -> "HIGH", otherwise "NORMAL"
 * - Qualitative: !== normalQualitative -> "ABNORMAL", otherwise "NORMAL"
 */
export function evaluateParameterFlag(
  def: LabParameterDef,
  rawValue: string
): "NORMAL" | "HIGH" | "LOW" | "ABNORMAL" | "EMPTY" {
  const val = (rawValue ?? "").trim();
  if (!val) return "EMPTY";

  if (def.inputType === "number") {
    const num = Number(val.replace(",", "."));
    if (!Number.isFinite(num)) return "NORMAL";
    if (def.min !== undefined && num < def.min) return "LOW";
    if (def.max !== undefined && num > def.max) return "HIGH";
    return "NORMAL";
  }

  if (def.inputType === "qualitative" && def.normalQualitative) {
    if (def.code === "U_COLOR" && (val === "Yellow" || val === "Yellow (Sarı)" || val === "Pale Yellow")) {
      return "NORMAL";
    }
    return val.toLowerCase() === def.normalQualitative.toLowerCase() ? "NORMAL" : "ABNORMAL";
  }

  return "NORMAL";
}

/**
 * Given a free-text testName ordered by a doctor (e.g. "CBC, CRP, Tam İdrar"),
 * finds the matching specimen category and panel IDs automatically.
 */
export function detectPanelsFromTestName(testName: string): {
  specimen: SpecimenCategory;
  panelIds: string[];
} {
  const lower = (testName || "").toLocaleLowerCase("tr-TR");
  const matchedPanels = LAB_PANELS_CATALOG.filter((panel) =>
    panel.keywords.some((kw) => lower.includes(kw))
  );

  if (matchedPanels.length > 0) {
    return {
      specimen: matchedPanels[0].specimen,
      panelIds: matchedPanels.map((p) => p.id),
    };
  }

  return {
    specimen: "BLOOD",
    panelIds: ["cbc_hematology"],
  };
}
