// Objeto para mantener los datos cargados
let diagramData = null;

// Función que se ejecuta cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    loadAndValidateData();
});

// Cargar datos del localStorage y generar matriz inicial
function loadAndValidateData() {
    try {
        const savedData = localStorage.getItem('diagramData');
        if (!savedData) throw new Error('No hay datos guardados');
        diagramData = JSON.parse(savedData);

        if (!diagramData.buses || !diagramData.cities) throw new Error('Estructura de datos incompleta');
        if (Object.keys(diagramData.buses).length === 0) throw new Error('No hay datos de buses');
        if (diagramData.cities.length === 0) throw new Error('No hay datos de ciudades');

        generateInputMatrix();
    } catch (error) {
        showError(`Datos del diagrama incompletos: ${error.message}`);
        setTimeout(() => { window.location.href = 'index.html'; }, 2500);
    }
}


// Función para validar las sumas cuando cambian los valores
function validateSums() {
    const offers = Array.from(document.querySelectorAll('.offer-input')).map(i => parseInt(i.value) || 0);
    const demands = Array.from(document.querySelectorAll('.demand-input')).map(i => parseInt(i.value) || 0);
    const totalOffers = offers.reduce((a,b) => a + b, 0);
    const totalDemands = demands.reduce((a,b) => a + b, 0);

    let sumHtml = `
        <div class="alert ${totalOffers===totalDemands ? 'alert-success':'alert-danger'} mt-2 mb-2 p-2" role="alert">
            <b>Total Oferta:</b> <span id="total-oferta">${totalOffers}</span> | 
            <b>Total Demanda:</b> <span id="total-demanda">${totalDemands}</span>
            <span class="ms-2">${totalOffers===totalDemands ? '✔️ Sumas iguales' : '❌ Las sumas deben ser iguales'}</span>
        </div>
    `;
    let sumDiv = document.getElementById('sum-validation');
    if (sumDiv) {
        sumDiv.innerHTML = sumHtml;
        sumDiv.style.display = "block";
        
        // Ocultar el mensaje después de 2 segundos
        setTimeout(() => {
            sumDiv.style.display = "none";
        }, 2000);
    }

    // Deshabilitar el botón si no son iguales
    const btn = document.querySelector('button[onclick="calcularEsquinaNoroeste()"]');
    if (btn) btn.disabled = !(totalOffers === totalDemands);

    return totalOffers === totalDemands;
}

// Función para calcular el total de ofertas
function calculateTotalOffer() {
    let total = 0;
    const offerInputs = document.querySelectorAll('.offer-input');
    offerInputs.forEach(input => {
        total += parseInt(input.value) || 0;
    });
    return total;
}

// Función para calcular el total de demandas
function calculateTotalDemand() {
    let total = 0;
    const demandInputs = document.querySelectorAll('.demand-input');
    demandInputs.forEach(input => {
        total += parseInt(input.value) || 0;
    });
    return total;
}

// Función para crear el contenedor de validación de sumas
function createSumValidationContainer() {
    const container = document.createElement('div');
    container.id = 'sum-validation';
    container.className = 'card mt-3 mb-3';
    
    container.innerHTML = `
        <div class="card-header bg-info text-white">
            <h5 class="mb-0">Validación de Sumas</h5>
        </div>
        <div class="card-body">
            <div class="row">
                <div class="col-md-4">
                    <p class="mb-0"><strong>Total Oferta:</strong> <span id="total-oferta">0</span></p>
                </div>
                <div class="col-md-4">
                    <p class="mb-0"><strong>Total Demanda:</strong> <span id="total-demanda">0</span></p>
                </div>
                <div class="col-md-4">
                    <p class="mb-0" id="sum-status"></p>
                </div>
            </div>
        </div>
    `;
    
    // Insertar después de la matriz
    const matrixContainer = document.getElementById('data-matrix');
    if (matrixContainer) {
        matrixContainer.parentNode.insertBefore(container, matrixContainer.nextSibling);
    }
}

