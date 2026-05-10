import { useState, useCallback } from 'preact/hooks';
import { ListView } from './ListView';
import { PreviewView } from './PreviewView';
import { EditView } from './EditView'; // Import the new EditView component

export default function EditorPage() {
  const [view, setView] = useState('list');
  const [currentStoryId, setCurrentStoryId] = useState(null);

  // Define initial states for nodes and edges (or load from storage/API)
  const initialNodes = [
    { id: 'start', type: 'startNode', position: { x: 0, y: 0 }, data: { text: 'START' } },
    { id: 'n1', type: 'storyNode', position: { x: -56, y: 150 }, data: { text: 'first block' } },
    { id: 'end', type: 'endNode', position: { x: 0, y: 400 }, data: { text: 'THE END' } },
  ];

  const initialEdges = [
    { id: 'start-n1', type: 'customEdge', source: 'start', target: 'n1', data: { label: 'Start' } },
    { id: 'n1-end', type: 'customEdge', source: 'n1', target: 'end', data: { label: 'End' } }
  ];

  // --- HANDLERY ZMIAN WIDOKÓW ---
  const handleEditStory = (storyId) => {
    setCurrentStoryId(storyId);
    setView('edit');
    // Here you would load the story data into nodes and edges for the editor
  };

  const handlePreviewStory = (storyId) => {
    setCurrentStoryId(storyId);
    setView('preview');
    // Here you would prepare data for preview, maybe pass to PreviewView
  };

  const handleCreateNewStory = () => {
    // Logic for creating a new story
    setView('edit'); // Or a dedicated creation view
  };

  const handleBackToList = () => {
    setView('list');
    setCurrentStoryId(null);
  };

  const handleEditFlowFromPreview = () => {
    setView('edit');
  };

  let renderedView;
  switch (view) {
    case 'list':
      renderedView = (
        <ListView
          onEditStory={handleEditStory}
          onPreviewStory={handlePreviewStory}
          onCreateNewStory={handleCreateNewStory}
        />
      );
      break;
    case 'preview':
      renderedView = (
        <PreviewView
          onBackToList={handleBackToList}
          onEditFlow={handleEditFlowFromPreview}
        />
      );
      break;
    case 'edit':
      renderedView = (
        <EditView
          initialNodes={initialNodes}
          initialEdges={initialEdges}
          onBackToList={handleBackToList}
        />
      );
      break;
    default:
      renderedView = <ListView onEditStory={handleEditStory} onPreviewStory={handlePreviewStory} onCreateNewStory={handleCreateNewStory} />;
  }

  return (
    <div style={{ margin: 0, overflow: 'hidden' }}>
      {renderedView}
    </div>
  );
}