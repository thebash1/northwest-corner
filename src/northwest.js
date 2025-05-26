// Objeto para mantener los datos cargados
let diagramData = null;

// Función que se ejecuta cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    loadAndValidateData();
});



// Función para cargar los datos del localStorage
function loadAndValidateData() {
    try {
        const savedData = localStorage.getItem('diagramData');
        console.log('Datos cargados:', savedData); // Para debug

        if (!savedData) {
            throw new Error('No hay datos guardados');
        }

        diagramData = JSON.parse(savedData);
        console.log('Datos parseados:', diagramData); // Para debug

        // Validar estructura de datos
        if (!diagramData.buses || !diagramData.cities) {
            throw new Error('Estructura de datos incompleta');
        }

        if (Object.keys(diagramData.buses).length === 0) {
            throw new Error('No hay datos de buses');
        }

        if (diagramData.cities.length === 0) {
            throw new Error('No hay datos de ciudades');
        }

        // Si los datos son válidos, generar la matriz
        generateInputMatrix();
        
    } catch (error) {
        console.error('Error al cargar datos:', error);
        showError(`Datos del diagrama incompletos: ${error.message}`);
        
        // Esperar 3 segundos antes de redirigir
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 3000);
    }
}

// Función para validar las sumas cuando cambian los valores
function validateSums() {
    const totalOferta = calculateTotalOffer();
    const totalDemanda = calculateTotalDemand();
    
    const sumContainer = document.getElementById('sum-validation');
    if (!sumContainer) {
        // Crear el contenedor si no existe
        createSumValidationContainer();
    }
    
    updateSumValidationDisplay(totalOferta, totalDemanda);
    
    // Retornar si las sumas son iguales
    return totalOferta === totalDemanda;
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
    const allInputs = document.querySelectorAll('.offer-input, .demand-input');
    
    allInputs.forEach(input => {
        input.addEventListener('input', function() {
            validateSums();
        });
        
        input.addEventListener('change', function() {
            validateSums();
        });
    });
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
    
    // Insertar al principio de la página
    document.body.insertBefore(alertDiv, document.body.firstChild);
}

