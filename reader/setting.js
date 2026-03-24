const menu = document.getElementById('myMenu');
const slider = document.getElementById('textSize');
const textSizeValue = document.getElementById('text-size-value');
const btnDec = document.getElementById('decText');
const btnInc = document.getElementById('incText');

function openSetting() {
  menu.hidden = !menu.hidden;
}

slider.addEventListener('input', (e) => {
  const currentVal = e.target.value + 'px';
  if (textSizeValue) {
    textSizeValue.textContent = currentVal;
  }
});

slider.addEventListener('change', (e) => {
  const finalSize = e.target.value + 'px';
  document.documentElement.style.setProperty('--font-size-base', finalSize);
  
  textSizeValue.style.color = 'var(--color-text)'; 
});

function updateSizeFromBtn(delta) {
  let newVal = parseInt(slider.value) + delta;
  newVal = Math.max(12, Math.min(100, newVal));
  
  slider.value = newVal;
  textSizeValue.textContent = newVal + 'px';
  document.documentElement.style.setProperty('--font-size-base', newVal + 'px');
}

btnDec.onclick = () => updateSizeFromBtn(-1);
btnInc.onclick = () => updateSizeFromBtn(1);