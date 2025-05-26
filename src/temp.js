// Generar función objetivo
let objectiveFunction = 'Min Z = ';
const terms = [];

Object.keys(diagramData.buses).forEach((busKey, i) => {
    diagramData.cities.forEach((city, j) => {
        const cost = costsMatrix[i][j];
        if (cost > 0) {
            terms.push(`${cost}x${i+1}${j+1}`);
        }
    });
});

objectiveFunction += terms.join(' + ');

// Generar restricciones de oferta
const supplyConstraints = offers.map((supply, i) => {
    const rowTerms = [];
    for (let j = 0; j < diagramData.cities.length; j++) {
        rowTerms.push(`x${i+1}${j+1}`);
    }
    return `${rowTerms.join(' + ')} ≤ ${supply}`;
});

// Generar restricciones de demanda
const demandConstraints = demands.map((demand, j) => {
    const colTerms = [];
    for (let i = 0; i < Object.keys(diagramData.buses).length; i++) {
        colTerms.push(`x${i+1}${j+1}`);
    }
    return `${colTerms.join(' + ')} = ${demand}`;
});

// Crear el HTML del modelo matemático
modelDiv.innerHTML = `
    <div class="card-header bg-primary text-white">
        <h4 class="mb-0">Modelo Matemático</h4>
    </div>
    <div class="card-body">
        <div class="mb-4">
            <h5>Función Objetivo (Minimizar costos):</h5>
            <div class="p-2 bg-light">${objectiveFunction}</div>
        </div>
        
        <div class="mb-4">
            <h5>Restricciones de oferta:</h5>
            <div class="p-2 bg-light">
                ${supplyConstraints.map(constraint => `<div>${constraint}</div>`).join('')}
            </div>
        </div>
        
        <div class="mb-4">
            <h5>Restricciones de demanda:</h5>
            <div class="p-2 bg-light">
                ${demandConstraints.map(constraint => `<div>${constraint}</div>`).join('')}
            </div>
        </div>
    </div>
`;

// Insertar el modelo matemático antes de los resultados
const resultsDiv = document.getElementById('results');
resultsDiv.parentNode.insertBefore(modelDiv, resultsDiv);