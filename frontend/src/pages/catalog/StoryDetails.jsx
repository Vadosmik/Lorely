import { useLocation } from 'preact-iso';
import { useState, useEffect } from 'preact/hooks';
import { catalogService } from '../../services/CatalogService.js';
import { storageService } from '../../services/StorageService.js';

export default function StoryDetails({ story_id }) {
  const [story, setStory] = useState([]);
  const [coverUrl, setCoverUrl] = useState(null);

  const { route } = useLocation();

  useEffect(() => {
    async function loadCatalogData() {
      try {
        const fetchedStory = await catalogService.getStory(story_id);

        if (fetchedStory && fetchedStory.cover_pic_path) {
          const blob = await storageService.getFile(fetchedStory.cover_pic_path);
          const url = URL.createObjectURL(blob);
          setCoverUrl(url);
        } else {
          setCoverUrl(null);
        }

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

  return (
    <div>
      <button onClick={handleBack}>{'< back'}</button>
      <h2>Story data</h2>
      {story ? (
        <div>
          <div className="info">
            <img
              src={coverUrl || '/default_cover.jpg'}
              alt="Cover"
              style={{ width: '150px', marginBottom: '10px', borderRadius: '8px' }}
            />

            <h3>Title:</h3>
            <p>{story.title}</p>

            <h3>Description:</h3>
            <p>{story.description || "No description provided."}</p>

            <h3>Age rate:</h3>
            <p>{story.age_rate}+</p>

            <h3>Likes:</h3>
            <p>{story.liked}</p>

            <h3>Views:</h3>
            <p>{story.viewed}</p>

            <h3>Status:</h3>
            <p>{story.status}</p>
          </div>
        </div>
      ) : (
        <p>Select a story from the list above to view its catalog details.</p>
      )}

      {story.story_json_path ? (
        <button type="button" onClick={() => handleOnNavigateToRead(story_id)}>
          Read
        </button>
      ) : (
        <p></p>
      )}
    </div>
  )
}

const styles = {

}