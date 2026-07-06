import { useLocation } from 'preact-iso';
import { useState, useEffect } from 'preact/hooks';
import { useLanguage } from '../../LanguageContext.jsx';

import { storyService } from '../../services/StoryService.js';
import { catalogService } from '../../services/CatalogService.js';
import { storageService } from '../../services/StorageService.js';
import { genreService } from '../../services/GenreService.js';
import { categoryService } from '../../services/CategoryService.js';

export default function StoryDetails({ story_id }) {
  const [story, setStory] = useState(null);
  const [storyData, setStoryData] = useState(null);

  const [genres, setGenres] = useState([]);
  const [categories, setCategories] = useState([]);

  const [coverUrl, setCoverUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const { route } = useLocation();
  const { currentLang } = useLanguage();

  useEffect(() => {
    async function loadStoryData() {
      try {
        const fetchedStory = await storyService.getStory(story_id);
        const fetchedGenres = await genreService.getGenres();
        const fetchedCategory = await categoryService.getCategories();

        if (fetchedStory && fetchedStory.cover_pic_path) {
          const blob = await storageService.getFile(fetchedStory.cover_pic_path);
          const url = URL.createObjectURL(blob);
          setCoverUrl(url);
        } else {
          setCoverUrl(null);
        }

        setGenres(fetchedGenres || []);
        setCategories(fetchedCategory || []);
        setStory(fetchedStory);
        setStoryData(fetchedStory);
      } catch (err) {
        console.error(err);
      }
    }
    loadStoryData();
  }, [story_id]);

  useEffect(() => {
    if (story?.title) {
      document.title = story.title;
    }
    return () => {
      document.title = 'Lorely';
    };
  }, [story]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setStoryData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setCoverUrl(URL.createObjectURL(file));
    }
  };

  const handleGenreChange = (genreId) => {
    setStoryData((prevData) => {
      const currentIds = prevData.genre_ids || [];

      const updatedIds = currentIds.includes(genreId)
        ? currentIds.filter(id => id !== genreId)
        : [...currentIds, genreId];

      return {
        ...prevData,
        genre_ids: updatedIds
      };
    });
  }

  const handleCategoryChange = (categoryId) => {
    setStoryData((prevData) => {
      const currentIds = prevData.category_ids || [];

      const updatedIds = currentIds.includes(categoryId)
        ? currentIds.filter(id => id !== categoryId)
        : [...currentIds, categoryId];

      return {
        ...prevData,
        category_ids: updatedIds
      };
    });
  }

  const handleCoverSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Error: Please select a file first!');
      return;
    }

    try {
      if (storyData && storyData.cover_pic_path) {
        await storageService.deleteFile(storyData.cover_pic_path);
      }

      const newCoverPath = await storageService.uploadFile('covers', selectedFile);
      const updatePayload = { cover_pic_path: newCoverPath };

      const updatedStory = await storyService.updateStoryInfo(storyData.id, updatePayload);
      setStoryData(updatedStory);
      setSelectedFile(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCoverDelete = async (e) => {
    e.preventDefault();
    if (!storyData?.cover_pic_path) {
      alert("You don't have a cover to delete.");
      return;
    }

    try {
      await storageService.deleteFile(storyData.cover_pic_path);

      const updatePayload = { cover_pic_path: null };

      const updatedStory = await storyService.updateStoryInfo(storyData.id, updatePayload);

      setStoryData(updatedStory);
      setCoverUrl(null);
      setSelectedFile(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStoryUpdate = async (e) => {
    e.preventDefault();
    try {
      const updatePayload = {
        title: storyData.title,
        description: storyData.description === '' ? null : storyData.description,
        age_rate: storyData.age_rate,
        genre_ids: storyData.genre_ids || [],
        category_ids: storyData.category_ids || []
      };

      const updatedStory = await storyService.updateStoryInfo(storyData.id, updatePayload);

      setStoryData(updatedStory);
    } catch (err) {
      console.error(err);
    }
  }

  const handleStoryDelete = async (e) => {
    e.preventDefault();
    if (!confirm('Realy want to delete?')) return;
    try {
      const allPublished = await catalogService.getMinePublishedStories();
      const isPublished = allPublished.some(s => s.id === Number(story_id));

      if (isPublished) {
        await catalogService.deleteStory(story_id);
      }

      await storyService.deleteStory(story_id);
      route(`/studio`);
    } catch (err) {
      console.error(err);
    }
  }

  const handleBack = () => {
    route(`/studio`);
  };

  return (
    <div>
      <button onClick={handleBack}>{'< back'}</button>
      {story ? (
        <>
          <h2>Story Details: "{story.title}" (ID: {story_id})</h2>

          <form onSubmit={handleCoverSubmit}>
            <label htmlFor="cover">
              <img
                src={coverUrl || '/default_cover.jpg'}
                alt="Cover"
              />
            </label>

            <input
              id="cover"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />

            <div>
              <button type="submit">
                Update cover
              </button>
              <button type="button" onClick={handleCoverDelete}>
                Delete Cover
              </button>
            </div>
          </form>

          <form onSubmit={handleStoryUpdate}>

            <label>Title</label>
            <input
              type='text'
              id="ltitle"
              name="title"
              value={storyData?.title || ''}
              onInput={handleChange}
            /> <br></br>

            <label>Description</label>
            <input
              type='text'
              id="ldesc"
              name="description"
              value={storyData?.description || ''}
              onInput={handleChange}
            /><br></br>

            <label>age rate</label>
            <input
              type='number'
              id="lage"
              name="age_rate"
              value={storyData?.age_rate || ''}
              onInput={handleChange}
            /><br></br>

            <label>Category</label>
            {categories.map(category => {
              const isChecked = storyData?.category_ids?.includes(category.id) || false;

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

            <label>Genre</label>

            {genres.map(genre => {
              const isChecked = storyData?.genre_ids?.includes(genre.id) || false;

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

            <button type="submit">
              Update data
            </button>
            <button type="button" onClick={handleStoryDelete}>
              Delete story
            </button>

          </form>

        </>
      ) : (
        <h2>Loading story...</h2>
      )}
    </div>
  )
}

const styles = {

};