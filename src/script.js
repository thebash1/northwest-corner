const capitals = [
    "Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena", "Cúcuta", "Bucaramanga", "Pereira",
    "Manizales", "Ibagué", "Santa Marta", "Villavicencio", "Pasto", "Montería", "Armenia", "Neiva",
    "Sincelejo", "Valledupar", "Quibdó", "Riohacha", "Florencia", "San Andrés", "Mocoa", "Yopal",
    "Popayán", "Tunja", "Leticia", "Arauca", "Inírida", "Puerto Carreño", "Mitú", "San José del Guaviare"
];

const busColors = ['#0000FF', '#FF0000', '#FFA500', '#006400'];
let busesAndCities = {};
let currentCities = [];
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
    
    // Guardar los datos después de generar el diagrama
    saveDiagramData();
}


function goBack() {
    document.getElementById('diagram-window').classList.add('hidden');
    document.getElementById('start-window').classList.remove('hidden');
}

function generateDiagram() {
    
    const numSources = parseInt(document.getElementById('num-sources').value);
    const numDest = parseInt(document.getElementById('num-dest').value);
    const cities = capitals.sort(() => 0.5 - Math.random()).slice(0, numDest);
    currentCities = cities;

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

    console.log('Datos antes de guardar:', busesAndCities, currentCities); // Para debug

    if (Object.keys(busesAndCities).length === 0) {
        showError('No hay datos para guardar');
        return;
    }

    // Guardar los datos
    const dataToSave = {
        buses: busesAndCities,
        cities: currentCities,
        timestamp: new Date().toISOString()
    };

    try {
        localStorage.setItem('diagramData', JSON.stringify(dataToSave));
        console.log('Datos guardados:', dataToSave); // Para debug
    } catch (error) {
        console.error('Error al guardar datos:', error);
        showError('Error al guardar los datos del diagrama');
    }
}

// Función mejorada para mostrar la función objetivo en un modal
function showObjetiveFunction() {
    let objective = "Z = ";
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
            objective += `${termino}`;
            
            // Formato para LaTeX (mostrado en rojo)
            objectiveLatex += `(${xName} * ${cName})`;
            
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
    
    // Título mejorado con formato
    modalTitle.innerHTML = "Función Objetivo (minimizar costos)";
    
    // Construir contenido con formato
    let modalContent = `
        <div class="text-center mb-4">
            <p class="text">${objectiveLatex}</p>
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

function showConstraints() {
    // --- Restricciones de oferta ---
    let supplyHtml = '<h6 class="text-primary fw-bold mb-3">Restricciones de oferta</h6><ul>';
    Object.keys(busesAndCities).forEach((busKey, i) => {
        // x_{i+1,1} + x_{i+1,2} + ... <= busKey
        const terms = currentCities
            .map((_, j) => `x${i+1}${j+1}`)
            .join(' + ');
        supplyHtml += `<li>${terms} ≤ ${busKey}</li>`;
    });
    supplyHtml += '</ul>';

    // --- Restricciones de demanda ---
    let demandHtml = '<h6 class="text-success fw-bold mt-4 mb-3">Restricciones de demanda</h6><ul>';
    currentCities.forEach((city, j) => {
        // c_{1,j+1} + c_{2,j+1} + ... ≤ city
        const terms = Object.keys(busesAndCities)
            .map((_, i) => `c${i+1}${j+1}`)
            .join(' + ');
        demandHtml += `<li>${terms} = ${city}</li>`;
    });
    demandHtml += '</ul>';

    // Inserta el HTML completo en el modal y lo muestra
    const body = document.getElementById('constraints-modal-body');
    body.innerHTML = supplyHtml + demandHtml;
    const modal = new bootstrap.Modal(document.getElementById('constraints-modal'));
    modal.show();
}

function getDiagramData() {
    const data = {
        buses: {},
        cities: currentCities,
        timestamp: new Date().toISOString()
    };

    // Obtener datos de buses y sus conexiones
    Object.keys(busesAndCities).forEach(busKey => {
        data.buses[busKey] = busesAndCities[busKey].map(route => ({
            cityName: route.ciudad,
            passengers: route.x,
            cost: route.c
        }));
    });

    return data;
}

function saveDiagramData() {
    try {
        const data = getDiagramData();
        localStorage.setItem('diagramData', JSON.stringify(data));
        console.log('Datos guardados exitosamente:', data);
        return data;
    } catch (error) {
        console.error('Error al guardar los datos:', error);
        showError('Error al guardar los datos del diagrama');
    }
}

function goToNorthwest() {
    const savedData = localStorage.getItem('diagramData');
    if (!savedData) {
        showError('No hay datos del diagrama para procesar');
        return;
    }

    try {
        const parsedData = JSON.parse(savedData);
        if (!parsedData.buses || !parsedData.cities) {
            showError('Los datos del diagrama están incompletos');
            return;
        }
        window.location.href = 'northwest.html';
    } catch (error) {
        console.error('Error al procesar datos:', error);
        showError('Error al procesar los datos del diagrama');
    }
}

function handleError(error, message) {
    console.error(error);
    showError(message || 'Ha ocurrido un error');
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger alert-dismissible fade show';
    errorDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Insertar al principio del contenedor principal
    const container = document.querySelector('.container') || document.body;
    container.insertBefore(errorDiv, container.firstChild);
    
    // Remover después de 5 segundos
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

function loadDiagramData() {
    const savedData = localStorage.getItem('diagramData');
    if (!savedData) {
        showError('No hay datos del diagrama disponibles');
        return null;
    }

    try {
        return JSON.parse(savedData);
    } catch (error) {
        console.error('Error al cargar los datos:', error);
        showError('Error al cargar los datos del diagrama');
        return null;
    }
}