import { useLocation } from 'preact-iso';
import { useState, useCallback, useEffect } from 'preact/hooks';
import { catalogService } from '../../services/CatalogService.js';
import { storageService } from '../../services/StorageService.js';

import StoryReader from '../../components/StoryReader.jsx';

export default function ReaderPage({ story_id }) {
  const [story, setStory] = useState([]);
  const [storyJson, setStoryJson] = useState(null);

  const { route } = useLocation();

  const loadStoryData = useCallback(async () => {
    try {
      const fetchedStory = await catalogService.getStory(story_id);

      if (fetchedStory && fetchedStory.story_json_path) {
        const blob = await storageService.getFile(fetchedStory.story_json_path);
        const storyJsonText = await blob.text();
        setStoryJson(JSON.parse(storyJsonText));
      }

      setStory(fetchedStory);
    } catch (err) {
      console.error(err);
    }
  }, [story_id]);

  useEffect(() => {
    loadStoryData();
  }, [loadStoryData]);

  useEffect(() => {
    if (story?.title) {
      document.title = story.title;
    }
    return () => {
      document.title = 'Lorely';
    };
  }, [story]);

  const handleBack = () => {
    route(`/catalog/${story_id}/details`);
  };

  const handleResetTrigger = () => {
    loadStoryData();
  };

  return (
    <div>
      <button onClick={handleBack}>{'< back'}</button>
      {story && storyJson && (
        <StoryReader
          storyId={story.id}
          storyJson={storyJson}
          onReset={handleResetTrigger}
        />
      )}
    </div>
  )
}

const styles = {

}