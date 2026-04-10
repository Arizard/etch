function readInput() {
  const textInput = document.querySelector(".text-input");
  const inputRe = /(\$[\w-]+):\s+(\#[abcdefgABCDEFG0123456789]{6});/g;
  const matches = textInput.innerHTML.matchAll(inputRe);

  const hexPairs = matches.map(([_, name, hex]) => [name, hex]);

  const paletteContainer = document.querySelector(".palette-container");
  paletteContainer.innerHTML = "";

  const paletteContainerDark = document.querySelector(".palette-container-dark");
  paletteContainerDark.innerHTML = "";
  for (const [name, hex] of hexPairs) {
    const cellHTML = `<div class="palette-cell"><div class="name"><p>${name}</p></div><div  style="background-color: ${hex}" class="swatch">&nbsp;</div></div>`;
    if (name.includes("dark")) {
      paletteContainerDark.innerHTML = `${paletteContainerDark.innerHTML}${cellHTML}`;
    } else {
      paletteContainer.innerHTML = `${paletteContainer.innerHTML}${cellHTML}`;
    }
  }
}

addEventListener("load", () => {
  const textInput = document.querySelector(".text-input");
  textInput.addEventListener("input", () => readInput());
  readInput();
});
