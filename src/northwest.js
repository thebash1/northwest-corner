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
    matrixContainer.parentNode.insertBefore(container, matrixContainer.nextSibling);
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
        html += `<tr><th>Bus ${busKey.replace('bus', '')}</th>`;
        
        // Celdas para cada ciudad
        diagramData.cities.forEach(city => {
            const route = routes.find(r => r.cityName === city);
            const value = route ? route.passengers : 0;
            html += `
                <td>
                    <input type="number" 
                           class="form-control form-control-sm text-center matrix-input" 
                           id="input_${busKey}_${city}"
                           value="${value}"
                           min="0"
                           onkeydown="return validateNumberInput(event)"
                           onpaste="return validatePaste(event)"
                           oninput="validateValue(this)">
                </td>`;
        });

        // Celda de oferta
        html += `
            <td>
                <input type="number" 
                       class="form-control form-control-sm text-center offer-input" 
                       id="offer_${busKey}"
                       value="0"
                       min="0"
                       onkeydown="return validateNumberInput(event)"
                       onpaste="return validatePaste(event)"
                       oninput="validateValue(this)">
            </td>
        </tr>`;
    });

    // Fila de demanda
    html += '<tr><th>Demanda</th>';
    diagramData.cities.forEach(city => {
        html += `
            <td>
                <input type="number" 
                       class="form-control form-control-sm text-center demand-input" 
                       id="demand_${city}"
                       value="0"
                       min="0"
                       onkeydown="return validateNumberInput(event)"
                       onpaste="return validatePaste(event)"
                       oninput="validateValue(this)">
            </td>`;
    });
    html += '<td></td></tr>';

    html += '</tbody></table></div>';
    
    matrixContainer.innerHTML = html;
    
    addSumValidationListeners();
    createSumValidationContainer();
    validateSums(); // Validación inicial

    // Añadir resumen de datos
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

// Función para calcular el método de la esquina noroeste
function calcularEsquinaNoroeste() {
    
    if (!validateSums()) {
        showError('Las sumas de ofertas y demandas deben ser iguales para calcular');
        return;
    }

    // Obtener valores de la matriz
    const matrix = [];
    const offers = [];
    const demands = [];
    
    // Recolectar ofertas
    document.querySelectorAll('.offer-input').forEach(input => {
        offers.push(parseInt(input.value) || 0);
    });
    
    // Recolectar demandas
    document.querySelectorAll('.demand-input').forEach(input => {
        demands.push(parseInt(input.value) || 0);
    });
    
    // Recolectar valores de la matriz
    Object.keys(diagramData.buses).forEach((busKey, i) => {
        const row = [];
        diagramData.cities.forEach((city, j) => {
            const input = document.querySelector(`#input_${busKey}_${city}`);
            row.push(parseInt(input.value) || 0);
        });
        matrix.push(row);
    });
    
    // Aquí va tu lógica existente del método de la esquina noroeste...
    const result = northwestCornerMethod(matrix, offers, demands);
    displayResults(result);
}

// Función que implementa el método de la esquina noroeste
function northwestCornerMethod(matrix, offers, demands) {
    // Crear copias de los arrays para no modificar los originales
    const remainingOffers = [...offers];
    const remainingDemands = [...demands];
    const solution = Array(matrix.length).fill().map(() => Array(matrix[0].length).fill(0));
    
    let i = 0, j = 0;
    
    while (i < matrix.length && j < matrix[0].length) {
        const amount = Math.min(remainingOffers[i], remainingDemands[j]);
        solution[i][j] = amount;
        
        remainingOffers[i] -= amount;
        remainingDemands[j] -= amount;
        
        if (remainingOffers[i] === 0) i++;
        if (remainingDemands[j] === 0) j++;
    }
    
    return solution;
}

// Función para mostrar los resultados
function displayResults(solution) {
    const resultsDiv = document.getElementById('results');
    
    let html = `
        <div class="card mt-4">
            <div class="card-header bg-success text-white">
                <h4 class="mb-0">Resultados</h4>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-bordered">
                        <thead>
                            <tr>
                                <th></th>
                                ${diagramData.cities.map(city => `<th>${city}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
    `;
    
    Object.keys(diagramData.buses).forEach((busKey, i) => {
        html += `
            <tr>
                <th>Bus ${busKey.replace('bus', '')}</th>
                ${solution[i].map(value => `<td>${value}</td>`).join('')}
            </tr>
        `;
    });
    
    html += `
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    resultsDiv.innerHTML = html;
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