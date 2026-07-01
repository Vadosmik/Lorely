export function transformJsonToFlow(storyJson) {
  const nodes = [];
  const edges = [];

  if (!storyJson || !storyJson.nodes) {
    return { nodes: [], edges: [] };
  }

  Object.entries(storyJson.nodes).forEach(([nodeId, nodeData]) => {
    
    nodes.push({
      id: nodeId,
      type: nodeData.type || 'storyNode',
      position: nodeData.position || { x: 0, y: 0 },
      data: { 
        text: nodeData.text,
      }
    });

    if (nodeData.choices && Array.isArray(nodeData.choices)) {
      nodeData.choices.forEach((choice, index) => {
        edges.push({
          id: `edge-${nodeId}-to-${choice.next_node}-${index}`,
          type: 'customEdge',
          source: nodeId,
          target: choice.next_node,
          data: { 
            label: choice.text
          }
        });
      });
    }

    if (nodeData.auto_next && Array.isArray(nodeData.auto_next)) {
      nodeData.auto_next.forEach((autoRule, index) => {
        const reqLabel = autoRule.requires 
          ? Object.entries(autoRule.requires).map(([k, v]) => `${k}:${v}`).join(', ')
          : 'Auto';

        edges.push({
          id: `edge-auto-${nodeId}-to-${autoRule.next_node}-${index}`,
          type: 'customEdge',
          source: nodeId,
          target: autoRule.next_node,
          data: { 
            label: `➔ ${reqLabel}`
          }
        });
      });
    }
  });

  return { initialNodes: nodes, initialEdges: edges };
}