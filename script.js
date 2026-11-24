// Definición del quiz sobre maquillaje en formato JSON[cite: 8]
const bancoQuizJson = JSON.stringify([
  {
    id: 1,
    pregunta:
      "¿Cuál es la función principal de una prebase (primer) antes de aplicar la base de maquillaje?",
    opciones: [
      "Fijar las pestañas postizas",
      "Suavizar la textura de la piel y ayudar a que el maquillaje dure más",
      "Retirar el exceso de rubor con agua",
      "Dar color oscuro a las cejas",
    ],
    respuestaCorrecta: 1,
  },
  {
    id: 2,
    pregunta:
      "¿Qué subtono de piel suele armonizar mejor con joyas plateadas y tonos fríos o lavanda?",
    opciones: [
      "Subtono frío",
      "Subtono dorado intenso",
      "Subtono cobrizo",
      "Subtono bronceado artificial",
    ],
    respuestaCorrecta: 0,
  },
  {
    id: 3,
    pregunta:
      "¿Qué brocha o herramienta se usa comúnmente para difuminar sombras en la cuenca del ojo?",
    opciones: [
      "Brocha de abanico para iluminador",
      "Brocha biselada para delineador en gel",
      "Brocha suelta de difuminar (blending brush)",
      "Rizador de pestañas",
    ],
    respuestaCorrecta: 2,
  },
  {
    id: 4,
    pregunta:
      "¿Para qué sirve principalmente el polvo translúcido suelto o compacto al finalizar el maquillaje?",
    opciones: [
      "Sellar las fórmulas en crema y controlar el brillo",
      "Rizar las pestañas naturales",
      "Hidratar los labios resecos",
      "Aclarar el tono del delineador negro",
    ],
    respuestaCorrecta: 0,
  },
  {
    id: 5,
    pregunta:
      "¿En qué zonas del rostro se suele aplicar iluminador para aportar puntos de luz?",
    opciones: [
      "En el centro de la frente y el mentón únicamente",
      "En la parte alta de los pómulos, el tabique nasal y el arco de cupido",
      "Debajo de la mandíbula para oscurecer",
      "En toda la ojera oscura sin corrector",
    ],
    respuestaCorrecta: 1,
  },
]);

const preguntas = JSON.parse(bancoQuizJson);
const TIEMPO_POR_PREGUNTA = 60; // 1 minuto por pregunta[cite: 8]

// Estado de la aplicación
const estadoQuiz = {
  indiceActual: 0,
  puntaje: 0,
  respondida: false,
  tiempoRestante: TIEMPO_POR_PREGUNTA,
  idTemporizador: null,
  historial: [],
};

// Referencias del DOM
const pantallaInicio = document.getElementById("pantalla-inicio");
const pantallaPregunta = document.getElementById("pantalla-pregunta");
const pantallaResultados = document.getElementById("pantalla-resultados");

const botonIniciar = document.getElementById("boton-iniciar");
const botonSiguiente = document.getElementById("boton-siguiente");
const botonReiniciar = document.getElementById("boton-reiniciar");

const indicadorPregunta = document.getElementById("indicador-pregunta");
const temporizadorBadge = document.getElementById("temporizador-pregunta");
const puntajeActualEl = document.getElementById("puntaje-actual");
const textoPregunta = document.getElementById("texto-pregunta");
const contenedorOpciones = document.getElementById("contenedor-opciones");
const retroalimentacionEl = document.getElementById("retroalimentacion");

const resumenPuntajeEl = document.getElementById("resumen-puntaje");
const listaResumenEl = document.getElementById("lista-resumen");

// Cambia entre pantalla de inicio, pregunta y resultados
function mostrarPantalla(pantallaActiva) {
  [pantallaInicio, pantallaPregunta, pantallaResultados].forEach((pantalla) => {
    pantalla.classList.toggle("activa", pantalla === pantallaActiva);
  });
}