// Función para actualizar la visualización de las sumas
function updateSumValidationDisplay(totalOferta, totalDemanda) {
    document.getElementById('total-oferta').textContent = totalOferta;
    document.getElementById('total-demanda').textContent = totalDemanda;
    
    const statusElement = document.getElementById('sum-status');
    const calcularButton = document.querySelector('button[onclick="calcularEsquinaNoroeste()"]');
    
    if (totalOferta === totalDemanda) {
        statusElement.innerHTML = '<span class="text-success"><strong>✓ Las sumas son iguales</strong></span>';
        statusElement.className = 'mb-0 text-success';
        calcularButton.disabled = false;
    } else {
        statusElement.innerHTML = '<span class="text-danger"><strong>✗ Las sumas deben ser iguales</strong></span>';
        statusElement.className = 'mb-0 text-danger';
        calcularButton.disabled = true;
    }
}

// Función para agregar los listeners de validación de sumas
function addSumValidationListeners() {
    document.querySelectorAll('.offer-input, .demand-input').forEach(input => {
        input.addEventListener('input', validateSums);
        input.addEventListener('change', validateSums);
    });
}

function validateValue(input) {
    let value = input.value.replace(/[^\d]/g, '');
    if (value === '') value = '0';
    input.value = Math.max(0, parseInt(value));
}

function calcularEsquinaNoroeste() {
    if (!validateSums()) {
        showError('Las sumas de ofertas y demandas deben ser iguales para calcular');
        return;
    }

    // Extraer datos de inputs
    const offerInputs = Array.from(document.querySelectorAll('.offer-input'));
    const demandInputs = Array.from(document.querySelectorAll('.demand-input'));
    const offers = offerInputs.map(i => parseInt(i.value) || 0);
    const demands = demandInputs.map(i => parseInt(i.value) || 0);

    const buses = Object.keys(diagramData.buses);
    const cities = diagramData.cities;
    // Matriz de costos
    const costs = buses.map(busKey =>
        cities.map(city => parseInt(document.querySelector(`#cost_${busKey}_${city}`).value) || 0)
    );

    // Resolver método noroeste
    const solution = northwestCornerAlgorithm([...offers], [...demands]);

    // Mostrar resultados
    displayResults(solution, costs, offers, demands);
}

// Función para mostrar errores
function showError(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger alert-dismissible fade show';
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    document.body.insertBefore(alertDiv, document.body.firstChild);
}

// Función para generar la matriz de inputs
function generateInputMatrix() {
    const matrixContainer = document.getElementById('data-matrix');
    if (!matrixContainer) return showError('No se encontró el contenedor de la matriz');

    let html = '<div class="table-responsive"><table class="table table-bordered align-middle">';
    // Encabezado
    html += '<thead><tr><th></th>';
    diagramData.cities.forEach(city => { html += `<th class="text-center">${city}</th>`; });
    html += '<th style="background:#c8fac8;">Oferta</th></tr></thead><tbody>';

    // Filas de buses
    Object.entries(diagramData.buses).forEach(([busKey, routes]) => {
        html += `<tr><th>Bus ${busKey.replace('bus','')}</th>`;
        diagramData.cities.forEach(city => {
            const route = routes.find(r => r.ciudad === city);
            const passengers = route ? route.x : 0;
            const cost = route ? route.c : 0;
            html += `
                <td>
                    <input type="number" class="form-control form-control-sm text-center passengers-input matrix-input" 
                        id="passengers_${busKey}_${city}" value="${passengers}" min="0" data-bus="${busKey}" data-city="${city}" 
                        oninput="validateValue(this)">
                    <input type="number" class="form-control form-control-sm text-center cost-input matrix-input mt-1" 
                        id="cost_${busKey}_${city}" value="${cost}" min="0" data-bus="${busKey}" data-city="${city}"
                        oninput="validateValue(this)">
                </td>`;
        });
        const oferta = routes[0] && routes[0].oferta !== undefined ? routes[0].oferta : 0;
        html += `<td style="background:#c8fac8;">
            <input type="number" class="form-control form-control-sm text-center offer-input" 
                id="offer_${busKey}" value="${oferta}" min="0" oninput="validateValue(this)">
            </td></tr>`;
    });

    // Fila de demanda
    html += '<tr><th>Demanda</th>';
    diagramData.cities.forEach(city => {
        const demanda = (diagramData.demanda && diagramData.demanda[city] !== undefined) ? diagramData.demanda[city] : 0;
        html += `<td style="background:#c8fac8;">
            <input type="number" class="form-control form-control-sm text-center demand-input" 
                id="demand_${city}" value="${demanda}" min="0" oninput="validateValue(this)">
            </td>`;
    });
    html += '<td style="background:#e0e0e0;"></td></tr>';

    html += '</tbody></table></div>';
    matrixContainer.innerHTML = html;

    // Listeners
    addSumValidationListeners();
    validateSums();

    // Resumen del diagrama
    const summaryHtml = `
        <div class="card mb-4">
            <div class="card-header bg-info text-white">
                <h5 class="mb-0">Resumen del Diagrama</h5>
            </div>
            <div class="card-body">
                <p><strong>Buses:</strong> ${Object.keys(diagramData.buses).length}</p>
                <p><strong>Ciudades:</strong> ${diagramData.cities.length}</p>
                <p><strong>Última actualización:</strong> ${new Date(diagramData.timestamp).toLocaleString()}</p>
            </div>
        </div>
    `;
    document.getElementById('diagram-data').innerHTML = summaryHtml;
}

