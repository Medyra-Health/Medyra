import Link from 'next/link'

export default function RelatedValues({ entries }) {
  if (!entries || entries.length === 0) return null

  return (
    <div className="my-8">
      <h2 className="text-base font-semibold mb-3" style={{color:'rgba(232,245,240,0.7)'}}>Verwandte Laborwerte</h2>
      <div className="flex flex-wrap gap-2">
        {entries.map((entry) => (
          <Link
            key={entry.slug}
            href={`/lexikon/${entry.slug}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-1.5 rounded-full transition-colors"
            style={{
              background: 'rgba(16,185,129,0.08)',
              border: '1px solid rgba(16,185,129,0.2)',
              color: '#10B981',
            }}
          >
            <span style={{fontWeight:700}}>{entry.acronym}</span>
            <span style={{color:'rgba(232,245,240,0.5)', fontSize:'0.75rem'}}>— {entry.fullName}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
