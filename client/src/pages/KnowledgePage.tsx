import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { knowledgePosts } from './knowledge.data'

export function KnowledgePage() {
  const [query, setQuery] = useState('')
  const [level, setLevel] = useState<'ALL' | 'NEWBIE' | 'INTERMEDIATE' | 'PRO'>('ALL')

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return knowledgePosts.filter((p) => {
      if (level !== 'ALL' && p.level !== level) return false
      if (!q) return true
      return `${p.title} ${p.desc}`.toLowerCase().includes(q)
    })
  }, [query, level])

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="space-y-2">
          <div className="text-primary text-[10px] font-bold uppercase tracking-[0.2em]">Knowledge</div>
          <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight">
            Kiến Thức <span className="text-primary italic">& Kỹ Thuật</span>
          </h1>
          <p className="text-slate-500 text-sm max-w-2xl">
            Bộ sưu tập bài viết giúp bạn nâng cấp kỹ thuật, chiến thuật và tư duy thi đấu.
          </p>
        </div>
        <Link to="/" className="btn-secondary !px-5 !py-3 !text-[10px]">
          ← Trang chủ
        </Link>
      </div>

      <div className="sticky top-[88px] z-[120] mb-8">
        <div className="glass rounded-3xl border-white/5 p-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-6">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="input-standard !py-3"
                placeholder="Tìm bài viết theo tiêu đề, mô tả..."
              />
            </div>
            <div className="md:col-span-6 flex items-center justify-start md:justify-end gap-2 flex-wrap">
              {(['ALL', 'NEWBIE', 'INTERMEDIATE', 'PRO'] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setLevel(k)}
                  className={`px-3 py-2 rounded-2xl border text-[10px] font-bold uppercase tracking-widest transition-all ${
                    level === k ? 'bg-primary/15 border-primary/30 text-primary' : 'bg-white/5 border-white/10 text-gray-500 hover:bg-white/10'
                  }`}
                >
                  {k === 'ALL' ? 'Tất cả' : k}
                </button>
              ))}
              <div className="text-muted text-[10px] font-bold uppercase tracking-widest">
                {rows.length} bài
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rows.map((p) => (
          <Link
            key={p.slug}
            to={`/knowledge/${p.slug}`}
            className="group glass rounded-3xl border border-white/5 overflow-hidden hover:border-white/10 transition-all block"
          >
            <div className="aspect-[21/9] overflow-hidden relative">
              <img
                src={p.img}
                alt={p.title}
                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                onError={(e) => {
                  e.currentTarget.src = '/images/badminton-hero.svg'
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/30 to-transparent" />
              <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between gap-3">
                <div className="text-white text-[10px] font-bold uppercase tracking-widest">{p.readTime}</div>
                <div className="px-2.5 py-1 rounded-full border border-white/10 text-[10px] font-bold uppercase tracking-widest text-muted bg-black/30">
                  {p.level}
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="text-white font-black text-xl tracking-tight">{p.title}</div>
              <div className="text-slate-500 text-sm leading-relaxed mt-2">{p.desc}</div>
              <div className="mt-4 text-primary text-[10px] font-bold uppercase tracking-widest group-hover:underline">
                Đọc tiếp →
              </div>
            </div>
          </Link>
        ))}
        {rows.length === 0 && (
          <div className="md:col-span-2 glass rounded-3xl border border-dashed border-white/10 p-14 text-center">
            <div className="text-gray-500 font-bold uppercase tracking-widest text-sm">Không có bài viết phù hợp</div>
            <div className="text-gray-600 text-xs mt-2">Thử đổi từ khóa hoặc bộ lọc.</div>
          </div>
        )}
      </div>
    </div>
  )
}
