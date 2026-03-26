import { useCallback, useMemo, useState } from 'react'
import { I18nContext } from './context.js'
import { readStoredLocale, translate, writeStoredLocale } from './messages.js'

/** @typedef {import('./messages.js').Locale} Locale */

export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(() => readStoredLocale())

  const setLocale = useCallback((/** @type {Locale} */ next) => {
    setLocaleState(next)
    writeStoredLocale(next)
  }, [])

  const t = useCallback((/** @type {string} */ path) => translate(locale, path), [locale])

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
