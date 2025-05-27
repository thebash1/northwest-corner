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
    createDiagramFromSolution(solution, costs);

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

    let html = `
        <div class="table-responsive">
            <table class="table table-bordered align-middle">
                <thead class="table-light">
                    <tr>
                        <th class="bg-light"></th>
                        ${diagramData.cities.map(city => 
                            `<th class="text-center bg-light">${city}</th>`
                        ).join('')}
                        <th class="text-center" style="background-color: #e6f3ff;">Oferta</th>
                    </tr>
                </thead>
                <tbody>
    `;

    // Filas de buses
    Object.entries(diagramData.buses).forEach(([busKey, routes]) => {
        html += `
            <tr>
                <th class="bg-light">Bus ${busKey.replace('bus','')}</th>`;
                
        diagramData.cities.forEach(city => {
            const route = routes.find(r => r.ciudad === city);
            const passengers = route ? route.x : 0;
            const cost = route ? route.c : 0;
            html += `
                <td class="position-relative" style="min-width: 100px; height: 80px;">
                    <div class="position-absolute" style="top: 50%; left: 50%; transform: translate(-50%, -50%);">
                        <input type="number" 
                            class="form-control form-control-sm text-center passengers-input matrix-input mb-1" 
                            id="passengers_${busKey}_${city}" 
                            value="${passengers}" 
                            min="0" 
                            data-bus="${busKey}" 
                            data-city="${city}" 
                            oninput="validateValue(this)"
                            style="display: none;">
                        <input type="number" 
                            class="form-control form-control-sm text-center cost-input matrix-input" 
                            id="cost_${busKey}_${city}" 
                            value="${cost}" 
                            min="0" 
                            data-bus="${busKey}" 
                            data-city="${city}"
                            oninput="validateValue(this)">
                    </div>
                </td>`;
        });

        const oferta = routes[0] && routes[0].oferta !== undefined ? routes[0].oferta : 0;
        html += `
            <td style="background-color: #e6f3ff;">
                <input type="number" 
                    class="form-control form-control-sm text-center offer-input" 
                    id="offer_${busKey}" 
                    value="${oferta}" 
                    min="0" 
                    oninput="validateValue(this)">
            </td>
        </tr>`;
    });

    // Fila de demanda
    html += `
        <tr>
            <th class="bg-light">Demanda</th>`;
    
    diagramData.cities.forEach(city => {
        const demanda = (diagramData.demanda && diagramData.demanda[city] !== undefined) ? diagramData.demanda[city] : 0;
        html += `
            <td style="background-color: #e6f3ff;">
                <input type="number" 
                    class="form-control form-control-sm text-center demand-input" 
                    id="demand_${city}" 
                    value="${demanda}" 
                    min="0" 
                    oninput="validateValue(this)">
            </td>`;
    });
    
    html += `
            <td style="background-color: #e6f3ff;"></td>
        </tr>
        </tbody>
        </table>
        </div>`;

    matrixContainer.innerHTML = html;

    // Agregar estilos específicos
    const styles = document.createElement('style');
    styles.textContent = `
        .matrix-input {
            width: 70px !important;
            margin: 0 auto;
        }
        .form-control-sm {
            font-size: 0.875rem;
        }
        .table td {
            padding: 0.75rem;
        }
        input[type="number"] {
            -moz-appearance: textfield;
        }
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
        }
        .table td, .table th {
            vertical-align: middle;
        }
        input.form-control {
            background-color: white !important;
        }
    `;
    document.head.appendChild(styles);
    
    // Listeners
    addSumValidationListeners();
    validateSums();

}