// Función que implementa el método de la esquina noroeste
function northwestCornerAlgorithm(offers, demands) {
    const m = offers.length;
    const n = demands.length;
    const sol = Array(m).fill().map(()=>Array(n).fill(0));
    let i=0, j=0;
    while(i<m && j<n){
        const asignar = Math.min(offers[i], demands[j]);
        sol[i][j] = asignar;vali
        offers[i] -= asignar;
        demands[j] -= asignar;
        if(offers[i]===0 && i<m-1) i++;
        else if(demands[j]===0 && j<n-1) j++;
        else if(offers[i]===0 && demands[j]===0) { i++; j++; }
    }
    return sol;
}


// Función para mostrar los resultados
// Visualización de resultados
function displayResults(solution, costs, offers, demands) {
    const resultsDiv = document.getElementById('results');
    if (!resultsDiv) return;

    // Calcular costo total
    let totalCost = 0;
    for (let i = 0; i < solution.length; i++)
        for (let j = 0; j < solution[0].length; j++)
            totalCost += solution[i][j] * costs[i][j];

    // Construcción tabla
    let html = `
        <h3 class="mb-3" style="color:#228B22;">Solución por Método de la Esquina Noroeste</h3>
        <div class="table-responsive">
        <table class="table table-bordered align-middle" style="text-align:center;min-width:540px;">
            <thead>
                <tr>
                    <th></th>
                    ${costs[0].map((_,j)=>`<th class="text-center">Ciudad ${j+1}</th>`).join('')}
                    <th style="background:#c8fac8;">Oferta</th>
                </tr>
            </thead>
            <tbody>
    `;
    for (let i = 0; i < solution.length; i++) {
        html += `<tr>
            <th>Bus ${i+1}</th>`;
        for (let j = 0; j < solution[0].length; j++) {
            html += `<td style="position:relative;height:55px;width:85px;">
                <div style="position:absolute;top:8px;left:10px;color:gray;font-size:13px;">${costs[i][j]}</div>
                <div style="position:absolute;bottom:8px;right:10px;color:red;font-size:17px;">${solution[i][j] > 0 ? solution[i][j] : ''}</div>
            </td>`;
        }
        html += `<td style="background:#c8fac8;font-weight:bold;">${offers[i]}</td></tr>`;
    }
    // Demanda (última fila)
    html += `<tr>
        <th>Demanda</th>
        ${demands.map(d=>`<td style="background:#c8fac8;font-weight:bold;">${d}</td>`).join('')}
        <td style="background:#e0e0e0;"></td>
    </tr>`;
    html += `</tbody></table></div>
        <div style="color:#228B22;font-weight:bold;font-size:1.2em;margin-top:15px;">Costo Total: ${totalCost}</div>
    `;
    resultsDiv.innerHTML = html;
}

