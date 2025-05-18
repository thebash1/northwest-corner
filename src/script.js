const capitals = [
    "Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena", "Cúcuta", "Bucaramanga", "Pereira",
    "Manizales", "Ibagué", "Santa Marta", "Villavicencio", "Pasto", "Montería", "Armenia", "Neiva",
    "Sincelejo", "Valledupar", "Quibdó", "Riohacha", "Florencia", "San Andrés", "Mocoa", "Yopal",
    "Popayán", "Tunja", "Leticia", "Arauca", "Inírida", "Puerto Carreño", "Mitú", "San José del Guaviare"
];

const busColors = ['#0000FF', '#FF0000', '#FFA500', '#006400'];
let busesAndCities = {};
let functionObj = [];
let restricOff = [];
let restricDem = [];

function showError(message) {
    alert(`Error de validación: ${message}`);
}

function clearInput(idBus, idCity) {
    document.getElementById(idBus).value = '1';
    document.getElementById(idCity).value = '1';
}

function startProgram() {
    const numBuses = parseInt(document.getElementById('num-buses').value);
    const numCities = parseInt(document.getElementById('num-cities').value);
    
    if (numBuses > 4 || numCities > 4) {
        showError("como máximo 4 buses y 4 ciudades");
        clearInput('num-buses', 'num-cities');
        return;
    }
    if (numBuses < 1 || numCities < 1) {
        showError("debe haber al menos 1 bus y 1 ciudad");
        clearInput('num-buses', 'num-cities');
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
    
    const numSources = parseInt(document.getElementById('num-sources').value);
    const numDest = parseInt(document.getElementById('num-dest').value);
    const cities = capitals.sort(() => 0.5 - Math.random()).slice(0, numDest);
    
    if (numSources > 4 || numDest > 4) {
        showError("como máximo 4 buses y 4 ciudades");
        clearInput('num-sources', 'num-dest');
        return;
    }
    if (numSources < 1 || numDest < 1) {
        showError("debe haber al menos 1 bus y 1 ciudad");
        clearInput('num-sources', 'num-dest');
        return;
    }

    const svg = document.getElementById('diagram-svg');
    svg.innerHTML = '';

    // Ajustes clave -------------------------------------------------
    const element_spacing = 300; // Más espacio entre elementos
    const horizontalMargin = 150; // Margen lateral aumentado
    const baseHeight = 50; // Altura base adicional
    
    // Calcular dimensiones dinámicas
    const maxElements = Math.max(numSources, numDest);
    const diagramWidth = 1200; // Ancho aumentado
    const diagramHeight = (maxElements * element_spacing) + baseHeight;
    
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
        x: horizontalMargin,
        y: baseHeight/2 + i * element_spacing
    }));
    
    const cityPositions = cities.map((_, i) => ({
        x: diagramWidth - horizontalMargin,
        y: baseHeight/2 + i * element_spacing
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

    const labelOffset = 40; // Distancia desde la línea
    const angleOffset = 25; // Ángulo para evitar colisiones

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
            line.setAttribute('stroke', busColors[busIdx % busColors.length]);
            svg.appendChild(line);

            // calcular dirección de la línea
            const dx = cityPos.x - busPos.x;
            const dy = cityPos.y - busPos.y;
            const angle = Math.atan2(dy, dx);

            // Posicionamiento inteligente de etiquetas
            const xijPosition = {
                x: busPos.x + dx * 0.25 + Math.cos(angle + angleOffset) * labelOffset,
                y: busPos.y + dy * 0.25 + Math.sin(angle + angleOffset) * labelOffset
            };

            const cijPosition = {
                x: busPos.x + dx * 0.75 + Math.cos(angle - angleOffset) * labelOffset,
                y: busPos.y + dy * 0.75 + Math.sin(angle - angleOffset) * labelOffset
            };

            // Alternar posición vertical para evitar superposición
            // const verticalOffset = (cityIdx % 2 === 0) ? - 15 : 15;
            // xij.setAttribute('y', xijY + verticalOffset);
            // cij.setAttribute('y', cijY - verticalOffset);

            // Crear etiquetas con posición calculada
            createLabel(svg, `x${busIdx+1}${cityIdx+1}`, xijPosition, busColors[busIdx % busColors.length]);
            createLabel(svg, `c${busIdx+1}${cityIdx+1}`, cijPosition, busColors[busIdx % busColors.length]);

            // Etiquetas
            // const midX = (busPos.x + cityPos.x) / 2;
            // const midY = (busPos.y + cityPos.y) / 2;

            // // Coordenadas para xij (25% desde el bus)
            // const xijX = busPos.x + (cityPos.x - busPos.x) * 0.25;
            // const xijY = busPos.y + (cityPos.y - busPos.y) * 0.25;
            
            // // Coordenadas para cij (75% desde el bus = 25% desde la ciudad)
            // const cijX = busPos.x + (cityPos.x - busPos.x) * 0.75;
            // const cijY = busPos.y + (cityPos.y - busPos.y) * 0.75;
    
            // // Crear etiqueta xij
            // const xij = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            // xij.setAttribute('x', xijX);
            // xij.setAttribute('y', xijY - 10); // 10px arriba de la línea
            // xij.textContent = `x${busIdx + 1}${cityIdx + 1}`;
            // xij.setAttribute('fill', '#2c3e50'); // Color oscuro para contraste
            // svg.appendChild(xij);
    
            // // Crear etiqueta cij
            // const cij = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            // cij.setAttribute('x', cijX);
            // cij.setAttribute('y', cijY - 10); // 10px arriba de la línea
            // cij.textContent = `c${busIdx + 1}${cityIdx + 1}`;
            // cij.setAttribute('fill', '#2c3e50'); // Color oscuro para contraste
            // svg.appendChild(cij);
        });
    });
    
    function createLabel(svg, text, position, color) {
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', position.x);
        label.setAttribute('y', position.y);
        label.textContent = text;
        label.setAttribute('fill', color);
        label.setAttribute('class', 'diagram-label');
        svg.appendChild(label);
    }

    // busPositions.forEach((busPos, busIdx) => {
    //     cityPositions.forEach((cityPos, cityIdx) => {
    //         // Calcular posición relativa
    //         const lineLength = Math.sqrt(
    //             Math.pow(cityPos.x - busPos.x, 2) + 
    //             Math.pow(cityPos.y - busPos.y, 2)
    //         );
            
    //         // Offset para las etiquetas
    //         const labelOffset = lineLength * 0.15; // 15% de la longitud de la línea
            
    //         // Coordenadas para xij (25% desde el bus)
    //         const xijX = busPos.x + (cityPos.x - busPos.x) * 0.25;
    //         const xijY = busPos.y + (cityPos.y - busPos.y) * 0.25;
            
    //         // Coordenadas para cij (75% desde el bus = 25% desde la ciudad)
    //         const cijX = busPos.x + (cityPos.x - busPos.x) * 0.75;
    //         const cijY = busPos.y + (cityPos.y - busPos.y) * 0.75;
    
    //         // Crear etiqueta xij
    //         const xij = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    //         xij.setAttribute('x', xijX);
    //         xij.setAttribute('y', xijY - 10); // 10px arriba de la línea
    //         xij.textContent = `x${busIdx + 1}${cityIdx + 1}`;
    //         xij.setAttribute('fill', '#2c3e50'); // Color del bus
    //         svg.appendChild(xij);
    
    //         // Crear etiqueta cij
    //         const cij = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    //         cij.setAttribute('x', cijX);
    //         cij.setAttribute('y', cijY + 15); // 15px debajo de la línea
    //         cij.textContent = `c${busIdx + 1}${cityIdx + 1}`;
    //         cij.setAttribute('fill', '#2c3e50'); // Color oscuro para contraste
    //         svg.appendChild(cij);
    //     });
    // });
    // Añadir al final:
    //svg.setAttribute('viewBox', `0 0 1024 ${numSources}`);

}
