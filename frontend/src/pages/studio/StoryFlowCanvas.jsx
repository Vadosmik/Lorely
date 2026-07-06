import { useLocation } from 'preact-iso';
import { useState, useEffect } from 'preact/hooks';

import { EditView } from './components/EditView.jsx';

import { storyService } from '../../services/storyService.js';
import { storageService } from '../../services/StorageService.js';
import { transformJsonToFlow } from '../../services/transformJsonToFlow.js';


export default function StoryFlowCanvas({ story_id }) {

  const [storyData, setStoryData] = useState(null);
  const [initialNodes, setInitialNodes] = useState(null);
  const [initialEdges, setInitialEdges] = useState(null);

  const { route } = useLocation();
  useEffect(() => {
    async function loadStoryData() {

      // setStoryData(data);
      // setInitialNodes(initialNodesD);
      // setInitialEdges(initialEdgesD);
      try {
        const data = await storyService.getStory(story_id);
        setStoryData(data);

        if (data && data.story_json_path) {
          const blob = await storageService.getFile(data.story_json_path);
          const url = URL.createObjectURL(blob);
          const storyJsonText = await blob.text();
          const storyJson = JSON.parse(storyJsonText);

          const { initialNodes, initialEdges } = transformJsonToFlow(storyJson);

          setInitialNodes(initialNodes);
          setInitialEdges(initialEdges);
        } else {
          setInitialNodes([{ id: 'start', type: 'startNode', position: { x: 0, y: 0 }, data: { text: 'START' } }]);
          setInitialEdges([]);
        }
      } catch (err) {
        console.error(err);
      }
    }

    loadStoryData();
  }, [story_id]);

  useEffect(() => {
    if (storyData?.title) {
      document.title = storyData.title;
    }
    return () => {
      document.title = 'Lorely';
    };
  }, [storyData]);


  const handleBack = () => {
    route(`/studio`);
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
      console.error(`Error save: ${err.message}`);
    }
  };

  return (
    <div>
      <button onClick={handleBack}>{'< back'}</button>

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
  )
}

const styles = {

};