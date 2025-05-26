// Llama a esta función cuando quieras mostrar el modelo matemático (por ejemplo, al pulsar un botón)
function generarModeloMatematicoNorthwest() {
    // Asegúrate de que diagramData está cargado y la matriz en DOM
    if (!window.diagramData || !diagramData.buses || !diagramData.cities) {
        alert("Primero debes cargar los datos y generar la matriz.");
        return;
    }

    const buses = Object.keys(diagramData.buses);
    const cities = diagramData.cities;

    // -------- FUNCIÓN OBJETIVO --------
    let fo = "Min Z = ";
    const terms = [];
    for (let i = 0; i < buses.length; i++) {
        for (let j = 0; j < cities.length; j++) {
            const bus = buses[i];
            const city = cities[j];
            const costo = document.querySelector(`#cost_${bus}_${city}`)?.value || 0;
            const pasajeros = document.querySelector(`#passengers_${bus}_${city}`)?.value || 0;
            terms.push(`${costo}×${pasajeros}`);
        }
    }
    fo += terms.join(" + ");

    // -------- RESTRICCIONES DE OFERTA --------
    let restOferta = "";
    for (let i = 0; i < buses.length; i++) {
        const bus = buses[i];
        const oferta = document.querySelector(`#offer_${bus}`)?.value || 0;
        const sumandos = [];
        for (let j = 0; j < cities.length; j++) {
            const city = cities[j];
            const pasajeros = document.querySelector(`#passengers_${bus}_${city}`)?.value || 0;
            sumandos.push(pasajeros);
        }
        restOferta += `${sumandos.join(" + ")} ≤ ${oferta}<br>`;
    }

    // -------- RESTRICCIONES DE DEMANDA --------
    let restDemanda = "";
    for (let j = 0; j < cities.length; j++) {
        const city = cities[j];
        const demanda = document.querySelector(`#demand_${city}`)?.value || 0;
        const sumandos = [];
        for (let i = 0; i < buses.length; i++) {
            const bus = buses[i];
            const pasajeros = document.querySelector(`#passengers_${bus}_${city}`)?.value || 0;
            sumandos.push(pasajeros);
        }
        restDemanda += `${sumandos.join(" + ")} = ${demanda}<br>`;
    }

    // -------- ENSAMBLAR EL HTML --------
    const html = `
    <div style="background:#f8f8f8;border:2px solid #28a745;padding:20px;border-radius:8px">
        <h3 style="color:#28a745;margin-bottom:18px;">Modelo Matemático</h3>
        <b>Función Objetivo (Minimizar costos):</b>
        <div style="background:#fff;padding:7px 12px;margin-bottom:20px;border-radius:6px;font-family:monospace;">${fo}</div>
        <b>Restricciones de oferta:</b>
        <div style="background:#fff;padding:7px 12px;margin-bottom:20px;border-radius:6px;font-family:monospace;">${restOferta}</div>
        <b>Restricciones de demanda:</b>
        <div style="background:#fff;padding:7px 12px;border-radius:6px;font-family:monospace;">${restDemanda}</div>
    </div>
    `;

    // Muestra el modelo en el div correspondiente
    const contenedor = document.getElementById('modelo-matematico');
    if (contenedor) {
        contenedor.innerHTML = html;
    } else {
        alert("No se encontró el contenedor 'modelo-matematico' en el HTML.");
    }
}

function updateSumValidationDisplay(totalOferta, totalDemanda) {
    document.getElementById('total-oferta').textContent = totalOferta;
    document.getElementById('total-demanda').textContent = totalDemanda;

    const statusElement = document.getElementById('sum-status');
    const calcularButton = document.querySelector('button[onclick="calcularEsquinaNoroeste()"]');

    if (totalOferta === totalDemanda) {
        statusElement.innerHTML = '<span class="text-success"><strong>✓ Las sumas son iguales</strong></span>';
        statusElement.className = 'mb-0 text-success';
        if (calcularButton) calcularButton.disabled = false; // SOLO si existe
    } else {
        statusElement.innerHTML = '<span class="text-danger"><strong>✗ Las sumas deben ser iguales</strong></span>';
        statusElement.className = 'mb-0 text-danger';
        if (calcularButton) calcularButton.disabled = true; // SOLO si existe
    }
}