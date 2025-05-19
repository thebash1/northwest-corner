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

// Función esquina noroeste CORREGIDA
function showNorthWestCorner() {
    let info = "Rutas:\n\n";
    Object.keys(busesAndCities).forEach(bus => {
        info += `${bus}:\n`;
        busesAndCities[bus].forEach((ruta, idx) => {
            info += `${ruta.ciudad}: x=${ruta.x}, c=${ruta.c}\n`;
        });
    });
    alert(info);
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

            // Crear etiquetas con posición calculada
            const cityName = cities[cityIdx];
            const xId = `x${busIdx+1}${cityIdx+1}`;
            const cId = `c${busIdx+1}${cityIdx+1}`;

            // Modificar las llamadas a createLabel para incluir los valores iniciales
            createLabel(svg, `${xId}`, xijPosition, busColors[busIdx % busColors.length]);
            createLabel(svg, `${cId}`, cijPosition, busColors[busIdx % busColors.length]);

            // Inicializar valores para esta ruta
            // Valores de prueba (normalmente estos valores los ingresaría el usuario)
            const randomX = Math.floor(Math.random() * 10) + 1; // Valor aleatorio entre 1-10
            const randomC = Math.floor(Math.random() * 100) + 20; // Costo aleatorio entre 20-120
            
            // Actualizar la estructura de datos con valores aleatorios iniciales para demo
            updateRouteValues(busIdx, cityIdx, randomX, randomC, cityName);
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
}

// Función mejorada para mostrar la función objetivo en un modal
function showObjetiveFunction() {
    let objective = "";
    let objectiveLatex = "Z = ";
    let total = 0;
    
    const busKeys = Object.keys(busesAndCities);
    
    busKeys.forEach((bus, busIndex) => {
        const routes = busesAndCities[bus];
        
        routes.forEach((ruta, routeIndex) => {
            // Obtener los valores de x y c
            const xValue = parseInt(ruta.x) || 0;
            const cValue = parseInt(ruta.c) || 0;
            const xName = `x${busIndex + 1}${routeIndex + 1}`;
            const cName = `c${busIndex + 1}${routeIndex + 1}`;
            
            // Calcular el producto para esta ruta
            const producto = xValue * cValue;
            total += producto;
            
            // Formato para la ecuación matemática
            const termino = `${xName} × ${cName}`;
            const terminoConValores = `${xValue} × ${cValue}`;
            
            // Añadir el término a la ecuación
            objective += `${termino} = ${terminoConValores} = ${producto}`;
            
            // Formato para LaTeX (mostrado en rojo)
            objectiveLatex += `${xName} · ${cName}`;
            
            // Añadir "+" si no es el último término
            const isLastTerm = (busIndex === busKeys.length - 1) && 
                              (routeIndex === routes.length - 1);
            
            if (!isLastTerm) {
                objective += " + ";
                objectiveLatex += " + ";
            }
        });
    });
    
    // Abrir el modal con la información
    const modalBody = document.getElementById('objective-modal-body');
    const modalTitle = document.getElementById('objective-modal-title');
    
    modalTitle.innerHTML = "Función Objetivo del Modelo de Transporte";
    
    // Construir contenido con formato
    let modalContent = `
        <div class="text-center mb-4">
            <h4 class="text-danger">${objectiveLatex}</h4>
        </div>
        <div class="row">
            <div class="col-12">
                <p><strong>Cálculo paso a paso:</strong></p>
                <p>${objective}</p>
            </div>
        </div>
        <div class="row mt-3">
            <div class="col-12">
                <h5>Valor total de la función objetivo: <span class="badge bg-success">${total}</span></h5>
            </div>
        </div>
    `;
    
    modalBody.innerHTML = modalContent;
    
    // Abrir el modal usando Bootstrap
    const objectiveModal = new bootstrap.Modal(document.getElementById('objective-modal'));
    objectiveModal.show();
}

function showNorthWestCorner() {
    let mensaje = "Datos de rutas:\n\n";
    
    Object.keys(busesAndCities).forEach(bus => {
        mensaje += `${bus}:\n`;
        busesAndCities[bus].forEach((ruta, index) => {
            mensaje += `  Ruta ${index + 1}: ${ruta.ciudad}\n`;
            mensaje += `    x: ${ruta.x}, c: ${ruta.c}\n`;
        });
        mensaje += "\n";
    });
    
    alert(mensaje);
}

// Función para actualizar los valores de las variables
function updateRouteValues(busIndex, cityIndex, xValue, cValue, cityName) {
    const busKey = `bus${busIndex + 1}`;
    
    if (!busesAndCities[busKey]) {
        busesAndCities[busKey] = [];
    }
    
    busesAndCities[busKey][cityIndex] = {
        x: xValue,
        c: cValue,
        ciudad: cityName
    };
}