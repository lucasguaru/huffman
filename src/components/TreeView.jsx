import { useMemo } from 'react'
import './TreeView.css'
import { printableChar } from '../lib/huffman.js'

function isLeaf(node) {
  return node && !node.left && !node.right
}

function layoutTree(nodesById, rootId) {
  if (!rootId || !nodesById[rootId]) return { nodes: [], edges: [], width: 0, height: 0 }

  // Primeiro: medir "folhas" para espaçar bem no eixo X
  const leafOrder = []
  function collectLeaves(id) {
    const n = nodesById[id]
    if (!n) return
    if (isLeaf(n)) {
      leafOrder.push(id)
      return
    }
    if (n.left) collectLeaves(n.left)
    if (n.right) collectLeaves(n.right)
  }
  collectLeaves(rootId)

  const leafX = new Map()
  const gapX = 86
  leafOrder.forEach((id, i) => leafX.set(id, i * gapX))

  const positions = new Map()
  const depthOf = new Map()

  function place(id, depth) {
    const n = nodesById[id]
    if (!n) return 0
    depthOf.set(id, depth)
    if (isLeaf(n)) {
      const x = leafX.get(id) ?? 0
      positions.set(id, { x, y: depth })
      return x
    }
    const leftX = n.left ? place(n.left, depth + 1) : 0
    const rightX = n.right ? place(n.right, depth + 1) : leftX
    const x = (leftX + rightX) / 2
    positions.set(id, { x, y: depth })
    return x
  }

  place(rootId, 0)

  let maxDepth = 0
  let maxX = 0
  for (const [id, pos] of positions.entries()) {
    maxDepth = Math.max(maxDepth, pos.y)
    maxX = Math.max(maxX, pos.x)
  }

  const pad = 44
  const levelGapY = 88

  const nodes = []
  const edges = []
  for (const [id, pos] of positions.entries()) {
    const n = nodesById[id]
    const x = pad + pos.x
    const y = pad + pos.y * levelGapY
    nodes.push({
      id,
      x,
      y,
      freq: n.freq,
      char: n.char ?? null,
      left: n.left ?? null,
      right: n.right ?? null,
      depth: pos.y,
      leaf: isLeaf(n),
    })
    if (n.left) edges.push({ from: id, to: n.left, bit: '0' })
    if (n.right) edges.push({ from: id, to: n.right, bit: '1' })
  }

  const width = pad * 2 + Math.max(maxX, 0)
  const height = pad * 2 + (maxDepth + 1) * levelGapY

  const byId = new Map(nodes.map((n) => [n.id, n]))
  const edgesAbs = edges.map((e) => {
    const a = byId.get(e.from)
    const b = byId.get(e.to)
    return { ...e, ax: a?.x ?? 0, ay: a?.y ?? 0, bx: b?.x ?? 0, by: b?.y ?? 0 }
  })

  return { nodes, edges: edgesAbs, width, height }
}

function layoutForest(nodesById, rootId, forestIds) {
  if (rootId) return layoutTree(nodesById, rootId)
  const roots = (forestIds || []).filter((id) => nodesById?.[id])
  if (!roots.length) return { nodes: [], edges: [], width: 0, height: 0 }

  const gap = 80
  let offsetX = 0
  let maxH = 0

  const allNodes = []
  const allEdges = []

  for (const r of roots) {
    const one = layoutTree(nodesById, r)
    for (const n of one.nodes) allNodes.push({ ...n, x: n.x + offsetX })
    for (const e of one.edges)
      allEdges.push({
        ...e,
        ax: e.ax + offsetX,
        bx: e.bx + offsetX,
      })
    offsetX += one.width + gap
    maxH = Math.max(maxH, one.height)
  }

  return { nodes: allNodes, edges: allEdges, width: Math.max(offsetX - gap, 0), height: maxH }
}

export default function TreeView({ nodesById, rootId, forestIds, highlightIds }) {
  const { nodes, edges, width, height } = useMemo(
    () => layoutForest(nodesById || {}, rootId, forestIds),
    [nodesById, rootId, forestIds],
  )

  const highlights = new Set(highlightIds || [])

  if (!rootId && (!forestIds || forestIds.length === 0)) {
    return (
      <div className="treeEmpty">
        <div className="muted2">A árvore vai surgindo conforme os nós são combinados.</div>
      </div>
    )
  }

  const vbW = Math.max(width, 520)
  const vbH = Math.max(height, 260)

  return (
    <div className="treeWrap fadeIn">
      <svg
        className="treeSvg"
        viewBox={`0 0 ${vbW} ${vbH}`}
        preserveAspectRatio="xMidYMin meet"
        style={{ aspectRatio: `${vbW} / ${vbH}` }}
        role="img"
        aria-label="Árvore de Huffman"
      >
        <defs>
          <filter id="softShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="rgba(15,23,42,0.16)" />
          </filter>
          <linearGradient id="nodeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.98)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.78)" />
          </linearGradient>
        </defs>

        {edges.map((e) => {
          const mx = (e.ax + e.bx) / 2
          const my = (e.ay + e.by) / 2
          return (
            <g key={`${e.from}_${e.to}`}>
              <path
                className="treeEdge"
                d={`M ${e.ax} ${e.ay + 18} C ${e.ax} ${my} ${e.bx} ${my} ${e.bx} ${e.by - 18}`}
              />
              <g transform={`translate(${mx}, ${my - 10})`}>
                <rect className="treeBitPill" x={-10} y={-10} width={20} height={18} rx={9} />
                <text className="treeBitText" textAnchor="middle" dominantBaseline="central">
                  {e.bit}
                </text>
              </g>
            </g>
          )
        })}

        {nodes.map((n) => {
          const selected = highlights.has(n.id)
          const cls = ['treeNode']
          if (n.leaf) cls.push('isLeaf')
          if (selected) cls.push('isSelected')
          return (
            <g key={n.id} transform={`translate(${n.x}, ${n.y})`} className={cls.join(' ')}>
              <circle r="22" className="treeCircle" filter="url(#softShadow)" />
              <text className="treeMain" textAnchor="middle" dominantBaseline="central">
                {n.leaf ? printableChar(n.char) : n.freq}
              </text>
              {n.leaf && (
                <text className="treeSub mono" textAnchor="middle" dominantBaseline="hanging" y="20">
                  {n.freq}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

