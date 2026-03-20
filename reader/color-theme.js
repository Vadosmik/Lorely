const color_theme = document.getElementById('color-theme');

color_theme.addEventListener("click", () => {
  const isLight = document.documentElement.getAttribute("data-theme") === "light";

  if (isLight) {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", "light");
  }
});