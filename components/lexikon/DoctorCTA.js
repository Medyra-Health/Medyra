import Link from 'next/link'

export default function DoctorCTA({ slug }) {
  return (
    <div style={{border:'1px solid rgba(16,185,129,0.3)', background:'rgba(16,185,129,0.05)'}} className="rounded-2xl p-7 my-10 text-center">
      <h3 className="text-xl font-bold mb-2" style={{color:'#E8F5F0'}}>Sie haben einen kompletten Befund?</h3>
      <p className="text-sm mb-5" style={{color:'rgba(232,245,240,0.7)'}}>Medyra erklärt Ihren gesamten Laborbericht in einfacher Sprache und bereitet Fragen für Ihren Arzttermin vor.</p>
      <Link
        href={`/upload?source=lexikon&term=${slug}`}
        className="inline-block font-bold px-8 py-3 rounded-xl text-sm transition-colors"
        style={{background:'#10B981', color:'#040C08'}}
      >
        Befund jetzt hochladen — kostenlos starten
      </Link>
    </div>
  )
}
