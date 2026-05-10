import { useState, useCallback } from 'preact/hooks';
import ReactFlow, {
  useNodesState,
  useEdgesState,
  addEdge,
  Background,
  MiniMap
} from 'reactflow';
import { StartNode, StoryNode, EndNode } from './CustomNode';
import { CustomEdge } from './CustomEdge';
import 'reactflow/dist/style.css';

const nodeTypes = { startNode: StartNode, storyNode: StoryNode, endNode: EndNode };
const edgeTypes = { customEdge: CustomEdge };

export default function EditorPage() {
  const [view, setView] = useState('flow');
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isMapVisible, setIsMapVisible] = useState(true);
  const [rfInstance, setRfInstance] = useState(null);

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
      data: { text: 'Nowa scena' },
      origin: [0.5, 0.5],
    };
    setNodes((nds) => nds.concat(newNode));
  }, [rfInstance, setNodes]);

  const exportToJson = () => {
    const startNode = nodes.find(n => n.type === 'startNode');
    const exportData = {
      story_title: "Test",
      history: startNode ? [startNode.id] : [],
      nodes: nodes.reduce((acc, node) => {
        const outgoingEdges = edges.filter((e) => e.source === node.id);
        acc[node.id] = {
          text: node.data?.text || "",
          choices: outgoingEdges.map((e) => ({
            text: e.data?.label || "Domyślny wybór",
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

  // --- RENDEROWANIE WIDOKÓW ---

  const renderPreview = () => (
    <div style={{
      padding: '20px',
      backgroundColor: '#F9FAFB',
      minHeight: '100vh',
      fontFamily: 'sans-serif'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button onClick={() => setView('flow')} style={{ border: 'none', background: 'none', fontSize: '18px' }}>←</button>
        <span style={{ fontWeight: 'bold' }}>Ustawienia Projektu</span>
        <button style={{ border: 'none', background: 'none', color: 'red' }}>🗑️</button>
      </div>

      {/* Cover Placeholder */}
      <div style={{
        width: '150px',
        height: '200px',
        backgroundColor: '#E5E7EB',
        margin: '0 auto 20px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px dashed #9CA3AF'
      }}>
        <span style={{ color: '#6B7280', fontSize: '12px' }}>Dodaj okładkę</span>
      </div>

      {/* Inputs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <label>
          <span style={{ fontSize: '12px', color: '#666' }}>Tytuł opowieści</span>
          <input style={inputStyle} type="text" placeholder="Wpisz tytuł..." value="Moja Historia" />
        </label>

        <label>
          <span style={{ fontSize: '12px', color: '#666' }}>Opis</span>
          <textarea style={inputStyle} rows={3} placeholder="O czym jest ta opowieść?" />
        </label>
      </div>

      {/* Floating Action Button - Start Editor */}
      <button
        onClick={() => setView('flow')}
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          right: '20px',
          backgroundColor: '#FFD54F',
          color: '#000',
          padding: '15px',
          borderRadius: '12px',
          border: 'none',
          fontWeight: 'bold',
          fontSize: '16px',
          boxShadow: '0 4px 10px rgba(255, 213, 79, 0.4)'
        }}
      >
        🖊️ Edytuj Fabułę (Whiteboard)
      </button>
    </div>
  );

  const renderFlow = () => (
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
      >
        <Background variant="dots" gap={12} size={1} />

        {/* Przycisk Mapy */}
        <button onClick={() => setIsMapVisible(!isMapVisible)} style={mapToggleStyle}>
          {isMapVisible ? '✕ Map' : 'Map'}
        </button>

        {isMapVisible && (
          <MiniMap position="bottom-left" nodeColor={'#FFD54F'} style={miniMapStyle} zoomable pannable />
        )}
      </ReactFlow>

      {/* UI Overlay */}
      <button onClick={() => setView('preview')} style={backButtonStyle}>Settings</button>
      <button onClick={exportToJson} style={saveButtonStyle}>Zapisz JSON</button>
      <button onClick={addNewNode} style={addNodeButtonStyle}>+</button>
    </div>
  );

  return (
    <div style={{ margin: 0, overflow: 'hidden' }}>
      {view === 'flow' ? renderFlow() : renderPreview()}
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

const initialNodes = [
  { id: 'start', type: 'startNode', position: { x: 0, y: 0 }, data: { text: 'START' } },
  { id: 'n1', type: 'storyNode', position: { x: -56, y: 150 }, data: { text: 'first block' } },
  { id: 'end', type: 'endNode', position: { x: 0, y: 400 }, data: { text: 'THE END' } },
];

const initialEdges = [
  { id: 'start-n1', type: 'customEdge', source: 'start', target: 'n1', data: { label: 'Start' } },
  { id: 'n1-end', type: 'customEdge', source: 'n1', target: 'end', data: { label: 'End' } }
];


// if (view === 'list') {
//   return (
//     <div className="p-4">
//       <h1 className="text-2xl font-bold mb-4">Youre Histori</h1>
//       <div
//         className="card cursor-pointer hover:shadow-lg transition-shadow"
//         style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '10px' }}
//         onClick={() => setView('settings')}
//       >
//         <h3>Moja Epicka Powieść +</h3>
//         <button className="mt-2 px-4 py-1 bg-blue-500 text-white rounded">Edytuj</button>
//       </div>
//       <div
//         className="card cursor-pointer hover:shadow-lg transition-shadow"
//         style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '10px' }}
//         onClick={() => setView('settings')}
//       >
//         <h3>Moja Epicka Powieść +</h3>
//         <button className="mt-2 px-4 py-1 bg-blue-500 text-white rounded">Edytuj</button>
//       </div>
//     </div>
//   );
// }