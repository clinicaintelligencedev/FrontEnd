#!/bin/bash

# =============================================================
# BUILD SCRIPT — Clínica Intelligence Landing Page
# =============================================================
# Este script toma el archivo fuente main.js y lo convierte
# en main.min.js: una versión comprimida e ilegible que es la
# que sube a GitHub y ve el mundo.
#
# Qué hace Terser con el código:
#   --compress : elimina código muerto, simplifica expresiones
#   --mangle   : renombra variables a letras cortas (a, b, c...)
#   --toplevel : también renombra variables del scope principal
#                del archivo (nav, obs, hamburger, etc.)
#
# Cuándo correr este script:
#   Cada vez que modifiques main.js, antes de hacer git commit.
#   Comando: bash build.sh
# =============================================================

echo "Minificando main.js..."

npx terser main.js \
  --compress \
  --mangle \
  --toplevel \
  -o main.min.js

echo "Listo. Archivo generado: main.min.js"
echo "Ahora podés hacer git add main.min.js y git commit."
