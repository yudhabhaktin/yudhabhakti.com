import { SCENES } from '../src/components/rag/scenes';

const boxes = [
  { name: 'phone', W: 337, H: 388, pad: 14, tall: true, still: false },
  { name: 'tablet', W: 700, H: 480, pad: 18, tall: false, still: false },
  { name: 'desktop', W: 1160, H: 560, pad: 20, tall: false, still: false },
  { name: 'narrow', W: 292, H: 360, pad: 12, tall: true, still: false },
];

let bad = 0;
for (const [i, s] of SCENES.entries()) {
  const line: string[] = [];
  for (const b of boxes) {
    try {
      const els = s.els(b as never);
      if (!Array.isArray(els) || els.length === 0) throw new Error('empty');
      const finite = els.every((e: never) => JSON.stringify(e).includes('NaN') === false);
      line.push(`${b.name}=${els.length}${finite ? '' : ':NaN'}`);
    } catch (err) {
      bad++;
      line.push(`${b.name}=THROW(${(err as Error).message.slice(0, 60)})`);
    }
  }
  console.log(`${String(i + 1).padStart(2)} ${s.id.padEnd(10)} ${line.join('  ')}`);
}
console.log('scenes:', SCENES.length, 'problems:', bad);
