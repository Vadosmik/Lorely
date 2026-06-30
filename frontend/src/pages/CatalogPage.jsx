import { useState, useEffect } from 'preact/hooks';
import { catalogService } from '../services/catalogService.js';
import { storageService } from '../services/storageService.js';
import StoryReader from '../components/StoryReader.jsx';

export default function EditPage() {
  const [stories, setStories] = useState([]);
  const [storyData, setStoryData] = useState(null);
  const [coverUrls, setCoverUrls] = useState({});
  const [gameStoryJson, setGameStoryJson] = useState(null);

  useEffect(() => {
    async function fetchCatalogList() {
      try {
        const data = await catalogService.getStories();

        setStories(data);

        const urlsMap = {};
        await Promise.all(
          data.map(async (story) => {
            if (story.cover_pic_path) {
              try {
                const blob = await storageService.getFile(story.cover_pic_path);
                urlsMap[story.id] = URL.createObjectURL(blob);
              } catch (err) {
                console.error(`Nie udało się pobrać okładki dla story ${story.id}:`, err);
              }
            }
          })
        );

        setCoverUrls(urlsMap);
      } catch (err) {
        console.error(err);
      }
    }
    fetchCatalogList();
  }, []);

  const handleGetStory = async (id) => {
    try {
      const data = await catalogService.getStory(id);
      setStoryData(data);

      if (data && data.cover_pic_path && !coverUrls[id]) {
        const blob = await storageService.getFile(data.cover_pic_path);
        const url = URL.createObjectURL(blob);
        setCoverUrls(prev => ({ ...prev, [id]: url }));
      }

      if (data && data.story_json_path) {
        const blob = await storageService.getFile(data.story_json_path);
        const url = URL.createObjectURL(blob);
        const jsonResponse = await fetch(url);
        const storyJson = await jsonResponse.json();

        setGameStoryJson(storyJson);
      }
    } catch (err) {
      console.dir(err);
    }
  };

  const handleResetTrigger = () => {
    handleGetStory(storyData.id);
  };

  return (
    <div>
      <h1>Catalog</h1>

      <h2>Stories List</h2>
      <ul style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', listStyle: 'none', padding: 0 }}>
        {stories.map(story => (
          <li key={story.id} style={{ width: '160px' }}>
            <button
              onClick={() => handleGetStory(story.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}
            >
              <img
                src={coverUrls[story.id] || '/default_cover.jpg'}
                style={{ width: '150px', height: '250px', objectFit: 'cover', display: 'block', marginBottom: '10px', borderRadius: '8px' }}
                alt="Cover"
              />
              <strong style={{ display: 'block', maxWidth: '150px' }}>{story.title}</strong>
            </button>
          </li>
        ))}
      </ul>

      <hr style={{ margin: '30px 0', borderColor: '#333' }} />

      <h2>Story data</h2>
      {storyData ? (
        <div>
          <div className="info">
            <img
              src={coverUrls[storyData.id] || '/default_cover.jpg'}
              alt="Cover"
              style={{ width: '150px', marginBottom: '10px', borderRadius: '8px' }}
            />

            <h3>Title:</h3>
            <p>{storyData.title}</p>

            <h3>Description:</h3>
            <p>{storyData.description || "No description provided."}</p>

            <h3>Age rate:</h3>
            <p>{storyData.age_rate}+</p>

            <h3>Likes:</h3>
            <p>{storyData.liked}</p>

            <h3>Views:</h3>
            <p>{storyData.viewed}</p>

            <h3>Status:</h3>
            <p>{storyData.status}</p>
          </div>
        </div>
      ) : (
        <p>Select a story from the list above to view its catalog details.</p>
      )}

      <hr style={{ margin: '30px 0', borderColor: '#333' }} />

      {storyData && gameStoryJson && (
        <StoryReader
          storyId={storyData.id}
          storyJson={gameStoryJson}
          onReset={handleResetTrigger}
        />
      )}
    </div>
  )
}

const styles = {

}