// Detiene el temporizador si está corriendo
function limpiarTemporizador() {
  if (estadoQuiz.idTemporizador !== null) {
    clearInterval(estadoQuiz.idTemporizador);
    estadoQuiz.idTemporizador = null;
  }
}

// Actualiza el marcador de puntaje en pantalla
function actualizarMarcadorPuntaje() {
  puntajeActualEl.textContent = `Puntos: ${estadoQuiz.puntaje}`;
}

// Actualiza la etiqueta del temporizador (60s -> 0s)
function actualizarVisualTemporizador() {
  temporizadorBadge.textContent = `Tiempo: ${estadoQuiz.tiempoRestante}s`;
  temporizadorBadge.classList.toggle(
    "urgente",
    estadoQuiz.tiempoRestante <= 10,
  );
}

// Si el tiempo llega a 0 sin responder, resta 1 punto y pasa a la siguiente pregunta[cite: 8]
function manejarTiempoAgotado() {
  if (estadoQuiz.respondida) return;

  estadoQuiz.respondida = true;
  estadoQuiz.puntaje -= 1;
  actualizarMarcadorPuntaje();

  const preguntaActual = preguntas[estadoQuiz.indiceActual];
  const botonesOpcion = contenedorOpciones.querySelectorAll(".boton-opcion");

  botonesOpcion.forEach((btn, idx) => {
    btn.disabled = true;
    if (idx === preguntaActual.respuestaCorrecta) {
      btn.classList.add("correcta");
    }
  });

  retroalimentacionEl.textContent = `¡Se acabó el tiempo! Se restó 1 punto. La respuesta correcta era: "${preguntaActual.opciones[preguntaActual.respuestaCorrecta]}".`;
  retroalimentacionEl.className = "retroalimentacion error";

  estadoQuiz.historial.push({
    pregunta: preguntaActual.pregunta,
    respuestaUsuario: "Sin responder (tiempo agotado)",
    respuestaCorrecta:
      preguntaActual.opciones[preguntaActual.respuestaCorrecta],
    esCorrecta: false,
    sinTiempo: true,
  });

  setTimeout(() => {
    avanzarPregunta();
  }, 1500);
}

// Inicia la cuenta regresiva de 60 segundos para la pregunta actual[cite: 8]
function iniciarTemporizadorPregunta() {
  limpiarTemporizador();
  estadoQuiz.tiempoRestante = TIEMPO_POR_PREGUNTA;
  actualizarVisualTemporizador();

  estadoQuiz.idTemporizador = setInterval(() => {
    estadoQuiz.tiempoRestante -= 1;
    actualizarVisualTemporizador();

    if (estadoQuiz.tiempoRestante <= 0) {
      limpiarTemporizador();
      manejarTiempoAgotado();
    }
  }, 1000);
}

// Evalúa la opción elegida por el usuario y da retroalimentación inmediata[cite: 8]
function seleccionarRespuesta(indiceElegido, botonElegido) {
  if (estadoQuiz.respondida) return;

  estadoQuiz.respondida = true;
  limpiarTemporizador();

  const preguntaActual = preguntas[estadoQuiz.indiceActual];
  const esCorrecta = indiceElegido === preguntaActual.respuestaCorrecta;
  const botonesOpcion = contenedorOpciones.querySelectorAll(".boton-opcion");

  botonesOpcion.forEach((btn, idx) => {
    btn.disabled = true;
    if (idx === preguntaActual.respuestaCorrecta) {
      btn.classList.add("correcta");
    }
  });

  if (esCorrecta) {
    estadoQuiz.puntaje += 1;
    actualizarMarcadorPuntaje();
    retroalimentacionEl.textContent = "¡Correcto! Sumaste 1 punto.";
    retroalimentacionEl.className = "retroalimentacion exito";
  } else {
    botonElegido.classList.add("incorrecta");
    const opcionCorrectaTexto =
      preguntaActual.opciones[preguntaActual.respuestaCorrecta];
    retroalimentacionEl.textContent = `Incorrecto. La opción correcta era: "${opcionCorrectaTexto}".`;
    retroalimentacionEl.className = "retroalimentacion error";
  }

  estadoQuiz.historial.push({
    pregunta: preguntaActual.pregunta,
    respuestaUsuario: preguntaActual.opciones[indiceElegido],
    respuestaCorrecta:
      preguntaActual.opciones[preguntaActual.respuestaCorrecta],
    esCorrecta,
    sinTiempo: false,
  });

  botonSiguiente.disabled = false;
}

