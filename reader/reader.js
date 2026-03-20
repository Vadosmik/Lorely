const contentArea = document.getElementById('story-content');
const choicesArea = document.getElementById('choices-container');
const titleElement = document.getElementById('story-title');

let storyData = null;
let historyData = null;
let variablesData = null;

async function loadStory() {
  try {
    const response = await fetch('test.json');
    storyData = await response.json();
    titleElement.textContent = storyData.story_title;

    // === HISTORY ===
    const savedHistory = localStorage.getItem('lorely_history');
    historyData = savedHistory ? JSON.parse(savedHistory) : storyData.history;

    // === VARIABLES ===
    const savedVars = localStorage.getItem('lorely_variables');
    variablesData = savedVars ? JSON.parse(savedVars) : (storyData.variables || {});

    renderHistory(historyData);
  } catch (error) {
    console.error("Błąd ładowania historii:", error);
    contentArea.innerHTML = "<p>Nie udało się załadować historii.</p>";
  }
}

function renderHistory(historyData) {
  contentArea.innerHTML = '';
  let lastSceneId;

  historyData.forEach(sceneId => {
    lastSceneId = sceneId;
    const node = storyData.nodes[sceneId];

    if (node) {
      const paragraphs = node.text.split('\n\n');
      paragraphs.forEach(text => {
        const p = document.createElement('p');
        p.textContent = text;
        contentArea.appendChild(p);
      });
    }
  });

  renderChoicesBtn(lastSceneId);
}

function renderNode(nodeId) {
  const node = storyData.nodes[nodeId];
  if (!node) return;

  choicesArea.innerHTML = '';
  historyData.push(nodeId);
  localStorage.setItem('lorely_history', JSON.stringify(historyData));

  const paragraphs = node.text.split('\n\n');
  paragraphs.forEach(text => {
    const p = document.createElement('p');
    p.textContent = text;
    contentArea.appendChild(p);
  });

  renderChoicesBtn(nodeId);
}

function renderChoicesBtn(nodeId) {
  const node = storyData.nodes[nodeId];
  if (!node || !node.choices) return;

  choicesArea.innerHTML = '';

  // if (choice.requires) {
  //     let hasRequirements = true;
  //     for (let varName in choice.requires) {
  //       const requiredValue = choice.requires[varName];
  //       const currentValue = variablesData[varName] || 0;

  //       if (currentValue < requiredValue) {
  //         hasRequirements = false;
  //         break;
  //       }
  //     }
      
  //     if (!hasRequirements) return; 
  //   }

  node.choices.forEach(choice => {
    const btn = document.createElement('button');
    btn.textContent = choice.text;
    btn.className = 'choice-btn';

    btn.onclick = () => {

      if (choice.variables) {
        for (let key in choice.variables) {
          if (variablesData[key]) {
            variablesData[key] += choice.variables[key];
          } else {
            variablesData[key] = choice.variables[key];
          }
        }
        localStorage.setItem('lorely_variables', JSON.stringify(variablesData));
      }

      renderNode(choice.next_node)
    };
    choicesArea.appendChild(btn);
  });
}

//requires do json funkcja jezeli 

function resetStory() {
  localStorage.removeItem('lorely_variables');
  localStorage.removeItem('lorely_history');
  location.reload(); // Odśwież stronę, żeby zacząć od zera
}

// Uruchomienie na starcie
loadStory();