# Lentes DISC

Plataforma web para entender el modelo DISC y hacer un test rápido de tendencia (12 tarjetas) con ficha técnica descargable en PDF.

- **Contenido:** Patricia Fuel — *Negociar para servir* (bloque DISC, incluidas las slides ocultas 13–16 y 21).
- **Test:** instrumento "Determinación del temperamento – Tendencias DISC" (12 filas, calificación 4-3-2-1, total 120, línea intermedia en 30).
- **Plataforma:** Distilled Innovation.

Sitio estático (HTML/CSS/JS sin build). Las respuestas se quedan en el navegador de cada persona; no se envían a ningún servidor.

## Estructura
- `index.html` — página (hero, presentación embebida, test, resultado)
- `js/content.js` — todos los textos de la presentación y del test (editar aquí)
- `js/app.js` — lógica del carrusel, test, cálculo, ficha y PDF
- `css/styles.css` — estilos
- `assets/` — imágenes, logos y librerías (html2canvas, jsPDF)

## Reglas de cálculo
- Cada tarjeta: la palabra que más te describe = 4, la que menos = 1, sin repetir.
- Totales por columna D/I/S/C (suman 120).
- **Predominantes:** letras con total > 30.
- **Dominante:** la letra con el total más alto (si hay empate, se muestran ambas). Si todas quedan en 30: perfil equilibrado.
