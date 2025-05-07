const canvas = document.getElementById("golCanvas");    // Holt das Canvas Element per ID aus dem HTML-Dokument
const ctx = canvas.getContext("2d");                    // Definiert den 2D-Kontext des Canvas
const cellSize = 2;                                     // Größe jeder Zelle
const rows = canvas.height / cellSize;
const cols = canvas.width / cellSize;                   // Berechnet die Anzahl der Zeilen und Spalten basierend auf der Canvas-Größe
let grid = createGrid();                                // Deklariere das Array global und initialisiere es mit createGrid()
let running = false;                                    // Status des Spiels (läuft oder nicht)
let generationcount = 0;                                // Zähler für die Generationen
let livingcount = 0;                                    // Zähler für lebende Zellen
let eingabe = 0.3;                                      // Wahrscheinlichkeit, dass eine Zelle lebendig ist (30%)
let history = [];                                       // Array zur Speicherung der Historie der Generationen


//Erstellt ein zweidimensionales Array mit Zeilen 
//und Spalten. Alle Zellen sind am Anfang tot (0).
function createGrid() {
    let grid = [];                                  // Erstelle ein leeres Array
    for (let row = 0; row < rows; row++) {          // Liest das Array zeilenweise durch
        grid[row] = [];                             // Erstelle eine neue Zeile im Array    
        for (let col = 0; col < cols; col++) {      // Schleife über die Spalten
            grid[row][col] = 0;                     // 0 = tot
        }
    }
    return grid;                                    // Rückgabe des Arrays
}

// Initialisiert das Gitter mit zufälligen Werten (1 = lebendig, 0 = tot)
function randomizeGrid() {
    const eingabe = parseFloat(document.getElementById("eingabe").value) || 0; // Holt den Wert aus dem Input-Feld und konvertiert ihn zu einer Zahl
    for (let i = 0; i < rows; i++) {                        // Schleife über die Zeilen
        for (let j = 0; j < cols; j++) {                    // Schleife über die Spalten
            grid[i][j] = Math.random() < eingabe ? 1 : 0;   // Wahrscheinlichkeit basierend auf eingabe
        }
    }
    livingcount = countLivingCells(); // Zähle lebende Zellen nach dem Randomisieren
    document.getElementById("livinglabel").innerText = livingcount; // Label aktualisieren
}

// Zeichnet das Gitter auf das Canvas basierend auf dem Array "grid".
// Löscht das Canvas vor dem Zeichnen und füllt lebendige Zellen (1) mit schwarzer Farbe.
// Lebendige Zellen werden als schwarze Rechtecke gezeichnet.
function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);                               // Löscht das Canvas
    for (let i = 0; i < rows; i++) {                                                // Schleife über die Zeilen
        for (let j = 0; j < cols; j++) {                                            // Schleife über die Spalten
            if (grid[i][j] === 1) {                                                 // Überprüfe, ob die Zelle lebendig ist
                ctx.fillStyle = "black";                                            // Setze die Füllfarbe auf schwarz
                ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);       // Zeichne ein schwarzes Rechteck für die lebendige Zelle
            }
        }
    }
}

// Funktion zur Berechnung der Anzahl lebender Nachbarn
function getNeighborCount(cellRow, cellCol) {
    let livingNeighbors = 0; // Zähler für lebende Nachbarn deklariert
    for (let rowOffset = -1; rowOffset <= 1; rowOffset++) { // Schleife über die Nachbarn in der Umgebung
        for (let colOffset = -1; colOffset <= 1; colOffset++) {
            if (rowOffset === 0 && colOffset === 0) continue; // Überspringe die Zelle selbst 
            let neighborRow = cellRow + rowOffset; // Berechne die Nachbarposition in Zeilenrichtung
            let neighborCol = cellCol + colOffset; // Berechne die Nachbarposition in Spaltenrichtung
            if (neighborRow >= 0 && neighborRow < rows && neighborCol >= 0 && neighborCol < cols) { // Überprüfe, ob die Nachbarposition im Gitter liegt
                livingNeighbors += grid[neighborRow][neighborCol]; // Zähle die lebenden Nachbarn
            }
        }
    }
    return livingNeighbors; // Rückgabe der Anzahl lebender Nachbarn

}

function countLivingCells() {
    let count = 0;
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (grid[i][j] === 1) {
                count++;
            }
        }
    }
    return count;
}

function updateGrid() {
    if (!grid) return; // Ensure grid is defined before proceeding
    history.push(JSON.parse(JSON.stringify(grid))); // Save the current grid state to history
    let newGrid = createGrid(); // Erstellt ein neues Gitter für die nächste Generation
    previousGrid = JSON.parse(JSON.stringify(grid));

    for (let i = 0; i < rows; i++) { // Schleife über die Zeilen
        for (let j = 0; j < cols; j++) { // Schleife über die Spalten    
            const neighbors = getNeighborCount(i, j); // Berechne die Anzahl lebender Nachbarn für die Zelle (i, j)
            if (grid[i][j] === 1) { // Wenn die Zelle lebendig ist (1)
                newGrid[i][j] = neighbors === 2 || neighbors === 3 ? 1 : 0; // Lebende Zelle bleibt lebendig, wenn sie 2 oder 3 Nachbarn hat
            } else {
                newGrid[i][j] = neighbors === 3 ? 1 : 0; // Tote Zelle wird lebendig, wenn sie genau 3 Nachbarn hat
            }
        }
    }
    grid = newGrid;
}

