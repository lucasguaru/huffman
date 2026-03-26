import { stepCopy } from '../i18n/messages.js'

function makeId(prefix, n) {
  return `${prefix}_${n}`
}

export function printableChar(ch) {
  if (ch === ' ') return '␠'
  if (ch === '\n') return '␤'
  if (ch === '\t') return '⇥'
  return ch
}

function countFrequencies(text) {
  const freq = {}
  for (const ch of text) {
    freq[ch] = (freq[ch] || 0) + 1
  }
  return freq
}

function sortedEntriesByFreq(freq) {
  return Object.entries(freq).sort((a, b) => {
    const df = a[1] - b[1]
    if (df !== 0) return df
    return a[0].localeCompare(b[0])
  })
}

function stableQueueSort(nodes) {
  return [...nodes].sort((a, b) => {
    const df = a.freq - b.freq
    if (df !== 0) return df
    const aKey = a.char ?? a.id
    const bKey = b.char ?? b.id
    return String(aKey).localeCompare(String(bKey))
  })
}

function cloneNodePublic(node) {
  return {
    id: node.id,
    char: node.char ?? null,
    freq: node.freq,
    left: node.left ?? null,
    right: node.right ?? null,
  }
}

function snapshot(nodesById, queue, selectedIds, created, rootId, meta) {
  const nodes = {}
  for (const [id, n] of Object.entries(nodesById)) nodes[id] = cloneNodePublic(n)

  return {
    nodesById: nodes,
    queue: stableQueueSort(queue).map((n) => ({
      id: n.id,
      char: n.char ?? null,
      freq: n.freq,
    })),
    forestIds: stableQueueSort(queue).map((n) => n.id),
    selectedIds: selectedIds ? [...selectedIds] : [],
    created: created ? { ...created } : null,
    rootId: rootId || null,
    ...meta,
  }
}

function buildCodes(nodesById, rootId) {
  const codes = {}

  if (!rootId) return codes

  function dfs(nodeId, prefix) {
    const node = nodesById[nodeId]
    if (!node) return

    const isLeaf = !node.left && !node.right
    if (isLeaf) {
      codes[node.char] = prefix || '0'
      return
    }
    if (node.left) dfs(node.left, prefix + '0')
    if (node.right) dfs(node.right, prefix + '1')
  }

  dfs(rootId, '')
  return codes
}

function encodeText(text, codes) {
  let out = ''
  for (const ch of text) out += codes[ch] || ''
  return out
}

/** Arestas da raiz até a folha do caractere (ordem topo → folha), para destacar o caminho no SVG */
export function findPathToChar(nodesById, rootId, ch) {
  const edges = []
  function dfs(id) {
    const n = nodesById[id]
    if (!n) return false
    if (n.char === ch) return true
    if (n.left) {
      if (dfs(n.left)) {
        edges.unshift({ from: id, to: n.left, bit: '0' })
        return true
      }
    }
    if (n.right) {
      if (dfs(n.right)) {
        edges.unshift({ from: id, to: n.right, bit: '1' })
        return true
      }
    }
    return false
  }
  if (rootId) dfs(rootId)
  return edges
}

export function sortedCodeChars(codes) {
  if (!codes) return []
  return Object.keys(codes).sort((a, b) => a.localeCompare(b))
}

export function summarizeBits(result) {
  const n = result?.text?.length || 0
  const unique = Object.keys(result?.frequencies || {}).length
  const asciiBits = n * 8
  const huffmanBits = (result?.encodedText || '').length
  return { n, unique, asciiBits, huffmanBits }
}

/**
 * Gera uma sequência de passos (steps) para animar o Huffman.
 *
 * Cada step contém tudo o que a UI precisa:
 * - frequencies
 * - queue (nós atuais ordenados)
 * - selectedIds
 * - created (nó pai recém-criado)
 * - rootId (quando existir)
 * - nodesById (para desenhar árvore)
 * - title/description/kind (texto didático)
 * @param {string} [locale='pt-BR'] idioma para títulos/descrições (pt-BR | en)
 */
