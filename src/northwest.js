// Objeto para mantener los datos cargados
let diagramData = null;

// Función que se ejecuta cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    const savedData = localStorage.getItem('diagramData');
    if (!savedData) {
        showError('No hay datos del diagrama disponibles');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return;
    }

    try {
        const diagramData = JSON.parse(savedData);
        generateInputMatrix(diagramData);
    } catch (error) {
        console.error('Error al cargar los datos:', error);
        showError('Error al procesar los datos del diagrama');
    }
});

// Función para cargar los datos del localStorage
function loadDiagramData() {
    const savedData = localStorage.getItem('diagramData');
    if (!savedData) {
        showError('No hay datos del diagrama disponibles');
        return;
    }

    try {
        diagramData = JSON.parse(savedData);
        generateInputMatrix();
    } catch (error) {
        showError('Error al cargar los datos del diagrama');
        console.error(error);
    }
}

// Función para mostrar errores
function showError(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger';
    alertDiv.textContent = message;
    document.getElementById('diagram-data').appendChild(alertDiv);
}

// Función para generar la matriz de inputs
function generateInputMatrix() {
    if (!diagramData || !diagramData.buses || !diagramData.cities) {
        showError('Datos del diagrama incompletos');
        return;
    }

    const matrixContainer = document.getElementById('data-matrix');
    
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
            const route = routes.find(r => r.city === city);
            const value = route ? route.passengers : 0;
            html += `
                <td>
                    <input type="number" 
                           class="form-control form-control-sm text-center matrix-input" 
                           id="input_${busKey}_${city}"
                           value="${value}"
                           min="0">
                </td>`;
        });

        // Celda de oferta
        html += `
            <td>
                <input type="number" 
                       class="form-control form-control-sm text-center offer-input" 
                       id="offer_${busKey}"
                       value="0"
                       min="0">
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
                       min="0">
            </td>`;
    });
    html += '<td></td></tr>';

    html += '</tbody></table></div>';
    
    matrixContainer.innerHTML = html;

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
    // Obtener los datos de la matriz
    const matrix = [];
    const offers = [];
    const demands = [];

    // Recolectar ofertas y demandas
    Object.keys(diagramData.buses).forEach(busKey => {
        const offer = parseInt(document.getElementById(`offer_${busKey}`).value) || 0;
        offers.push(offer);
        
        const row = [];
        diagramData.cities.forEach(city => {
            const value = parseInt(document.getElementById(`input_${busKey}_${city}`).value) || 0;
            row.push(value);
        });
        matrix.push(row);
    });

    diagramData.cities.forEach(city => {
        const demand = parseInt(document.getElementById(`demand_${city}`).value) || 0;
        demands.push(demand);
    });

    // Validar que la suma de ofertas sea igual a la suma de demandas
    const totalOffer = offers.reduce((sum, val) => sum + val, 0);
    const totalDemand = demands.reduce((sum, val) => sum + val, 0);

    if (totalOffer !== totalDemand) {
        showError('La suma de ofertas debe ser igual a la suma de demandas');
        return;
    }

    // Aquí implementas el algoritmo de la esquina noroeste
    const result = northwestCornerMethod(matrix, offers, demands);
    
    // Mostrar resultados
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