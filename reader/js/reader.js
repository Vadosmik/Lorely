const contentArea = document.getElementById('story-content');
const choicesArea = document.getElementById('choices-container');
const titleElement = document.getElementById('story-title');

let storyData = null;
let historyData = null;
let variablesData = null;
let currentAudio = null;

let fadeInTimer = null;
let fadeOutTimer = null;
const FADE_DURATION = 2000;
const MAX_VOLUME = 0.1;

async function loadStory() {
  try {
    const response = await fetch('story_flow.json');
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
      if (node.bg_music) handleMusic(node.bg_music);
      
      const paragraphs = node.text.split('\n\n');
      paragraphs.forEach(text => {
        const p = document.createElement('p');
        p.textContent = text;
        contentArea.appendChild(p);
      });
    }
  });

  renderChoicesBtn(storyData.nodes[lastSceneId]);
}

function renderNode(nodeId) {
  const node = storyData.nodes[nodeId];
  if (!node) return;

  if (node.bg_music) {
    handleMusic(node.bg_music);
  }

  choicesArea.innerHTML = '';
  historyData.push(nodeId);
  localStorage.setItem('lorely_history', JSON.stringify(historyData));

  const paragraphs = node.text.split('\n\n');
  paragraphs.forEach(text => {
    const p = document.createElement('p');
    p.textContent = text;
    contentArea.appendChild(p);
  });

  renderChoicesBtn(node);
}

function renderChoicesBtn(node) {
  choicesArea.innerHTML = '';

  if (node.auto_next && Array.isArray(node.auto_next)) {
    for (let rule of node.auto_next) {
      let met = true;
      if (rule.requires) {
        for (let v in rule.requires) {
          if ((variablesData[v] || 0) < rule.requires[v]) met = false;
        }
      }
      if (met) {
        renderNode(rule.next_node);
        return;
      }
    }
  }

  node.choices.forEach(choice => {
    if (choice.requires) {
      let hasRequirements = true;
      for (let varName in choice.requires) {
        const requiredValue = choice.requires[varName];
        const currentValue = variablesData[varName] || 0;

        if (currentValue < requiredValue) {
          hasRequirements = false;
          break;
        }
      }

      if (!hasRequirements) return;
    }

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

function handleMusic(audioPath) {
  if (!audioPath) return;

  if (currentAudio && currentAudio.src.includes(audioPath)) return;

  clearInterval(fadeInTimer);
  clearInterval(fadeOutTimer);

  const oldAudio = currentAudio;
  const newAudio = new Audio(audioPath);
  
  newAudio.loop = true;
  newAudio.volume = 0; 
  currentAudio = newAudio;

  const fadeIntervalTime = 50;
  const steps = FADE_DURATION / fadeIntervalTime;

  if (oldAudio) {
    const fadeOutStep = oldAudio.volume / steps;
    fadeOutTimer = setInterval(() => {
      if (oldAudio.volume > fadeOutStep) {
        oldAudio.volume = Math.max(0, oldAudio.volume - fadeOutStep);
      } else {
        oldAudio.volume = 0;
        oldAudio.pause();
        clearInterval(fadeOutTimer);
      }
    }, fadeIntervalTime);
  }

  newAudio.play().then(() => {
    const fadeInStep = MAX_VOLUME / steps;
    fadeInTimer = setInterval(() => {
      if (newAudio.volume < MAX_VOLUME) {
        newAudio.volume = Math.min(MAX_VOLUME, +(newAudio.volume + fadeInStep).toFixed(4));
      } else {
        newAudio.volume = MAX_VOLUME;
        clearInterval(fadeInTimer);
      }
    }, fadeIntervalTime);
  }).catch(e => {
    console.warn("Autoplay zablokowany - wymagana interakcja.");
  });
}

function resetStory() {
  localStorage.removeItem('lorely_variables');
  localStorage.removeItem('lorely_history');
  location.reload();
}

// START
loadStory();