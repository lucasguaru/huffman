import './QueueView.css'
import { useI18n } from '../i18n/useI18n.js'
import { printableChar } from '../lib/huffman.js'

function labelFor(node) {
  if (node.char != null) return printableChar(node.char)
  return '•'
}

export default function QueueView({ queue, selectedIds, createdId }) {
  const { t } = useI18n()
  if (!queue?.length) {
    return <div className="muted2">{t('queue.empty')}</div>
  }

  const selected = new Set(selectedIds || [])

  return (
    <div className="queueScroll">
      <div className="queueRow">
      {queue.map((n, idx) => {
        const isSelected = selected.has(n.id)
        const isCreated = createdId === n.id
        const classes = ['queueNode']
        if (isSelected) classes.push('isSelected')
        if (isCreated) classes.push('isCreated')

        return (
          <div key={n.id} className={classes.join(' ')}>
            <div className="queueTop">
              <div className="queueBadge mono">{idx + 1}</div>
              <div className="queueLabel mono" title={n.char ?? t('queue.internal')}>
                {labelFor(n)}
              </div>
            </div>
            <div className="queueFreq">
              <span className="muted2">{t('queue.freq')}</span>{' '}
              <span className="mono">{n.freq}</span>
            </div>
          </div>
        )
      })}
      </div>
    </div>
  )
}

