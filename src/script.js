const COLOMBIAN_CAPITALS = [
    "Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena", "Cúcuta", "Bucaramanga", "Pereira",
    "Manizales", "Ibagué", "Santa Marta", "Villavicencio", "Pasto", "Montería", "Armenia", "Neiva",
    "Sincelejo", "Valledupar", "Quibdó", "Riohacha", "Florencia", "San Andrés", "Mocoa", "Yopal",
    "Popayán", "Tunja", "Leticia", "Arauca", "Inírida", "Puerto Carreño", "Mitú", "San José del Guaviare"
];

const BUS_COLORS = ['#0000FF', '#FF0000', '#FFA500', '#006400'];

function showError(message) {
    alert(`Error de Validación:\n${message}`);
}

function startProgram() {
    const numBuses = parseInt(document.getElementById('num-buses').value);
    const numCities = parseInt(document.getElementById('num-cities').value);
    
    if (numBuses > 4 || numCities > 4) {
        showError("El número máximo de buses y ciudades es 4.");
        return;
    }
    
    document.getElementById('start-window').classList.add('hidden');
    document.getElementById('diagram-window').classList.remove('hidden');
    document.getElementById('num-sources').value = numBuses;
    document.getElementById('num-dest').value = numCities;
    generateDiagram();
}

function goBack() {
    document.getElementById('diagram-window').classList.add('hidden');
    document.getElementById('start-window').classList.remove('hidden');
}

function generateDiagram() {
    const svg = document.getElementById('diagram-svg');
    svg.innerHTML = '';
    
    const numSources = parseInt(document.getElementById('num-sources').value);
    const numDest = parseInt(document.getElementById('num-dest').value);
    const cities = COLOMBIAN_CAPITALS.sort(() => 0.5 - Math.random()).slice(0, numDest);

    if (numSources > 4 || numDest > 4) {
        showError("El número máximo de buses y ciudades es 4.");
        return;
    }
    // Ajustes clave -------------------------------------------------
    const ELEMENT_SPACING = 200; // Más espacio entre elementos
    const HORIZONTAL_MARGIN = 150; // Margen lateral aumentado
    const BASE_HEIGHT = 0; // Altura base adicional
    
    // Calcular dimensiones dinámicas
    const maxElements = Math.max(numSources, numDest);
    const diagramWidth = 1200; // Ancho aumentado
    const diagramHeight = (maxElements * ELEMENT_SPACING) + BASE_HEIGHT;
    
    svg.style.minHeight = `${diagramHeight}px`;
    svg.setAttribute('viewBox', `0 0 ${diagramWidth} ${diagramHeight}`);

    // Definir marcador de flecha
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', 'arrow');
    marker.setAttribute('viewBox', '0 0 10 10');
    marker.setAttribute('refX', '9');
    marker.setAttribute('refY', '5');
    marker.setAttribute('markerWidth', '6');
    marker.setAttribute('markerHeight', '6');
    marker.setAttribute('orient', 'auto');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M0,0 L10,5 L0,10 Z');
    path.setAttribute('fill', 'black');
    marker.appendChild(path);
    defs.appendChild(marker);
    svg.appendChild(defs);

    // Posicionar elementos
    const busPositions = Array.from({length: numSources}, (_, i) => ({
        x: HORIZONTAL_MARGIN,
        y: BASE_HEIGHT/2 + i * ELEMENT_SPACING
    }));
    
    const cityPositions = cities.map((_, i) => ({
        x: diagramWidth - HORIZONTAL_MARGIN,
        y: BASE_HEIGHT/2 + i * ELEMENT_SPACING
    }));

    // Dibujar buses
    busPositions.forEach((pos, i) => {
        const bus = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        bus.setAttribute('href', 'img/bus.png'); // Asegurar que esta imagen existe
        bus.setAttribute('x', pos.x - 35); // Centrar icono
        bus.setAttribute('y', pos.y - 30);
        bus.setAttribute('width', '50');
        bus.setAttribute('height', '50');
        svg.appendChild(bus);
        
        // Texto
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', pos.x);
        text.setAttribute('y', pos.y - 40);
        text.textContent = `Bus ${i + 1}`;
        svg.appendChild(text);
    });

    // Dibujar ciudades
    cityPositions.forEach((pos, i) => {
        // Ícono de ciudad
        const city = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        city.setAttribute('href', 'img/cityscape.png'); // Asegurar que esta imagen existe
        city.setAttribute('x', pos.x - 30); // Centrar icono
        city.setAttribute('y', pos.y - 30);
        city.setAttribute('width', '60');
        city.setAttribute('height', '60');
        svg.appendChild(city);

        // Nombre de la ciudad
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', pos.x - 50);
        text.setAttribute('y', pos.y - 45);
        text.textContent = cities[i];
        svg.appendChild(text);
    });

    // Dibujar conexiones
    busPositions.forEach((busPos, busIdx) => {
        cityPositions.forEach((cityPos, cityIdx) => {
            // Línea
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', busPos.x + 50);
            line.setAttribute('y1', busPos.y);
            line.setAttribute('x2', cityPos.x);
            line.setAttribute('y2', cityPos.y);
            line.setAttribute('class', 'line');
            line.setAttribute('stroke', BUS_COLORS[busIdx % BUS_COLORS.length]);
            svg.appendChild(line);

            // Etiquetas
            const midX = (busPos.x + cityPos.x) / 2;
            const midY = (busPos.y + cityPos.y) / 2;

            const xij = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            xij.setAttribute('x', midX - 30);
            xij.setAttribute('y', midY);
            xij.textContent = `x${busIdx + 1}${cityIdx + 1}`;
            svg.appendChild(xij);

            const cij = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            cij.setAttribute('x', midX + 30);
            cij.setAttribute('y', midY);
            cij.textContent = `c${busIdx + 1}${cityIdx + 1}`;
            svg.appendChild(cij);
        });
    });
    
    // Añadir al final:
    svg.setAttribute('viewBox', `0 0 1024 ${numElements}`);
    
}