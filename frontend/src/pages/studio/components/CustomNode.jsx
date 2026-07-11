import { Handle, Position } from 'reactflow';

function stripHtml(html) {
  return (html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function StartNode({ data }) {
  return (
    <div style={styles.label}>
      Start
      <Handle type="source" position={Position.Bottom} style={styles.handleBottomSmall} />
    </div>
  );
}


export function StoryNode({ id, data, selected }) {
  const plainText = stripHtml(data.text);
  const isLongText = plainText.length > 120;
  const tail = isLongText ? plainText.slice(plainText.length - 42) : '';

  return (
    <div style={{ ...styles.node, ...(selected ? styles.nodeSelected : styles.nodeIdle) }}>
      <div style={styles.nodeId}>#{id}</div>

      <Handle type="target" position={Position.Top} style={styles.handleTop} />


      <div style={styles.body}>
        <div style={styles.preview} dangerouslySetInnerHTML={{ __html: plainText || 'text...' }} />

        {tail && (
          <>
            <div style={styles.divider}>
              <span style={styles.dividerDots}>•••</span>
            </div>
            <div style={styles.tail}>...{tail}</div>
          </>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} style={styles.handleBottom} />
    </div>
  );
}

export function EndNode({ data }) {
  return (
    <div style={styles.label}>
      <Handle type="target" position={Position.Top} style={styles.handleTopSmall} />
      End
    </div>
  );
}

const styles = {
  handle: {
    width: 15,
    height: 15,
    background: '#FFD54F',
    border: '0',
  },
  handleTop: {
    width: 15,
    height: 15,
    background: '#FFD54F',
    border: '0',
    top: -10,
  },
  handleBottom: {
    width: 15,
    height: 15,
    background: '#FFD54F',
    border: '0',
    bottom: -10,
  },
  handleTopSmall: {
    width: 15,
    height: 15,
    background: '#FFD54F',
    border: '0',
    top: -8,
  },
  handleBottomSmall: {
    width: 15,
    height: 15,
    background: '#FFD54F',
    border: '0',
    bottom: -8,
  },
  label: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#444',
    padding: '10px 20px',
    background: 'white',
    borderRadius: '20px',
    border: '2px solid #FFD54F',
    textAlign: 'center',
  },
  node: {
    position: 'relative',
    width: '170px',
    minHeight: '130px',
    borderRadius: '14px',
    background: '#FFFDF6',
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'sans-serif',
  },
  nodeIdle: {
    border: '1px solid #EDE0B0',
    boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
  },
  nodeSelected: {
    border: '2px solid #FFD54F',
    boxShadow: '0 0 0 4px rgba(255, 213, 79, 0.25)',
  },
  nodeId: {
    fontSize: '9px',
    color: '#D9CBA0',
    position: 'absolute',
    top: '8px',
    right: '10px',
    fontFamily: 'monospace',
  },
  body: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginTop: '4px',
  },
  preview: {
    fontSize: '12px',
    lineHeight: '1.35em',
    color: '#3a3a3a',
    fontWeight: '500',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  divider: {
    textAlign: 'center',
    opacity: 0.35,
  },
  dividerDots: {
    letterSpacing: '3px',
    fontSize: '10px',
    color: '#B08D2E',
  },
  tail: {
    fontSize: '11px',
    lineHeight: '1.3em',
    color: '#9a9a9a',
    fontStyle: 'italic',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
};