// Función que implementa el método de la esquina noroeste
function northwestCornerAlgorithm(offers, demands) {
    const m = offers.length;
    const n = demands.length;
    const sol = Array(m).fill().map(()=>Array(n).fill(0));
    let i=0, j=0;
    while(i<m && j<n){
        const asignar = Math.min(offers[i], demands[j]);
        sol[i][j] = asignar;  // <-- Corregido aquí, eliminando 'vali'
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

    // Construcción de la tabla con mejor diseño
    let html = `
        <div class="card shadow-sm mb-4">
            <div class="card-header bg-success text-white">
                <h3 class="mb-0">Solución por Método de la Esquina Noroeste</h3>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-bordered table-hover align-middle mb-0">
                        <thead class="table-light">
                            <tr class="text-center">
                                <th class="bg-light"></th>
                                ${costs[0].map((_,j)=>`
                                    <th class="text-center bg-light">Ciudad ${j+1}</th>
                                `).join('')}
                                <th class="text-center" style="background-color: #e8f6e8;">Oferta</th>
                            </tr>
                        </thead>
                        <tbody>
    `;

    // Filas de buses
    for (let i = 0; i < solution.length; i++) {
        html += `
            <tr class="text-center">
                <th class="bg-light">Bus ${i+1}</th>`;
        
        for (let j = 0; j < solution[0].length; j++) {
            html += `
                <td class="position-relative" style="min-width: 100px; height: 80px;">
                    <div class="position-absolute" style="top: 50%; left: 50%; transform: translate(-50%, -50%);">
                        <div class="fw-bold" style="color: #333; font-size: 1.2em;">${costs[i][j]}</div>
                        <div class="fw-bold text-danger" style="font-size: 1.3em; margin-top: 5px;">
                            ${solution[i][j] > 0 ? solution[i][j] : ''}
                        </div>
                    </div>
                </td>`;
        }
        
        html += `
            <td class="fw-bold text-center" style="background-color: #e8f6e8;">${offers[i]}</td>
        </tr>`;
    }

    // Fila de demanda
    html += `
        <tr class="text-center">
            <th class="bg-light">Demanda</th>
            ${demands.map(d=>`
                <td class="fw-bold" style="background-color: #e8f6e8;">${d}</td>
            `).join('')}
            <td style="background-color: #e8f6e8;"></td>
        </tr>`;

    html += `
                        </tbody>
                    </table>
                </div>
                <div class="text-end mt-3">
                    <h4 class="text-success mb-0">
                        Costo Total: <span class="badge bg-success" style="font-size: 1.1em;">${totalCost}</span>
                    </h4>
                </div>
            </div>
        </div>
    `;

    resultsDiv.innerHTML = html;

    displayMathematicalModel(solution, costs, offers, demands);
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

function displayMathematicalModel(solution, costs, offers, demands) {
    // Crear la función objetivo con valores reales
    let objectiveFunction = 'Min Z = ';
    let terms = [];
    let actualTerms = [];
    let total = 0;

    for (let i = 0; i < solution.length; i++) {
        for (let j = 0; j < solution[0].length; j++) {
            if (solution[i][j] > 0) {
                // Término con valores reales
                terms.push(`${costs[i][j]}(${solution[i][j]})`);
                total += costs[i][j] * solution[i][j];
            }
        }
    }

    // Restricciones de oferta con valores reales
    let supplyConstraints = [];
    for (let i = 0; i < solution.length; i++) {
        let constraintTerms = [];
        for (let j = 0; j < solution[0].length; j++) {
            if (solution[i][j] > 0) {
                constraintTerms.push(`${solution[i][j]}`);
            }
        }
        supplyConstraints.push(`${constraintTerms.join(' + ')} ≤ ${offers[i]}`);
    }

    // Restricciones de demanda con valores reales
    let demandConstraints = [];
    for (let j = 0; j < solution[0].length; j++) {
        let constraintTerms = [];
        for (let i = 0; i < solution.length; i++) {
            if (solution[i][j] > 0) {
                constraintTerms.push(`${solution[i][j]}`);
            }
        }
        demandConstraints.push(`${constraintTerms.join(' + ')} = ${demands[j]}`);
    }

    // Construir el HTML
    let html = `
        <div class="card shadow-sm mb-4 mt-4">
            <div class="card-header bg-success text-white">
                <h4 class="mb-0">Modelo Matemático</h4>
            </div>
            <div class="card-body">
                <div class="mb-4">
                    <h5 class="text-success">Función Objetivo:</h5>
                    <p class="ms-3">Min Z = ${terms.join(' + ')} = ${total}</p>
                </div>

                <div class="mb-4">
                    <h5 class="text-success">Restricciones de oferta:</h5>
                    ${supplyConstraints.map(constraint => 
                        `<p class="ms-3 mb-1">${constraint}</p>`
                    ).join('')}
                </div>

                <div class="mb-4">
                    <h5 class="text-success">Restricciones de demanda:</h5>
                    ${demandConstraints.map(constraint => 
                        `<p class="ms-3 mb-1">${constraint}</p>`
                    ).join('')}
                </div>

            </div>
        </div>
    `;

    // Agregar al div de resultados después de la tabla
    const resultsDiv = document.getElementById('results');
    resultsDiv.insertAdjacentHTML('beforeend', html);
}

function createDiagramFromSolution(solution, costs) {
    // Definir los colores al inicio de la función
    const busColors = ['#0000FF', '#FF0000', '#FFA500'];
    
    const diagramContainer = document.getElementById('results');
    
    // Crear el contenedor principal
    const html = `
        <div class="card shadow-sm mb-4 mt-4">
            <div class="card-header bg-success text-white">
                <h4 class="mb-0">Diagrama de Relación Buses-Ciudades</h4>
            </div>
            <div class="card-body">
                <div id="diagram-container">
                    <svg id="diagram-svg"></svg>
                </div>
            </div>
        </div>
    `;
    
    diagramContainer.insertAdjacentHTML('beforeend', html);

    const svg = document.getElementById('diagram-svg');
    
    // Configuración del diagrama con más espacio superior
    const element_spacing = 300;
    const horizontalMargin = 150;
    const topMargin = 100;
    const baseHeight = 50;
    const diagramWidth = 1200;
    const diagramHeight = (Math.max(solution.length, solution[0].length) * element_spacing) + baseHeight + topMargin;
    
    svg.style.minHeight = `${diagramHeight}px`;
    svg.setAttribute('viewBox', `0 0 ${diagramWidth} ${diagramHeight}`);

    // Definir marcadores de flecha para cada color
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    
    busColors.forEach((color, i) => {
        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        marker.setAttribute('id', `arrow-${i}`);
        marker.setAttribute('viewBox', '0 0 10 10');
        marker.setAttribute('refX', '9');
        marker.setAttribute('refY', '5');
        marker.setAttribute('markerWidth', '6');
        marker.setAttribute('markerHeight', '6');
        marker.setAttribute('orient', 'auto');
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M0,0 L10,5 L0,10 Z');
        path.setAttribute('fill', color);
        marker.appendChild(path);
        defs.appendChild(marker);
    });
    svg.appendChild(defs);

    // Posicionar buses y ciudades
    const busPositions = Array.from({length: solution.length}, (_, i) => ({
        x: horizontalMargin,
        y: topMargin + baseHeight/2 + i * element_spacing
    }));
    
    const cityPositions = Array.from({length: solution[0].length}, (_, i) => ({
        x: diagramWidth - horizontalMargin,
        y: topMargin + baseHeight/2 + i * element_spacing
    }));

    // Dibujar buses
    busPositions.forEach((pos, i) => {
        const bus = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        bus.setAttribute('href', 'img/bus.png');
        bus.setAttribute('x', pos.x - 35);
        bus.setAttribute('y', pos.y - 30);
        bus.setAttribute('width', '50');
        bus.setAttribute('height', '50');
        svg.appendChild(bus);
        
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', pos.x);
        text.setAttribute('y', pos.y - 40);
        text.textContent = `Bus ${i + 1}`;
        svg.appendChild(text);
    });

    // Dibujar ciudades
    cityPositions.forEach((pos, i) => {
        const city = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        city.setAttribute('href', 'img/cityscape.png');
        city.setAttribute('x', pos.x - 30);
        city.setAttribute('y', pos.y - 30);
        city.setAttribute('width', '60');
        city.setAttribute('height', '60');
        svg.appendChild(city);
        
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', pos.x - 50);
        text.setAttribute('y', pos.y - 45);
        text.textContent = `Ciudad ${i + 1}`;
        svg.appendChild(text);
    });

    // Dibujar conexiones
    busPositions.forEach((busPos, i) => {
        cityPositions.forEach((cityPos, j) => {
            if (solution[i][j] > 0) {
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', busPos.x + 50);
                line.setAttribute('y1', busPos.y);
                line.setAttribute('x2', cityPos.x);
                line.setAttribute('y2', cityPos.y);
                line.setAttribute('stroke', busColors[i % busColors.length]);
                line.setAttribute('stroke-width', '2');
                line.setAttribute('marker-end', `url(#arrow-${i})`);
                svg.appendChild(line);

                // Calcular posiciones para etiquetas
                const dx = cityPos.x - busPos.x;
                const dy = cityPos.y - busPos.y;
                const labelOffset = 30;

                // Etiqueta x cerca del bus
                const xLabelX = busPos.x + (dx * 0.3);
                const xLabelY = busPos.y + (dy * 0.3) - labelOffset;
                const xLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                xLabel.setAttribute('x', xLabelX);
                xLabel.setAttribute('y', xLabelY);
                xLabel.setAttribute('class', 'diagram-label');
                xLabel.setAttribute('fill', busColors[i % busColors.length]);
                xLabel.textContent = `x${i+1}${j+1}=${costs[i][j]}`;
                svg.appendChild(xLabel);

                // Etiqueta c cerca de la ciudad
                const cLabelX = busPos.x + (dx * 0.7);
                const cLabelY = busPos.y + (dy * 0.7) - labelOffset;
                const cLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                cLabel.setAttribute('x', cLabelX);
                cLabel.setAttribute('y', cLabelY);
                cLabel.setAttribute('class', 'diagram-label');
                cLabel.setAttribute('fill', busColors[i % busColors.length]);
                cLabel.textContent = `c${i+1}${j+1}=${solution[i][j]}`;
                svg.appendChild(cLabel);
            }
        });
    });

    // Estilos
    const styles = document.createElement('style');
    styles.textContent = `
        #diagram-container {
            position: relative;
            min-height: ${diagramHeight}px;
            padding: 20px;
            margin-top: 20px;
        }
        #diagram-svg {
            width: 100%;
            height: 100%;
        }
        .diagram-label {
            font-size: 14px;
            font-weight: bold;
            text-shadow: 1px 1px 2px white, -1px -1px 2px white;
            dominant-baseline: middle;
            text-anchor: middle;
        }
    `;
    document.head.appendChild(styles);
}
