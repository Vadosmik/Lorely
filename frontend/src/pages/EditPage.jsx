import { useState, useEffect } from 'preact/hooks';
import { storyService } from '../services/storyService.js';
import { storageService } from '../services/storageService.js';

export default function EditPage() {
  const [stories, setStories] = useState([]);
  const [storyData, setStoryData] = useState(null);
  const [title, setTitle] = useState('');
  const [coverUrl, setCoverUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    async function fetchEditList() {
      try {
        const data = await storyService.getStories();

        setStories(data);
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
      await storyService.deleteStory(storyData.id);

      const data = await storyService.getStories();

      setStories(data);

      setStoryData(null);
      setCoverUrl(null);
      setSelectedFile(null);

      console.log('Story deleted successfully!');
    } catch (err) {
      console.error(`Error: ${err.message}`);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Story Editor</h1>

      <h3>Create New Story</h3>
      <form onSubmit={handleSubmitNewStory}>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="story_title" style={{ display: 'block' }}>Title:</label>
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

      <hr style={{ margin: '30px 0', borderColor: '#333' }} />

      <h2>My Stories List</h2>
      <ul>
        {stories.map(story => (
          <li key={story.id}>
            <button onClick={() => handleGetStory(story.id)}>
              {story.title}
            </button>
            <button onClick={() => alert("added")}>
              publish
            </button>
          </li>
        ))}
      </ul>

      <hr style={{ margin: '30px 0', borderColor: '#333' }} />

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
              brakuje style={{ display: 'none' }}
            />

            <div style={{ marginTop: '10px' }}>
              <button type="submit" style={styles.submitBtn}>
                Update cover
              </button>
              <button type="button" onClick={handleCoverDelete} style={{ ...styles.deleteBtn, marginLeft: '10px' }}>
                Delete Cover
              </button>
            </div>
          </form>

          <form onSubmit={handleSubmit}>

            <h3>Title:</h3>

            <div style={styles.formGroup}>
              <label htmlFor="ltitle" style={styles.label}>Title:</label>
              <input
                type="text"
                id="ltitle"
                name="title"
                style={styles.input}
                minLength={1}
                maxLength={255}
                value={storyData?.title || ''}
                onInput={handleChange}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="ldesc" style={styles.label}>Description:</label>
              <textarea
                type="text"
                id="ldesc"
                name="description"
                style={styles.input}
                maxLength={2000}
                value={storyData.description || ''}
                onInput={handleChange}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="lage_rate" style={styles.label}>Age rate:</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <input
                  type="number"
                  id="lage_rate"
                  name="age_rate"
                  style={styles.input}
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
              <button type="submit" style={styles.submitBtn}>
                Update Story
              </button>
            </div>
          </form>
          <button type="button" onClick={handleStoryDelete} style={{ ...styles.deleteBtn, marginLeft: '10px' }}>
            Delete Story
          </button>
        </div>
      ) : (
        <p>Select a story from the list above to view details and edit its cover.</p>
      )}

    </div>
  );
}

const styles = {
  submitBtn: {
    padding: '8px 12px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    cursor: 'pointer'
  },
  deleteBtn: {
    padding: '8px 12px',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    cursor: 'pointer'
  }
};