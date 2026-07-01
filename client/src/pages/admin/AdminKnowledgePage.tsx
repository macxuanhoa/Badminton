import { useEffect, useMemo, useState } from 'react'
import { useStore, type KnowledgeRecord, type KnowledgeSection } from '../../store/useStore'

export function AdminKnowledgePage() {
  const knowledge = useStore((s) => s.knowledge)
  const fetchKnowledge = useStore((s) => s.fetchKnowledge)
  const addKnowledge = useStore((s) => s.addKnowledge)
  const updateKnowledge = useStore((s) => s.updateKnowledge)
  const deleteKnowledge = useStore((s) => s.deleteKnowledge)
  const isLoading = useStore((s) => s.isLoading)
  const setNotification = useStore((s) => s.setNotification)

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<KnowledgeRecord | null>(null)
  const [errors, setErrors] = useState<{ title?: string; slug?: string; desc?: string; level?: string }>({})
  const [form, setForm] = useState<Omit<KnowledgeRecord, 'id' | 'createdAt'>>({
    slug: '',
    title: '',
    desc: '',
    img: '',
    readTime: '5 phút',
    level: 'NEWBIE',
    sections: [],
  })

  useEffect(() => {
    fetchKnowledge()
  }, [fetchKnowledge])

  const rows = useMemo(() => {
    return [...knowledge].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [knowledge])

  const openCreate = () => {
    setEditing(null)
    setErrors({})
    setForm({
      slug: '',
      title: '',
      desc: '',
      img: '',
      readTime: '5 phút',
      level: 'NEWBIE',
      sections: [],
    })
    setOpen(true)
  }

  const openEdit = (k: KnowledgeRecord) => {
    setEditing(k)
    setErrors({})
    setForm({
      slug: k.slug,
      title: k.title,
      desc: k.desc,
      img: k.img,
      readTime: k.readTime,
      level: k.level,
      sections: Array.isArray(k.sections) ? k.sections : [],
    })
    setOpen(true)
  }

  const addSection = () => {
    setForm((prev) => ({
      ...prev,
      sections: [...(prev.sections as KnowledgeSection[]), { heading: '', body: '' }],
    }))
  }

  const updateSection = (index: number, field: keyof KnowledgeSection, value: string) => {
    setForm((prev) => {
      const newSections = [...(prev.sections as KnowledgeSection[])]
      newSections[index] = { ...newSections[index], [field]: value }
      return { ...prev, sections: newSections }
    })
  }

  const removeSection = (index: number) => {
    setForm((prev) => ({
      ...prev,
      sections: (prev.sections as KnowledgeSection[]).filter((_, i) => i !== index),
    }))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-primary text-[10px] font-bold uppercase tracking-widest">Admin</div>
          <h1 className="text-white text-2xl font-bold tracking-tight uppercase">Kiến thức</h1>
        </div>
        <button type="button" className="btn-primary" onClick={openCreate}>
          Thêm bài viết
        </button>
      </div>

      <div className="glass rounded-2xl border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-white/5">
              <tr className="text-[10px] text-muted font-bold uppercase tracking-widest">
                <th className="px-4 py-3">Tiêu đề</th>
                <th className="px-4 py-3">Level</th>
                <th className="px-4 py-3">Thời gian đọc</th>
                <th className="px-4 py-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.map((k) => (
                <tr key={k.id} className="text-[12px]">
                  <td className="px-4 py-3 text-white font-bold">{k.title}</td>
                  <td className="px-4 py-3 text-muted">{k.level}</td>
                  <td className="px-4 py-3 text-muted">{k.readTime}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button type="button" className="btn-secondary !px-3 !py-2 !text-[10px]" onClick={() => openEdit(k)}>
                        Sửa
                      </button>
                      <button
                        type="button"
                        className="btn-secondary !px-3 !py-2 !text-[10px]"
                        onClick={async () => {
                          try {
                            await deleteKnowledge(k.id)
                            setNotification({ message: 'Đã xóa bài viết', type: 'success' })
                          } catch (err: any) {
                            setNotification({ message: err.message || 'Lỗi xóa bài viết', type: 'error' })
                          }
                        }}
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-muted">
                    Chưa có bài viết nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative glass-dark w-full max-w-3xl rounded-[28px] border border-white/10 p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <div className="text-primary text-[10px] font-bold uppercase tracking-widest">Knowledge</div>
                <h2 className="text-white text-xl font-bold tracking-tight uppercase">
                  {editing ? 'Cập nhật' : 'Tạo mới'}
                </h2>
              </div>
              <button type="button" className="btn-secondary !px-3 !py-2 !text-[10px]" onClick={() => setOpen(false)}>
                Đóng
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="label-standard">Tiêu đề</label>
                <input
                  className={`input-standard ${errors.title ? '!border-red-500/40 focus:!border-red-500 focus:!shadow-[0_0_0_3px_rgba(239,68,68,0.12)]' : ''}`}
                  value={form.title}
                  onChange={(e) => {
                    setForm((s) => ({ ...s, title: e.target.value }))
                    if (errors.title) setErrors((s) => ({ ...s, title: undefined }))
                  }}
                />
                {errors.title && (
                  <div className="mt-2 text-red-400 text-[10px] font-bold uppercase tracking-widest">{errors.title}</div>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="label-standard">Slug</label>
                <input
                  className={`input-standard ${errors.slug ? '!border-red-500/40 focus:!border-red-500 focus:!shadow-[0_0_0_3px_rgba(239,68,68,0.12)]' : ''}`}
                  value={form.slug}
                  onChange={(e) => {
                    setForm((s) => ({ ...s, slug: e.target.value }))
                    if (errors.slug) setErrors((s) => ({ ...s, slug: undefined }))
                  }}
                  placeholder="bi-quyet-chon-vot"
                />
                {errors.slug && (
                  <div className="mt-2 text-red-400 text-[10px] font-bold uppercase tracking-widest">{errors.slug}</div>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="label-standard">Mô tả ngắn</label>
                <textarea
                  className={`input-standard min-h-[80px] ${errors.desc ? '!border-red-500/40 focus:!border-red-500 focus:!shadow-[0_0_0_3px_rgba(239,68,68,0.12)]' : ''}`}
                  value={form.desc}
                  onChange={(e) => {
                    setForm((s) => ({ ...s, desc: e.target.value }))
                    if (errors.desc) setErrors((s) => ({ ...s, desc: undefined }))
                  }}
                />
                {errors.desc && (
                  <div className="mt-2 text-red-400 text-[10px] font-bold uppercase tracking-widest">{errors.desc}</div>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="label-standard">Hình ảnh</label>
                <div className="flex items-center gap-4">
                  {form.img && (
                    <div className="w-32 h-20 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                      {form.img.startsWith('http') || form.img.startsWith('data:') ? (
                        <img src={form.img} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl">{form.img}</span>
                      )}
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      value={form.img || ''}
                      onChange={(e) => setForm((s) => ({ ...s, img: e.target.value }))}
                      className="input-standard"
                      placeholder="URL ảnh hoặc emoji"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="label-standard">Thời gian đọc</label>
                <input
                  className="input-standard"
                  value={form.readTime}
                  onChange={(e) => setForm((s) => ({ ...s, readTime: e.target.value }))}
                />
              </div>

              <div>
                <label className="label-standard">Level</label>
                <select
                  className={`input-standard ${errors.level ? '!border-red-500/40 focus:!border-red-500 focus:!shadow-[0_0_0_3px_rgba(239,68,68,0.12)]' : ''}`}
                  value={form.level}
                  onChange={(e) => {
                    setForm((s) => ({ ...s, level: e.target.value as any }))
                    if (errors.level) setErrors((s) => ({ ...s, level: undefined }))
                  }}
                >
                  <option value="NEWBIE">NEWBIE</option>
                  <option value="INTERMEDIATE">INTERMEDIATE</option>
                  <option value="PRO">PRO</option>
                  <option value="ADVANCED">ADVANCED</option>
                </select>
                {errors.level && (
                  <div className="mt-2 text-red-400 text-[10px] font-bold uppercase tracking-widest">{errors.level}</div>
                )}
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="label-standard mb-0">Nội dung (Sections)</label>
                  <button type="button" className="btn-secondary !px-3 !py-1.5 !text-[10px]" onClick={addSection}>
                    + Thêm section
                  </button>
                </div>
                <div className="space-y-3">
                  {(form.sections as KnowledgeSection[]).map((section, index) => (
                    <div key={index} className="glass rounded-xl p-4 border border-white/5">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-muted text-[10px] font-bold uppercase tracking-widest">Section {index + 1}</span>
                        <button
                          type="button"
                          className="text-red-400 hover:text-red-300 text-[10px] font-bold uppercase tracking-widest"
                          onClick={() => removeSection(index)}
                        >
                          Xóa
                        </button>
                      </div>
                      <div className="space-y-2">
                        <input
                          className="input-standard !py-2 !text-[12px]"
                          placeholder="Tiêu đề section"
                          value={section.heading}
                          onChange={(e) => updateSection(index, 'heading', e.target.value)}
                        />
                        <textarea
                          className="input-standard !py-2 !text-[12px] min-h-[100px]"
                          placeholder="Nội dung section"
                          value={section.body}
                          onChange={(e) => updateSection(index, 'body', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                  {(form.sections as KnowledgeSection[]).length === 0 && (
                    <div className="text-center py-8 text-muted text-[12px]">
                      Chưa có section nào. Nhấn "Thêm section" để bắt đầu.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>
                Hủy
              </button>
              <button
                type="button"
                className="btn-primary"
                disabled={isLoading || !form.title.trim() || !form.slug.trim() || !form.desc.trim()}
                onClick={async () => {
                  try {
                    const next: { title?: string; slug?: string; desc?: string; level?: string } = {}
                    if (!form.title.trim()) next.title = 'Vui lòng nhập tiêu đề'
                    if (!form.slug.trim()) next.slug = 'Vui lòng nhập slug'
                    if (!form.desc.trim()) next.desc = 'Vui lòng nhập mô tả'
                    if (!form.level) next.level = 'Vui lòng chọn level'
                    setErrors(next)
                    if (Object.keys(next).length > 0) return

                    if (editing) {
                      await updateKnowledge(editing.id, form)
                      setNotification({ message: 'Đã cập nhật bài viết', type: 'success' })
                    } else {
                      await addKnowledge(form)
                      setNotification({ message: 'Đã thêm bài viết', type: 'success' })
                    }
                    setOpen(false)
                  } catch (err: any) {
                    setNotification({ message: err.message || 'Lỗi lưu bài viết', type: 'error' })
                  }
                }}
              >
                {isLoading ? 'ĐANG LƯU...' : 'LƯU'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
