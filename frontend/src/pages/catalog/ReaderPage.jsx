import { useLocation } from 'preact-iso';
import { useState, useCallback, useEffect } from 'preact/hooks';

import { catalogService } from '../../services/CatalogService.js';
import { storageService } from '../../services/StorageService.js';

import StoryReader from '../../components/StoryReader.jsx';

export default function ReaderPage({ story_id }) {
  const [story, setStory] = useState(null);
  const [storyJson, setStoryJson] = useState(null);

  const [resetKey, setResetKey] = useState(0);

  const { route } = useLocation();

  const loadStoryData = useCallback(async () => {
    try {
      const fetchedStory = await catalogService.getStory(story_id);

      if (fetchedStory && fetchedStory.story_json_path) {
        const blob = await storageService.getFile(fetchedStory.story_json_path);
        const storyJsonText = await blob.text();
        setStoryJson(JSON.parse(storyJsonText));
      }

      setStory(fetchedStory);
    } catch (err) {
      console.error(err);
    }
  }, [story_id]);

  useEffect(() => {
    loadStoryData();
  }, [loadStoryData]);

  useEffect(() => {
    if (story?.title) {
      document.title = story.title;
    }
    return () => {
      document.title = 'Lorely';
    };
  }, [story]);

  const handleBack = () => {
    route(`/catalog/${story_id}/details`);
  };

  const handleResetTrigger = () => {
    if (window.confirm("Are you sure you want to reset your progress?")) {
      localStorage.removeItem(`lorely_history_${story_id}`);
      localStorage.removeItem(`lorely_variables_${story_id}`);

      setResetKey(prev => prev + 1);
    }
  };

  if (!story || !storyJson) {
    return (
      <div style={styles.loadingContainer}>
        <p style={{ color: 'var(--color-text-muted)' }}>Loading story...</p>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      <header style={styles.storyHeader}>
        <button onClick={handleBack} style={styles.backButton}>{'← Back'}</button>
        <h1 style={styles.headerTitle}>{story.title || "Lorely Reader"}</h1>
        <button onClick={handleResetTrigger} style={styles.resetBtn}>Reset Progress</button>
      </header>

      <StoryReader
        key={resetKey}
        storyId={story.id}
        storyJson={storyJson}
      />
    </div>
  )
}

const styles = {
  pageContainer: {
    minHeight: '100vh',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '50vh',
  },
  backButton: {
    background: 'none',
    border: 'none',
    color: 'var(--color-text-muted)',
    cursor: 'pointer',
    fontSize: '15px',
    padding: 0,
    margin: 0,
  },
  storyHeader: {
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 'clamp(10px, 2vw, 16px) clamp(12px, 4vw, 24px)',
    backgroundColor: 'var(--color-surface)',
    borderBottom: '1px solid var(--color-border)',
    gap: '12px',
  },
  headerTitle: {
  fontSize: 'clamp(16px, 4vw, 20px)',
  fontWeight: 'bold',
  color: 'var(--color-text)',
  textAlign: 'center',
  flex: 1,
  
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
},
  resetBtn: {
    background: 'none',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-muted)',
    padding: '6px 14px',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 'bold',
    transition: 'all 0.2s ease',
  },
};