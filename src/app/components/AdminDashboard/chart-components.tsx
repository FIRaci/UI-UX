function niceTicks(max: number, count = 4): number[] {
  const raw = max / count;
  const pow = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / pow;
  const step = (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * pow;
  const top = Math.ceil(max / step) * step;
  return Array.from({ length: count + 1 }, (_, i) => Math.round((top * i) / count));
}

export function BarChartSimple({ data, labelKey }: { data: any[]; labelKey: string }) {
  const maxVal = Math.max(...data.map(d => d.v));
  const ticks = niceTicks(maxVal, 4);
  const top = ticks[ticks.length - 1];
  return (
    <div className="h-full w-full flex">
      <div className="flex flex-col justify-between py-2 pr-3 text-[10px] text-slate-400 font-bold tabular-nums text-right">
        {[...ticks].reverse().map(t => <span key={t}>{t}M</span>)}
      </div>
      <div className="flex-1 flex flex-col">
        <div className="flex-1 relative">
          {ticks.map((t, idx) => (
            <div
              key={t}
              className="absolute left-0 right-0 border-t border-slate-100"
              style={{ bottom: `${(idx / (ticks.length - 1)) * 100}%` }}
            />
          ))}
          <div className="absolute inset-0 flex items-end gap-5 px-3">
            {data.map((d, i) => {
              const h = (d.v / top) * 100;
              return (
                <div key={`${d[labelKey]}-${i}`} className="flex-1 h-full flex flex-col justify-end items-center group relative">
                  <div className="absolute -top-6 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none transform translate-y-1 group-hover:translate-y-0">
                    <div className="px-2 py-0.5 rounded-lg bg-slate-900 text-white text-[10px] font-bold shadow-md whitespace-nowrap">
                      {d.v}M
                    </div>
                  </div>
                  <div
                    className="w-full max-w-10 rounded-t-lg bg-gradient-to-t from-sky-600 via-sky-500 to-sky-400 hover:from-sky-700 hover:to-sky-500 transition-all duration-300 shadow-sm"
                    style={{ height: `${h}%` }}
                  />
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex gap-5 px-3 mt-2 border-t border-slate-100 pt-1.5">
          {data.map((d, i) => (
            <span key={`${d[labelKey]}-${i}`} className="flex-1 text-center text-[10px] text-slate-400 font-bold">{d[labelKey]}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function LineChartSimple({ data, labelKey }: { data: any[]; labelKey: string }) {
  const maxVal = Math.max(...data.map(d => d.v));
  const minVal = Math.min(...data.map(d => d.v));
  const ticks = niceTicks(maxVal, 4);
  const top = ticks[ticks.length - 1];
  const W = 600, H = 220, padL = 12, padR = 12, padT = 16, padB = 8;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const step = innerW / Math.max(1, data.length - 1);
  const y = (v: number) => padT + (1 - v / top) * innerH;
  const points = data.map((d, i) => `${padL + i * step},${y(d.v)}`).join(" ");
  const area = `${padL},${padT + innerH} ${points} ${padL + (data.length - 1) * step},${padT + innerH}`;

  return (
    <div className="h-full w-full flex">
      <div className="flex flex-col justify-between py-1 pr-3 text-[10px] text-slate-400 font-bold tabular-nums text-right">
        {[...ticks].reverse().map(t => <span key={t}>{t}</span>)}
      </div>
      <div className="flex-1 flex flex-col">
        <div className="flex-1 relative">
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </linearGradient>
            </defs>
            {ticks.map((t, idx) => {
              const yy = padT + (1 - idx / (ticks.length - 1)) * innerH;
              return <line key={t} x1={padL} x2={padL + innerW} y1={yy} y2={yy} stroke="#f1f5f9" strokeDasharray="3 3" strokeWidth="1" />;
            })}
            <polygon points={area} fill="url(#lineFill)" />
            <polyline fill="none" stroke="#10b981" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" points={points} />
            {data.map((d, i) => (
              <g key={`${d[labelKey]}-${i}`} className="group">
                <circle cx={padL + i * step} cy={y(d.v)} r="5" fill="white" stroke="#10b981" strokeWidth="3" />
                <circle cx={padL + i * step} cy={y(d.v)} r="12" fill="transparent" className="cursor-pointer">
                  <title>{`${d[labelKey]}: ${d.v}`}</title>
                </circle>
              </g>
            ))}
          </svg>
        </div>
        <div className="flex mt-2 border-t border-slate-100 pt-1.5">
          {data.map((d, i) => (
            <span key={`${d[labelKey]}-${i}`} className="flex-1 text-center text-[10px] text-slate-400 font-bold">{d[labelKey]}</span>
          ))}
        </div>
        <div className="text-[9px] font-bold text-slate-400 mt-1 text-right uppercase tracking-wider">Tối thiểu: {minVal} • Tối đa: {maxVal}</div>
      </div>
    </div>
  );
}
