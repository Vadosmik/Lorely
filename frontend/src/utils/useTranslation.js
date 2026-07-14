import { useState, useEffect } from 'preact/hooks';
import { useLanguage } from '../context/LanguageContext';

const translationsCache = {};

export function useTranslation(namespace) {
  const { currentLang } = useLanguage();
  const [translations, setTranslations] = useState({
    current: translationsCache[`${currentLang}_${namespace}`] || {},
    en: translationsCache[`en_${namespace}`] || {}
  });

  useEffect(() => {
    const currentKey = `${currentLang}_${namespace}`;
    const enKey = `en_${namespace}`;

    const promises = [];

    if (!translationsCache[currentKey]) {
      promises.push(
        fetch(`/lang/${currentLang}/${namespace}.json`)
          .then(res => res.ok ? res.json() : {})
          .then(data => { translationsCache[currentKey] = data; })
          .catch(() => { translationsCache[currentKey] = {}; })
      );
    }

    // fallback
    if (currentLang !== 'en' && !translationsCache[enKey]) {
      promises.push(
        fetch(`/lang/en/${namespace}.json`)
          .then(res => res.ok ? res.json() : {})
          .then(data => { translationsCache[enKey] = data; })
          .catch(() => { translationsCache[enKey] = {}; })
      );
    }

    Promise.all(promises).then(() => {
      setTranslations({
        current: translationsCache[currentKey] || {},
        en: translationsCache[enKey] || {}
      });
    });
  }, [currentLang, namespace])

  const t = (key) => {
    if (translations.current && translations.current[key]) {
      return translations.current[key];
    }
    if (translations.en && translations.en[key]) {
      return translations.en[key];
    }
    return key;
  };

  return { t }
}