export function buildHuffmanSteps(text, locale = 'pt-BR') {
  const steps = []
  const safeText = String(text ?? '')
  const sc = (id) => stepCopy(locale, id)

  const frequencies = countFrequencies(safeText)
  const freqEntries = sortedEntriesByFreq(frequencies)

  const nodesById = {}
  let idCounter = 1

  const leaves = freqEntries.map(([ch, f]) => {
    const id = makeId('leaf', idCounter++)
    const node = { id, char: ch, freq: f, left: null, right: null }
    nodesById[id] = node
    return node
  })

  // Step 1: Frequências
  steps.push(
    snapshot(nodesById, leaves, [], null, null, {
      kind: 'frequencies',
      ...sc('frequencies'),
      frequencies,
      text: safeText,
    }),
  )

  // Step 2: Fila inicial ordenada
  let queue = stableQueueSort(leaves)
  steps.push(
    snapshot(nodesById, queue, [], null, null, {
      kind: 'queue',
      ...sc('queue'),
      frequencies,
      text: safeText,
    }),
  )

  // Caso especial: texto vazio
  if (safeText.length === 0) {
    steps.push({
      kind: 'done',
      ...sc('doneEmpty'),
      frequencies,
      queue: [],
      selectedIds: [],
      created: null,
      rootId: null,
      nodesById: {},
      result: { text: safeText, frequencies, codes: {}, encodedText: '' },
    })
    return { steps }
  }

  // Caso especial: apenas 1 símbolo
  if (queue.length === 1) {
    const root = queue[0]
    const codes = { [root.char]: '0' }
    const encodedText = encodeText(safeText, codes)
    steps.push(
      snapshot(nodesById, queue, [root.id], null, root.id, {
        kind: 'single',
        ...sc('single'),
        frequencies,
        text: safeText,
        result: { text: safeText, frequencies, codes, encodedText, rootId: root.id },
      }),
    )
    steps.push(
      snapshot(nodesById, queue, [], null, root.id, {
        kind: 'done',
        ...sc('doneSingle'),
        frequencies,
        text: safeText,
        result: { text: safeText, frequencies, codes, encodedText, rootId: root.id },
      }),
    )
    return { steps }
  }

  // Loop principal de Huffman
  while (queue.length > 1) {
    queue = stableQueueSort(queue)
    const a = queue[0]
    const b = queue[1]

    steps.push(
      snapshot(nodesById, queue, [a.id, b.id], null, null, {
        kind: 'pick',
        ...sc('pick'),
        frequencies,
        text: safeText,
      }),
    )

    const parentId = makeId('node', idCounter++)
    const parent = {
      id: parentId,
      char: null,
      freq: a.freq + b.freq,
      left: a.id,
      right: b.id,
    }
    nodesById[parentId] = parent

    // remove 2 primeiros e adiciona pai
    queue = queue.slice(2)
    queue.push(parent)

    steps.push(
      snapshot(nodesById, queue, [], { id: parentId, left: a.id, right: b.id }, null, {
        kind: 'merge',
        ...sc('merge'),
        frequencies,
        text: safeText,
      }),
    )
  }

  const rootId = queue[0]?.id || null

  steps.push(
    snapshot(nodesById, queue, [], null, rootId, {
      kind: 'tree',
      ...sc('tree'),
      frequencies,
      text: safeText,
    }),
  )

  const codes = buildCodes(nodesById, rootId)
  const encodedText = encodeText(safeText, codes)

  steps.push(
    snapshot(nodesById, queue, [], null, rootId, {
      kind: 'codes',
      ...sc('codes'),
      frequencies,
      text: safeText,
      result: { text: safeText, frequencies, codes, encodedText, rootId },
    }),
  )

  steps.push(
    snapshot(nodesById, queue, [], null, rootId, {
      kind: 'done',
      ...sc('done'),
      frequencies,
      text: safeText,
      result: { text: safeText, frequencies, codes, encodedText, rootId },
    }),
  )

  return { steps }
}

