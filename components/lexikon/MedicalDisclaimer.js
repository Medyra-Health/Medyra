export default function MedicalDisclaimer() {
  return (
    <div className="mt-10 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
      <div className="flex items-start gap-3">
        <span className="text-xl flex-shrink-0">⚠️</span>
        <div>
          <p className="text-xs font-bold text-amber-800 mb-1">Medizinischer Hinweis</p>
          <p className="text-xs text-amber-700 leading-relaxed">
            Die Inhalte dieser Seite dienen ausschließlich zur allgemeinen Information und ersetzen keine professionelle medizinische Beratung, Diagnose oder Behandlung. Wenden Sie sich bei gesundheitlichen Fragen immer an Ihren Arzt oder Apotheker. Laborwerte sollten stets im Kontext Ihrer persönlichen Krankengeschichte bewertet werden.
          </p>
        </div>
      </div>
    </div>
  )
}