// Exponer función para el botón en HTML
window.calcularEsquinaNoroeste = calcularEsquinaNoroeste;
window.validateValue = validateValue;

// Función para validar entrada de teclado
function validateNumberInput(event) {
    // Permitir: backspace, delete, tab, escape, enter, punto y números
    if (
        event.key === 'Backspace' ||
        event.key === 'Delete' ||
        event.key === 'Tab' ||
        event.key === 'Escape' ||
        event.key === 'Enter' ||
        // Permitir: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        (event.ctrlKey === true && (event.key === 'a' || event.key === 'c' || event.key === 'v' || event.key === 'x')) ||
        // Permitir: home, end, left, right
        (event.key === 'Home' || event.key === 'End' || event.key === 'ArrowLeft' || event.key === 'ArrowRight')
    ) {
        return true;
    }
    
    // Asegurarse de que sea un número y no sea negativo
    return /^[0-9]$/.test(event.key);
}

// Función para validar pegado de contenido
function validatePaste(event) {
    const clipboardData = event.clipboardData || window.clipboardData;
    const pastedData = clipboardData.getData('Text');
    
    // Verificar que solo contenga números positivos
    if (!/^\d+$/.test(pastedData)) {
        event.preventDefault();
        return false;
    }
    return true;
}

// Función para agregar listeners de validación a todos los inputs
function addInputValidationListeners() {
    // Seleccionar todos los inputs numéricos
    const inputs = document.querySelectorAll('input[type="number"]');
    
    inputs.forEach(input => {
        // Prevenir el uso de la rueda del mouse para cambiar valores
        input.addEventListener('wheel', function(e) {
            e.preventDefault();
        });

        // Validar cuando el input pierde el foco
        input.addEventListener('blur', function() {
            validateValue(this);
        });

        // Validar cuando se suelta una tecla
        input.addEventListener('keyup', function() {
            validateValue(this);
        });
    });
}

const validationStyles = document.createElement('style');
validationStyles.textContent = `
    #sum-validation {
        transition: all 0.3s ease;
    }
    
    .sum-mismatch {
        animation: shake 0.5s;
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
    
    .validation-status {
        font-weight: bold;
        padding: 5px 10px;
        border-radius: 4px;
    }
    
    .validation-status.valid {
        background-color: #d4edda;
        color: #155724;
    }
    
    .validation-status.invalid {
        background-color: #f8d7da;
        color: #721c24;
    }
`;
document.head.appendChild(validationStyles);

// Función para generar la función objetivo
function generateObjectiveFunction(matrix) {
    let objective = 'Min Z = ';
    let terms = [];
    
    Object.keys(diagramData.buses).forEach((busKey, i) => {
        diagramData.cities.forEach((city, j) => {
            const cost = matrix[i][j];
            if (cost > 0) {
                terms.push(`${cost} X<sub>${i+1}${j+1}</sub>`);
            }
        });
    });
    
    objective += terms.join(' + ');
    return objective;
}

// Función para generar las restricciones de oferta
function generateSupplyConstraints(offers) {
    const constraints = [];
    
    Object.keys(diagramData.buses).forEach((busKey, i) => {
        let constraint = '';
        const terms = [];
        
        diagramData.cities.forEach((city, j) => {
            terms.push(`X<sub>${i+1}${j+1}</sub>`);
        });
        
        constraint = terms.join(' + ') + ` ≤ ${offers[i]}`;
        constraints.push(constraint);
    });
    
    return constraints;
}

