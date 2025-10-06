const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// Cargar las imágenes
const imgJugador = new Image();
imgJugador.src = "img/jugador.png";
const imgCocodrilo = new Image();
imgCocodrilo.src = "img/cocodrilo.png";
const imgMosca = new Image();
imgMosca.src = "img/mosca.png";
const imgFondo = new Image();
imgFondo.src = "img/fondo.png";

// Posición inicial del jugador
const player = {
  x: 80,
  y: 380,
  w: 60,
  h: 60,
  vx: 0,
  vy: 0,
  onGround: true
};

let keys = {};
let enemigos = [];
let amigos = [];
let score = 0;
let vidas = 3;
let nivelActual = 1;
let tiempoNivel = 0;
let ultimoCambioNivel = 0;

// Variable para controlar si el juego está en marcha
let juegoEnMarcha = false;

function crearEnemigo() {
  enemigos.push({
    x: 800,
    y: Math.random() * 200 + 200,
    w: 40,
    h: 40,
    vx: Math.random() * 3 + 2
  });
}

function crearAmigos() {
  amigos.push({
    x: 800,
    y: Math.random() * 200 + 200,
    w: 40,
    h: 40,
    vx: Math.random() * 3 + 2
  });
}

document.addEventListener("keydown", (e) => keys[e.key] = true);
document.addEventListener("keyup", (e) => keys[e.key] = false);
document.getElementById('start-game').addEventListener('click', () => {
  document.getElementById('reglas').style.display = 'none';
  // Código para iniciar el juego
});

function update() {
  // Función para mover el personaje
  if (keys["ArrowLeft"]) {
    player.vx = -4;
    if (player.x < 0) {
      player.x = 0;
      player.vx = 0; // Detener el movimiento
    }
  } else if (keys["ArrowRight"]) {
    player.vx = 4;
    if (player.x + player.w > canvas.width) {
      player.x = canvas.width - player.w;
      player.vx = 0; // Detener el movimiento
    }
  } else {
    player.vx = 0;
  }
  if (keys["ArrowUp"] && player.onGround) {
    player.vy = -10;
    player.onGround = false;
  }
  player.x += player.vx;
  player.y += player.vy;
  player.vy += 0.5; // Salta personaje
  if (player.y + player.h > canvas.height) {
    player.y = canvas.height - player.h;
    player.vy = 0;
    player.onGround = true;
  }
  if (player.y < 0) {
    player.y = 0;
    player.vy = 0;
  }
  // Crear los enemigos
  // Muevo el enemigo
  enemigos.forEach(enemigo => enemigo.x -= enemigo.vx)
  // Elimino al enemigo que llego al borde
  enemigos = enemigos.filter(enemigo => enemigo.x + enemigo.w > 0)
  // Muevo el amigo
  amigos.forEach(amigo => amigo.x -= amigo.vx)
  // Elimino al amigo en lo que llego al borde
  amigos = amigos.filter(amigo => amigo.x + amigo.w > 0)
  const ahora = new Date().getTime();
  if (ahora - ultimoCambioNivel >= 30000) {
    nivelActual++;
    ultimoCambioNivel = ahora;
  }
  if (nivelActual === 1) {
    if (Math.random() < 0.01) {
      crearEnemigo();
    }
    if (Math.random() < 0.005) {
      crearAmigos();
    }
  } else if (nivelActual === 2) {
    if (Math.random() < 0.02) {
      crearEnemigo();
    }
    if (Math.random() < 0.01) {
      crearAmigos();
    }
    enemigos.forEach(enemigo => enemigo.vx += 0.1);
  } else if (nivelActual === 3) {
    if (Math.random() < 0.05) {
      crearEnemigo();
    }
    enemigos.forEach(enemigo => enemigo.vx += 0.2);
    amigos = []; // Solo enemigos en este nivel
  } else if (nivelActual >= 4) {
    juegoEnMarcha = false;
    ctx.font = "32px arial";
    ctx.fillStyle = "green";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("FELICIDADES, HAS GANADO!", canvas.width / 2, canvas.height / 2);
  }
  enemigos.forEach((enemigo, indice) => {
    if (colision(player, enemigo)) {
      vidas--;
      enemigos.splice(indice, 1)
    }
  });
  amigos.forEach((amigo, indice) => {
    if (colision(player, amigo)) {
      vidas++;
      amigos.splice(indice, 1)
    }
  });

  function colision(player, item) {
    return player.x < item.x + item.w &&
      player.x + player.w > item.x &&
      player.y < item.y + item.h &&
      player.y + player.h > item.y
  }
}

function draw() {
  ctx.clearRect(0, 0, 800, 480);
  if (imgFondo.complete) {
    ctx.drawImage(imgFondo, 0, 0, 800, 480);
  }
  if (imgJugador.complete) {
    ctx.drawImage(imgJugador, player.x, player.y, player.w, player.h);
  }
  enemigos.forEach(enemigo => {
    if (imgCocodrilo.complete) {
      ctx.drawImage(imgCocodrilo, enemigo.x, enemigo.y, enemigo.w, enemigo.h);
    }
  });
  amigos.forEach(amigo => {
    if (imgMosca.complete) {
      ctx.drawImage(imgMosca, amigo.x, amigo.y, amigo.w, amigo.h);
    }
  });

  // Marcador
  ctx.fillStyle = "green";
  ctx.font = "16px arial";
  ctx.fillText("Puntos: " + score, 20, 30);
  ctx.fillText("vidas ❤: " + vidas, 20, 50);
  ctx.fillText("Nivel: " + nivelActual, 20, 70);
}

function loop() {
  if (juegoEnMarcha) {
    update();
    draw();
    requestAnimationFrame(loop);
    // Detener el juego cuando se pierdan las 3 vidas
    if (vidas <= 0) {
      juegoEnMarcha = false;
      ctx.font = "32px arial";
      ctx.fillStyle = "red";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("PERDISTE", canvas.width / 2, canvas.height / 2);
      ctx.font = "24px arial";
      ctx.fillText("Presiona el botón para jugar de nuevo", canvas.width / 2, canvas.height / 2 + 50);
      document.getElementById('reiniciar-juego').style.display = 'block';
    }
    if (nivelActual >= 4) {
      juegoEnMarcha = false;
      ctx.font = "32px arial";
      ctx.fillStyle = "green";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("FELICIDADES, HAS GANADO!", canvas.width / 2, canvas.height / 2);
      ctx.font = "24px arial";
      ctx.fillText("Presiona el botón para jugar de nuevo", canvas.width / 2, canvas.height / 2 + 50);
      document.getElementById('reiniciar-juego').style.display = 'block';
    }
  }
}

// Agregar evento de clic al botón de reiniciar juego
document.getElementById('reiniciar-juego').addEventListener('click', () => {
  // Reiniciar variables
  nivelActual = 1;
  vidas = 3;
  score = 0;
  enemigos = [];
  amigos = [];
  player.x = 80;
  player.y = 380;
  ultimoCambioNivel = new Date().getTime();
  juegoEnMarcha = true;
  loop();
  document.getElementById('reiniciar-juego').style.display = 'none';
});

// Iniciar el juego cuando se presiona el botón
document.getElementById('start-game').addEventListener('click', () => {
  juegoEnMarcha = true;
  ultimoCambioNivel = new Date().getTime();
  loop();
  document.getElementById('start-game').style.display = 'none';
});