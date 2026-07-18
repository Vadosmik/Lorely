import { useLocation } from 'preact-iso';
import { useState, useEffect } from 'preact/hooks';

import { profileService } from '../../services/ProfileService.js';
import { catalogService } from '../../services/CatalogService.js';

import { genreService } from '../../services/GenreService.js';
import { categoryService } from '../../services/CategoryService.js';

import FilterList from './component/FilterList.jsx';
import Icon from '../../components/common/Icon'
import CachedImage from '../../components/common/CachedImage'
import { DEFAULT_COVER } from '../../utils/imageCache';

export default function CatalogDashboard() {
  const [stories, setStories] = useState([]);
  const [genres, setGenres] = useState([]);
  const [categories, setCategories] = useState([]);

  const [selectedGenres, setSelectedGenres] = useState(() => {
    const saved = sessionStorage.getItem('catalog_genres');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedCategories, setSelectedCategories] = useState(() => {
    const saved = sessionStorage.getItem('catalog_categories');
    return saved ? JSON.parse(saved) : [];
  });
  const [searchQuery, setSearchQuery] = useState(() => {
    return sessionStorage.getItem('catalog_search') || '';
  });

  const { route } = useLocation();

  useEffect(() => {
    sessionStorage.setItem('catalog_genres', JSON.stringify(selectedGenres));
    sessionStorage.setItem('catalog_categories', JSON.stringify(selectedCategories));
    sessionStorage.setItem('catalog_search', searchQuery);
  }, [selectedGenres, selectedCategories, searchQuery]);

  async function loadFilteredCatalog(overrides = {}) {
    try {
      const genreIds = overrides.genreIds ?? selectedGenres;
      const categoryIds = overrides.categoryIds ?? selectedCategories;
      const query = (overrides.query ?? searchQuery).toLowerCase().trim();

      const filters = { 
        genre_ids: genreIds, 
        category_ids: categoryIds 
      };

      const fetchedStories = await catalogService.searchStories(filters);

      const fetchedUsers = await profileService.getUsers() || [];
      const usersMap = new Map(fetchedUsers.map(u => [u.id, u.username]));

      fetchedStories.forEach(story => {
        story.author_username = usersMap.get(story.author_id) || 'Unknown Author';
      });

      let filtered = [...fetchedStories];

      if (query) {
        const scoredStories = filtered.map(story => {
          const title = story.title.toLowerCase();
          let score = 0;

          if (title === query) {
            score += 100;
          } else if (title.startsWith(query)) {
            score += 50;
          } else if (title.includes(query)) {
            score += 20;
          }

          const words = query.split(/\s+/);
          words.forEach(word => {
            if (word && title.includes(word)) {
              score += 5;
            }
          });

          return { ...story, score };
        });

        filtered = scoredStories
          .filter(story => story.score > 0)
          .sort((a, b) => b.score - a.score);
      }

      setStories(filtered);
    } catch (err) {
      console.error("Błąd filtrowania:", err);
    }
  }

  useEffect(() => {
    async function initData() {
      try {
        const fetchedGenres = await genreService.getGenres();
        const fetchedCategory = await categoryService.getCategories();

        setGenres(fetchedGenres || []);
        setCategories(fetchedCategory || []);

        await loadFilteredCatalog();
      } catch (err) {
        console.error(err);
      }
    }
    initData();
  }, []);

  const handleGenreChange = (genreId) => {
    setSelectedGenres(prev => {
      return (prev.includes(genreId) ? prev.filter(id => id !== genreId) : [...prev, genreId]);
    });
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategories(prev => {
      return (prev.includes(categoryId) ? prev.filter(id => id !== categoryId) : [...prev, categoryId]);
    });
  };

  async function handleClearFilters() {
    setSearchQuery('');
    setSelectedCategories([]);
    setSelectedGenres([]);

    await loadFilteredCatalog({ genreIds: [], categoryIds: [], query: '' });
  };

  const handleOnNavigateToDetails = (id) => {
    route(`/catalog/${id}/details`);
  };

  return (
    <>
      <section>
        <div style={styles.searchContainer}>
          <Icon name="search" alt="Search" style={styles.searchIcon} />
          <input
            type="search"
            placeholder="Type to search story..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadFilteredCatalog()}
            style={styles.searchInput}
          />
        </div>
      </section>

      <section>
        <label style={{ fontWeight: 'bold', display: 'block', margin: '10px 0' }}>Genre</label>
        <ul style={{ padding: 0 }}>
          <FilterList items={genres} selected={selectedGenres} onChange={handleGenreChange} prefix="genre" />
        </ul>

        <label style={{ fontWeight: 'bold', display: 'block', margin: '10px 0' }}>Category</label>
        <ul style={{ padding: 0 }}>
          <FilterList items={categories} selected={selectedCategories} onChange={handleCategoryChange} prefix="category" />
        </ul>

        <button type="button" onClick={loadFilteredCatalog}>
          Search
        </button>
        <button type="button" onClick={handleClearFilters}>
          Clear filters
        </button>
      </section>

      <section>
        <h2>Stories List</h2>
        <ul style={styles.grid}>
          {stories.map(story => (
            <li key={story.id} style={styles.storyItem}>
              <button
                onClick={() => handleOnNavigateToDetails(story.id)}
                style={styles.card}
              >
                <CachedImage
                  path={story.cover_pic_path}
                  fallback={DEFAULT_COVER}
                  alt="Cover"
                  style={styles.cover}
                />
                <div style={styles.cardContent}>
                  <strong style={styles.title}>{story.title}</strong>
                </div>
              </button>
              <span style={styles.author}>{story.author_username || 'author'}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}

const styles = {
  back: {
    minHeight: '100vh',
  },
  searchSection: {
    marginBottom: '20px',
    width: '100%',
  },
  searchContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: '8px',
    padding: '4px 12px',
    width: '100%',
    boxSizing: 'border-box',
  },
  searchIcon: {
    width: '24px',
    height: '24px',
    color: 'var(--color-text)',
    flexShrink: 0,
  },
  searchInput: {
    flexGrow: 1,
    padding: '8px 0',
    borderRadius: '0',
    border: 'none',
    backgroundColor: 'transparent',
    color: 'var(--color-text)',
    fontSize: '16px',
    outline: 'none',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: 'clamp(8px, 2vw, 24px) clamp(6px, 1.5vw, 32px)',
    marginTop: 'clamp(4px, 1.5vw, 20px)',
    padding: 0,
  },
  storyItem: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    background: 'none',
    border: '2px solid transparent',
    borderRadius: '14px',
    overflow: 'hidden',
    padding: 0,
    cursor: 'pointer',
    transition: 'border-color 0.15s ease',
    height: '100%',
  },
  cover: {
    width: '100%',
    aspectRatio: '3 / 4',
    objectFit: 'cover',
    display: 'block',
    flexShrink: 0,
  },
  cardContent: {
    background: 'var(--color-primary)',
    padding: '10px 10px',
    textAlign: 'center',
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  title: {
    fontSize: '14px',
    color: '#222',

    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',

    width: '100%',
  },
  author: {
    color: 'var(--color-primary)',
    marginTop: '4px',
    fontSize: '14px',
    textAlign: 'right',
  },
};