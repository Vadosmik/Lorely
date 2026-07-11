import { useState, useEffect } from 'preact/hooks';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function SceneEditor({ activeNode, onUpdateNode, onJumpToNode }) {
  const [editorContent, setEditorContent] = useState('');

  useEffect(() => {
    if (activeNode) {
      setEditorContent(activeNode.text);
    }
  }, [activeNode?.id]);

  if (!activeNode) {
    return (
      <div style={styles.containerEmpty}>
        <p style={{ color: '#888', fontStyle: 'italic' }}>
          Click twice to edit node text
        </p>
      </div>
    );
  }

  const handleTextChange = (content) => {
    setEditorContent(content);
    onUpdateNode({
      ...activeNode,
      text: content
    });
  };

  const handleEdgeTextChange = (edgeId, newText) => {
    const updatedConnections = activeNode.connections.map(conn =>
      conn.edgeId === edgeId ? { ...conn, edgeText: newText } : conn
    );

    onUpdateNode({
      ...activeNode,
      connections: updatedConnections
    });
  };

  return (
    <div style={styles.container}>
      <ReactQuill
        value={editorContent}
        onChange={handleTextChange}
        style={styles.editorContent}
      />

      <div style={{ padding: '0 15px' }}>
        <h4 style={{ color: '#333', marginBottom: '10px' }}>Choices / Connections</h4>
        {activeNode.connections && activeNode.connections.length > 0 ? (
          activeNode.connections.map((conn, idx, arr) => {
            const isLast = idx === arr.length - 1;

            return (
              <div
                key={conn.edgeId}
                style={{
                      ...styles.connectionCard,
                      ...(isLast ? styles.lastConnectionCard : {})
                    }}
              >
                <div style={{ marginBottom: '5px' }}>
                  <strong style={{ color: '#555' }}>Choice {idx + 1}:</strong>
                </div>

                <input
                  type="text"
                  value={conn.edgeText}
                  style={styles.input}
                  placeholder="Enter choice text..."
                  onInput={(e) => handleEdgeTextChange(conn.edgeId, e.target.value)}
                />

                <div style={styles.targetInfo}>
                  Next node:{' '}
                  <span
                    style={styles.targetBadge}
                    onClick={() => onJumpToNode(conn.targetId)}
                    title="Click to jump directly"
                  >
                    {conn.targetTitle}
                  </span>
                </div>
              </div>
            )
          })
        ) : (
          <p style={{ color: '#888', fontSize: '13px' }}>
            This node doesn't have any outgoing connections. Please connect it to another node on the canvas.
          </p>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    backgroundColor: '#F7FAFF',
    overflowY: 'auto'
  },
  containerEmpty: {
    height: '100%',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    textAlign: 'center',
    backgroundColor: '#fafafa',
  },
  editorContent: {
    height: 'auto',
    minHeight: '200px',
    marginBottom: '50px'
  },
  connectionCard: {
    background: '#f8f9fa',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    padding: '12px',
    marginBottom: '10px'
  },
  lastConnectionCard: {
    marginBottom: '65px'
  },
  input: {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '4px',
    border: '1px solid #cbd5e1',
    boxSizing: 'border-box'
  },
  targetInfo: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '6px'
  },
  targetBadge: {
    background: '#e2e8f0',
    padding: '2px 6px',
    borderRadius: '4px',
    color: '#334155',
    fontWeight: '500',
    cursor: 'pointer'
  }
};