// Función para generar las restricciones de demanda
function generateDemandConstraints(demands) {
    const constraints = [];
    
    diagramData.cities.forEach((city, j) => {
        let constraint = '';
        const terms = [];
        
        Object.keys(diagramData.buses).forEach((busKey, i) => {
            terms.push(`X<sub>${i+1}${j+1}</sub>`);
        });
        
        constraint = terms.join(' + ') + ` = ${demands[j]}`;
        constraints.push(constraint);
    });
    
    return constraints;
}

// Función para generar las restricciones de no negatividad
function generateNonNegativityConstraints(matrix) {
    let constraint = '';
    const terms = [];
    
    Object.keys(diagramData.buses).forEach((busKey, i) => {
        diagramData.cities.forEach((city, j) => {
            terms.push(`X<sub>${i+1}${j+1}</sub> ≥ 0`);
        });
    });
    
    constraint = terms.join(', ');
    return constraint;
}

// Agregar estilos para inputs inválidos
const style = document.createElement('style');
style.textContent = `
    input:invalid {
        border-color: red;
        background-color: #ffd7d7;
    }
    
    input:focus:invalid {
        outline-color: red;
    }
    
    .matrix-input, .offer-input, .demand-input {
        -moz-appearance: textfield;
    }
    
    .matrix-input::-webkit-outer-spin-button,
    .matrix-input::-webkit-inner-spin-button,
    .offer-input::-webkit-outer-spin-button,
    .offer-input::-webkit-inner-spin-button,
    .demand-input::-webkit-outer-spin-button,
    .demand-input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }
`;
document.head.appendChild(style);

// Función para generar la tabla inicial
function generateTable(rows, cols) {
    const table = document.createElement('table');
    table.className = 'table table-bordered';
    table.id = 'data-matrix';
    
    // Crear encabezado de la tabla
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    // Celda vacía en la esquina superior izquierda
    headerRow.appendChild(document.createElement('th'));
    
    // Encabezados de demanda (D1, D2, etc.)
    for (let j = 1; j <= cols; j++) {
        const th = document.createElement('th');
        th.textContent = `D${j}`;
        headerRow.appendChild(th);
    }
    
    // Columna para la oferta
    const ofertaTh = document.createElement('th');
    ofertaTh.textContent = 'Oferta';
    headerRow.appendChild(ofertaTh);
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Crear cuerpo de la tabla
    const tbody = document.createElement('tbody');
    for (let i = 1; i <= rows; i++) {
        const tr = document.createElement('tr');
        
        // Encabezado de fila (O1, O2, etc.)
        const th = document.createElement('th');
        th.textContent = `O${i}`;
        tr.appendChild(th);
        
        // Celdas de costos
        for (let j = 1; j <= cols; j++) {
            const td = document.createElement('td');
            const input = document.createElement('input');
            input.type = 'number';
            input.className = 'form-control cost-input';
            input.min = '0';
            td.appendChild(input);
            tr.appendChild(td);
        }
        
        // Celda de oferta
        const ofertaTd = document.createElement('td');
        const ofertaInput = document.createElement('input');
        ofertaInput.type = 'number';
        ofertaInput.className = 'form-control offer-input';
        ofertaInput.min = '0';
        ofertaTd.appendChild(ofertaInput);
        tr.appendChild(ofertaTd);
        
        tbody.appendChild(tr);
    }
    
    // Fila de demanda
    const demandRow = document.createElement('tr');
    demandRow.innerHTML = `<th>Demanda</th>`;
    
    for (let j = 1; j <= cols; j++) {
        const td = document.createElement('td');
        const input = document.createElement('input');
        input.type = 'number';
        input.className = 'form-control demand-input';
        input.min = '0';
        td.appendChild(input);
        demandRow.appendChild(td);
    }
    
    // Celda vacía en la esquina inferior derecha
    demandRow.appendChild(document.createElement('td'));
    tbody.appendChild(demandRow);
    table.appendChild(tbody);
    
    // Insertar la tabla en el contenedor
    const container = document.getElementById('table-container');
    if (container) {
        container.innerHTML = '';
        container.appendChild(table);
    }
    
    // Añadir los listeners de validación después de crear la tabla
    addSumValidationListeners();
}