function gameRun() {
    if (!running) return; // Wenn das Spiel nicht läuft, beende die Funktion
    drawGrid(); // Zeichne das Gitter auf dem Canvas
    updateGrid(); // Aktualisiere das Gitter für die nächste Generation
    livingcount = countLivingCells();  // <--- HIER wird die Anzahl lebender Zellen gezählt
    animationFrameId = requestAnimationFrame(gameRun);
    generationcount++; // Erhöhe den Generationen-Zähler
    document.getElementById("genlabel").innerText = generationcount; // Setze den Text des Labels auf die aktuelle Generation
    document.getElementById("livinglabel").innerText = livingcount; // Setze den Text des Labels auf die aktuelle Generation
}

function runOnce() {
    if  (!running) { // Wenn das Spiel nicht läuft, beende die Funktion
    drawGrid();                                                                         // Draw the grid on the canvas
    updateGrid();   
    livingcount = countLivingCells();                          // Count the number of living cells
    generationcount++;                                                                  // Increment the generation count        
    document.getElementById("genlabel").innerText = "Generation: " + generationcount; 
    }  // Update the generation label

    if (running) { // Wenn das Spiel läuft, beende die Funktion
        return;
    }
}

let previousGrid = createGrid();                                                // Speichert den Zustand der vorherigen Generation

// Speichert den aktuellen Zustand vor dem Update
function stepBack() {
    if (history.length === 0) return;
    grid = history.pop();
    drawGrid();
    generationcount = Math.max(0, generationcount - 1);
    livingcount = countLivingCells();

    document.getElementById("genlabel").innerText = generationcount;
    document.getElementById("livinglabel").innerText = livingcount;
}


document.getElementById("startButton").addEventListener("click", () => { // Fügt einen Klick-Event-Listener zum Start-Button hinzu
    if (!running) { // Nur wenn das Spiel nicht läuft
        grid = createGrid();
        randomizeGrid();
        drawGrid();
        generationcount = 0; // Setze den Generationen-Zähler zurück
        running = true; // Setze den Status auf "laufend"
        gameRun(); // Starte die Spielschleife
    }
});

document.getElementById("stopButton").addEventListener("click", () => {
    if (running) { // Wenn das Spiel läuft, stoppe es
        running = false; // Setze den Status auf "nicht laufend"
        cancelAnimationFrame(animationFrameId); // Stoppe die Animationsschleife
    }
});

document.getElementById("resetButton").addEventListener("click", () => {
    running = false;
    cancelAnimationFrame(animationFrameId);
    grid = createGrid();
    randomizeGrid();
    drawGrid();
    generationcount = 0; // Setze den Generationen-Zähler zurück
    document.getElementById("genlabel").innerText = generationcount; // Setze den Text des Labels auf die aktuelle Generation
});

document.getElementById("continueButton").addEventListener("click", () => { // Fügt einen Klick-Event-Listener zum Start-Button hinzu
    if (!running) {
        running = true;
        gameRun(); // Starte die Spielschleife
    }
});

document.getElementById("clearGridButton").addEventListener("click", () => {
    running = false; // Stop the game
    grid = createGrid(); // Clear the grid (all cells set to 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas (make it white)   
    generationcount = 0; // Setze den Generationen-Zähler zurück
    livingcount = 0; // Setze den Zähler für lebende Zellen zurück
    document.getElementById("genlabel").innerText = generationcount; // Setze den Text des Labels auf die aktuelle Generation
    document.getElementById("livinglabel").innerText = livingcount; // Setze den Text des Labels auf die aktuelle Generation
});

document.getElementById("plusButton").addEventListener("click", () => {
    runOnce(); // Run the game once (update the grid and draw it)

});

canvas.addEventListener("click", function (event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);

    if (row >= 0 && row < rows && col >= 0 && col < cols) {
        grid[row][col] = grid[row][col] === 1 ? 0 : 1;
        drawGrid();
        livingcount = countLivingCells(); // Zähle die lebenden Zellen neu
        document.getElementById("livinglabel").innerText = livingcount; // Label aktualisieren
    }
});

document.getElementById("minusButton").addEventListener("click", () => {
    stepBack(); // Gehe einen Schritt zurück in der Historie
});

document.getElementById("genlabel").innerText = generationcount; // Setze den Text des Labels auf die aktuelle Generation
document.getElementById("livinglabel").innerText = livingcount; // Setze den Text des Labels auf die aktuelle Generation

randomizeGrid();
drawGrid();

