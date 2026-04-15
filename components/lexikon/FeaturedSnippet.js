export default function FeaturedSnippet({ text }) {
  return (
    <div style={{borderLeft:'3px solid #10B981', background:'rgba(16,185,129,0.05)'}} className="pl-5 py-4 pr-4 rounded-r-xl mb-8">
      <p className="text-base leading-relaxed" style={{color:'rgba(232,245,240,0.9)'}}>{text}</p>
    </div>
  )
}
