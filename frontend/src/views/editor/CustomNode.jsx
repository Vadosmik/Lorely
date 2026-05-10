import { Handle, Position } from 'reactflow';

export function StartNode({ data, selected }) {
  return (
    <div>
      <div>
        {'Start'}
      </div>
      <Handle 
        type="source" 
        position={Position.Bottom}
      />
    </div>
  );
}

export function StoryNode({ id, data, selected }) {
  return (
    <div style={{
      position: 'relative',
      maxHeight: '150px',
      maxWidth: '150px',
      minHeight: '100px',
      minWidth: '120px',
      borderRadius: '15px',
      border: selected ? '2px solid #FFD54F' : '1px dashed #FFD54F',
      background: '#FEF9E7',
      padding: '10px',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'sans-serif',
      boxShadow: selected ? '0 0 10px rgba(255, 213, 79, 0.5)' : 'none',
    }}>
      {/* ID węzła w rogu */}
      <div style={{ 
        fontSize: '8px', 
        color: '#BDBDBD', 
        position: 'absolute', 
        top: '5px', 
        right: '8px' 
      }}>
        #{id}
      </div>

      <Handle type="target" position={Position.Top} style={{ background: '#FFD54F'}} />
      
      <div style={{ 
        marginTop: '8px',
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%', 
        justifyContent: 'space-between'
      }}>
        
        <div style={{
          fontSize: '10px',
          lineHeight: '1.2em',
          maxHeight: '3.6em',
          overflow: 'hidden',
          color: '#444',
        }}>
          {data.text || 'text...'}
        </div>

        <div style={{ margin: 'auto'}}>
          <span style={{ fontSize: '10px', letterSpacing: '2px'}}>•••</span>
        </div>

        <div style={{
          fontSize: '10px',
          maxHeight: '3.6em',
          color: '#666',
          textAlign: 'right',
          fontStyle: 'italic'
        }}>
          {data.text && data.text.length > 50 ? data.text.slice(-80) : ''}
        </div>

      </div>

      <Handle type="source" position={Position.Bottom} style={{ background: '#FFD54F'}} />
    </div>
  );
}

export function EndNode({ data, selected }) {
  return (
    <div>
      <Handle 
        type="target" 
        position={Position.Top} 
      />
      <div>
        {'End'}
      </div>
    </div>
  );
}