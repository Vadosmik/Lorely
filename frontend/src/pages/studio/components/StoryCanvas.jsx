import { useState, useEffect, useCallback } from 'preact/hooks';
import ReactFlow, {
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge
} from 'reactflow';
import 'reactflow/dist/style.css';

import { StartNode, StoryNode, EndNode } from './CustomNode';
import { CustomEdge } from './CustomEdge';
import { transformJsonToFlow, transformFlowToJson } from '../../../utils/transformJsonToFlow.js';
import { storageService } from '../../../services/StorageService.js';

const nodeTypes = { startNode: StartNode, storyNode: StoryNode, endNode: EndNode };
const edgeTypes = { customEdge: CustomEdge };

export default function StoryCanvas({ storyData, selectedNode, onSelectNode, onFlowChange, jumpToNodeId, onJumpHandled }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [rfInstance, setRfInstance] = useState(null);

  useEffect(() => {
    onFlowChange(nodes, edges);
  }, [nodes, edges]);

  useEffect(() => {
    async function fetchAndParseJson() {
      if (!storyData) return;
      try {
        if (storyData.story_json_path) {
          const blob = await storageService.getFile(storyData.story_json_path);
          const storyJsonText = await blob.text();
          const storyJson = JSON.parse(storyJsonText);

          const { initialNodes, initialEdges } = transformJsonToFlow(storyJson);
          setNodes(initialNodes);
          setEdges(initialEdges);
        } else {
          setNodes([{ id: 'start', type: 'startNode', position: { x: 0, y: 0 }, data: { text: 'START' } }]);
          setEdges([]);
        }
      } catch (err) {
        console.error("Error parsing story flowchart JSON:", err);
      }
    }
    fetchAndParseJson();
  }, [storyData, setNodes, setEdges]);

  useEffect(() => {
    if (!selectedNode) return;

    setNodes((nds) =>
      nds.map((n) => (n.id === selectedNode.id ? { ...n, data: { ...n.data, text: selectedNode.text } } : n))
    );

    setEdges((eds) =>
      eds.map((edge) => {
        const matchingConnection = selectedNode.connections.find((c) => c.edgeId === edge.id);
        if (matchingConnection) {
          return { ...edge, data: { ...edge.data, label: matchingConnection.edgeText } };
        }
        return edge;
      })
    );
  }, [selectedNode, setNodes, setEdges]);


  useEffect(() => {
    if (!selectedNode) return;
    const stillExists = nodes.some((n) => n.id === selectedNode.id);
    if (!stillExists) {
      onSelectNode(null);
    }
  }, [nodes, selectedNode, onSelectNode]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, type: 'customEdge', data: { label: '' } }, eds)),
    [setEdges]
  );

  const addNewNode = useCallback(() => {
    if (!rfInstance) return;
    const { x, y, zoom } = rfInstance.getViewport();
    const flowX = ((window.innerWidth / 4 - x) / zoom) - 75;
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

  const selectNodeById = useCallback((nodeId) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    const outgoingEdges = edges.filter(edge => edge.source === nodeId);
    const connections = outgoingEdges.map(edge => {
      const targetNode = nodes.find(n => n.id === edge.target);
      return {
        edgeId: edge.id,
        edgeText: edge.data?.label ?? '',
        targetId: edge.target,
        targetTitle: targetNode?.data?.text?.replace(/<[^>]*>/g, '') || 'Unnamed Node'
      };
    });

    onSelectNode({
      id: node.id,
      text: node.data.text || '',
      connections
    });
  }, [nodes, edges, onSelectNode]);

  useEffect(() => {
  if (!selectedNode) return;

  const outgoingEdges = edges.filter((edge) => edge.source === selectedNode.id);

  const connections = outgoingEdges.map((edge) => {
    const targetNode = nodes.find((n) => n.id === edge.target);
    const existing = selectedNode.connections.find((c) => c.edgeId === edge.id);

    return {
      edgeId: edge.id,
      edgeText: existing?.edgeText ?? edge.data?.label ?? '',
      targetId: edge.target,
      targetTitle: targetNode?.data?.text?.replace(/<[^>]*>/g, '') || 'Unnamed Node',
    };
  });

  const changed =
    connections.length !== selectedNode.connections.length ||
    connections.some((c, i) => c.edgeId !== selectedNode.connections[i]?.edgeId);

  if (changed) {
    onSelectNode({ ...selectedNode, connections });
  }
}, [edges, nodes, selectedNode, onSelectNode]);

  useEffect(() => {
    if (!jumpToNodeId) return;

    selectNodeById(jumpToNodeId);

    const targetNode = nodes.find((n) => n.id === jumpToNodeId);
    if (targetNode && rfInstance) {
      rfInstance.setCenter(
        targetNode.position.x + 75,
        targetNode.position.y + 40,
        { zoom: 1, duration: 500 }
      );
    }

    onJumpHandled();
  }, [jumpToNodeId, nodes, rfInstance, selectNodeById, onJumpHandled]);

  const handleNodeDoubleClick = useCallback((event, node) => {
    rfInstance.setCenter(
      node.position.x + 75,
      node.position.y + 40,
      { zoom: 1, duration: 500 }
    );
    selectNodeById(node.id);
  }, [selectNodeById]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3>Story Canvas ({nodes.length} nodes)</h3>
      </div>

      <div style={styles.flowWrapper}>
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
          panOnScroll
          panOnScrollMode="free"
          zoomOnScroll={false}
          zoomOnPinch
          zoomOnDoubleClick={false}
          onNodeDoubleClick={handleNodeDoubleClick}
        >
          <Background variant="dots" gap={12} size={1} />
          <button onClick={() => setIsMapVisible(!isMapVisible)} style={mapToggleStyle}>
            {isMapVisible ? '✕ Map' : 'Map'}
          </button>
          {isMapVisible && <MiniMap position="bottom-left" nodeColor={'#FFD54F'} style={miniMapStyle} zoomable pannable />}
        </ReactFlow>
        <button onClick={addNewNode} style={addNodeButtonStyle}>+</button>
      </div>
    </div>
  );
}

const addNodeButtonStyle = { position: 'absolute', bottom: 30, right: 10, zIndex: 20, width: 50, height: 50, borderRadius: '50%', background: '#FFD54F', color: 'white', border: 'none', fontSize: '24px', cursor: 'pointer' };
const mapToggleStyle = { position: 'absolute', bottom: 30, left: 10, zIndex: 20, padding: '5px 10px', borderRadius: '8px', border: '1px solid #FFD54F', background: 'white', cursor: 'pointer' };
const miniMapStyle = { backgroundColor: '#fff', border: '2px solid #FFD54F', borderRadius: '10px' };
const styles = {
  container: { height: '100%', width: '100%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', backgroundColor: '#f5f5f5' },
  header: { padding: '10px 20px', borderBottom: '1px solid #ddd', backgroundColor: '#fff' },
  flowWrapper: { flex: 1, position: 'relative', width: '100%', height: '100%' }
};