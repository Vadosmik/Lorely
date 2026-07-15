import { useLocation } from 'preact-iso';
import { useState, useEffect } from 'preact/hooks';
import { useLanguage } from '../../context/LanguageContext.jsx';

import { profileService } from '../../services/ProfileService.js';
import { catalogService } from '../../services/CatalogService.js';
import { storageService } from '../../services/StorageService.js';
import { genreService } from '../../services/GenreService.js';
import { categoryService } from '../../services/CategoryService.js';

import CachedImage from '../../components/common/CachedImage'
import { DEFAULT_COVER } from '../../utils/imageCache';

export default function StoryDetails({ story_id }) {
  const [story, setStory] = useState(null);
  // const [genres, setGenres] = useState([]);
  // const [categories, setCategories] = useState([]);

  const { route } = useLocation();
  const { currentLang } = useLanguage();

  useEffect(() => {
    async function loadCatalogData() {
      try {
        const fetchedStory = await catalogService.getStory(story_id);
        if (!fetchedStory) return;

        const [fetchedUser, fetchedGenres, fetchedCategories] = await Promise.all([
          profileService.getUser(fetchedStory.author_id).catch(() => null),
          genreService.getGenres().catch(() => []),
          categoryService.getCategories().catch(() => [])
        ]);

        fetchedStory.author_username = fetchedUser?.username || 'Unknown Author';

        const genresMap = new Map((fetchedGenres || []).map(g => [g.id, g.slug]));
        const storyGenreIds = fetchedStory.genre_ids || fetchedStory.genres || [];

        const categoriesMap = new Map((fetchedCategories || []).map(c => [c.id, c.slug]));
        const storyCategoryIds = fetchedStory.category_ids || fetchedStory.categories || [];

        setStory(fetchedStory);
      } catch (err) {
        console.error(err);
      }
    }
    loadCatalogData();
  }, [story_id]);

  useEffect(() => {
    if (story?.title) {
      document.title = story.title;
    }
    return () => {
      document.title = 'Lorely';
    };
  }, [story]);

  const handleOnNavigateToRead = () => {
    route(`/catalog/${story_id}/read`);
  };

  const handleBack = () => {
    route(`/catalog`);
  };

  if (!story) {
    return <div style={styles.container}><p style={{ color: 'var(--color-text)' }}>Loading...</p></div>;
  }

  return (
    <div style={styles.container}>
      <button onClick={handleBack} style={styles.backButton}>{'← Back'}</button>
      <h2>Story data</h2>

      <div style={styles.coverSection}>
        <div style={styles.coverStackBgLeft} />
        <div style={styles.coverStackBgRight} />
        <div style={styles.coverContainer}>
          <CachedImage
            path={story.cover_pic_path}
            fallback={DEFAULT_COVER}
            alt="Cover"
            style={styles.cover}
          />
          <div style={styles.ratingBadge}>6.7</div>
        </div>
      </div>

      <h2 style={styles.title}>{story.title}</h2>
      <div style={styles.statsContainer}>
        <span style={styles.badge}><b>like:</b> {story.liked || '0'}</span>
        <span style={styles.badge}><b>views:</b> {story.viewed || '0'}</span>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Description:</h3>
        <p style={styles.descriptionText}>{story.description || "No description..."}</p>
        <p style={styles.tags}>
          {(story.genres || []).map(genre => (
            <span key={genre.id} style={{ marginRight: '8px' }}>#{genre[currentLang] || genre.en}</span>
          ))}
        </p>
        <p style={styles.tags}>
          {(story.categories || []).map(category => (
            <span key={category.id} style={{ marginRight: '8px' }}>#{category[currentLang] || category.en}</span>
          ))}
        </p>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Autor:</h3>
        <div style={styles.authorRow}>
          <div style={styles.authorAvatar} />
          <span style={styles.authorName}>{story.author_username}</span>
        </div>
      </div>

      <div style={styles.metaGrid}>
        <div>
          <h3 style={styles.sectionTitle}>Status:</h3>
          <p style={styles.metaValue}>{story.status || 'writted'}</p>
        </div>
        <div>
          <h3 style={styles.sectionTitle}>Age restriction:</h3>
          <p style={styles.metaValue}>{story.age_rate ? `${story.age_rate}+` : '16+'}</p>
        </div>
      </div>

      <h3 style={styles.sectionTitle}>Opinion:</h3>
      <h3 style={styles.sectionTitle}>Similar:</h3>

      <div style={styles.actionBar}>
        {story.story_json_path ? (
          <button onClick={handleOnNavigateToRead} style={styles.readButton}>
            read
          </button>
        ) : (
          <button style={{ ...styles.readButton, opacity: 0.5, cursor: 'not-allowed' }} disabled>
            no content
          </button>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: {
    maxWidth: '450px',
    margin: '0 auto',
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text)',
    fontFamily: 'sans-serif',
    padding: '16px',
    minHeight: '100vh',
    position: 'relative',
    boxSizing: 'border-box',
  },
  backButton: {
    background: 'none',
    border: 'none',
    color: 'var(--color-text-muted)',
    cursor: 'pointer',
    fontSize: '15px',
    marginBottom: '16px',
    padding: 0,
  },
  coverSection: {
    position: 'relative',
    height: '240px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: '20px 0 30px 0',
  },
  coverContainer: {
    position: 'relative',
    width: '150px',
    height: '210px',
    borderRadius: '16px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
    zIndex: 3,
    overflow: 'hidden',
    border: '1px solid var(--color-border)',
  },
  cover: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  coverStackBgLeft: {
    position: 'absolute',
    width: '130px',
    height: '180px',
    backgroundColor: 'var(--color-bg)',
    border: '1.5px solid var(--color-border)',
    borderRadius: '16px',
    left: '10%',
    transform: 'rotate(-8deg)',
    zIndex: 1,
    opacity: 0.5,
  },
  coverStackBgRight: {
    position: 'absolute',
    width: '130px',
    height: '180px',
    backgroundColor: 'var(--color-bg)',
    border: '1.5px solid var(--color-border)',
    borderRadius: '16px',
    right: '10%',
    transform: 'rotate(8deg)',
    zIndex: 1,
    opacity: 0.5,
  },
  ratingBadge: {
    position: 'absolute',
    bottom: '10px',
    right: '10px',
    backgroundColor: 'var(--color-bg)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text)',
    fontSize: '12px',
    fontWeight: 'bold',
    padding: '3px 8px',
    borderRadius: '10px',
  },
  title: {
    fontSize: '24px',
    textAlign: 'center',
    margin: '10px 0 5px 0',
    color: 'var(--color-text)',
    textTransform: 'capitalize',
  },
  statsContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '12px',
    marginBottom: '24px',
  },
  badge: {
    fontSize: '12px',
    padding: '4px 14px',
    border: '1px solid var(--color-primary)',
    borderRadius: '20px',
    color: 'var(--color-text-muted)',
  },
  section: {
    margin: '20px 0',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: 'var(--color-text)',
    margin: '0 0 6px 0',
  },
  descriptionText: {
    fontSize: '14px',
    color: 'var(--color-text-muted)',
    lineHeight: '1.4',
    margin: 0,
  },
  tags: {
    fontSize: '12px',
    color: 'var(--color-text-muted)',
    opacity: 0.7,
    marginTop: '6px',
  },
  authorRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  authorAvatar: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-primary)',
    border: '1px solid var(--color-border)',
  },
  metaGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    margin: '20px 0',
  },
  metaValue: {
    margin: 0,
    fontSize: '15px',
    color: 'var(--color-text-muted)',
  },
  actionBar: {
    position: 'fixed',
    bottom: '16px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 'calc(100% - 32px)',
    maxWidth: '418px',
    display: 'flex',
    gap: '12px',
    zIndex: 10,
  },
  readButton: {
    flex: 1,
    backgroundColor: 'var(--color-primary)',
    color: 'var(--color-accent)',
    border: '1.5px solid var(--color-border)',
    borderRadius: '24px',
    padding: '14px 0',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
}