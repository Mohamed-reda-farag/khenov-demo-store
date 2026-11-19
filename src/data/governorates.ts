import type { LocaleText } from './types';

export interface Governorate {
  id: string;
  name: LocaleText;
}

/** Egypt's 27 governorates, alphabetical in English. */
export const GOVERNORATES: readonly Governorate[] = [
  { id: 'alexandria', name: { ar: 'الإسكندرية', en: 'Alexandria' } },
  { id: 'aswan', name: { ar: 'أسوان', en: 'Aswan' } },
  { id: 'asyut', name: { ar: 'أسيوط', en: 'Asyut' } },
  { id: 'beheira', name: { ar: 'البحيرة', en: 'Beheira' } },
  { id: 'beni-suef', name: { ar: 'بني سويف', en: 'Beni Suef' } },
  { id: 'cairo', name: { ar: 'القاهرة', en: 'Cairo' } },
  { id: 'dakahlia', name: { ar: 'الدقهلية', en: 'Dakahlia' } },
  { id: 'damietta', name: { ar: 'دمياط', en: 'Damietta' } },
  { id: 'faiyum', name: { ar: 'الفيوم', en: 'Faiyum' } },
  { id: 'gharbia', name: { ar: 'الغربية', en: 'Gharbia' } },
  { id: 'giza', name: { ar: 'الجيزة', en: 'Giza' } },
  { id: 'ismailia', name: { ar: 'الإسماعيلية', en: 'Ismailia' } },
  { id: 'kafr-el-sheikh', name: { ar: 'كفر الشيخ', en: 'Kafr El Sheikh' } },
  { id: 'luxor', name: { ar: 'الأقصر', en: 'Luxor' } },
  { id: 'matrouh', name: { ar: 'مطروح', en: 'Matrouh' } },
  { id: 'minya', name: { ar: 'المنيا', en: 'Minya' } },
  { id: 'monufia', name: { ar: 'المنوفية', en: 'Monufia' } },
  { id: 'new-valley', name: { ar: 'الوادي الجديد', en: 'New Valley' } },
  { id: 'north-sinai', name: { ar: 'شمال سيناء', en: 'North Sinai' } },
  { id: 'port-said', name: { ar: 'بورسعيد', en: 'Port Said' } },
  { id: 'qalyubia', name: { ar: 'القليوبية', en: 'Qalyubia' } },
  { id: 'qena', name: { ar: 'قنا', en: 'Qena' } },
  { id: 'red-sea', name: { ar: 'البحر الأحمر', en: 'Red Sea' } },
  { id: 'sharqia', name: { ar: 'الشرقية', en: 'Sharqia' } },
  { id: 'sohag', name: { ar: 'سوهاج', en: 'Sohag' } },
  { id: 'south-sinai', name: { ar: 'جنوب سيناء', en: 'South Sinai' } },
  { id: 'suez', name: { ar: 'السويس', en: 'Suez' } },
];

export const GOVERNORATE_IDS = GOVERNORATES.map((g) => g.id) as [string, ...string[]];

export const governorateName = (id: string): LocaleText | undefined =>
  GOVERNORATES.find((g) => g.id === id)?.name;
