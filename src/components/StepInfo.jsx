import './StepInfo.css'

export default function StepInfo({ step, stepIndex, stepCount }) {
  if (!step) {
    return (
      <div className="stepInfo fadeIn">
        <div className="stepTop">
          <div className="stepLine">
            <div className="stepBadge">—</div>
          </div>
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
        <div className="stepLine">
          <div className="stepBadge">
            {stepCount ? `${stepIndex + 1}/${stepCount}` : '—'}
          </div>
          {step.kind && (
            <span className="stepKind mono" title="Tipo de etapa">
              {step.kind}
            </span>
          )}
        </div>
        <div className="stepTitle">{step.title}</div>
      </div>
      <div className="stepDesc">{step.description}</div>
    </div>
  )
}

