import React from 'preact/compat';

export function ListView({ onEditStory, onPreviewStory, onCreateNewStory }) {
  // Placeholder for a single test story
  const testStory = {
    id: 'test-story-1',
    name: 'Moja Przykładowa Historia',
    description: 'Krótki opis testowej historii, która ma za zadanie zaprezentować funkcjonalność listy opowieści.'
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Twoje Historie</h1>
      
      <button onClick={onCreateNewStory} style={styles.addButton}>+ Dodaj Nową Historię</button>

      <div style={styles.storyCard}>
        <h2 style={styles.storyTitle}>{testStory.name}</h2>
        <p style={styles.storyDescription}>{testStory.description}</p>
        <div style={styles.buttonGroup}>
          <button onClick={() => onEditStory(testStory.id)} style={styles.editButton}>Edytuj Historię</button>
          <button onClick={() => onPreviewStory(testStory.id)} style={styles.previewButton}>Podgląd</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#F9FAFB',
    minHeight: '100vh',
    fontFamily: 'sans-serif',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
  },
  header: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '10px',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '12px 25px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    transition: 'background-color 0.3s ease',
  },
  storyCard: {
    backgroundColor: 'white',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    padding: '25px',
    width: '100%',
    maxWidth: '600px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  storyTitle: {
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#333',
  },
  storyDescription: {
    fontSize: '15px',
    color: '#555',
    lineHeight: '1.5',
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    marginTop: '15px',
    justifyContent: 'flex-end',
  },
  editButton: {
    backgroundColor: '#2196F3',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '6px',
    border: 'none',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  previewButton: {
    backgroundColor: '#FFC107',
    color: '#333',
    padding: '10px 20px',
    borderRadius: '6px',
    border: 'none',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
};
