/**
created by Eric Zhou with p5.js, with help from p5.js reference, openprocessing.org, and ChatGPT.

this code generates symmetrical, irregularly spaced grid patterns with various fill modes.
parameters:
- numDivisions: the number of grid divisions (varies randomly between 6 and 20)
- fillMode: grid color fill mode
- solidColor: solid fill mode color
- colorPalette: palette fill mode color array
- t: perlin noise offset

Sources:
- p5.js reference: https://p5js.org/reference/
- perlin noise: https://p5js.org/reference/#/p5/noise
- weaving: https://openprocessing.org/sketch/2310330
- weaving style reference: https://philamuseum.org/collection/object/108223
 */

let quadrantRows = [];
let quadrantCols = [];
let numDivisions;
let filledQuads = [];
let t;
let fillMode;
let solidColor;
let colorPalette;
let bgColor;

let animationProgress;
let isAnimating = false;
let maxGridLines;

function setup() {
  createCanvas(windowWidth, windowHeight);
  noLoop();
  initPattern();
}

function initPattern() {
  t = random(1000);
  bgColor = random(255);
  numDivisions = int(random(6, 21));
  quadrantRows = createNoiseSpacing(height / 2, numDivisions, t);
  quadrantCols = createNoiseSpacing(width / 2, numDivisions, t + 100);
  filledQuads = createFillPattern(quadrantRows.length - 1, quadrantCols.length - 1);
  fillMode = random(['solid', 'gradient', 'palette']);

  if (fillMode === 'solid') {
    solidColor = color(random(255), random(255), random(255));
  }

  if (fillMode === 'palette') {
    colorPalette = randomColorPalette();
  }

  isAnimating = true;
  animationProgress = 0;
  maxGridLines = (quadrantRows.length + quadrantCols.length) * 2;
  loop();
}

function draw() {
  background(bgColor);

  if (isAnimating) {
    let linesToDraw = int(map(animationProgress, 0, 1, 0, maxGridLines));

    drawGridAnimated(0, 0, quadrantRows, quadrantCols, filledQuads, linesToDraw / 4);
    drawGridAnimated(width / 2, 0, quadrantRows, flipArray(quadrantCols, width / 2), flipPatternColumns(filledQuads), linesToDraw / 4);
    drawGridAnimated(0, height / 2, flipArray(quadrantRows, height / 2), quadrantCols, flipPatternRows(filledQuads), linesToDraw / 4);
    drawGridAnimated(width / 2, height / 2, flipArray(quadrantRows, height / 2), flipArray(quadrantCols, width / 2), flipPatternBoth(filledQuads), linesToDraw / 4);

    animationProgress += 0.02;
    if (animationProgress >= 1) {
      animationProgress = 1;
      isAnimating = false;
    }
  } else {
    drawGrid(0, 0, quadrantRows, quadrantCols, filledQuads);
    drawGrid(width / 2, 0, quadrantRows, flipArray(quadrantCols, width / 2), flipPatternColumns(filledQuads));
    drawGrid(0, height / 2, flipArray(quadrantRows, height / 2), quadrantCols, flipPatternRows(filledQuads));
    drawGrid(width / 2, height / 2, flipArray(quadrantRows, height / 2), flipArray(quadrantCols, width / 2), flipPatternBoth(filledQuads));
    noLoop();
  }
}

function drawGridAnimated(offsetX, offsetY, rows, cols, fillPattern, linesToDraw) {
  stroke(255, 127);
  let linesDrawn = 0;

  // DRAW ROWS
  for (let i = 0; i < rows.length; i++) {
    if (linesDrawn >= linesToDraw) break;
    line(offsetX, offsetY + rows[i], offsetX + width / 2, offsetY + rows[i]);
    linesDrawn++;
  }

  // DRAW COLUMNS
  for (let j = 0; j < cols.length; j++) {
    if (linesDrawn >= linesToDraw) break;
    line(offsetX + cols[j], offsetY, offsetX + cols[j], offsetY + height / 2);
    linesDrawn++;
  }

  // FILL QUADS
  if (!isAnimating) {
    fillQuads(offsetX, offsetY, rows, cols, fillPattern);
  }
}

