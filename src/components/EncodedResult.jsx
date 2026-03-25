import './EncodedResult.css'

export default function EncodedResult({ text, encodedText, bitsSummary }) {
  if (!encodedText) {
    return <div className="muted2">O texto codificado aparece no final.</div>
  }

  return (
    <div className="encodedWrap fadeIn">
      <div className="encodedBlock">
        <div className="encodedLabel">Texto original</div>
        <div className="encodedText mono">{text || '—'}</div>
      </div>

      <div className="encodedBlock">
        <div className="encodedLabel">Texto codificado (bits)</div>
        <div className="encodedBits mono">{encodedText}</div>
      </div>

      {bitsSummary && (
        <div className="encodedStats">
          <div className="stat">
            <div className="statK">Chars</div>
            <div className="statV mono">{bitsSummary.n}</div>
          </div>
          <div className="stat">
            <div className="statK">Símbolos</div>
            <div className="statV mono">{bitsSummary.unique}</div>
          </div>
          <div className="stat">
            <div className="statK">Antes (ASCII)</div>
            <div className="statV mono">{bitsSummary.asciiBits} bits</div>
          </div>
          <div className="stat">
            <div className="statK">Depois (Huffman)</div>
            <div className="statV mono">{bitsSummary.huffmanBits} bits</div>
          </div>
        </div>
      )}
    </div>
  )
}

