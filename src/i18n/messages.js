/** @typedef {'pt-BR' | 'en'} Locale */

export const SUPPORTED_LOCALES = /** @type {const} */ (['pt-BR', 'en'])

export const LOCALE_LABELS = {
  'pt-BR': 'PT-BR',
  en: 'EN',
}

export const defaultLocale = 'pt-BR'

const STORAGE_KEY = 'huffman-visual-lab-locale'

export function readStoredLocale() {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === 'pt-BR' || v === 'en') return v
  } catch {
    /* ignore */
  }
  return defaultLocale
}

export function writeStoredLocale(/** @type {Locale} */ locale) {
  try {
    localStorage.setItem(STORAGE_KEY, locale)
  } catch {
    /* ignore */
  }
}

/** @type {Record<Locale, Record<string, unknown>>} */
export const messages = {
  'pt-BR': {
    app: {
      title: 'Huffman Visual Lab',
      subtitle: 'Visualização didática, passo a passo, do algoritmo de Huffman.',
      tip: 'Dica',
      tipEnter: 'gera a animação',
      langAria: 'Idioma',
    },
    panel: {
      queueForest: 'Fila / Floresta atual',
      nodes: 'nós',
      tree: 'Árvore de Huffman',
      root: 'raiz',
      codes: 'Códigos',
      codesCount: 'códigos',
      result: 'Resultado',
    },
    controls: {
      input: 'Entrada',
      step: 'passo',
      placeholder:
        'Digite um texto curto (ex.: banana, abacaxi, huffman, \'banana split\')',
      ariaInput: 'Texto de entrada',
      generate: 'Gerar animação',
      play: 'Play',
      pause: 'Pause',
      back: 'Voltar',
      next: 'Próximo',
      reset: 'Reiniciar',
      vel: 'Vel.',
      ariaSpeed: 'Velocidade',
      shortcutPrev: '←',
      shortcutNext: '→',
      shortcutPrevTitle: 'Seta para a esquerda',
      shortcutNextTitle: 'Seta para a direita',
    },
    stepInfo: {
      ready: 'Pronto para começar',
      readyDesc: 'Digite um texto e clique em',
      readyBtn: 'Gerar animação',
      stepKindTitle: 'Tipo de etapa',
    },
    codesTable: {
      empty: 'Os códigos aparecem quando a árvore estiver pronta.',
      char: 'Caractere',
      freq: 'Frequência',
      code: 'Código',
    },
    encoded: {
      empty: 'O texto codificado aparece ao montar o resultado.',
      original: 'Texto original',
      bits: 'Texto codificado (bits)',
      statsChars: 'Caracteres',
      symbols: 'Símbolos',
      beforeAscii: 'Antes (ASCII)',
      afterHuffman: 'Depois (Huffman)',
    },
    tree: {
      empty: 'A árvore vai surgindo conforme os nós são combinados.',
      aria: 'Árvore de Huffman',
    },
    queue: {
      empty: 'A fila aparecerá aqui durante a execução.',
      freq: 'freq.',
      internal: 'nó interno',
    },
    steps: {
      frequencies: {
        title: '1) Contar frequências',
        description:
          'Primeiro, contamos quantas vezes cada caractere aparece no texto. Isso vira o peso de cada folha.',
      },
      queue: {
        title: '2) Ordenar nós pela menor frequência',
        description:
          'Colocamos as folhas em uma fila de prioridade (menor frequência primeiro).',
      },
      pick: {
        title: '3) Selecionar os dois menores',
        description:
          'Escolhemos os dois nós de menor frequência. Eles serão combinados em um novo nó pai.',
      },
      merge: {
        title: '4) Combinar e criar um nó pai',
        description:
          'Criamos um nó interno cujo peso é a soma dos pesos dos dois nós escolhidos. Esse nó volta para a fila.',
      },
      tree: {
        title: '5) Árvore final pronta',
        description:
          'Repetimos até sobrar apenas um nó. Ele é a raiz da árvore binária de Huffman.',
      },
      codes: {
        title: '6) Gerar códigos binários',
        description:
          'Percorremos a árvore: esquerda é 0, direita é 1. O caminho da raiz até cada folha vira o código do caractere.',
      },
      done: {
        title: '7) Texto codificado',
        description:
          'Substituímos cada caractere pelo seu código e obtemos a sequência final de bits.',
      },
      single: {
        title: 'Caso especial: um único caractere',
        description:
          'Quando só existe um símbolo, a árvore tem apenas uma folha. Por convenção didática, usamos o código 0.',
      },
      doneSingle: {
        title: 'Resultado final',
        description: 'Códigos gerados e texto codificado.',
      },
      doneEmpty: {
        title: 'Resultado',
        description: 'Digite algum texto para visualizar o algoritmo.',
      },
    },
  },
  en: {
    app: {
      title: 'Huffman Visual Lab',
      subtitle: 'A step-by-step, educational visualization of Huffman’s algorithm.',
      tip: 'Tip',
      tipEnter: 'runs the animation',
      langAria: 'Language',
    },
    panel: {
      queueForest: 'Queue / current forest',
      nodes: 'nodes',
      tree: 'Huffman tree',
      root: 'root',
      codes: 'Codes',
      codesCount: 'codes',
      result: 'Result',
    },
    controls: {
      input: 'Input',
      step: 'step',
      placeholder: 'Type a short string (e.g. banana, avocado, huffman, \'banana split\')',
      ariaInput: 'Input text',
      generate: 'Build animation',
      play: 'Play',
      pause: 'Pause',
      back: 'Back',
      next: 'Next',
      reset: 'Reset',
      vel: 'Spd.',
      ariaSpeed: 'Speed',
      shortcutPrev: '←',
      shortcutNext: '→',
      shortcutPrevTitle: 'Left arrow',
      shortcutNextTitle: 'Right arrow',
    },
    stepInfo: {
      ready: 'Ready to start',
      readyDesc: 'Type some text and click',
      readyBtn: 'Build animation',
      stepKindTitle: 'Step kind',
    },
    codesTable: {
      empty: 'Codes show up once the tree is ready.',
      char: 'Character',
      freq: 'Frequency',
      code: 'Code',
    },
    encoded: {
      empty: 'The encoded bit string appears while building the result.',
      original: 'Original text',
      bits: 'Encoded text (bits)',
      statsChars: 'Characters',
      symbols: 'Symbols',
      beforeAscii: 'Before (ASCII)',
      afterHuffman: 'After (Huffman)',
    },
    tree: {
      empty: 'The tree grows as nodes are merged.',
      aria: 'Huffman tree',
    },
    queue: {
      empty: 'The queue will appear here during the run.',
      freq: 'freq.',
      internal: 'internal node',
    },
    steps: {
      frequencies: {
        title: '1) Count frequencies',
        description:
          'First, we count how often each character appears. That count becomes each leaf’s weight.',
      },
      queue: {
        title: '2) Order nodes by lowest frequency',
        description:
          'We place the leaves in a priority queue (lowest frequency first).',
      },
      pick: {
        title: '3) Take the two smallest',
        description:
          'We pick the two smallest nodes. They will be merged under a new parent.',
      },
      merge: {
        title: '4) Merge into a parent node',
        description:
          'We create an internal node whose weight is the sum of the two chosen nodes, then put it back in the queue.',
      },
      tree: {
        title: '5) Final tree ready',
        description:
          'We repeat until only one node remains. It is the root of the Huffman binary tree.',
      },
      codes: {
        title: '6) Build binary codes',
        description:
          'We walk the tree: left is 0, right is 1. The path from the root to each leaf is that character’s code.',
      },
      done: {
        title: '7) Encoded text',
        description:
          'We replace each character with its code to get the final bit sequence.',
      },
      single: {
        title: 'Special case: one symbol',
        description:
          'When there is only one symbol, the tree is a single leaf. For teaching, we use the code 0.',
      },
      doneSingle: {
        title: 'Final result',
        description: 'Codes generated and text encoded.',
      },
      doneEmpty: {
        title: 'Result',
        description: 'Enter some text to visualize the algorithm.',
      },
    },
  },
}

/**
 * @param {Locale} locale
 * @param {string} path dot-separated, e.g. `app.title`
 */
export function translate(locale, path) {
  const parts = path.split('.')
  let cur = messages[locale]
  for (const p of parts) {
    cur = cur?.[p]
  }
  if (typeof cur === 'string') return cur
  return path
}

/**
 * @param {Locale} locale
 * @param {'frequencies'|'queue'|'pick'|'merge'|'tree'|'codes'|'done'|'single'|'doneSingle'|'doneEmpty'} id
 */
export function stepCopy(locale, id) {
  const s = messages[locale]?.steps?.[id]
  if (s?.title && s?.description) return { title: s.title, description: s.description }
  const fb = messages[defaultLocale]?.steps?.[id]
  if (fb?.title && fb?.description) return { title: fb.title, description: fb.description }
  return { title: '', description: '' }
}
