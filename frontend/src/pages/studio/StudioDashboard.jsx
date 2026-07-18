import { useLocation } from 'preact-iso';
import { useState, useEffect } from 'preact/hooks';

import { studioService } from '../../services/StudioService.js';
import { catalogService } from '../../services/CatalogService.js';
import { storageService } from '../../services/StorageService.js';
import { profileService } from '../../services/ProfileService.js';

import CachedImage from '../../components/common/CachedImage'
import { DEFAULT_COVER } from '../../utils/imageCache';

const StoryStatus = {
  ANNOUNCEMENT: "Announcement",
  CONTINUES: "Continues",
  FROZEN: "Frozen",
  FINISHED: "Finished"
};


export default function StudioDashboard() {
  const [stories, setStories] = useState([]);
  const [publishedDetails, setPublishedDetails] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState({});
  const [title, setTitle] = useState('');

  const { route } = useLocation();

  useEffect(() => {
    async function loadStoiesData() {
      try {
        const fetchedStories = await studioService.getStories();
        const myPublished = await catalogService.getMinePublishedStories();

        const initialSelected = {};
        myPublished.forEach(s => { initialSelected[s.id] = s.status; });

        setStories(fetchedStories);
        setPublishedDetails(myPublished);
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

      const savedStory = await studioService.createStory(payload);

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
      const storyData = await studioService.getStory(id);

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
    route(`/studio/${id}/details`);
  };

  return (
    <>
      <section style={styles.createSection}>
        <h2 style={styles.sectionHeader}>Create New Story</h2>
        <form onSubmit={handleOnStoryCreate} style={styles.form}>
          <input
            type="text"
            placeholder="Enter story title..."
            value={title}
            onInput={(e) => setTitle(e.target.value)}
            required
            style={styles.input}
          />
          <button type="submit" style={styles.submitBtn}>Add New Story</button>
        </form>
      </section>

      <section>
        <h2 style={styles.sectionHeader}>My Stories List</h2>
        <ul>
          {stories.map(story => {
            const publishedInfo = publishedDetails.find(s => s.id === story.id);
            const isPublished = publishedInfo ? true : false;
            const currentSelectedStatus = selectedStatuses[story.id] || (isPublished ? publishedInfo.status : '');

            return (
              <li key={story.id} style={styles.card}>
                <div style={styles.mainRow}>
                  <div style={styles.coverWrapper}>
                    <CachedImage
                      path={story.cover_pic_path}
                      fallback={DEFAULT_COVER}
                      alt="Cover"
                      style={styles.cover}
                    />
                  </div>

                  <div style={styles.contentColumn}>
                    <h3 style={styles.title}>{story.title || "title name"}</h3>
                    
                    <div style={styles.actionsRow}>
                      <div style={styles.selectWrapper}>
                        <select
                          value={currentSelectedStatus}
                          onChange={(e) => handleStatusChange(story.id, e.target.value)}
                          style={styles.select}
                        >
                          <option value=''>status</option>
                          {Object.values(StoryStatus).map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </div>

                      <button
                        onClick={() => handlePublishSubmit(story.id)}
                        style={styles.publishBtn}
                      >
                        {isPublished ? 'Update' : 'Publish'}
                      </button>

                      {isPublished && (
                        <button
                          onClick={() => handlePublishDelete(story.id)}
                          style={styles.deleteBtn}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div style={styles.buttonGroup}>
                  <button
                    onClick={() => handleOnNavigateToDetails(story.id)}
                    style={styles.editInfoBtn}
                  >
                    edit info
                  </button>
                  <button
                    onClick={() => handleOnNavigateToFlow(story.id)}
                    style={styles.editStoryBtn}
                  >
                    edit story
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  )
}

const styles = {
  sectionHeader: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '16px',
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    width: '100%',
    marginBottom: '24px',
  },
  mainRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'var(--color-bg)',
    border: '1.5px solid var(--color-primary)',
    borderRadius: '25px',
    overflow: 'hidden',
    paddingInline: 20,
    width: '100%',
  },
  coverWrapper: {
    position: 'relative',
    width: '80px',
    height: '120px',
    zIndex: 3,
    overflow: 'hidden',
  },
  cover: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  contentColumn: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    paddingLeft: '16px',
    paddingRight: '12px',
    flex: 1,
    overflow: 'hidden',
  },
  title: {
    margin: '0 0 4px 0',
    fontSize: '18px',
    fontWeight: 'bold',
    color: 'var(--color-text)',
    textTransform: 'lowercase',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  actionsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  publishBtn: {
    backgroundColor: 'var(--color-accent)',
    color: 'var(--color-bg)',
    border: 'none',
    borderRadius: '12px',
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'opacity 0.2s ease',
  },
  deleteBtn: {
    backgroundColor: 'transparent',
    color: 'var(--color-error)',
    border: '1px solid var(--color-error)',
    borderRadius: '12px',
    padding: '5px 12px',
    fontSize: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    width: '100%',
  },
  editInfoBtn: {
    flex: 1,
    backgroundColor: 'var(--color-accent)',
    color: 'var(--color-bg)',
    border: 'none',
    borderRadius: '24px',
    padding: '12px 0',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    textAlign: 'center',
  },
  editStoryBtn: {
    flex: 1,
    backgroundColor: 'var(--color-primary)',
    color: 'var(--color-text)',
    border: 'none',
    borderRadius: '24px',
    padding: '12px 0',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    textAlign: 'center',
  },
};
