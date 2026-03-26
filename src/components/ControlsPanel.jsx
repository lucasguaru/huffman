import { useEffect } from 'react'
import { useI18n } from '../i18n/useI18n.js'
import './ControlsPanel.css'

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
  const { t } = useI18n()

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Enter') {
        e.preventDefault()
        onGenerate()
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
  }, [onGenerate, canNext, canPrev, onNext, onPrev])

  return (
    <div>
      <div className="panelTitle">
        <h2>{t('controls.input')}</h2>
        <span className="muted2">
          {stepCount > 0 ? `${t('controls.step')} ${stepIndex + 1}/${stepCount}` : '—'}
        </span>
      </div>

      <input
        className="input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t('controls.placeholder')}
        aria-label={t('controls.ariaInput')}
      />

      <div className="helperRow">
        <div className="btnRow">
          <button className="btn btnPrimary" onClick={onGenerate}>
            {t('controls.generate')}
          </button>

          <button
            className="btn"
            onClick={() => setIsPlaying((v) => !v)}
            disabled={stepCount === 0 || !canPlay}
          >
            {isPlaying ? t('controls.pause') : t('controls.play')}
          </button>

          <button
            className="btn btnNavStack"
            onClick={onPrev}
            disabled={!canPrev}
            type="button"
            title={t('controls.shortcutPrevTitle')}
          >
            <span className="btnNavMain">{t('controls.back')}</span>
            <span className="btnNavKey">{t('controls.shortcutPrev')}</span>
          </button>
          <button
            className="btn btnNavStack"
            onClick={onNext}
            disabled={!canNext}
            type="button"
            title={t('controls.shortcutNextTitle')}
          >
            <span className="btnNavMain">{t('controls.next')}</span>
            <span className="btnNavKey">{t('controls.shortcutNext')}</span>
          </button>

          <button className="btn btnDanger" onClick={onReset} disabled={stepCount === 0}>
            {t('controls.reset')}
          </button>
        </div>

        <label className="pill" title={t('controls.ariaSpeed')}>
          <span className="muted2">{t('controls.vel')}</span>
          <input
            className="slider"
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            aria-label={t('controls.ariaSpeed')}
          />
          <span className="mono">{speed.toFixed(1)}x</span>
        </label>
      </div>
    </div>
  )
}
