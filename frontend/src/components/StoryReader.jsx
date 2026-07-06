import { useState, useEffect } from 'preact/hooks';

export default function StoryReader({ storyId, storyJson, onReset }) {
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

  const localReset = () => {
    localStorage.removeItem(varsKey);
    localStorage.removeItem(historyKey);
    onReset();
  };

  return (
    <div>
      <div>
        <h2>{storyJson.story_title || "Lorely Reader"}</h2>
        <button onClick={localReset}>Reset Game</button>
      </div>

      <div>
        {historyData.map((sceneId, idx) => {
          const node = storyJson.nodes[sceneId];
          if (!node || !node.text) return null;
          return (
            <div
              key={`${sceneId}_${idx}`}
              dangerouslySetInnerHTML={{ __html: node.text }}
            />
          );
        })}
      </div>

      <div>
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

};