// Renderiza la pregunta actual en su tarjeta[cite: 8]
function renderizarPregunta() {
  const preguntaActual = preguntas[estadoQuiz.indiceActual];
  estadoQuiz.respondida = false;
  botonSiguiente.disabled = true;

  indicadorPregunta.textContent = `Pregunta ${estadoQuiz.indiceActual + 1} de ${preguntas.length}`;
  actualizarMarcadorPuntaje();
  textoPregunta.textContent = preguntaActual.pregunta;
  retroalimentacionEl.textContent = "";
  retroalimentacionEl.className = "retroalimentacion";
  contenedorOpciones.innerHTML = "";

  preguntaActual.opciones.forEach((opcionTexto, indice) => {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "boton-opcion";
    boton.textContent = opcionTexto;
    boton.addEventListener("click", () => seleccionarRespuesta(indice, boton));
    contenedorOpciones.appendChild(boton);
  });

  iniciarTemporizadorPregunta();
}

// Muestra la pantalla final con puntaje acumulado y detalle de cada pregunta[cite: 8]
function mostrarResultadosFinales() {
  limpiarTemporizador();
  mostrarPantalla(pantallaResultados);

  const aciertos = estadoQuiz.historial.filter(
    (item) => item.esCorrecta,
  ).length;
  resumenPuntajeEl.textContent = `Puntaje final: ${estadoQuiz.puntaje} pts · Aciertos: ${aciertos} de ${preguntas.length}`;

  listaResumenEl.innerHTML = "";

  estadoQuiz.historial.forEach((item, idx) => {
    const tarjetaResumen = document.createElement("div");
    tarjetaResumen.className = `item-resumen ${item.esCorrecta ? "acierto" : "fallo"}`;

    const titulo = document.createElement("strong");
    titulo.textContent = `${idx + 1}. ${item.pregunta}`;

    const respuestaUser = document.createElement("p");
    respuestaUser.textContent = `Tu respuesta: ${item.respuestaUsuario}`;

    const respuestaCorr = document.createElement("p");
    respuestaCorr.textContent = `Respuesta correcta: ${item.respuestaCorrecta}`;

    tarjetaResumen.appendChild(titulo);
    tarjetaResumen.appendChild(respuestaUser);
    tarjetaResumen.appendChild(respuestaCorr);
    listaResumenEl.appendChild(tarjetaResumen);
  });
}

// Avanza a la siguiente pregunta o cierra el quiz
function avanzarPregunta() {
  limpiarTemporizador();
  estadoQuiz.indiceActual += 1;

  if (estadoQuiz.indiceActual < preguntas.length) {
    renderizarPregunta();
  } else {
    mostrarResultadosFinales();
  }
}

// Reinicia todo el estado para jugar de nuevo
function iniciarQuiz() {
  limpiarTemporizador();
  estadoQuiz.indiceActual = 0;
  estadoQuiz.puntaje = 0;
  estadoQuiz.respondida = false;
  estadoQuiz.tiempoRestante = TIEMPO_POR_PREGUNTA;
  estadoQuiz.historial = [];

  mostrarPantalla(pantallaPregunta);
  renderizarPregunta();
}

botonIniciar.addEventListener("click", iniciarQuiz);
botonSiguiente.addEventListener("click", avanzarPregunta);
botonReiniciar.addEventListener("click", iniciarQuiz);
