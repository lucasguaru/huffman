import './QueueView.css'
import { printableChar } from '../lib/huffman.js'

function labelFor(node) {
  if (node.char != null) return printableChar(node.char)
  return '•'
}

export default function QueueView({ queue, selectedIds, createdId }) {
  if (!queue?.length) {
    return <div className="muted2">A fila aparecerá aqui durante a execução.</div>
  }

  const selected = new Set(selectedIds || [])

  return (
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
              <div className="queueLabel mono" title={n.char ?? 'nó interno'}>
                {labelFor(n)}
              </div>
            </div>
            <div className="queueFreq">
              <span className="muted2">freq.</span>{' '}
              <span className="mono">{n.freq}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