// Función para generar la matriz de inputs
function generateInputMatrix() {
    if (!diagramData || !diagramData.buses || !diagramData.cities) {
        showError('Datos del diagrama incompletos');
        return;
    }

    const matrixContainer = document.getElementById('data-matrix');
    if (!matrixContainer) {
        showError('No se encontró el contenedor de la matriz');
        return;
    }

    // Crear tabla para la matriz
    let html = '<div class="table-responsive"><table class="table table-bordered">';
    
    // Encabezado con ciudades
    html += '<thead><tr><th></th>';
    diagramData.cities.forEach(city => {
        html += `<th class="text-center">${city}</th>`;
    });
    html += '<th>Oferta</th></tr></thead><tbody>';

    // Filas para cada bus
    Object.entries(diagramData.buses).forEach(([busKey, routes]) => {
        html += `<tr><th class="align-middle">Bus ${busKey.replace('bus', '')}</th>`;
        
        // Celdas para cada ciudad
        diagramData.cities.forEach(city => {
            const route = routes.find(r => r.ciudad === city);
            const passengers = route ? route.x : 0;
            const cost = route ? route.c : 0;
            html += `
                <td class="p-2">
                    <div class="d-flex flex-column align-items-center">
                        <div class="input-group input-group-sm w-75 mx-auto">
                            <input type="number" 
                                   class="form-control form-control-sm text-center matrix-input passengers-input" 
                                   id="passengers_${busKey}_${city}"
                                   value="${passengers}"
                                   min="0"
                                   data-bus="${busKey}"
                                   data-city="${city}"
                                   onkeydown="return validateNumberInput(event)"
                                   onpaste="return validatePaste(event)"
                                   oninput="validateValue(this)"
                                   title="Pasajeros">
                        </div>
                        <div class="input-group input-group-sm w-75 mx-auto">
                            <input type="number" 
                                   class="form-control form-control-sm text-center matrix-input cost-input" 
                                   id="cost_${busKey}_${city}"
                                   value="${cost}"
                                   min="0"
                                   data-bus="${busKey}"
                                   data-city="${city}"
                                   onkeydown="return validateNumberInput(event)"
                                   onpaste="return validatePaste(event)"
                                   oninput="validateValue(this)"
                                   title="Costo">
                        </div>
                    </div>
                </td>`;
        });

        // Celda de oferta
        const offerInput = document.querySelector(`#offer_${busKey}`);
        const offerValue = offerInput ? offerInput.value : 0;
        // Declarar e inicializar tableHtml antes de usarlo
        let tableHtml = "";
        tableHtml += `
                <td class="text-center fw-bold">${offerValue}</td>
            </tr>
        `;
    });
    // Fila de demandas
    tableHtml += `
        <tr>
            <th class="bg-secondary-subtle">Demandas</th>
    `;
    diagramData.cities.forEach((city, j) => {
        const demandInput = document.querySelector(`#demand_${city}`);
        const demandValue = demandInput ? demandInput.value : 0;
        tableHtml += `
            <td class="text-center fw-bold">${demandValue}</td>
        `;
    });
    // Celda de total
    const totalOferta = calculateTotalOffer();
    tableHtml += `
            <td class="text-center fw-bold">${totalOferta}</td>
        </tr>
    `;
    tableHtml += `
            </tbody>
        </table>
    `;
    tableDiv.innerHTML = tableHtml;
    // Crear el div para el costo total
    const costDiv = document.createElement('div');
    costDiv.className = 'text-center mt-3';
    costDiv.innerHTML = `<h4 class="fw-bold">Costo Total: <span style="color: #388e3c;">${totalCost}</span></h4>`;
    // Agregar todo al contenedor de resultados
    resultCard.appendChild(title);
    resultCard.appendChild(tableDiv);
    resultCard.appendChild(costDiv);
    // Mostrar restricciones y validación después de la tabla
    const constraintsDiv = document.createElement('div');
    constraintsDiv.className = 'mt-4';
    // Generar restricciones con los valores de la solución
    const supplyConstraints = generateSupplyConstraints(solution.map(row => row.reduce((a,b)=>a+b,0)));
    const demandConstraints = generateDemandConstraints(solution[0].map((_,j)=>solution.reduce((a,row)=>a+row[j],0)));
    // Validar restricciones
    let supplyValid = true;
    let demandValid = true;
    Object.keys(diagramData.buses).forEach((busKey, i) => {
        const offerInput = document.querySelector(`#offer_${busKey}`);
        const offerValue = offerInput ? parseInt(offerInput.value) : 0;
        const sum = solution[i].reduce((a,b)=>a+b,0);
        if(sum > offerValue) supplyValid = false;
    });
    diagramData.cities.forEach((city, j) => {
        const demandInput = document.querySelector(`#demand_${city}`);
        const demandValue = demandInput ? parseInt(demandInput.value) : 0;
        const sum = solution.map(row=>row[j]).reduce((a,b)=>a+b,0);
        if(sum !== demandValue) demandValid = false;
    });
    constraintsDiv.innerHTML = `
        <div class="card shadow-sm border-0">
            <div class="card-header bg-primary text-white rounded-top"><h4 class="mb-0 fw-bold">Restricciones del Modelo</h4></div>
            <div class="card-body bg-light">
                <div class="mb-3">
                    <h5 class="fw-bold">Restricciones de Oferta:</h5>
                    ${supplyConstraints.map((constraint, i) => `<p class="mb-1">${constraint} <span class='badge bg-${supplyValid ? "success" : "danger"}'>${supplyValid ? "Cumple" : "No cumple"}</span></p>`).join('')}
                </div>
                <div class="mb-3">
                    <h5 class="fw-bold">Restricciones de Demanda:</h5>
                    ${demandConstraints.map((constraint, i) => `<p class="mb-1">${constraint} <span class='badge bg-${demandValid ? "success" : "danger"}'>${demandValid ? "Cumple" : "No cumple"}</span></p>`).join('')}
                </div>
            </div>
        </div>
    `;
    resultCard.appendChild(constraintsDiv);
    resultsDiv.appendChild(resultCard);
}

