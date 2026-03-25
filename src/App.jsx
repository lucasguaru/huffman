import { useEffect, useMemo, useRef, useState } from 'react'
import { buildHuffmanSteps, printableChar, summarizeBits } from './lib/huffman.js'
import ControlsPanel from './components/ControlsPanel.jsx'
import StepInfo from './components/StepInfo.jsx'
import FrequencyView from './components/FrequencyView.jsx'
import QueueView from './components/QueueView.jsx'
import TreeView from './components/TreeView.jsx'
import CodesTable from './components/CodesTable.jsx'
import EncodedResult from './components/EncodedResult.jsx'

function App() {
  const [text, setText] = useState('banana')
  const [steps, setSteps] = useState([])
  const [stepIndex, setStepIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1.0) // 0.5x .. 2.0x
  const playTimer = useRef(null)

  const current = steps[stepIndex] || null
  const analysis = useMemo(() => {
    if (!steps.length) return null
    const last = steps[steps.length - 1]
    if (!last?.result) return null
    return last.result
  }, [steps])

  function generate() {
    const built = buildHuffmanSteps(text)
    setSteps(built.steps)
    setStepIndex(0)
    setIsPlaying(false)
  }

  function reset() {
    setStepIndex(0)
    setIsPlaying(false)
  }

  function next() {
    setStepIndex((i) => Math.min(i + 1, Math.max(steps.length - 1, 0)))
  }

  function prev() {
    setStepIndex((i) => Math.max(i - 1, 0))
  }

  const canPlay = steps.length > 0 && stepIndex < steps.length - 1
  const canPrev = steps.length > 0 && stepIndex > 0
  const canNext = steps.length > 0 && stepIndex < steps.length - 1

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
          <span className="muted2">gera</span>
          <span className="kbd">Space</span>
          <span className="muted2">play</span>
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
              onPrev={prev}
              onNext={next}
              onReset={reset}
              canPrev={canPrev}
              canNext={canNext}
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

          <div className="panelInner">
            <div className="panelTitle">
              <h2>Frequências</h2>
              <span className="muted2">
                {current?.frequencies ? `${Object.keys(current.frequencies).length} símbolos` : '—'}
              </span>
            </div>
            <FrequencyView frequencies={current?.frequencies || null} />
          </div>

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
        </section>

        <section className="panel">
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
            />
          </div>

          <div className="panelInner">
            <div className="panelTitle">
              <h2>Códigos</h2>
              <span className="muted2">
                {analysis?.codes ? `${Object.keys(analysis.codes).length} códigos` : '—'}
              </span>
            </div>
            <CodesTable
              frequencies={analysis?.frequencies || null}
              codes={analysis?.codes || null}
              printableChar={printableChar}
            />
          </div>

          <div className="panelInner">
            <div className="panelTitle">
              <h2>Resultado</h2>
              <span className="muted2">
                {analysis?.encodedText ? 'final' : '—'}
              </span>
            </div>
            <EncodedResult
              text={analysis?.text || ''}
              encodedText={analysis?.encodedText || ''}
              bitsSummary={analysis ? summarizeBits(analysis) : null}
            />
          </div>
        </section>
      </div>

      {analysis?.codes && (
        <footer style={{ marginTop: 16 }} className="muted2">
          Pronto. Agora você pode testar com <span className="mono">abacaxi</span>,{' '}
          <span className="mono">huffman</span> e textos com <span className="mono">␠</span>.
        </footer>
      )}
    </div>
  )
}

export default App
