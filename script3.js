"use strict";

// DOM
const opciones = document.querySelectorAll(".opcion");
const muestra = document.getElementById("muestra");
const codigo = document.getElementById("codigo");
const aciertos = document.getElementById("aciertos");
const fallos = document.getElementById("fallos");
const mensaje = document.getElementById("mensaje");
const nuevoJuego = document.getElementById("nuevoJuego");
const mensajeInicial =
  "¡Bienvenidx a Adivina el color! ¿Cuántos colores puedes adivinar?";
const comoJugarButton = document.getElementById("comoJugar");
const popUpComoJugar = document.getElementById("popUpComoJugar");
const cerrarPopUpButton = document.getElementById("cerrarPopUp");

function toggleMenu() {
  var iconoHamburguesa = document.querySelector(".iconoHamburguesa");
  var iconoCerrar = document.querySelector(".iconoCerrar");

  var menuHamburguesa = document.querySelector(".menuHamburguesa");
  menuHamburguesa.classList.toggle("active");

  iconoHamburguesa.classList.toggle("oculto");
  iconoCerrar.classList.toggle("visible");
}

// Contadores de fallos y aciertos
let contadorFallos = 0;
let contadorAciertos = 0;

// Número aleatorio entre 0 y 255 (color RGB)
function numeroAleatorio() {
  return Math.floor(Math.random() * 256);
}

// RGB aleatorio
function colorAleatorio() {
  const r = numeroAleatorio();
  const g = numeroAleatorio();
  const b = numeroAleatorio();
  return `rgb(${r}, ${g}, ${b})`;
}

// Pasar de RGB a HSL (para editar iluminación)
function rgbToHsl(r, g, b) {
  (r /= 255), (g /= 255), (b /= 255);
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return [h, s, l];
}

// Pasar de HSL a RGB
function hslToRgb(h, s, l) {
  let r, g, b;
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [r * 255, g * 255, b * 255];
}

// Variaciones en la saturación de las opciones
function generarOpcionesSaturacion(colorBase) {
  // Conversión RGB -> HSL para modificar la luminosidad
  const hslBase = rgbToHsl(colorBase[0], colorBase[1], colorBase[2]);

  // Definición de saturación y luminosidad
  const saturacionBase = hslBase[1];
  const luminosidadBase = hslBase[2];

  // Número de opciones a generar
  const numOpciones = 8;

  // Rango de luminosidad para las opciones
  const rangoLuminosidad = 0.8; // Porcentaje del rango de luminosidad a utilizar
  const pasoLuminosidad = rangoLuminosidad / (numOpciones - 1);

  // Opciones de colores con variaciones de luminosidad
  const opciones = [];
  for (let i = 0; i < numOpciones; i++) {
    // Calculo de la luminosidad para la opción actual
    const luminosidad = Math.min(
      1,
      Math.max(0, luminosidadBase + pasoLuminosidad * i - rangoLuminosidad / 2)
    );

    // Conversión HSL -> RGB
    const rgbColor = hslToRgb(hslBase[0], saturacionBase, luminosidad);
    opciones.push(`rgb(${rgbColor[0]}, ${rgbColor[1]}, ${rgbColor[2]})`);
  }

  return opciones;
}

// Color aleatorio de "muestra" y "opciones"
function mostrarColor() {
  const colorMuestra = colorAleatorio(); // Generar color aleatorio para la muestra
  const opcionesSaturacion = generarOpcionesSaturacion(
    colorMuestra.match(/\d+/g)
  ); // Obtener RGB del color de la muestra
  codigo.textContent = colorMuestra;
  muestra.style.backgroundColor = colorMuestra;

  // RGB más atractivo
  codigo.textContent = `R: ${colorMuestra.match(/\d+/g)[0]} G: ${
    colorMuestra.match(/\d+/g)[1]
  } B: ${colorMuestra.match(/\d+/g)[2]}`;

  // Cambio color de opciones
  opciones.forEach((opcion, index) => {
    opcion.style.backgroundColor = opcionesSaturacion[index];
  });

  // Aleatoriedad en una opción que coincida con la muestra
  const opcionCorrecta = Math.floor(Math.random() * opciones.length);
  opciones[opcionCorrecta].style.backgroundColor = colorMuestra;
}

// Comprobación de si la selección es correcta
function comprobarColorSeleccionado() {
  const colorCorrecto = codigo.textContent;
  const colorSeleccionado = `R: ${
    this.style.backgroundColor.match(/\d+/g)[0]
  } G: ${this.style.backgroundColor.match(/\d+/g)[1]} B: ${
    this.style.backgroundColor.match(/\d+/g)[2]
  }`;
  if (colorSeleccionado === colorCorrecto) {
    mensaje.textContent = "¡Has acertado!";
    aciertos.textContent++;
    contadorAciertos++;
    if (contadorAciertos > 3) {
      mostrarPopUpGanado();
      reiniciarJuego();
    }
  } else {
    mensaje.textContent = "¡Has fallado!";
    fallos.textContent++;
    contadorFallos++;
    if (contadorFallos > 3) {
      mostrarPopUpPerdido();
      reiniciarJuego();
    }
  }
  mostrarColor();
}

// Qué sucede al reiniciar el juego
function reiniciarJuego() {
  aciertos.textContent = 0;
  fallos.textContent = 0;
  contadorAciertos = 0;
  contadorFallos = 0;
  mensaje.textContent = "";
  mostrarColor();
}

// Pop-up inicial
function mostrarPopUpInicial() {
  document.getElementById("mensajePopUp").textContent = mensajeInicial;
  document.getElementById("popUpInicial").style.display = "flex";
}
window.addEventListener("load", mostrarPopUpInicial);
document.getElementById("botonJuguemos").addEventListener("click", function () {
  document.getElementById("popUpInicial").style.display = "none";
});

// Pop-up ganar o perder
function mostrarPopUpGanado() {
  document.getElementById("popUpGanado").style.display = "flex";
}

function mostrarPopUpPerdido() {
  document.getElementById("popUpPerdido").style.display = "flex";
}

// Pop-up ¿Cómo jugar?
function mostrarPopUpComoJugar() {
  document.getElementById("popUpComoJugar").style.display = "block";
}

function cerrarPopUp(popUpId) {
  document.getElementById(popUpId).style.display = "none";
}

// Botón ¿Cómo jugar?
document
  .getElementById("comoJugar")
  .addEventListener("click", mostrarPopUpComoJugar);
comoJugarButton.addEventListener("click", () => {
  popUpComoJugar.style.display = "flex";
});

// Click para jugar de nuevo tras ganar
document
  .getElementById("popUpGanado")
  .querySelector(".botonDeNuevo")
  .addEventListener("click", function () {
    document.getElementById("popUpGanado").style.display = "none";
    reiniciarJuego();
  });

// Click para jugar de nuevo tras perder
document
  .getElementById("popUpPerdido")
  .querySelector(".botonDeNuevo")
  .addEventListener("click", function () {
    document.getElementById("popUpPerdido").style.display = "none";
    reiniciarJuego();
  });

// Evento click a las cajas de opciones
opciones.forEach((opcion) => {
  opcion.addEventListener("click", comprobarColorSeleccionado);
});

// Evento al botón para jugar de nuevo
nuevoJuego.addEventListener("click", reiniciarJuego);

// Mostramos el primer color al cargar la página
mostrarColor();
