import type { Silhouette } from '@/data/types';

/**
 * Hand-drawn side-profile silhouettes for the PLACEHOLDER image system.
 * Each shape is drawn in a 320-wide box; `fill` names a colour role resolved by ShoeArt.
 */
export type FillRole = 'upper' | 'shade' | 'light' | 'sole' | 'accent';

export interface ShoePart {
  d: string;
  fill?: FillRole;
  stroke?: FillRole;
  strokeWidth?: number;
  dash?: string;
}

export interface ShoeShape {
  width: number;
  height: number;
  parts: readonly ShoePart[];
}

export const SHOES: Record<Silhouette, ShoeShape> = {
  sneaker: {
    width: 320,
    height: 160,
    parts: [
      { d: 'M6 122H314V136Q314 150 296 150H26Q6 150 6 134Z', fill: 'sole' },
      {
        d: 'M10 122L14 62Q16 44 34 42L60 40Q72 40 80 54L90 68Q106 76 126 74L152 62L176 58Q200 56 218 68L250 90Q284 98 306 110Q314 114 314 122Z',
        fill: 'upper',
      },
      { d: 'M10 122L14 62Q16 46 32 44L44 44Q36 76 40 122Z', fill: 'shade' },
      { d: 'M252 92Q286 100 306 112Q314 116 314 122H234Q240 102 252 92Z', fill: 'shade' },
      { d: 'M64 122Q120 100 200 112L210 122Z', fill: 'accent' },
      { d: 'M150 68L166 82M168 63L184 77M186 62L202 76', stroke: 'light', strokeWidth: 5 },
      { d: 'M6 127H314', stroke: 'shade', strokeWidth: 1.5 },
    ],
  },
  runner: {
    width: 320,
    height: 160,
    parts: [
      {
        d: 'M4 126V134Q4 152 28 152H282Q300 152 312 142Q320 134 314 126Q290 104 238 104H22Q4 104 4 126Z',
        fill: 'sole',
      },
      {
        d: 'M8 108Q8 72 22 58Q30 50 46 48L66 46Q76 54 84 64Q104 74 132 68L176 56Q206 54 228 68Q270 86 300 110L300 114L8 114Z',
        fill: 'upper',
      },
      { d: 'M8 108Q8 74 22 60Q30 52 44 50Q34 80 40 114L8 114Z', fill: 'shade' },
      { d: 'M122 108L150 74M148 110L176 76M174 112L202 80', stroke: 'accent', strokeWidth: 7 },
      { d: 'M10 122Q150 134 308 122', stroke: 'light', strokeWidth: 2.5 },
    ],
  },
  boot: {
    width: 320,
    height: 172,
    parts: [
      { d: 'M8 148H314Q318 148 318 156V160Q318 172 304 172H28Q8 172 8 158Z', fill: 'sole' },
      {
        d: 'M14 28Q14 20 24 20H100Q108 20 108 28L110 84Q134 100 178 106L252 116Q304 124 314 142L316 148H10Z',
        fill: 'upper',
      },
      { d: 'M14 28Q14 20 24 20H100Q108 20 108 28V42H14Z', fill: 'shade' },
      { d: 'M250 116Q304 124 314 142L316 148H232Q244 130 250 116Z', fill: 'shade' },
      { d: 'M8 148H88V172H28Q8 172 8 158Z', fill: 'shade' },
      { d: 'M62 46V96', stroke: 'shade', strokeWidth: 3 },
      { d: 'M16 92H108', stroke: 'light', strokeWidth: 2, dash: '5 5' },
    ],
  },
  sandal: {
    width: 320,
    height: 120,
    parts: [
      { d: 'M8 92Q8 80 24 80H292Q316 82 316 98Q316 114 296 114H26Q8 114 8 100Z', fill: 'sole' },
      { d: 'M12 80Q12 68 28 68H286Q314 70 314 86L312 92H14Z', fill: 'light' },
      { d: 'M178 70Q198 26 240 26Q282 28 298 70', stroke: 'upper', strokeWidth: 18 },
      { d: 'M204 70Q216 46 240 46Q264 48 276 70', stroke: 'shade', strokeWidth: 8 },
      { d: 'M34 70Q40 40 68 38H104Q120 40 124 70', stroke: 'upper', strokeWidth: 16 },
      { d: 'M236 26h10v10h-10z', fill: 'accent' },
    ],
  },
  loafer: {
    width: 320,
    height: 140,
    parts: [
      { d: 'M8 116H312V124Q312 134 296 134H30Q8 134 8 122Z', fill: 'sole' },
      { d: 'M8 116H80V138H26Q8 138 8 126Z', fill: 'shade' },
      {
        d: 'M10 116L14 66Q16 50 34 48L60 46Q76 46 86 60Q108 82 150 82L226 82Q286 84 310 106Q316 112 312 116Z',
        fill: 'upper',
      },
      { d: 'M10 116L14 66Q16 52 32 50L42 50Q34 82 38 116Z', fill: 'shade' },
      { d: 'M118 84Q150 58 190 82L186 92Q150 74 124 94Z', fill: 'shade' },
      { d: 'M262 92Q290 96 304 108', stroke: 'light', strokeWidth: 2, dash: '4 4' },
    ],
  },
};
