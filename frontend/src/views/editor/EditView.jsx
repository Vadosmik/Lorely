import React, { useCallback, useState } from 'preact/compat';
import ReactFlow, {
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge
} from 'reactflow';
import { StartNode, StoryNode, EndNode } from './CustomNode';
import { CustomEdge } from './CustomEdge';
import { RichTextEditorModal } from './RichTextEditorModal';

import 'reactflow/dist/style.css';

const nodeTypes = { startNode: StartNode, storyNode: StoryNode, endNode: EndNode };
const edgeTypes = { customEdge: CustomEdge };

export function EditView({
  initialNodes,
  initialEdges,
  onBackToList,
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState(() => initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(() => initialEdges);
  const [isMapVisible, setIsMapVisible] = useState(false); // Changed to false by default for consistency with user's reported state.
  const [rfInstance, setRfInstance] = useState(null);

  // State for Rich Text Editor Modal
  const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);
  const [editingNodeId, setEditingNodeId] = useState(null);
  const [editingNodeText, setEditingNodeText] = useState('');

  // --- LOGIKA ---
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, type: 'customEdge' }, eds)),
    [setEdges]
  );

  const addNewNode = useCallback(() => {
    if (!rfInstance) return;
    const { x, y, zoom } = rfInstance.getViewport();
    const flowX = ((window.innerWidth / 2 - x) / zoom) - 75;
    const flowY = ((window.innerHeight / 2 - y) / zoom) - 40;

    const newNode = {
      id: `node_${Date.now()}`,
      type: 'storyNode',
      position: { x: flowX, y: flowY },
      data: { text: 'New scene' },
      origin: [0.5, 0.5],
    };
    setNodes((nds) => nds.concat(newNode));
  }, [rfInstance, setNodes]);

  const exportToJson = () => {
    const startNode = nodes.find(n => n.type === 'startNode');
    const exportData = {
      story_title: "My Story", // Consistent with PreviewView
      history: startNode ? [startNode.id] : [],
      nodes: nodes.reduce((acc, node) => {
        const outgoingEdges = edges.filter((e) => e.source === node.id);
        acc[node.id] = {
          text: node.data?.text || "",
          choices: outgoingEdges.map((e) => ({
            text: e.data?.label || "Default choice",
            next_node: e.target
          }))
        };
        return acc;
      }, {})
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'story_flow.json';
    link.click();
  };

  // --- Rich Text Editor handlers ---
  const handleNodeDoubleClick = useCallback((event, node) => {
    console.log('Node double-clicked:', node); // For debugging
    setEditingNodeId(node.id);
    setEditingNodeText(node.data.text || '');
    setIsEditorModalOpen(true);
  }, []);

  const handleSaveNodeText = useCallback((id, newText) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, text: newText } } : node
      )
    );
    setIsEditorModalOpen(false);
    setEditingNodeId(null);
    setEditingNodeText('');
  }, [setNodes]);

  const handleCloseEditorModal = useCallback(() => {
    setIsEditorModalOpen(false);
    setEditingNodeId(null);
    setEditingNodeText('');
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setRfInstance}
        fitView
        onNodeDoubleClick={handleNodeDoubleClick} // Re-enabled double click handler
      >
        <Background variant="dots" gap={12} size={1} />

        {/* Map Button */}
        <button onClick={() => setIsMapVisible(!isMapVisible)} style={mapToggleStyle}>
          {isMapVisible ? '✕ Map' : 'Map'}
        </button>

        {isMapVisible && (
          <MiniMap position="bottom-left" nodeColor={'#FFD54F'} style={miniMapStyle} zoomable pannable />
        )}
      </ReactFlow>

      {/* UI Overlay */}
      <button onClick={onBackToList} style={backButtonStyle}>Back to List</button>
      <button onClick={exportToJson} style={saveButtonStyle}>Save JSON</button>
      <button onClick={addNewNode} style={addNodeButtonStyle}>+</button>

      {isEditorModalOpen && (
        <RichTextEditorModal
          nodeId={editingNodeId}
          initialText={editingNodeText}
          onSave={handleSaveNodeText}
          onClose={handleCloseEditorModal}
        />
      )}
    </div>
  );
}

// --- STYLE (Wydzielone dla czytelności) ---

const buttonStyle = { padding: '10px', borderRadius: '5px', cursor: 'pointer' };

const inputStyle = {
  width: '100%', padding: '12px', borderRadius: '8px',
  border: '1px solid #D1D5DB', marginTop: '5px', boxSizing: 'border-box'
};

const backButtonStyle = {
  position: 'absolute', top: 15, left: 15, zIndex: 20,
  padding: '10px 20px', background: 'white', border: '1px solid #ccc', borderRadius: '8px'
};

const saveButtonStyle = {
  position: 'absolute', top: 15, right: 15, zIndex: 20,
  padding: '10px 20px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px'
};

const addNodeButtonStyle = {
  position: 'absolute', bottom: 20, right: 20, zIndex: 20,
  width: 50, height: 50, borderRadius: '50%', background: '#FFD54F', color: 'white', border: 'none', fontSize: '24px'
};

const mapToggleStyle = {
  position: 'absolute', bottom: 10, left: 10, zIndex: 20,
  padding: '5px 10px', borderRadius: '8px', border: '1px solid #FFD54F', background: 'white'
};

const miniMapStyle = { backgroundColor: '#fff', border: '2px solid #FFD54F', borderRadius: '10px' };