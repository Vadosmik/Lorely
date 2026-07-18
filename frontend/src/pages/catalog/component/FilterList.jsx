import { memo } from 'preact/compat';
import { useLanguage } from '../../../context/LanguageContext.jsx';

function FilterList({ items, selected, onChange, prefix }) {
  const { currentLang } = useLanguage();

  if (!items || items.length === 0) {
    return <li style={styles.emptyText}>No available options...</li>;
  }

  return (
    <>
      {items.map(item => {
        const isChecked = selected.includes(item.id) || false;
        const uniqueId = `${prefix}-${item.id}`;

        return (
          <li key={item.id} style={styles.filterItem}>
            <input
              type="checkbox"
              id={uniqueId}
              checked={isChecked}
              onChange={() => onChange(item.id)}
            />
            <label htmlFor={uniqueId} style={{ cursor: 'pointer' }}>
              {item.slug} ({item[currentLang] || item.en})
            </label>
          </li>
        )
      })}
    </>
  );
}

const styles = {
  filterItem: {
    listStyle: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    margin: '6px 0',
  },
};

export default memo(FilterList);