import './FrequencyView.css'
import { printableChar } from '../lib/huffman.js'

export default function FrequencyView({ frequencies }) {
  if (!frequencies) {
    return <div className="muted2">Gere a animação para ver as frequências.</div>
  }

  const entries = Object.entries(frequencies).sort((a, b) => {
    const df = b[1] - a[1]
    if (df !== 0) return df
    return a[0].localeCompare(b[0])
  })

  return (
    <div className="freqGrid">
      {entries.map(([ch, count]) => (
        <div key={ch} className="freqCard">
          <div className="freqChar mono" title={ch === ' ' ? 'Espaço' : ch}>
            {printableChar(ch)}
          </div>
          <div className="freqCount">
            <span className="muted2">freq.</span> <span className="mono">{count}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

