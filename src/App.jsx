import { useEffect, useMemo, useRef, useState } from 'react'
import {
  buildHuffmanSteps,
  findPathToChar,
  printableChar,
  sortedCodeChars,
  summarizeBits,
} from './lib/huffman.js'
import ControlsPanel from './components/ControlsPanel.jsx'
import StepInfo from './components/StepInfo.jsx'
import QueueView from './components/QueueView.jsx'
import TreeView from './components/TreeView.jsx'
import CodesTable from './components/CodesTable.jsx'
import EncodedResult from './components/EncodedResult.jsx'

const INPUT_STORAGE_KEY = 'huffman-visual-lab-input'

function readStoredInput() {
  try {
    const v = localStorage.getItem(INPUT_STORAGE_KEY)
    if (v != null) return v
  } catch {
    /* ignore */
  }
  return 'abacate'
}

function buildEncodedPrefix(text, codes, idx) {
  let s = ''
  for (let i = 0; i <= idx && i < text.length; i++) s += codes[text[i]] || ''
  return s
}

function App() {
  const [text, setText] = useState(() => readStoredInput())
  const [steps, setSteps] = useState([])
  const [stepIndex, setStepIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1.0)
  const [codeTourIndex, setCodeTourIndex] = useState(0)
  const [encodeIndex, setEncodeIndex] = useState(0)
  const playTimer = useRef(null)
  const prevKindRef = useRef(null)

  const current = steps[stepIndex] || null
  const stepResult = current?.result ?? null

  useEffect(() => {
    try {
      localStorage.setItem(INPUT_STORAGE_KEY, text)
    } catch {
      /* ignore */
    }
  }, [text])

  useEffect(() => {
    const kind = current?.kind
    if (kind === 'codes' && stepResult?.codes) {
      const keys = sortedCodeChars(stepResult.codes)
      if (prevKindRef.current === 'done') {
        setCodeTourIndex(Math.max(0, keys.length - 1))
      } else if (prevKindRef.current !== 'codes') {
        setCodeTourIndex(0)
      }
    }
    if (kind === 'done' && stepResult?.text) {
      if (prevKindRef.current !== 'done') {
        setEncodeIndex(0)
      }
    }
    if (kind === 'single' && stepResult?.codes) {
      if (prevKindRef.current !== 'single') {
        setCodeTourIndex(0)
      }
    }
    prevKindRef.current = kind
  }, [stepIndex, current?.kind, stepResult])

  function generate() {
    const built = buildHuffmanSteps(text)
    setSteps(built.steps)
    setStepIndex(0)
    setIsPlaying(false)
    setCodeTourIndex(0)
    setEncodeIndex(0)
    prevKindRef.current = null
  }

  function reset() {
    setStepIndex(0)
    setIsPlaying(false)
    setCodeTourIndex(0)
    setEncodeIndex(0)
  }

  function stepNext() {
    setStepIndex((i) => Math.min(i + 1, Math.max(steps.length - 1, 0)))
  }

  function stepPrev() {
    setStepIndex((i) => Math.max(i - 1, 0))
  }

  function handleNext() {
    if (!current) return
    if (current.kind === 'codes' && stepResult?.codes) {
      const keys = sortedCodeChars(stepResult.codes)
      if (codeTourIndex < keys.length - 1) {
        setCodeTourIndex((i) => i + 1)
        return
      }
      if (stepIndex < steps.length - 1) {
        stepNext()
        return
      }
    }
    if (current.kind === 'single') {
      if (stepIndex < steps.length - 1) stepNext()
      return
    }
    if (current.kind === 'done' && stepResult?.text && stepResult.codes) {
      const L = stepResult.text.length
      if (encodeIndex < L - 1) {
        setEncodeIndex((i) => i + 1)
        return
      }
    }
    stepNext()
  }

  function handlePrev() {
    if (!current) return
    if (current.kind === 'done' && stepResult?.text) {
      if (encodeIndex > 0) {
        setEncodeIndex((i) => i - 1)
        return
      }
      stepPrev()
      return
    }
    if (current.kind === 'codes' && stepResult?.codes) {
      if (codeTourIndex > 0) {
        setCodeTourIndex((i) => i - 1)
        return
      }
      stepPrev()
      return
    }
    if (current.kind === 'single') {
      stepPrev()
      return
    }
    stepPrev()
  }

  const canNavigateNext = useMemo(() => {
    if (!steps.length || !current) return false
    const lastIdx = steps.length - 1
    if (current.kind === 'codes' && stepResult?.codes) {
      const keys = sortedCodeChars(stepResult.codes)
      if (codeTourIndex < keys.length - 1) return true
      return stepIndex < lastIdx
    }
    if (current.kind === 'single') return stepIndex < lastIdx
    if (current.kind === 'done' && stepResult?.text) {
      const L = stepResult.text.length
      if (encodeIndex < L - 1) return true
      return false
    }
    return stepIndex < lastIdx
  }, [steps.length, current, stepResult, stepIndex, codeTourIndex, encodeIndex])

  const canNavigatePrev = useMemo(() => {
    if (!steps.length || !current) return false
    if (current.kind === 'done' && stepResult?.text) {
      if (encodeIndex > 0) return true
      return stepIndex > 0
    }
    if (current.kind === 'codes' && stepResult?.codes) {
      if (codeTourIndex > 0) return true
      return stepIndex > 0
    }
    if (current.kind === 'single') return stepIndex > 0
    return stepIndex > 0
  }, [steps.length, current, stepResult, stepIndex, codeTourIndex, encodeIndex])

  const canPlay =
    steps.length > 0 &&
    stepIndex < steps.length - 1 &&
    current?.kind !== 'codes' &&
    current?.kind !== 'done'

  useEffect(() => {
    if (!isPlaying) return
    if (!canPlay) return
    const baseMs = 900
    const interval = Math.max(140, Math.round(baseMs / speed))

    playTimer.current = window.setInterval(() => {
      setStepIndex((i) => {
        const nextIndex = Math.min(i + 1, steps.length - 1)
        return nextIndex
      })
    }, interval)

    return () => {
      if (playTimer.current) window.clearInterval(playTimer.current)
      playTimer.current = null
    }
  }, [isPlaying, speed, steps.length, canPlay])

  useEffect(() => {
    if (!isPlaying) return
    if (stepIndex >= steps.length - 1) setIsPlaying(false)
  }, [isPlaying, stepIndex, steps.length])

  const hideQueueSection =
    current && ['tree', 'codes', 'done'].includes(current.kind)

  const showTreeSection =
    current &&
    ['frequencies', 'queue', 'pick', 'merge', 'tree', 'codes', 'single'].includes(
      current.kind,
    )

  const showCodesTableSection =
    current && ['codes', 'done', 'single'].includes(current.kind)

  const showResultSection = current && current.kind === 'done'

  const pathEdges = useMemo(() => {
    if (!current?.rootId || !current?.nodesById) return null
    if (current.kind === 'codes' && stepResult?.codes) {
      const keys = sortedCodeChars(stepResult.codes)
      const ch = keys[codeTourIndex]
      if (ch == null) return null
      return findPathToChar(current.nodesById, current.rootId, ch)
    }
    if (current.kind === 'single' && stepResult?.codes) {
      const keys = sortedCodeChars(stepResult.codes)
      const k = keys[0]
      return k ? findPathToChar(current.nodesById, current.rootId, k) : null
    }
    return null
  }, [current, codeTourIndex, stepResult])

  const codeTableHighlight = useMemo(() => {
    if (!stepResult?.codes) return null
    if (current?.kind === 'codes') {
      const keys = sortedCodeChars(stepResult.codes)
      return keys[codeTourIndex] ?? null
    }
    if (current?.kind === 'single') {
      return sortedCodeChars(stepResult.codes)[0] ?? null
    }
    if (current?.kind === 'done' && stepResult.text) {
      return stepResult.text[encodeIndex] ?? null
    }
    return null
  }, [current, stepResult, codeTourIndex, encodeIndex])

  const donePartialEncoded =
    current?.kind === 'done' && stepResult?.text && stepResult?.codes
      ? buildEncodedPrefix(stepResult.text, stepResult.codes, encodeIndex)
      : ''

  const doneShowStats =
    current?.kind === 'done' &&
    stepResult?.text &&
    encodeIndex === stepResult.text.length - 1

  return (
    <div className="container">
      <header className="appHeader">
        <div className="brand">
          <h1 className="brandTitle">Huffman Visual Lab</h1>
          <p className="brandSubtitle">
            Visualização didática, passo a passo, do algoritmo de Huffman.
          </p>
        </div>
        <div className="pill">
          <span className="muted2">Dica</span>
          <span className="kbd">Enter</span>
          <span className="muted2">gera a animação</span>
        </div>
      </header>

      <div className="grid">
        <section className="panel">
          <div className="panelInner">
            <ControlsPanel
              text={text}
              setText={setText}
              onGenerate={generate}
              isPlaying={isPlaying}
              setIsPlaying={setIsPlaying}
              onPrev={handlePrev}
              onNext={handleNext}
              onReset={reset}
              canPrev={canNavigatePrev}
              canNext={canNavigateNext}
              canPlay={canPlay}
              speed={speed}
              setSpeed={setSpeed}
              stepIndex={stepIndex}
              stepCount={steps.length}
            />
          </div>

          <div className="panelInner">
            <StepInfo step={current} stepIndex={stepIndex} stepCount={steps.length} />
          </div>

          {!hideQueueSection && (
            <div className="panelInner">
              <div className="panelTitle">
                <h2>Fila / Floresta atual</h2>
                <span className="muted2">
                  {current?.queue ? `${current.queue.length} nós` : '—'}
                </span>
              </div>
              <QueueView
                queue={current?.queue || []}
                selectedIds={current?.selectedIds || []}
                createdId={current?.created?.id || null}
              />
            </div>
          )}
        </section>

        <section className="panel">
          {showTreeSection && (
            <div className="panelInner">
              <div className="panelTitle">
                <h2>Árvore de Huffman</h2>
                <span className="muted2">
                  {current?.rootId ? `raiz: ${current.rootId}` : '—'}
                </span>
              </div>
              <TreeView
                nodesById={current?.nodesById || {}}
                rootId={current?.rootId || null}
                forestIds={current?.forestIds || []}
                highlightIds={current?.selectedIds || []}
                pathEdges={pathEdges}
              />
            </div>
          )}

          {showCodesTableSection && (
            <div className="panelInner">
              <div className="panelTitle">
                <h2>Códigos</h2>
                <span className="muted2">
                  {stepResult?.codes ? `${Object.keys(stepResult.codes).length} códigos` : '—'}
                </span>
              </div>
              <CodesTable
                frequencies={stepResult?.frequencies || null}
                codes={stepResult?.codes || null}
                printableChar={printableChar}
                highlightChar={codeTableHighlight}
              />
            </div>
          )}

          {showResultSection && (
            <div className="panelInner">
              <div className="panelTitle">
                <h2>Resultado</h2>
                <span className="muted2">
                  {stepResult?.encodedText ? `${encodeIndex + 1}/${stepResult.text.length}` : '—'}
                </span>
              </div>
              <EncodedResult
                text={stepResult?.text || ''}
                codes={stepResult?.codes || null}
                encodedText={donePartialEncoded}
                bitsSummary={stepResult ? summarizeBits(stepResult) : null}
                encodeCharIndex={encodeIndex}
                showStats={doneShowStats}
              />
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default App
