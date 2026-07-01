import { useState, useEffect } from 'preact/hooks';
import { storyService } from '../services/storyService.js';
import { profileService } from '../services/ProfileServiece.js';
import { catalogService } from '../services/catalogService.js';
import { storageService } from '../services/storageService.js';
import { EditView } from './editor/EditView.jsx';
import { transformJsonToFlow } from './editor/transformJsonToFlow.js';

export default function EditPage() {
  const [currentStoryId, setCurrentStoryId] = useState(null);

  const [initialNodes, setInitialNodes] = useState(null);
  const [initialEdges, setCInitialEdges] = useState(null);

  const [stories, setStories] = useState([]);
  const [publishedStories, setpublishedStories] = useState([]);
  const [storyData, setStoryData] = useState(null);
  const [title, setTitle] = useState('');
  const [coverUrl, setCoverUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    async function fetchEditList() {
      try {
        const data = await storyService.getStories();
        const pub_data = await catalogService.getStories();
        const user = await profileService.getMe();

        setStories(data);

        const myPublished = pub_data.filter(story => Number(story.author_id) === Number(user.id));
        setpublishedStories(myPublished);

      } catch (err) {
        console.error(err);
      }
    }
    fetchEditList();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setCoverUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmitNewStory = async (e) => {
    e.preventDefault();
    try {
      const templateResponse = await fetch('/template.json');
      const templateBlob = await templateResponse.blob();

      const newStoryPath = await storageService.uploadFile('stories', templateBlob);

      const payload = {
        title: title,
        story_json_path: newStoryPath
      };

      const savedStory = await storyService.createStory(payload);

      const data = await storyService.getStories();

      setStories(data);

      setTitle('');
    } catch (err) {
      console.dir(err);
    }
  };

  const handleGetStory = async (id) => {
    try {
      const data = await storyService.getStory(id);
      setStoryData(data);

      if (data && data.cover_pic_path) {
        const blob = await storageService.getFile(data.cover_pic_path);
        const url = URL.createObjectURL(blob);
        setCoverUrl(url);
      } else {
        setCoverUrl(null);
      }

      if (data && data.story_json_path) {
        const blob = await storageService.getFile(data.story_json_path);
        const url = URL.createObjectURL(blob);
        const jsonResponse = await fetch(url);
        const storyJson = await jsonResponse.json();

        const { initialNodes, initialEdges } = transformJsonToFlow(storyJson)

        setInitialNodes(initialNodes)
        setCInitialEdges(initialEdges)
      }
    } catch (err) {
      console.dir(err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStoryData((prevData) => ({
      ...prevData,
      [name]: value === '' ? null : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Changing story data...');

    try {
      const updatePayload = {
        title: storyData.title,
        description: storyData.description,
        age_rate: storyData.age_rate,
        genre_ids: storyData.genre_ids,
        category_ids: storyData.category_ids
      };

      const updatedStory = await storyService.updateStoryInfo(storyData.id, updatePayload);

      setStoryData(updatedStory);

      console.log('Story data changed successfully!');
    } catch (err) {
      console.error(`Error: ${err.message}`);
    }
  };


  const handleCoverSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      console.error('Error: Please select a file first!');
      return;
    }

    console.log('Changing cover...');

    try {
      if (storyData && storyData.cover_pic_path) {
        try {
          await storageService.deleteFile(storyData.cover_pic_path);
        } catch (delErr) {
          console.warn("Old file not found on storage, skipping deletion:", delErr);
        }
      }

      const newCoverPath = await storageService.uploadFile('covers', selectedFile);

      const updatePayload = {
        cover_pic_path: newCoverPath
      };

      const updatedStory = await storyService.updateStoryInfo(storyData.id, updatePayload);
      setStoryData(updatedStory);
      setSelectedFile(null);

      console.log('Cover changed successfully!');
    } catch (err) {
      console.error(`Error: ${err.message}`);
    }
  };

  const handleCoverDelete = async (e) => {
    e.preventDefault();

    if (!storyData?.cover_pic_path) {
      console.log("You don't have a cover to delete.");
      return;
    }

    console.log('Deleting cover...');

    try {
      await storageService.deleteFile(storyData.cover_pic_path);

      const updatePayload = {
        cover_pic_path: null
      };

      const updatedStory = await storyService.updateStoryInfo(storyData.id, updatePayload);

      setStoryData(updatedStory);
      setCoverUrl(null);
      setSelectedFile(null);

      console.log('Cover deleted successfully!');
    } catch (err) {
      console.error(`Error: ${err.message}`);
    }
  };

  const handleStoryDelete = async () => {
    try {
      console.log('Rozpoczynam procedurę usuwania...');

      const isPublished = publishedStories.some(s => s.id === storyData.id);
      if (isPublished) {
        console.log('Opowiadanie jest w katalogu. Usuwam najpierw wpis z katalogu...');
        await catalogService.deleteStory(storyData.id);
        setpublishedStories(prev => prev.filter(s => s.id !== storyData.id));
      }

      await storyService.deleteStory(storyData.id);

      const data = await storyService.getStories();
      setStories(data);

      setStoryData(null);
      setCoverUrl(null);
      setSelectedFile(null);

      setInitialNodes(null);
      setCInitialEdges(null);

      console.log('Story deleted successfully!');
    } catch (err) {
      console.error(`Error: ${err.message}`);
    }
  };

  const handlePublishSubmit = async (id) => {
    console.log('Publishing story...');

    try {
      const fullStoryData = await storyService.getStory(id);

      const updatePayload = {
        id: id,
        title: fullStoryData.title,
        description: fullStoryData.description,
        cover_pic_path: fullStoryData.cover_pic_path,
        age_rate: fullStoryData.age_rate,
        status: fullStoryData.status,
        story_json_path: fullStoryData.story_json_path,
        genre_ids: fullStoryData.genre_ids || [],
        category_ids: fullStoryData.category_ids || []
      };

      const isAlreadyPublished = publishedStories.some(s => s.id === id);

      if (!isAlreadyPublished) {
        const newPublishedStory = await catalogService.publishStory(updatePayload);

        setpublishedStories([...publishedStories, newPublishedStory]);
        console.log('Story published successfully (POST)!');
      } else {
        const updatedCatalogStory = await catalogService.updateStoryInfo(id, updatePayload);

        setpublishedStories(publishedStories.map(s => s.id === id ? updatedCatalogStory : s));
        console.log('Catalog updated successfully (PATCH)!');
      }
    } catch (err) {
      console.error(`Error: ${err.message}`);
    }
  };

  const handlePublishDelete = async (id) => {
    console.log('Deleting from catalog...');
    try {
      await catalogService.deleteStory(id);

      setpublishedStories(publishedStories.filter(s => s.id !== id));

      if (storyData && storyData.id === id) {
        setStoryData(null);
        setCoverUrl(null);
      }

      console.log('Publish deleted successfully!');
    } catch (err) {
      console.error(`Error: ${err.message}`);
    }
  };

  const handleSaveStoryJson = async (updatedJsonStructure) => {
    if (!storyData || !storyData.story_json_path) {
      console.error("have`t JSON!");
      return;
    }

    try {
      const jsonBlob = new Blob(
        [JSON.stringify(updatedJsonStructure, null, 2)],
        { type: 'application/json' }
      );

      if (storyData && storyData.story_json_path) {
        try {
          await storageService.deleteFile(storyData.story_json_path);
        } catch (delErr) {
          console.warn("Old file not found on storage, skipping deletion:", delErr);
        }
      }

      const newJsonPath = await storageService.uploadFile('stories', jsonBlob);
      const updatedStory = await storyService.updateStoryInfo(storyData.id, { story_json_path: newJsonPath });
      setStoryData(updatedStory);
    } catch (err) {
      console.error(`Błąd zapisu struktury grafu: ${err.message}`);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Story Editor</h1>

      <h3>Create New Story</h3>
      <form onSubmit={handleSubmitNewStory}>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="story_title">Title:</label>
          <input
            type="text"
            id="story_title"
            value={title}
            onInput={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <button type="submit">Add New Story</button>
      </form>

      <hr style={styles.hr} />

      <h2>My Stories List</h2>
      <ul>
        {stories.map(story => {
          const isPublished = publishedStories.some(s => s.id === story.id);

          return (
            <li key={story.id}>
              <button onClick={() => handleGetStory(story.id)}>
                {story.title}
              </button>
              <button
                onClick={() => handlePublishSubmit(story.id)}
                style={{ marginLeft: '10px', backgroundColor: isPublished ? '#2196F3' : '#4CAF50', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}
              >
                {isPublished ? 'Update Catalog' : 'Publish'}
              </button>
              {isPublished ?
                <button
                  onClick={() => handlePublishDelete(story.id)}
                >
                  Delete from catalog
                </button> :
                ''
              }
            </li>
          );
        })}
      </ul>

      <hr style={styles.hr} />

      {storyData ? (
        <div>
          <h2>Story Data: "{storyData.id}"</h2>

          <h3>Update Cover</h3>
          <form onSubmit={handleCoverSubmit}>
            <label htmlFor="cover" style={{ cursor: 'pointer' }}>
              <img
                src={coverUrl || '/default_cover.jpg'}
                style={{ width: '150px', height: '250px', objectFit: 'cover', display: 'block', marginBottom: '10px' }}
                alt="Cover"
              />
            </label>

            <input
              id="cover"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />

            <div style={{ marginTop: '10px' }}>
              <button type="submit">
                Update cover
              </button>
              <button type="button" onClick={handleCoverDelete}>
                Delete Cover
              </button>
            </div>
          </form>

          <form onSubmit={handleSubmit}>

            <h3>Title:</h3>

            <div>
              <label htmlFor="ltitle">Title:</label>
              <input
                type="text"
                id="ltitle"
                name="title"
                minLength={1}
                maxLength={255}
                value={storyData?.title || ''}
                onInput={handleChange}
                required
              />
            </div>

            <div>
              <label htmlFor="ldesc">Description:</label>
              <textarea
                type="text"
                id="ldesc"
                name="description"
                maxLength={2000}
                value={storyData.description || ''}
                onInput={handleChange}
                required
              />
            </div>

            <div>
              <label htmlFor="lage_rate">Age rate:</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <input
                  type="number"
                  id="lage_rate"
                  name="age_rate"
                  min="0"
                  max="22"
                  value={storyData.age_rate ?? ''}
                  onInput={handleChange}
                  required
                />
                <span style={{ fontSize: '16px', fontWeight: 'bold' }}>+</span>
              </div>
            </div>

            <div style={{ marginTop: '10px' }}>
              <button type="submit">
                Update Story
              </button>
            </div>
          </form>
          <button type="button" onClick={handleStoryDelete}>
            Delete Story
          </button>
        </div>
      ) : (
        <p>Select a story from the list above to view details and edit its cover.</p>
      )}

      <hr style={styles.hr} />

      {initialNodes && initialEdges ? (
        <EditView
          initialNodes={initialNodes}
          initialEdges={initialEdges}
          storyData={storyData}
          onSaveStoryJson={handleSaveStoryJson}
        />
      ) : (
        <p style={{ textAlign: 'center', color: '#888', fontStyle: 'italic' }}>
          Select a story from the list to load its visual flowchart editor.
        </p>
      )}

    </div>
  );
}


const styles = {
  hr: {
    borderColor: '#333',
    marginBottom: '20px',
  }
};