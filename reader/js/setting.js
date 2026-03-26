const menu = document.getElementById('myMenu');

const slider = document.getElementById('textSize');
const textSizeValue = document.getElementById('text-size-value');
const btnDec = document.getElementById('decText');
const btnInc = document.getElementById('incText');

const sliderLH = document.getElementById('lineHeight');
const lineHeightValue = document.getElementById('line-height-value');
const btnDecLH = document.getElementById('decLineHeight');
const btnIncLH = document.getElementById('incLineHeight');

function openSetting() {
  menu.hidden = !menu.hidden;
}

const setupControl = (config) => {
  const { slider, label, btnDec, btnInc, variableName, unit = '' } = config;

  if (!slider) return;

  const update = (value) => {
    const val = parseFloat(value).toFixed(unit === '' ? 1 : 0);
    const finalValue = val + unit;

    slider.value = val;
    label.textContent = finalValue;
    document.documentElement.style.setProperty(variableName, finalValue);
  };

  slider.addEventListener('input', (e) => update(e.target.value));

  const step = parseFloat(slider.step) || 1;

  btnDec.onclick = () => update(parseFloat(slider.value) - step);
  btnInc.onclick = () => update(parseFloat(slider.value) + step);
};

setupControl({
  slider: document.getElementById('textSize'),
  label: document.getElementById('text-size-value'),
  btnDec: document.getElementById('decText'),
  btnInc: document.getElementById('incText'),
  variableName: '--font-size-base',
  unit: 'px'
});

setupControl({
  slider: document.getElementById('lineHeight'),
  label: document.getElementById('line-height-value'),
  btnDec: document.getElementById('decLineHeight'),
  btnInc: document.getElementById('incLineHeight'),
  variableName: '--line-height-base',
  unit: ''
});