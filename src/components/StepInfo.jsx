import './StepInfo.css'
import { useI18n } from '../i18n/useI18n.js'

export default function StepInfo({ step, stepIndex, stepCount }) {
  const { t } = useI18n()

  if (!step) {
    return (
      <div className="stepInfo fadeIn">
        <div className="stepTop">
          <div className="stepLine">
            <div className="stepBadge">—</div>
          </div>
          <div className="stepTitle">{t('stepInfo.ready')}</div>
        </div>
        <div className="stepDesc">
          {t('stepInfo.readyDesc')}{' '}
          <span className="mono">{t('stepInfo.readyBtn')}</span>.
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
            <span className="stepKind mono" title={t('stepInfo.stepKindTitle')}>
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
