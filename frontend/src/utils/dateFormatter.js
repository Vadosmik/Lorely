export const formatDateByLang = (dateString, lang) => {
  if (!dateString) return '—';
  
  const cleanDate = dateString.split('T')[0];
  const date = new Date(cleanDate);
  
  if (isNaN(date.getTime())) return dateString;

  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };

  try {
    const locale = lang === 'by' ? 'be' : lang;
    return new Intl.DateTimeFormat(locale, options).format(date);
  } catch (e) {
    return date.toLocaleDateString();
  }
};

export const toISODateString = (dateString) => {
  if (!dateString) return '';
  return dateString.split('T')[0];
};