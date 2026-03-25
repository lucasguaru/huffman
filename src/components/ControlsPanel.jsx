import { useEffect } from 'react'

export default function ControlsPanel({
  text,
  setText,
  onGenerate,
  isPlaying,
  setIsPlaying,
  onPrev,
  onNext,
  onReset,
  canPrev,
  canNext,
  canPlay,
  speed,
  setSpeed,
  stepIndex,
  stepCount,
}) {
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Enter') {
        e.preventDefault()
        onGenerate()
      }
      if (e.key === ' ') {
        e.preventDefault()
        if (stepCount > 0) setIsPlaying((v) => !v)
      }
      if (e.key === 'ArrowRight') {
        if (canNext) onNext()
      }
      if (e.key === 'ArrowLeft') {
        if (canPrev) onPrev()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onGenerate, setIsPlaying, stepCount, canNext, canPrev, onNext, onPrev])

  return (
    <div>
      <div className="panelTitle">
        <h2>Entrada</h2>
        <span className="muted2">
          {stepCount > 0 ? `passo ${stepIndex + 1}/${stepCount}` : '—'}
        </span>
      </div>

      <input
        className="input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Digite um texto curto (ex.: banana, abacaxi, huffman, 'banana split')"
        aria-label="Texto de entrada"
      />

      <div className="helperRow">
        <div className="btnRow">
          <button className="btn btnPrimary" onClick={onGenerate}>
            Gerar animação
          </button>

          <button
            className="btn"
            onClick={() => setIsPlaying((v) => !v)}
            disabled={stepCount === 0 || !canPlay}
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>

          <button className="btn" onClick={onPrev} disabled={!canPrev}>
            Voltar
          </button>
          <button className="btn" onClick={onNext} disabled={!canNext}>
            Próximo
          </button>

          <button className="btn btnDanger" onClick={onReset} disabled={stepCount === 0}>
            Reiniciar
          </button>
        </div>

        <label className="pill" title="Velocidade da animação">
          <span className="muted2">Vel.</span>
          <input
            className="slider"
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            aria-label="Velocidade"
          />
          <span className="mono">{speed.toFixed(1)}x</span>
        </label>
      </div>
    </div>
  )
}

