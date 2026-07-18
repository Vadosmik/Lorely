import { useState, useEffect } from 'preact/hooks';

export default function StoryReader({ storyId, storyJson }) {
  const [historyData, setHistoryData] = useState([]);
  const [variablesData, setVariablesData] = useState({});
  const [activeNode, setActiveNode] = useState(null);

  const historyKey = `lorely_history_${storyId}`;
  const varsKey = `lorely_variables_${storyId}`;

  useEffect(() => {
    const savedHistory = localStorage.getItem(historyKey);
    const parsedHistory = savedHistory ? JSON.parse(savedHistory) : (Array.isArray(storyJson.history) ? storyJson.history : []);

    const savedVars = localStorage.getItem(varsKey);
    const parsedVars = savedVars ? JSON.parse(savedVars) : (storyJson.variables || {});

    setHistoryData(parsedHistory);
    setVariablesData(parsedVars);

    if (parsedHistory.length > 0) {
      const lastNodeId = parsedHistory[parsedHistory.length - 1];
      processNode(lastNodeId, parsedVars, parsedHistory);
    } else if (storyJson.nodes && Object.keys(storyJson.nodes).length > 0) {
      const firstNodeId = Object.keys(storyJson.nodes)[0];
      const initialHistory = [firstNodeId];
      setHistoryData(initialHistory);
      localStorage.setItem(historyKey, JSON.stringify(initialHistory));
      processNode(firstNodeId, parsedVars, initialHistory);
    }
  }, [storyId, storyJson]);

  const processNode = (nodeId, currentVars, currentHistory) => {
    const node = storyJson.nodes[nodeId];
    if (!node) return;

    setActiveNode(node);

    if (node.auto_next && Array.isArray(node.auto_next)) {
      for (let rule of node.auto_next) {
        let met = true;
        if (rule.requires) {
          for (let v in rule.requires) {
            if ((currentVars[v] || 0) < rule.requires[v]) met = false;
          }
        }
        if (met) {
          setTimeout(() => {
            const nextHistory = [...currentHistory, rule.next_node];
            setHistoryData(nextHistory);
            localStorage.setItem(historyKey, JSON.stringify(nextHistory));
            processNode(rule.next_node, currentVars, nextHistory);
          }, 100);
          return;
        }
      }
    }
  };

  const handleSelectChoice = (nextNodeId, choiceVariables) => {
    let updatedVars = { ...variablesData };

    if (choiceVariables) {
      for (let key in choiceVariables) {
        updatedVars[key] = (updatedVars[key] || 0) + choiceVariables[key];
      }
      setVariablesData(updatedVars);
      localStorage.setItem(varsKey, JSON.stringify(updatedVars));
    }

    const updatedHistory = [...historyData, nextNodeId];
    setHistoryData(updatedHistory);
    localStorage.setItem(historyKey, JSON.stringify(updatedHistory));

    processNode(nextNodeId, updatedVars, updatedHistory);
  };

  return (
    <div style={styles.readerWrapper}>
      {/* Treść opowiadania */}
      <main style={styles.storyContent}>
        {historyData.map((sceneId, idx) => {
          const node = storyJson.nodes[sceneId];
          if (!node || !node.text) return null;
          return (
            <div
              key={`${sceneId}_${idx}`}
              dangerouslySetInnerHTML={{ __html: node.text }}
              style={styles.paragraph}
            />
          );
        })}
      </main>

      {/* Duże przyciski wyborów */}
      <div style={styles.choicesContainer}>
        {activeNode && activeNode.choices && activeNode.choices.map((choice, idx) => {
          if (choice.requires) {
            for (let varName in choice.requires) {
              if ((variablesData[varName] || 0) < choice.requires[varName]) return null;
            }
          }
          return (
            <button
              key={idx}
              onClick={() => handleSelectChoice(choice.next_node, choice.variables)}
              style={styles.choiceBtn}
            >
              {choice.text}
            </button>
          );
        })}
      </div>
    </div>
  )
}

const styles = {
  readerWrapper: {
    paddingTop: '24px',
    paddingBottom: '80px',
    color: 'var(--color-text)',
    fontFamily: 'Georgia, serif',
    lineHeight: '1.7',
  },
  storyContent: {
    padding: '0 24px',
    textAlign: 'justify',
  },
  paragraph: {
    fontSize: '1.25rem',
    textIndent: '1.75em',
    marginBottom: '1.5rem',
  },
  choicesContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '40px',
    padding: '0 24px',
  },
  choiceBtn: {
    background: 'var(--color-surface)',
    color: 'var(--color-text)',
    fontFamily: 'sans-serif',
    textAlign: 'center',
    fontSize: '1.1rem',
    fontWeight: '500',
    cursor: 'pointer',
    padding: '16px 20px',
    border: '1.5px solid var(--color-border)',
    borderRadius: '16px',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
    outline: 'none',
  },
};