// Objeto para mantener los datos cargados
let diagramData = null;

// Al cargar la página
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

// Generar la matriz de inputs y resumen
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

// Validación de suma de ofertas y demandas
function addSumValidationListeners() {
    document.querySelectorAll('.offer-input, .demand-input').forEach(input => {
        input.addEventListener('input', validateSums);
        input.addEventListener('change', validateSums);
    });
}
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
    if (!sumDiv) {
        sumDiv = document.createElement('div');
        sumDiv.id = 'sum-validation';
        document.getElementById('data-matrix').appendChild(sumDiv);
    }
    sumDiv.innerHTML = sumHtml;

    // Deshabilitar el botón si no son iguales
    const btn = document.querySelector('button[onclick="calcularEsquinaNoroeste()"]');
    if (btn) btn.disabled = !(totalOffers === totalDemands);

    return totalOffers === totalDemands;
}

// Validación de valores numéricos
function validateValue(input) {
    let value = input.value.replace(/[^\d]/g, '');
    if (value === '') value = '0';
    input.value = Math.max(0, parseInt(value));
}

// Método de la esquina noroeste
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
    // Matriz de costos (corregido con verificación)
    const costs = buses.map(busKey =>
        cities.map(city => {
            const costInput = document.querySelector(`#cost_${busKey}_${city}`);
            return costInput ? parseInt(costInput.value) || 0 : 0;
        })
    );

    // Resolver método noroeste
    const solution = northwestCornerAlgorithm([...offers], [...demands]);

    // Mostrar resultados
    displayResults(solution, costs, offers, demands);
}

// Algoritmo de la esquina noroeste (devuelve matriz de asignaciones)
function northwestCornerAlgorithm(offers, demands) {
    const m = offers.length;
    const n = demands.length;
    const sol = Array(m).fill().map(()=>Array(n).fill(0));
    let i=0, j=0;
    while(i<m && j<n){
        const asignar = Math.min(offers[i], demands[j]);
        sol[i][j] = asignar;
        offers[i] -= asignar;
        demands[j] -= asignar;
        if(offers[i]===0 && i<m-1) i++;
        else if(demands[j]===0 && j<n-1) j++;
        else if(offers[i]===0 && demands[j]===0) { i++; j++; }
    }
    return sol;
}

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