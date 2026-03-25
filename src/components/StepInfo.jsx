import './StepInfo.css'

export default function StepInfo({ step, stepIndex, stepCount }) {
  if (!step) {
    return (
      <div className="stepInfo fadeIn">
        <div className="stepTop">
          <div className="stepBadge">—</div>
          <div className="stepTitle">Pronto para começar</div>
        </div>
        <div className="stepDesc">
          Digite um texto e clique em <span className="mono">Gerar animação</span>.
        </div>
      </div>
    )
  }

  return (
    <div className="stepInfo fadeIn">
      <div className="stepTop">
        <div className="stepBadge">
          {stepCount ? `${stepIndex + 1}/${stepCount}` : '—'}
        </div>
        <div className="stepTitle">{step.title}</div>
      </div>
      <div className="stepDesc">{step.description}</div>
      {step.kind && (
        <div className="stepMeta">
          <span className="pill">
            <span className="muted2">etapa</span> <span className="mono">{step.kind}</span>
          </span>
        </div>
      )}
    </div>
  )
}

