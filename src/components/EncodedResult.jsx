import './EncodedResult.css'

function prefixBits(text, codes, lastInclusiveIdx) {
  if (!text || !codes || lastInclusiveIdx < 0) return ''
  let s = ''
  const n = Math.min(lastInclusiveIdx, text.length - 1)
  for (let i = 0; i <= n; i++) s += codes[text[i]] ?? ''
  return s
}

export default function EncodedResult({
  text,
  codes = null,
  encodedText,
  bitsSummary,
  /** Índice do caractere do texto original em destaque (passo a passo da codificação) */
  encodeCharIndex = null,
  /** Se true, mostra estatísticas de bits (só no último passo) */
  showStats = false,
}) {
  const hasBits = encodedText != null && encodedText !== ''

  const encodedBitsParts =
    hasBits &&
    codes &&
    encodeCharIndex != null &&
    encodeCharIndex >= 0 &&
    text &&
    encodeCharIndex < text.length
      ? (() => {
          const prev =
            encodeCharIndex > 0 ? prefixBits(text, codes, encodeCharIndex - 1) : ''
          const added = encodedText.slice(prev.length)
          if (added.length === 0 && encodedText.length > 0) return null
          return { prev, added }
        })()
      : null

  if (!hasBits && encodeCharIndex == null) {
    return <div className="muted2">O texto codificado aparece ao montar o resultado.</div>
  }

  return (
    <div className="encodedWrap fadeIn">
      <div className="encodedBlock">
        <div className="encodedLabel">Texto original</div>
        <div className="encodedText mono encodedTextPick">
          {Array.from(text || '').map((ch, i) => (
            <span
              key={`${i}-${ch}`}
              className={encodeCharIndex === i ? 'encodedCharHi' : undefined}
            >
              {ch}
            </span>
          ))}
        </div>
      </div>

      <div className="encodedBlock">
        <div className="encodedLabel">Texto codificado (bits)</div>
        <div className="encodedBits mono">
          {!hasBits ? (
            '—'
          ) : encodedBitsParts ? (
            <>
              {encodedBitsParts.prev ? (
                <span className="encodedBitsPrev">{encodedBitsParts.prev}</span>
              ) : null}
              <span className="encodedBitsNew">{encodedBitsParts.added}</span>
            </>
          ) : (
            encodedText
          )}
        </div>
      </div>

      {showStats && bitsSummary && (
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
