import { useLocation } from 'preact-iso';
import { useState, useEffect } from 'preact/hooks';

import { storyService } from '../../services/StoryService.js';
import { catalogService } from '../../services/CatalogService.js';
import { storageService } from '../../services/StorageService.js';
import { profileService } from '../../services/ProfileServiece.js';

const StoryStatus = {
  ANNOUNCEMENT: "Announcement",
  CONTINUES: "Continues",
  FROZEN: "Frozen",
  FINISHED: "Finished"
};


export default function StoryEditorDashboard() {
  const [stories, setStories] = useState([]);
  const [publishedDetails, setPublishedDetails] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState({});
  const [coverUrls, setCoverUrls] = useState({});
  const [title, setTitle] = useState('');

  const { route } = useLocation();

  useEffect(() => {
    async function loadStoiesData() {
      const urlsMap = {};

      try {
        const fetchedStories = await storyService.getStories();
        const user = await profileService.getMe();
        const myPublished = await catalogService.getMinePublishedStories();

        await Promise.all(
          fetchedStories.map(async (story) => {
            if (story.cover_pic_path) {
              try {
                const blob = await storageService.getFile(story.cover_pic_path);
                urlsMap[story.id] = URL.createObjectURL(blob);
              } catch (err) {
                console.error(`${story.id}: `, err);
              }
            }
          })
        );

        const initialSelected = {};
        myPublished.forEach(s => { initialSelected[s.id] = s.status; });

        setStories(fetchedStories);
        setPublishedDetails(myPublished);
        setCoverUrls(urlsMap);
        setSelectedStatuses(initialSelected);

      } catch (err) {
        console.error(err)
      }
    }
    loadStoiesData()
  }, []);

  const handleStatusChange = (storyId, status) => {
    setSelectedStatuses(prev => ({ ...prev, [storyId]: status }));
  };

  const handleOnStoryCreate = async (e) => {
    e.preventDefault();

    if (!title.trim()) return;

    try {
      const templateResponse = await fetch('/template.json');
      const templateBlob = await templateResponse.blob();

      const newStoryPath = await storageService.uploadFile('stories', templateBlob);

      const payload = {
        title: title,
        story_json_path: newStoryPath,
        genre_ids: [],
        category_ids: []
      };

      const savedStory = await storyService.createStory(payload);

      setStories(prev => [...prev, savedStory]);
      setTitle('');
    } catch (err) {
      console.error(err);
    }
  }

  const handlePublishSubmit = async (id) => {
    const status = selectedStatuses[id] || StoryStatus.ANNOUNCEMENT;
    const isAlreadyPublished = publishedDetails.find(s => s.id === id);

    try {
      const storyData = await storyService.getStory(id);

      let newCoverPath = null;
      let newStoryPath = null;

      if (storyData.cover_pic_path) {
        if (isAlreadyPublished?.cover_pic_path) {
          await storageService.deleteFile(isAlreadyPublished.cover_pic_path);
        }
        const coverBlob = await storageService.getFile(storyData.cover_pic_path);
        newCoverPath = await storageService.uploadFile('covers', coverBlob);
      }

      if (storyData.story_json_path && status !== StoryStatus.ANNOUNCEMENT) {
        if (isAlreadyPublished?.story_json_path) {
          await storageService.deleteFile(isAlreadyPublished.story_json_path);
        }
        const storyBlob = await storageService.getFile(storyData.story_json_path);
        newStoryPath = await storageService.uploadFile('stories', storyBlob);
      }

      const storyDataPayload = {
        id: id,
        title: storyData.title,
        description: storyData.description || "",
        cover_pic_path: newCoverPath,
        age_rate: storyData.age_rate ?? 18,
        status: status,
        story_json_path: status === StoryStatus.ANNOUNCEMENT ? null : newStoryPath,
        genre_ids: storyData.genre_ids || [],
        category_ids: storyData.category_ids || []
      };

      if (!isAlreadyPublished) {
        const newPublishedStory = await catalogService.publishStory(storyDataPayload);

        setPublishedDetails([...publishedDetails, newPublishedStory]);
      } else {
        const updatedCatalogStory = await catalogService.updateStoryInfo(id, storyDataPayload);

        setPublishedDetails(publishedDetails.map(s => s.id === id ? updatedCatalogStory : s));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePublishDelete = async (id) => {
    try {
      const published = publishedDetails.find(s => s.id === id);
      await catalogService.deleteStory(id);

      if (published?.cover_pic_path) {
        await storageService.deleteFile(published.cover_pic_path);
      }
      if (published?.story_json_path) {
        await storageService.deleteFile(published.story_json_path);
      }

      setSelectedStatuses(prev => ({ ...prev, [id]: '' }));
      setPublishedDetails(publishedDetails.filter(s => s.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleOnNavigateToFlow = (id) => {
    route(`/studio/${id}/canvas`);
  };

  const handleOnNavigateToDetails = (id) => {
    // const publishedInfo = publishedDetails.find(s => s.id === id);
    // route(`/studio/${id}/details`, false, { isPublished: !!publishedInfo });
    route(`/studio/${id}/details`);
  };

  return (
    <div>
      <h1>Story Editor</h1>

      <h2>Create New Story</h2>
      <form onSubmit={handleOnStoryCreate}>
        <div>
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

      <hr />

      <h2>My Stories List</h2>
      <ul>
        {stories.map(story => {
          const publishedInfo = publishedDetails.find(s => s.id === story.id);
          const isPublished = publishedInfo ? true : false;
          const currentSelectedStatus = selectedStatuses[story.id] || (isPublished ? publishedInfo.status : '');

          return (
            <li key={story.id} style={styles.card}>
              <img style={styles.cover} src={coverUrls[story.id] || '/default_cover.jpg'} />
              <h3 style={styles.title} >{story.title}</h3>

              <select
                value={currentSelectedStatus}
                onChange={(e) => handleStatusChange(story.id, e.target.value)}
                style={styles.select}
              >
                <option value=''>---</option>
                {Object.values(StoryStatus).map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>

              <div>
                <button
                  onClick={() => handlePublishSubmit(story.id)}
                  style={styles.btn}
                >
                  {isPublished ? 'Update Catalog' : 'Publish'}
                </button>

                {isPublished && (
                  <button
                    onClick={() => handlePublishDelete(story.id)}
                    style={styles.btnDanger}
                  >
                    Delete from catalog
                  </button>
                )}
              </div>

              <button onClick={() => handleOnNavigateToDetails(story.id)} style={styles.linkBtn} >Story Details</button>
              <button onClick={() => handleOnNavigateToFlow(story.id)} style={styles.linkBtn} >Edit Flow</button>

            </li>
          );
        })}
      </ul>
    </div>
  )
}

const styles = {
  card: {
    border: '1px solid #333',
    borderRadius: '10px',
    overflow: 'hidden',
    marginBottom: '12px',
  },
  cover: {
    width: '100px',
    height: '140px',
    objectFit: 'cover',
    flexShrink: 0,
  },
  title: {
    margin: 0,
    fontSize: '16px',
  },
  select: {
    padding: '4px 8px',
    borderRadius: '6px',
  },
  btn: {
    padding: '6px 12px',
    borderRadius: '6px',
    border: '1px solid #4CAF50',
    background: 'transparent',
    color: '#4CAF50',
    cursor: 'pointer',
  },
  btnDanger: {
    padding: '6px 12px',
    borderRadius: '6px',
    border: '1px solid #f44336',
    background: 'transparent',
    color: '#f44336',
    cursor: 'pointer',
  },
  linkBtn: {
    height: '30px',
    width: '48vw',
    margin: '5px',
    background: 'none',
    border: 'none',
    background: '#FFD441',
    color: '#1E1D1D',
    textDecoration: 'underline',
    cursor: 'pointer',
    fontSize: '16px',
    padding: 0,
  },
};