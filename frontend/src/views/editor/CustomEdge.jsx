import { useState } from 'preact/hooks';
import { getBezierPath, useReactFlow, EdgeLabelRenderer } from 'reactflow';

export function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data
}) {
  const { setEdges } = useReactFlow();
  const [showSettings, setShowSettings] = useState(false);
  
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition,
  });

  const onRemove = () => {
    setEdges((eds) => eds.filter((edge) => edge.id !== id));
  };

  const onEdit = () => {
    const newLabel = prompt("Tytuł wyboru:", data?.label || "");
    if (newLabel !== null) {
      setEdges((eds) =>
        eds.map((edge) => 
          edge.id === id ? { ...edge, data: { ...edge.data, label: newLabel } } : edge
        )
      );
    }
    setShowSettings(false);
  };

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd="url(#react-flow__arrowclosed)"
        style={{ strokeWidth: 2, stroke: '#FFD54F' }}
      />
      
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          {/* Główny przycisk - Etykieta */}
          {!showSettings ? (
            <button
              onClick={() => setShowSettings(true)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                background: '#fff',
                border: '2px solid #FFD54F',
                fontSize: '12px',
                fontWeight: 'bold',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
              }}
            >
              {data?.label || 'Opcje'}
            </button>
          ) : (
            <div style={{
              display: 'flex',
              gap: '5px',
              background: '#333',
              padding: '5px',
              borderRadius: '12px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
              alignItems: 'center'
            }}>
              <button onClick={onEdit} style={btnStyle}>Edytuj</button>
              <button onClick={() => alert('Wkrótce: Zmienne')} style={btnStyle}>⚙️</button>
              <button onClick={onRemove} style={{...btnStyle, background: '#ff4d4d'}}>Del</button>
              
              {/* Przycisk zamknięcia menu */}
              <button 
                onClick={() => setShowSettings(false)} 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: '#ccc', 
                  fontSize: '16px', 
                  padding: '0 5px',
                  cursor: 'pointer' 
                }}
              >
                ok
              </button>
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

// Prosty styl dla przycisków wewnątrz popupu
const btnStyle = {
  background: '#555',
  color: 'white',
  border: 'none',
  padding: '6px 10px',
  borderRadius: '8px',
  fontSize: '11px',
  cursor: 'pointer',
  fontWeight: 'bold'
};