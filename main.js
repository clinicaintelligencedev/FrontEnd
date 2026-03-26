/* ============================================================
   CLÍNICA INTELLIGENCE — JavaScript Landing Page
   ============================================================ */


/* ============================================================
   1. FLICKERING GRID
   Efecto visual de fondo en el hero: una grilla de cuadraditos
   que parpadean sutilmente. Usa canvas con ImageData directo
   para rendimiento. Se pausa cuando el hero no es visible.
   ============================================================ */
(function() {
  var canvas = document.getElementById('flickerGrid');
  var ctx = canvas.getContext('2d');
  var hero = document.getElementById('hero');
  var squareSize = 4;
  var cellSize = 10;
  var flickerChance = 0.05;
  var maxOpacity = 0.15;
  var cols, rows, squares, total, lastTime = 0;
  var isVisible = true;
  var targetFPS = 10;
  var frameInterval = 1000 / targetFPS;
  var animId = null;
  var imageData, pixels;
  var renderScale = 0.5;

  var rBase = 138, gBase = 155, bBase = 176;
  var alphaLUT = new Uint8Array(256);
  for (var c = 0; c < 256; c++) {
    alphaLUT[c] = ((c / 255) * maxOpacity * 255) | 0;
  }

  function setup() {
    var w = hero.offsetWidth;
    var h = hero.offsetHeight;
    var cw = (w * renderScale) | 0;
    var ch = (h * renderScale) | 0;
    canvas.width = cw;
    canvas.height = ch;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    var scaledCell = (cellSize * renderScale) | 0;
    var scaledSquare = (squareSize * renderScale) | 0;
    cols = Math.floor(cw / scaledCell);
    rows = Math.floor(ch / scaledCell);
    total = cols * rows;
    squares = new Uint8Array(total);
    for (var i = 0; i < total; i++) {
      squares[i] = (Math.random() * 255) | 0;
    }
    imageData = ctx.createImageData(cw, ch);
    pixels = imageData.data;
    for (var p = 0; p < pixels.length; p += 4) {
      pixels[p] = 255; pixels[p+1] = 255; pixels[p+2] = 255; pixels[p+3] = 255;
    }
    canvas._scaledCell = scaledCell;
    canvas._scaledSquare = scaledSquare;
  }

  function paintSquare(col, row, level) {
    var sc = canvas._scaledCell;
    var ss = canvas._scaledSquare;
    var x0 = col * sc;
    var y0 = row * sc;
    var alpha = alphaLUT[level];
    var a255 = 255 - alpha;
    var r = ((rBase * alpha + 255 * a255) / 255) | 0;
    var g = ((gBase * alpha + 255 * a255) / 255) | 0;
    var b = ((bBase * alpha + 255 * a255) / 255) | 0;
    var cw = canvas.width;
    for (var dy = 0; dy < ss; dy++) {
      var rowStart = ((y0 + dy) * cw + x0) * 4;
      for (var dx = 0; dx < ss; dx++) {
        var p = rowStart + dx * 4;
        pixels[p] = r; pixels[p+1] = g; pixels[p+2] = b;
      }
    }
  }

  function drawAll() {
    for (var i = 0; i < cols; i++) {
      for (var j = 0; j < rows; j++) {
        paintSquare(i, j, squares[i * rows + j]);
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }

  function animate(time) {
    if (!isVisible) { animId = null; return; }
    var elapsed = time - lastTime;
    if (elapsed < frameInterval) { animId = requestAnimationFrame(animate); return; }
    lastTime = time;
    var dt = elapsed / 1000;
    var changeCount = (flickerChance * dt * total) | 0;
    for (var k = 0; k < changeCount; k++) {
      var idx = (Math.random() * total) | 0;
      squares[idx] = (Math.random() * 255) | 0;
      paintSquare((idx / rows) | 0, idx % rows, squares[idx]);
    }
    ctx.putImageData(imageData, 0, 0);
    animId = requestAnimationFrame(animate);
  }

  var heroObs = new IntersectionObserver(function(entries) {
    isVisible = entries[0].isIntersecting;
    if (isVisible && !animId) {
      lastTime = performance.now();
      animId = requestAnimationFrame(animate);
    }
  }, { threshold: 0 });
  heroObs.observe(hero);

  setup();
  drawAll();
  animId = requestAnimationFrame(animate);
  window.addEventListener('resize', function() { setup(); drawAll(); });
})();


/* ============================================================
   2. SOMBRA DEL NAV AL SCROLL
   Agrega clase "scrolled" al navbar cuando el usuario baja
   más de 10px. Esa clase activa una sombra definida en CSS.
   ============================================================ */
var nav = document.getElementById('nav');
window.addEventListener('scroll', function() {
  nav.classList.toggle('scrolled', scrollY > 10);
});


/* ============================================================
   3. ANIMACIONES FADE-IN AL SCROLL
   Observa elementos con clase "fade-in". Cuando entran en
   pantalla, agrega clase "visible" que activa la animación CSS.
   Cada elemento se anima una sola vez y deja de observarse.
   ============================================================ */
var obs = new IntersectionObserver(function(entries) {
  entries.forEach(function(e, i) {
    if (e.isIntersecting) {
      setTimeout(function() { e.target.classList.add('visible'); }, i * 80);
      obs.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.fade-in').forEach(function(el) { obs.observe(el); });


/* ============================================================
   4. MENÚ HAMBURGUESA MÓVIL
   Abre/cierra el menú en pantallas pequeñas. Al hacer clic en
   un link del menú, se cierra automáticamente.
   ============================================================ */
var hamburger = document.getElementById('hamburgerBtn');
var mobileMenu = document.getElementById('mobileMenu');
hamburger.addEventListener('click', function() {
  hamburger.classList.toggle('active');
  mobileMenu.classList.toggle('open');
});
mobileMenu.querySelectorAll('a').forEach(function(link) {
  link.addEventListener('click', function() {
    hamburger.classList.remove('active');
    mobileMenu.classList.remove('open');
  });
});


/* ============================================================
   5. FORMULARIO DE CONTACTO
   Envía los datos a Formspree via AJAX (fetch) sin salir de
   la página. Muestra estado en el botón: enviando, éxito o error.
   ============================================================ */
document.getElementById('contactForm').addEventListener('submit', function(e) {
  e.preventDefault();
  var form = this;
  var btn = document.getElementById('submitBtn');
  btn.textContent = 'Enviando...';
  btn.disabled = true;
  fetch(form.action, {
    method: 'POST',
    body: new FormData(form),
    headers: { 'Accept': 'application/json' }
  }).then(function(response) {
    if (response.ok) {
      btn.textContent = '\u2713 Solicitud enviada';
      btn.style.background = '#0F6E56';
      form.reset();
    } else {
      btn.textContent = 'Error \u2014 intenta de nuevo';
      btn.style.background = '#c0392b';
      btn.disabled = false;
    }
  }).catch(function() {
    btn.textContent = 'Error \u2014 intenta de nuevo';
    btn.style.background = '#c0392b';
    btn.disabled = false;
  });
});
