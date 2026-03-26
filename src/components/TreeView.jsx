import { useMemo } from 'react'
import './TreeView.css'
import { printableChar } from '../lib/huffman.js'

/**
 * Coordenadas do SVG = pixels na tela (escala 1:1; o SVG não é mais esticado pelo container).
 * Assim círculos e espaçamento horizontal não encolhem quando a árvore cresce.
 */
const NODE_RADIUS = 22
/** Distância horizontal entre centros de duas folhas adjacentes na base (px) */
const LEAF_GAP_X = 88
/** Espaço entre subárvores na floresta (px) */
const FOREST_SUBTREE_GAP = 80
/** Distância vertical entre níveis da árvore (px) */
const LEVEL_GAP_Y = 80
/**
 * Do centro da folha até o ponto mais baixo (rótulo de frequência em y≈20 + altura do texto).
 * Não somar NODE_RADIUS de novo — evita faixa vazia grande no rodapé do SVG.
 */
const LEAF_VISUAL_EXTENT_BELOW = 36
/** Margem inferior do SVG abaixo do último rótulo (px) */
const SVG_PAD_BOTTOM = 16

function isLeaf(node) {
  return node && !node.left && !node.right
}

function layoutTree(nodesById, rootId, levelGapY = LEVEL_GAP_Y) {
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
  leafOrder.forEach((id, i) => leafX.set(id, i * LEAF_GAP_X))

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
  /*
   * Altura: centros da raiz em pad, folhas mais fundas em pad + maxDepth*levelGapY;
   * abaixo do centro da folha só precisamos cobrir rótulos + margem (sem duplicar NODE_RADIUS).
   */
  const height = pad + maxDepth * levelGapY + LEAF_VISUAL_EXTENT_BELOW + SVG_PAD_BOTTOM

  const byId = new Map(nodes.map((n) => [n.id, n]))
  const edgesAbs = edges.map((e) => {
    const a = byId.get(e.from)
    const b = byId.get(e.to)
    return { ...e, ax: a?.x ?? 0, ay: a?.y ?? 0, bx: b?.x ?? 0, by: b?.y ?? 0 }
  })

  return { nodes, edges: edgesAbs, width, height }
}

function layoutForest(nodesById, rootId, forestIds, levelGapY = LEVEL_GAP_Y) {
  if (rootId) return layoutTree(nodesById, rootId, levelGapY)
  const roots = (forestIds || []).filter((id) => nodesById?.[id])
  if (!roots.length) return { nodes: [], edges: [], width: 0, height: 0 }

  const gap = FOREST_SUBTREE_GAP
  let offsetX = 0
  let maxH = 0

  const allNodes = []
  const allEdges = []

  for (const r of roots) {
    const one = layoutTree(nodesById, r, levelGapY)
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

function edgeKey(from, to) {
  return `${from}>${to}`
}

export default function TreeView({
  nodesById,
  rootId,
  forestIds,
  highlightIds,
  pathEdges = null,
}) {
  const { nodes, edges, width, height } = useMemo(
    () => layoutForest(nodesById || {}, rootId, forestIds, LEVEL_GAP_Y),
    [nodesById, rootId, forestIds],
  )

  const highlights = new Set(highlightIds || [])
  const pathEdgeSet = useMemo(() => {
    if (!pathEdges?.length) return null
    return new Set(pathEdges.map((e) => edgeKey(e.from, e.to)))
  }, [pathEdges])

  const pathNodeIds = useMemo(() => {
    if (!pathEdges?.length || !rootId) return null
    const s = new Set([rootId])
    for (const e of pathEdges) {
      s.add(e.to)
    }
    return s
  }, [pathEdges, rootId])

  if (!rootId && (!forestIds || forestIds.length === 0)) {
    return (
      <div className="treeEmpty">
        <div className="muted2">A árvore vai surgindo conforme os nós são combinados.</div>
      </div>
    )
  }

  const vbW = Math.max(width, 1)
  const vbH = Math.max(height, 1)

  const edgeOffset = NODE_RADIUS - 4

  return (
    <div className="treeWrap fadeIn">
      <svg
        className="treeSvg"
        width={vbW}
        height={vbH}
        viewBox={`0 0 ${vbW} ${vbH}`}
        preserveAspectRatio="xMinYMin meet"
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
          const onPath = pathEdgeSet?.has(edgeKey(e.from, e.to))
          return (
            <g key={`${e.from}_${e.to}`} className={onPath ? 'treePath' : undefined}>
              <path
                className={`treeEdge${onPath ? ' isPath' : ''}`}
                d={`M ${e.ax} ${e.ay + edgeOffset} C ${e.ax} ${my} ${e.bx} ${my} ${e.bx} ${e.by - edgeOffset}`}
              />
              <g transform={`translate(${mx}, ${my - 10})`}>
                <rect
                  className={`treeBitPill${onPath ? ' isPath' : ''}`}
                  x={-10}
                  y={-10}
                  width={20}
                  height={18}
                  rx={9}
                />
                <text className={`treeBitText${onPath ? ' isPath' : ''}`} textAnchor="middle" dominantBaseline="central">
                  {e.bit}
                </text>
              </g>
            </g>
          )
        })}

        {nodes.map((n) => {
          const selected = highlights.has(n.id)
          const onPath = pathNodeIds?.has(n.id)
          const cls = ['treeNode']
          if (n.leaf) cls.push('isLeaf')
          if (selected) cls.push('isSelected')
          if (onPath) cls.push('isPath')
          return (
            <g key={n.id} transform={`translate(${n.x}, ${n.y})`} className={cls.join(' ')}>
              <circle r={NODE_RADIUS} className="treeCircle" filter="url(#softShadow)" />
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

