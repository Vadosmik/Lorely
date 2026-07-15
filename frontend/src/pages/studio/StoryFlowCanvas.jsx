import { useLocation } from 'preact-iso';
import { useRef, useState, useEffect, useCallback } from 'preact/hooks';

import { storyService } from '../../services/StoryService.js';
import { storageService } from '../../services/StorageService.js';
import { transformFlowToJson, transformJsonToFlow } from '../../utils/transformJsonToFlow.js';

import SceneEditor from './components/SceneEditor.jsx';
import StoryCanvas from './components/StoryCanvas.jsx';

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= breakpoint);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= breakpoint);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [breakpoint]);
  return isMobile;
}

export default function StoryFlowCanvas({ story_id }) {
  const [storyData, setStoryData] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  const currentFlowRef = useRef({ nodes: [], edges: [] });
  const [jumpToNodeId, setJumpToNodeId] = useState(null);

  const [mobileView, setMobileView] = useState('canvas');

  const isMobile = useIsMobile(768);
  const { route } = useLocation();

  useEffect(() => {
    async function loadStory() {
      try {
        const data = await storyService.getStory(story_id);
        setStoryData(data);
      } catch (err) {
        console.error("Error loading story metadata:", err);
      }
    }
    loadStory();
  }, [story_id]);

  useEffect(() => {
    if (storyData?.title) {
      document.title = storyData.title;
    }
    return () => { document.title = 'Lorely'; };
  }, [storyData]);

  const handleBack = () => {
    route(`/studio`);
  };

  const handleFlowChange = useCallback((nodes, edges) => {
    currentFlowRef.current = { nodes, edges };
  }, []);

  const handleJumpToNode = useCallback((nodeId) => {
    setJumpToNodeId(nodeId);
  }, []);

  const handleSave = async () => {
    const { nodes, edges } = currentFlowRef.current;
    if (!storyData || !nodes.length) return;

    try {
      const json = transformFlowToJson(nodes, edges, storyData);
      const blob = new Blob([JSON.stringify(json)], { type: 'application/json' });
      const file = new File([blob], 'story.json', { type: 'application/json' });

      if (storyData.story_json_path) {
        try {
          await storageService.deleteFile(storyData.story_json_path);
        } catch (e) {
          console.warn("Old file delete failed or did not exist:", e);
        }
      }
      const newJsonPath = await storageService.uploadFile('stories', file);
      const updatedStory = await storyService.updateStoryInfo(storyData.id, { story_json_path: newJsonPath });

      setStoryData(updatedStory);
      alert('Story saved successfully!');
    } catch (err) {
      console.error("Error saving story:", err);
      alert(`Save failed: ${err.message}`);
    }
  };

  const showCanvas = mobileView === 'canvas' || !isMobile;
  const showEditor = mobileView === 'editor' || !isMobile;

  return (
    <div style={styles.pageContainer}>
      <div style={styles.topBar}>
        <button onClick={handleBack} style={styles.backButton}>{'< back'}</button>
        <button onClick={handleSave} style={styles.saveButton}>save</button>
      </div>

      <div style={styles.workspace}>
        <div
          style={{
            ...styles.fadeWrapper,
            opacity: showCanvas ? 1 : 0,
            pointerEvents: showCanvas ? 'auto' : 'none',
            position: isMobile ? 'absolute' : 'relative',
          }}>
          <StoryCanvas
            storyData={storyData}
            selectedNode={selectedNode}
            onSelectNode={(node) => {
              setSelectedNode(node);

              if (node && isMobile) {
                setTimeout(() => {
                  setMobileView('editor');
                }, 300);
              }
            }}
            onFlowChange={handleFlowChange}
            jumpToNodeId={jumpToNodeId}
            onJumpHandled={() => setJumpToNodeId(null)}
          />
        </div>

        <div
          style={{
            ...styles.fadeWrapper,
            opacity: showEditor ? 1 : 0,
            pointerEvents: showEditor ? 'auto' : 'none',
            position: isMobile ? 'absolute' : 'relative',
          }}>
          <SceneEditor
            activeNode={selectedNode}
            onUpdateNode={setSelectedNode}
            onJumpToNode={handleJumpToNode}
          />
        </div>
      </div>

      <div style={{ ...styles.bottomMenu, display: isMobile ? 'flex' : 'none' }}>
        <button
          onClick={() => setMobileView('canvas')}
          style={{ ...styles.bmBtn, ...(mobileView === 'canvas' ? styles.bmBtnActive : {}) }}
        >
          Mapa
        </button>
        <button
          onClick={() => setMobileView('editor')}
          style={{ ...styles.bmBtn, ...(mobileView === 'editor' ? styles.bmBtnActive : {}) }}
        >
          Scena
        </button>
      </div>
    </div>
  );
}

const styles = {
  pageContainer: {
    display: 'grid',
    gridTemplateRows: 'auto 1fr',
    height: '94vh',
    width: '100vw',
    overflow: 'hidden',
    boxSizing: 'border-box'
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: '10px 15px',
  },
  backButton: {
    padding: '10px 15px',
    cursor: 'pointer'
  },
  saveButton: {
    padding: '10px 20px',
    cursor: 'pointer',
    background: '#FFD54F',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 'bold'
  },
  workspace: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    position: 'relative'
  },
  fadeWrapper: {
    flex: 1,
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'opacity 0.3s ease-in-out',
  },
  bottomMenu: {
    position: 'fixed',
    bottom: '12px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 30,
    background: '#fff',
    borderRadius: '14px',
    padding: '4px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
    border: '1px solid #eee',
    gap: '2px',
  },
  bmBtn: {
    padding: '10px 22px',
    borderRadius: '10px',
    border: 'none',
    background: 'transparent',
    color: '#888',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  bmBtnActive: {
    background: '#FFD54F',
    color: '#333',
  },
};