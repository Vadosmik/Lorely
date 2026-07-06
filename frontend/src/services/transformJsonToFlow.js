export function transformJsonToFlow(storyJson) {
  const nodes = [];
  const edges = [];

  if (!storyJson || !storyJson.nodes) {
    return { nodes: [], edges: [] };
  }

  Object.entries(storyJson.nodes).forEach(([nodeId, nodeData]) => {
    const isStartNode = nodeData.type === 'startNode';
    
    nodes.push({
      id: nodeId,
      type: nodeData.type || 'storyNode',
      position: nodeData.position || { x: 0, y: 0 },
      data: { 
        text: nodeData.text,
      },
      deletable: !isStartNode 
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
        edges.push({
          id: `edge-auto-${nodeId}-to-${autoRule.next_node}-${index}`,
          type: 'customEdge',
          source: nodeId,
          target: autoRule.next_node,
          data: { 
            label: ''
          }
        });
      });
    }
  });

  return { initialNodes: nodes, initialEdges: edges };
}

export function transformFlowToJson(nodes, edges, storyData) {
  const startNode = nodes.find(n => n.type === 'startNode');

  return {
    story_title: storyData.title || 'Untitled Story',
    history: startNode ? [startNode.id] : [],
    variables: storyData.variables || {},
    nodes: nodes.reduce((acc, node) => {
      const outgoingEdges = edges.filter((e) => e.source === node.id);
      const choiceEdges = outgoingEdges.filter(e => e.data?.label?.trim());
      const autoNextEdges = outgoingEdges.filter(e => !e.data?.label?.trim());

      const nodeConfig = {
        position: node.position || { x: 0, y: 0 },
        type: node.type || 'storyNode',
        text: node.data?.text || ''
      };

      if (choiceEdges.length) {
        nodeConfig.choices = choiceEdges.map((e) => ({
          text: e.data.label,
          next_node: e.target,
          ...(e.data?.variables && { variables: e.data.variables })
        }));
      }
      if (autoNextEdges.length) {
        nodeConfig.auto_next = autoNextEdges.map((e) => ({
          next_node: e.target,
          ...(e.data?.requires && { requires: e.data.requires })
        }));
      }

      acc[node.id] = nodeConfig;
      return acc;
    }, {})
  };
}