import Link from 'next/link'

export default function RelatedValues({ entries }) {
  if (!entries || entries.length === 0) return null

  return (
    <div className="my-8">
      <h2 className="text-base font-bold text-gray-700 mb-3 flex items-center gap-2">
        <span className="text-lg">🔗</span> Verwandte Laborwerte
      </h2>
      <div className="flex flex-wrap gap-2">
        {entries.map((entry) => (
          <Link
            key={entry.slug}
            href={`/lexikon/${entry.slug}`}
            className="group inline-flex items-center gap-2 bg-white border border-gray-200 hover:border-emerald-400 hover:bg-emerald-50 text-sm font-medium px-4 py-2 rounded-xl transition-all shadow-sm"
          >
            <span className="font-black text-emerald-600">{entry.acronym}</span>
            <span className="text-gray-500 text-xs">— {entry.fullName}</span>
            <span className="text-gray-300 group-hover:text-emerald-400 transition-colors text-xs">→</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
