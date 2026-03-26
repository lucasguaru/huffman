import './CodesTable.css'
import { useI18n } from '../i18n/useI18n.js'

export default function CodesTable({ frequencies, codes, printableChar, highlightChar }) {
  const { t } = useI18n()

  if (!codes || !frequencies) {
    return <div className="muted2">{t('codesTable.empty')}</div>
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
            <th>{t('codesTable.char')}</th>
            <th>{t('codesTable.freq')}</th>
            <th>{t('codesTable.code')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.ch}
              className={highlightChar != null && r.ch === highlightChar ? 'codesRowActive' : undefined}
            >
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
