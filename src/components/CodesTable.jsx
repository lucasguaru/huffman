import './CodesTable.css'

export default function CodesTable({ frequencies, codes, printableChar }) {
  if (!codes || !frequencies) {
    return <div className="muted2">Os códigos aparecem quando a árvore estiver pronta.</div>
  }

  const rows = Object.keys(codes)
    .map((ch) => ({
      ch,
      freq: frequencies[ch] || 0,
      code: codes[ch],
    }))
    .sort((a, b) => {
      const df = b.freq - a.freq
      if (df !== 0) return df
      return a.ch.localeCompare(b.ch)
    })

  return (
    <div className="codesWrap">
      <table className="codesTable">
        <thead>
          <tr>
            <th>Caractere</th>
            <th>Frequência</th>
            <th>Código</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.ch}>
              <td className="mono">{printableChar(r.ch)}</td>
              <td className="mono">{r.freq}</td>
              <td className="mono codeCell">{r.code}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

