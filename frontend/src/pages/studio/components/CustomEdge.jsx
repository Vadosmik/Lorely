import { getBezierPath, useReactFlow, EdgeLabelRenderer } from 'reactflow';

export function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}) {
  const { setEdges } = useReactFlow();

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition,
  });

  const onLabelClick = (e) => {
    e.stopPropagation();
    setEdges((eds) =>
      eds.map((edge) => ({ ...edge, selected: edge.id === id }))
    );
  };

  const onRemove = (e) => {
    e.stopPropagation();
    setEdges((eds) => eds.filter((edge) => edge.id !== id));
  };

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd="url(#react-flow__arrowclosed)"
        style={{ strokeWidth: selected ? 3 : 2, stroke: '#FFD54F' }}
      />

      <EdgeLabelRenderer>
        <div
          onClick={onLabelClick}
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
          }}
          className="nodrag nopan"
        >
          <div style={styles.badge}>{data?.label || 'Auto'}</div>

          {selected && (
            <button onClick={onRemove} style={styles.delButton} title="Usuń połączenie">
              ✕
            </button>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

const styles = {
  badge: {
    padding: '6px 14px',
    borderRadius: '20px',
    background: '#fff',
    border: '2px solid #FFD54F',
    fontSize: '12px',
    fontWeight: 'bold',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
    pointerEvents: 'none',
  },
  delButton: {
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    background: '#ff4d4d',
    color: 'white',
    border: 'none',
    fontSize: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};