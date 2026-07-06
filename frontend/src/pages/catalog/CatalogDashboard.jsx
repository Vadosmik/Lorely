import { useLocation } from 'preact-iso';
import { useState, useEffect } from 'preact/hooks';
import { useLanguage } from '../../LanguageContext';

import { profileService } from '../../services/ProfileServiece.js';
import { catalogService } from '../../services/CatalogService.js';
import { storageService } from '../../services/StorageService.js';

import { genreService } from '../../services/GenreService.js';
import { categoryService } from '../../services/CategoryService.js';

export default function CatalogDashboard() {
  const [stories, setStories] = useState([]);
  const [coverUrls, setCoverUrls] = useState({});

  const [genres, setGenres] = useState([]);
  const [categories, setCategories] = useState([]);

  const { route } = useLocation();
  const { currentLang } = useLanguage();

  useEffect(() => {
    async function loadCatalogData() {
      try {
        const fetchedStories = await catalogService.getStories();
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
    loadCatalogData();
  }, []);

  const handleOnNavigateToDetails = (id) => {
    route(`/catalog/${id}/details`);
  };

  return (
    <div style={styles.back}>
      <h1>Catalog</h1>

      {genres.map(genre => {
        return (
          <label htmlFor={`genre-${genre.id}`}>
            {genre.slug} ({genre[currentLang] || genre.en})
          </label>
        )
      })}
      <br></br>
      {categories.map(category => {
        return (
          <label htmlFor={`category-${category.id}`}>
            {category.slug} ({category[currentLang] || category.en})
          </label>
        )
      })}

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