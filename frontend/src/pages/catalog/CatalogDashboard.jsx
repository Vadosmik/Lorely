import { useLocation } from 'preact-iso';
import { useState, useEffect } from 'preact/hooks';
import { useLanguage } from '../../context/LanguageContext.jsx';

import { profileService } from '../../services/ProfileService.js';
import { catalogService } from '../../services/CatalogService.js';

import { genreService } from '../../services/GenreService.js';
import { categoryService } from '../../services/CategoryService.js';

import CachedImage from '../../components/common/CachedImage'
import { DEFAULT_COVER } from '../../utils/imageCache';

export default function CatalogDashboard() {
  const [stories, setStories] = useState([]);

  const [genres, setGenres] = useState([]);
  const [categories, setCategories] = useState([]);

  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  const { route } = useLocation();
  const { currentLang } = useLanguage();

  useEffect(() => {
    async function initData() {
      try {
        const fetchedStories = await catalogService.getStories([]);
        const fetchedGenres = await genreService.getGenres();
        const fetchedCategory = await categoryService.getCategories();

        const fetchedUsers = await profileService.getUsers() || [];
        const usersMap = new Map(fetchedUsers.map(u => [u.id, u.username]));

        fetchedStories.forEach(story => {
          story.author_username = usersMap.get(story.author_id) || 'Unknown Author';
        });

        setStories(fetchedStories);

        setGenres(fetchedGenres || []);
        setCategories(fetchedCategory || []);
      } catch (err) {
        console.error(err);
      }
    }
    initData();
  }, []);

  async function loadCatalogData() {
    try {
      const filters = {
        genre_ids: selectedGenres,
        category_ids: selectedCategories
      };

      const fetchedStories = await catalogService.searchStories(filters);

      const fetchedUsers = await profileService.getUsers() || [];
      const usersMap = new Map(fetchedUsers.map(u => [u.id, u.username]));

      fetchedStories.forEach(story => {
        story.author_username = usersMap.get(story.author_id) || 'Unknown Author';
      });

      setStories(fetchedStories);
    } catch (err) {
      console.error("Błąd filtrowania:", err);
    }
  }

  const handleGenreChange = (genreId) => {
    setSelectedGenres(prev => {
      const next = prev.includes(genreId) ? prev.filter(id => id !== genreId) : [...prev, genreId];
      return next;
    });
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategories(prev => {
      const next = prev.includes(categoryId) ? prev.filter(id => id !== categoryId) : [...prev, categoryId];
      return next;
    });
  };

  const handleOnNavigateToDetails = (id) => {
    route(`/catalog/${id}/details`);
  };

  return (
    <>
      <section>
        <label style={{ fontWeight: 'bold', display: 'block', margin: '10px 0' }}>Genre</label>
        <ul style={{ padding: 0 }}>
          {genres.map(genre => {
            const isChecked = selectedGenres.includes(genre.id) || false;

            return (
              <li key={genre.id} style={styles.filterItem}>
                <input
                  type="checkbox"
                  id={`genre-${genre.id}`}
                  checked={isChecked}
                  onChange={() => handleGenreChange(genre.id)}
                />
                <label htmlFor={`genre-${genre.id}`} style={{ cursor: 'pointer' }}>
                  {genre.slug} ({genre[currentLang] || genre.en})
                </label>
              </li>
            )
          })}
        </ul>

        <label style={{ fontWeight: 'bold', display: 'block', margin: '10px 0' }}>Category</label>
        <ul style={{ padding: 0 }}>
          {categories.map(category => {
            const isChecked = selectedCategories.includes(category.id) || false;

            return (
              <li key={category.id} style={styles.filterItem}>
                <input
                  type="checkbox"
                  id={`category-${category.id}`}
                  checked={isChecked}
                  onChange={() => handleCategoryChange(category.id)}
                />
                <label htmlFor={`category-${category.id}`} style={{ cursor: 'pointer' }}>
                  {category.slug} ({category[currentLang] || category.en})
                </label>
              </li>
            )
          })}
        </ul>

        <button type="button" onClick={() => loadCatalogData()}>
          Search
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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: 'clamp(8px, 2vw, 24px) clamp(6px, 1.5vw, 32px)',
    marginTop: 'clamp(4px, 1.5vw, 20px)',
    padding: 0,
  },
  filterItem: {
    listStyle: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    margin: '6px 0',
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
    padding: '14px 10px',
    textAlign: 'center',
    flexGrow: 1, 
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start', 
    alignItems: 'center',
  },
  title: {
    fontSize: '15px',
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