import { dimensionOrder, dimensionMeta } from '@/data/dimensions';

interface PatternVizProps {
  pattern: string;
  className?: string;
}

const levelColor: Record<string, string> = {
  L: 'bg-blue-500/80',
  M: 'bg-yellow-500/80',
  H: 'bg-emerald-500/80',
};

const levelLabel: Record<string, string> = {
  L: 'L',
  M: 'M',
  H: 'H',
};

export default function PatternViz({ pattern, className = '' }: PatternVizProps) {
  const levels = pattern.replace(/-/g, '').split('');

  return (
    <div className={`grid grid-cols-5 gap-1 ${className}`}>
      {levels.map((level, i) => {
        const dim = dimensionOrder[i];
        const shortName = dimensionMeta[dim]?.name.split(' ')[0] || dim;
        return (
          <div key={dim} className="flex flex-col items-center gap-0.5">
            <span className="text-[10px] text-zinc-500">{shortName}</span>
            <div
              className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold text-white ${levelColor[level]}`}
            >
              {levelLabel[level]}
            </div>
          </div>
        );
      })}
    </div>
  );
}
