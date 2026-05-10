import { Handle, Position } from 'reactflow';

const handleStyle = {
  width: 15,
  height: 15,
  background: '#FFD54F',
  border: '0',
};

const labelStyle = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#444',
  padding: '10px 20px',
  background: 'white',
  borderRadius: '20px',
  border: '2px solid #FFD54F',
  textAlign: 'center'
};

export function StartNode({ data }) {
  return (
    <div style={labelStyle}>
      Start
      <Handle 
        type="source" 
        position={Position.Bottom}
        style={{ ...handleStyle, bottom: -8 }} // Przesunięcie kółka na krawędź dolną
      />
    </div>
  );
}

export function StoryNode({ id, data, selected }) {
  return (
    <div style={{
      position: 'relative',
      width: '150px',
      minHeight: '120px',
      borderRadius: '15px',
      border: selected ? '2px solid #FFD54F' : '1px solid #FFD54F',
      background: '#FEF9E7',
      padding: '15px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      fontFamily: 'sans-serif',
      boxShadow: selected ? '0 0 10px rgba(255, 213, 79, 0.5)' : '0 2px 5px rgba(0,0,0,0.05)',
    }}>
      {/* ID węzła w rogu */}
      <div style={{ fontSize: '8px', color: '#BDBDBD', position: 'absolute', top: '5px', right: '8px' }}>
        #{id}
      </div>

      <Handle type="target" position={Position.Top} style={{ ...handleStyle, top: -10 }} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <div style={{ fontSize: '11px', lineHeight: '1.2em', maxHeight: '3.6em', overflow: 'hidden', color: '#444', fontWeight: '500' }}>
          {data.text || 'text...'}
        </div>

        <div style={{ margin: 'auto', textAlign: 'center', opacity: 0.3 }}>
          <span style={{ letterSpacing: '3px' }}>•••</span>
        </div>

        <div style={{ fontSize: '11px', color: '#888', textAlign: 'right', fontStyle: 'italic' }}>
          {data.text && data.text.length > 50 ? data.text.slice(-80) : ''}
        </div>

      </div>

      <Handle type="source" position={Position.Bottom} style={{ ...handleStyle, bottom: -10 }} />

      </div>
  );
}

export function EndNode({ data }) {
  return (
    <div style={labelStyle}>
      <Handle 
        type="target" 
        position={Position.Top} 
        style={{ ...handleStyle, top: -8 }} // Przesunięcie kółka na krawędź górną
      />
      End
    </div>
  );
}