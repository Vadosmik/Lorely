




/**
 * Zmienia treść tekstową (innerText) danego elementu, 
 * ukrywa grupę przycisków wyboru i pokazuje nową scenę/zdanie.
 * * @param {string} id - Identyfikator elementu span, który ma otrzymać nowy tekst (np. 'drink').
 * @param {string} text - Nowa treść, która ma zostać wstawiona.* 
 * @param {string} nextNodeId - ID następnego bloku, który ma się pojawić.
 */
function handleMinChoice(id, text, nextNodeId) {
  document.getElementById(id).innerText = text;

  document.querySelectorAll('.' + id + '-btn').forEach(button => {
    button.classList.add('hidden');
  });

  activateNode(nextNodeId);
}

/**
 * Obsługuje wybór średni (zmiana akapitu).
 * @param {string} activeId - ID wariantu, który ma zostać pokazany.
 * @param {string} nextNodeId - ID następnego bloku, który ma się pojawić.
 */
function handleMedChoice(element, activeId, nextNodeId) {
  document.getElementById(activeId).classList.remove('hidden');

  document.querySelectorAll('.med-choice').forEach(button => {
    if (button === element) {
      button.disabled = true;
      button.style.cursor = 'default';
    } else {
      button.classList.add('hidden');
    }
  });

  const delayInSeconds = 1;
  setTimeout(() => {
    activateNode(nextNodeId);
  }, delayInSeconds * 1000);
}


/**
 * Funkcja pomocnicza: Aktywuje następny ukryty blok i przewija do niego.
 * @param {string} nodeId - ID bloku do aktywacji.
 */
function activateNode(nodeId) {
  const targetNode = document.getElementById(nodeId);

  if (targetNode) {
    targetNode.classList.remove('hidden');

    const elementsToAnimate = targetNode.querySelectorAll('p, h3, .choice-container');;

    elementsToAnimate.forEach((el, index) => {
      if (el.closest('.med-variant')) {
        el.style.animationDelay = 0.3 + 's';
        el.classList.add('fade-in-effect');
        return;
      }

      const delay = index * 0.3;

      el.style.animationDelay = delay + 's';
      el.classList.add('fade-in-effect');
    });
  }
}


// color - theme
const color_theme = document.getElementById('color-theme');

color_theme.addEventListener("click", () => {
  const isLight = document.documentElement.getAttribute("data-theme") === "light";

  if (isLight) {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", "light");
  }
});

// Music
// Konfiguracja obserwatora
const musicObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    // Sprawdzamy, czy element pojawił się na ekranie
    if (entry.isIntersecting) {
      const music = document.getElementById('bg-music');
      
      if (music) {
        music.play().then(() => {
          console.log("Muzyka gra!");
        }).catch(error => {
          console.log("Autoodtwarzanie zablokowane - kliknij coś na stronie.", error);
        });
      }

      // Przestajemy obserwować po pierwszym uruchomieniu
      musicObserver.unobserve(entry.target);
    }
  });
}, { 
  threshold: 0.1 
});

// Wskazujemy, który element ma wywołać muzykę
// Możesz to zrobić po ID lub po klasie
document.addEventListener("DOMContentLoaded", () => {
  const triggerElement = document.getElementById('music-2');
  if (triggerElement) {
    musicObserver.observe(triggerElement);
  }
});