// Función que implementa el método de la esquina noroeste
function northwestCornerMethod(matrix, offers, demands) {
    // Crear copias de los arrays para no modificar los originales
    const remainingOffers = [...offers];
    const remainingDemands = [...demands];
    const solution = Array(matrix.length).fill().map(() => Array(matrix[0].length).fill(0));
    
    // Crear un array para almacenar los pasos del algoritmo para mostrarlos después
    const steps = [];
    
    let i = 0, j = 0;
    
    // Mientras haya filas y columnas por procesar
    while (i < matrix.length && j < matrix[0].length) {
        // Calcular la cantidad a asignar (el mínimo entre oferta y demanda disponible)
        const amount = Math.min(remainingOffers[i], remainingDemands[j]);
        
        // Asignar la cantidad a la celda actual
        solution[i][j] = amount;
        
        // Guardar el paso actual para mostrar el proceso
        steps.push({
            row: i,
            col: j,
            amount: amount,
            remainingOffers: [...remainingOffers],
            remainingDemands: [...remainingDemands]
        });
        
        // Actualizar las ofertas y demandas restantes
        remainingOffers[i] -= amount;
        remainingDemands[j] -= amount;
        
        // Si la oferta se agotó, pasar a la siguiente fila
        if (remainingOffers[i] === 0) i++;
        // Si la demanda se satisfizo, pasar a la siguiente columna
        if (remainingDemands[j] === 0) j++;
    }
    
    return { solution, steps };
}

// Función para mostrar los resultados
function displayResults(solution, costsMatrix, totalCost) {
    const resultsDiv = document.getElementById('results');
    if (!resultsDiv) {
        console.error('No se encontró el contenedor de resultados');
        return;
    }

    const resultCard = document.createElement('div');
    resultCard.className = 'card mt-4';
    
    resultCard.innerHTML = `
        <div class="card-header bg-success text-white">
            <h4 class="mb-0">Resultados del Método de la Esquina Noroeste</h4>
        </div>
        <div class="card-body">
            <div class="table-responsive">
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th></th>
                            ${diagramData.cities.map(city => `<th class="text-center">${city}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.keys(diagramData.buses).map((busKey, i) => `
                            <tr>
                                <th>Bus ${busKey.replace('bus', '')}</th>
                                ${solution[i].map((value, j) => `
                                    <td class="text-center">
                                        <div class="font-weight-bold">Asignación: ${value}</div>
                                        <div class="text-muted">Costo: ${costsMatrix[i][j]}</div>
                                        <div class="text-info">Subtotal: ${value * costsMatrix[i][j]}</div>
                                    </td>
                                `).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <div class="mt-3">
                <h5 class="text-primary">Costo Total de Transporte: ${totalCost}</h5>
                <p class="text-muted">
                    Nota: Esta es la solución inicial usando el método de la esquina noroeste. 
                    No necesariamente es la solución óptima del problema de transporte.
                </p>
            </div>
        </div>
    `;
    
    resultsDiv.appendChild(resultCard);
}

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

// Función para validar el valor después de la entrada
function validateValue(input) {
    // Remover cualquier carácter no numérico
    let value = input.value.replace(/[^\d]/g, '');
    
    // Si está vacío, establecer a 0
    if (value === '') {
        value = '0';
    }
    
    // Convertir a número y asegurarse que sea positivo
    value = Math.max(0, parseInt(value));
    
    // Actualizar el valor del input
    input.value = value;
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