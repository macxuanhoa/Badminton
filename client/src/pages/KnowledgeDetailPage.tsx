import { Link, useParams } from 'react-router-dom'
import { knowledgePosts } from './knowledge.data'

export function KnowledgeDetailPage() {
  const { slug } = useParams()
  const post = knowledgePosts.find((p) => p.slug === slug) || null

  if (!post) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="glass rounded-3xl border border-white/5 p-10 text-center">
          <div className="text-white font-black text-2xl tracking-tight">Không tìm thấy bài viết</div>
          <div className="text-muted text-sm mt-2">Bài viết đã bị xoá hoặc đường dẫn không đúng.</div>
          <div className="mt-6">
            <Link to="/knowledge" className="btn-primary">
              Quay lại danh sách
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex items-center justify-between gap-4 mb-8">
        <Link to="/knowledge" className="btn-secondary !px-4 !py-2.5 !text-[10px]">
          ← Knowledge
        </Link>
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded-full border border-white/10 text-[10px] font-bold uppercase tracking-widest text-muted bg-white/5">
            {post.level}
          </div>
          <div className="px-2.5 py-1 rounded-full border border-white/10 text-[10px] font-bold uppercase tracking-widest text-muted bg-white/5">
            {post.readTime}
          </div>
        </div>
      </div>

      <div className="glass rounded-[36px] border border-white/5 overflow-hidden">
        <div className="aspect-[21/9] overflow-hidden relative">
          <img
            src={post.img}
            alt={post.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = '/images/badminton-hero.svg'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent" />
        </div>
        <div className="p-8 md:p-10">
          <h1 className="text-white font-black text-3xl md:text-4xl tracking-tight leading-tight">
            {post.title}
          </h1>
          <p className="text-slate-400 text-base leading-relaxed mt-4">{post.desc}</p>

          <div className="mt-10 space-y-8">
            {post.sections.map((s) => (
              <div key={s.heading} className="space-y-3">
                <div className="text-white font-bold text-lg tracking-tight">{s.heading}</div>
                <div className="text-slate-400 text-sm leading-relaxed">{s.body}</div>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <div className="text-primary text-[10px] font-bold uppercase tracking-widest">Gợi ý luyện tập</div>
            <div className="text-white font-bold mt-2">Áp dụng 10 phút mỗi buổi</div>
            <div className="text-slate-400 text-sm leading-relaxed mt-2">
              Chọn 1 ý trong bài và luyện chậm – đúng – đều. Tăng tốc độ sau khi cảm giác tay ổn định.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

