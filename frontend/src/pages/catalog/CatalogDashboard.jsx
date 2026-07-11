import { useLocation } from 'preact-iso';
import { useState, useEffect } from 'preact/hooks';
import { useLanguage } from '../../LanguageContext';

import { profileService } from '../../services/ProfileService.js';
import { catalogService } from '../../services/CatalogService.js';
import { storageService } from '../../services/StorageService.js';

import { genreService } from '../../services/GenreService.js';
import { categoryService } from '../../services/CategoryService.js';

export default function CatalogDashboard() {
  const [stories, setStories] = useState([]);
  const [coverUrls, setCoverUrls] = useState({});

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

        const urlsMap = {};
        await Promise.all(
          fetchedStories.map(async (story) => {
            if (story.cover_pic_path) {
              try {
                const blob = await storageService.getFile(story.cover_pic_path);
                urlsMap[story.id] = URL.createObjectURL(blob);
              } catch (err) {
                console.error(err);
              }
            }
          })
        );

        setGenres(fetchedGenres || []);
        setCategories(fetchedCategory || []);
        setCoverUrls(urlsMap);
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
    <div style={styles.back}>
      <h1>Catalog</h1>

      <label>Genre</label>
      {genres.map(genre => {
        const isChecked = selectedGenres.includes(genre.id) || false;

        return (
          <li key={genre.id}>
            <input
              type="checkbox"
              id={`genre-${genre.id}`}
              checked={isChecked}
              onChange={() => handleGenreChange(genre.id)}
            />
            <label htmlFor={`genre-${genre.id}`}>
              {genre.slug} ({genre[currentLang] || genre.en})
            </label>
          </li>
        )
      })}
      <label>Category</label>
      {categories.map(category => {
        const isChecked = selectedCategories.includes(category.id) || false;

        return (
          <li key={category.id}>
            <input
              type="checkbox"
              id={`category-${category.id}`}
              checked={isChecked}
              onChange={() => handleCategoryChange(category.id)}
            />
            <label htmlFor={`category-${category.id}`}>
              {category.slug} ({category[currentLang] || category.en})
            </label>
          </li>
        )
      })}

      <button type="button" onClick={() => loadCatalogData()}>
        Search
      </button>

      <h2>Stories List</h2>
      <ul style={styles.grid}>
        {stories.map(story => (
          <li key={story.id} style={styles.item}>
            <button
              onClick={() => handleOnNavigateToDetails(story.id)}
              style={styles.card}
            >
              <img
                src={coverUrls[story.id] || '/default_cover.jpg'}
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
    </div>
  )
}

const styles = {
  back: {
    background: '#F2F1ED',
    minHeight: '100vh',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '24px 32px',
    marginTop: '20px',
  },
  item: {
    display: 'flex',
    flexDirection: 'column',
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
  },
  cover: {
    width: '100%',
    aspectRatio: '3 / 4',
    objectFit: 'cover',
    display: 'block',
  },
  cardContent: {
    background: '#FFD441',
    padding: '14px 10px',
    textAlign: 'center',
  },
  title: {
    fontSize: '15px',
    color: '#222',
  },
  author: {
    color: '#FFD441',
    marginTop: '4px',
    fontSize: '14px',

    textAlign: 'right',
  },
};