function drawGrid(offsetX, offsetY, rows, cols, fillPattern) {
  stroke(255, 127);

  // DRAW ROWS
  for (let i = 0; i < rows.length; i++) {
    line(offsetX, offsetY + rows[i], offsetX + width / 2, offsetY + rows[i]);
  }

  // DRAW COLUMNS
  for (let j = 0; j < cols.length; j++) {
    line(offsetX + cols[j], offsetY, offsetX + cols[j], offsetY + height / 2);
  }

  // FILL QUADS
  fillQuads(offsetX, offsetY, rows, cols, fillPattern);
}

function fillQuads(offsetX, offsetY, rows, cols, fillPattern) {
  for (let i = 0; i < fillPattern.length; i++) {
    for (let j = 0; j < fillPattern[i].length; j++) {
      if (fillPattern[i][j]) {
        let x = offsetX + cols[j];
        let y = offsetY + rows[i];
        let w = cols[j + 1] - cols[j];
        let h = rows[i + 1] - rows[i];

        if (fillMode === 'solid') {
          fill(solidColor);
          noStroke();
          rect(x, y, w, h);
        } else if (fillMode === 'gradient') {
          drawGradientRect(x, y, w, h);
        } else if (fillMode === 'palette') {
          let paletteColor = random(colorPalette);
          fill(paletteColor);
          noStroke();
          rect(x, y, w, h);
        }
      }
    }
  }
}

function createNoiseSpacing(maxSize, divisions, offset) {
  let positions = [0];
  let noiseScale = 0.5;
  let total = 0;
  let spacings = [];
  for (let i = 0; i < divisions; i++) {
    let n = noise(i * noiseScale + offset);
    spacings.push(n);
    total += n;
  }
  let normalizedSpacings = spacings.map(s => s * maxSize / total);

  let pos = 0;
  for (let i = 0; i < divisions; i++) {
    pos += normalizedSpacings[i];
    positions.push(pos);
  }

  return positions;
}

function createFillPattern(rows, cols) {
  let pattern = [];
  for (let i = 0; i < rows; i++) {
    let row = [];
    for (let j = 0; j < cols; j++) {
      row.push(random() < 0.5);
    }
    pattern.push(row);
  }
  return pattern;
}

function flipPatternColumns(pattern) {
  return pattern.map(row => row.slice().reverse());
}

function flipPatternRows(pattern) {
  return pattern.slice().reverse();
}

function flipPatternBoth(pattern) {
  return pattern.slice().reverse().map(row => row.slice().reverse());
}

function flipArray(arr, maxSize) {
  let flipped = arr.map(val => maxSize - val).reverse();
  return flipped;
}

function drawGradientRect(x, y, w, h) {
  noFill();
  let c1 = color(random(255), random(255), random(255));
  let c2 = color(random(255), random(255), random(255));
  for (let i = 0; i <= h; i++) {
    let inter = map(i, 0, h, 0, 1);
    let c = lerpColor(c1, c2, inter);
    stroke(c);
    line(x, y + i, x + w, y + i);
  }
}

function randomColorPalette() {
  let palettes = [
    ['#FF5733', '#FFBD33', '#DBFF33', '#75FF33', '#33FF57'],
    ['#3357FF', '#33FFBD', '#33DBFF', '#3375FF', '#5733FF'],
    ['#FF33A8', '#FF33F6', '#D233FF', '#7533FF', '#333FFF'],
    ['#FFB733', '#FF8D33', '#FF5733', '#FF3333', '#FF3333'],
    ['#2ECC71', '#27AE60', '#229954', '#1E8449', '#196F3D'],
    ['#E74C3C', '#C0392B', '#A93226', '#922B21', '#7B241C'],
    ['#3498DB', '#2980B9', '#2471A3', '#1F618D', '#1A5276'],
    ['#F1C40F', '#F39C12', '#D68910', '#B9770E', '#9C640C'],
    ['#9B59B6', '#8E44AD', '#7D3C98', '#6C3483', '#5B2C6F'],
    ['#1ABC9C', '#17A589', '#148F77', '#117A65', '#0E6251']
  ];

  let palette = random(palettes);
  let colorObjects = palette.map(hex => color(hex));
  return colorObjects;
}

function keyPressed() {
  if (key === ' ') {
    initPattern();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initPattern();
}
