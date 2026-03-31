export function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h1 className="text-white font-extrabold text-2xl">{title}</h1>
        <p className="text-gray-300 mt-2">Đang hoàn thiện.</p>
      </div>
    </div>
  )
}

