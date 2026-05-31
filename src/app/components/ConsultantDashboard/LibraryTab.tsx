import { Card } from "../ui/card";
import { ARTICLES, type Article } from "./constants";

interface LibraryTabProps {
  onReadArticle: (a: Article) => void;
}

export function LibraryTab({ onReadArticle }: LibraryTabProps) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
      {ARTICLES.map((a, i) => (
        <Card
          key={i}
          className="overflow-hidden bg-white border border-slate-100 hover:border-emerald-100 hover:shadow-md transition-all duration-300 cursor-pointer group"
          style={{ borderRadius: "16px" }}
          onClick={() => onReadArticle(a)}
        >
          <div className="h-32 relative overflow-hidden">
            <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.04]" style={{ background: a.cover }} />
            <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition" />
            <span className="absolute top-3.5 left-3.5 px-2.5 py-0.5 rounded-lg bg-white/90 backdrop-blur text-xs font-bold text-slate-700 border border-white/20 shadow-sm">{a.c}</span>
          </div>
          <div className="p-4">
            <h4 className="font-bold text-slate-800 text-sm tracking-tight group-hover:text-emerald-600 transition-colors line-clamp-1">{a.t}</h4>
            <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">{a.lead}</p>
            <div className="text-xs mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between font-semibold">
              <span className="text-slate-600">{a.author}</span>
              <span className="text-slate-500 bg-slate-50 px-2 py-0.5 rounded">{a.d}</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
