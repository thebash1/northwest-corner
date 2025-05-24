function calcularEsquinaNoroeste() {
    const buses = 3;
    const ciudades = 3;
    
    // Obtener valores de oferta
    let oferta = [];
    for(let i = 0; i < buses; i++) {
        oferta[i] = parseInt(document.getElementById(`oferta${i}`).value) || 0;
    }
    
    // Obtener valores de demanda
    let demanda = [];
    for(let i = 0; i < ciudades; i++) {
        demanda[i] = parseInt(document.getElementById(`demanda${i}`).value) || 0;
    }
    
    // Obtener matriz de costos
    let costos = Array(buses).fill().map(() => Array(ciudades).fill(0));
    for(let i = 0; i < buses; i++) {
        for(let j = 0; j < ciudades; j++) {
            costos[i][j] = parseInt(document.getElementById(`costo${i}_${j}`).value) || 0;
        }
    }
    
    // Copiar arrays para no modificar los originales
    let ofertaTemp = [...oferta];
    let demandaTemp = [...demanda];
    
    // Matriz de resultados
    let resultado = Array(buses).fill().map(() => Array(ciudades).fill(0));
    
    // Aplicar método de la esquina noroeste
    let i = 0, j = 0;
    while(i < buses && j < ciudades) {
        let cantidad = Math.min(ofertaTemp[i], demandaTemp[j]);
        resultado[i][j] = cantidad;
        
        ofertaTemp[i] -= cantidad;
        demandaTemp[j] -= cantidad;
        
        if(ofertaTemp[i] === 0) i++;
        if(demandaTemp[j] === 0) j++;
    }
    
    // Calcular costo total
    let costoTotal = 0;
    for(let i = 0; i < buses; i++) {
        for(let j = 0; j < ciudades; j++) {
            costoTotal += resultado[i][j] * costos[i][j];
        }
    }
    
    // Mostrar resultados
    mostrarResultados(resultado, costoTotal);
}

function mostrarResultados(resultado, costoTotal) {
    const resultadoDiv = document.getElementById('resultado');
    let html = '<h2>Resultados</h2>';
    html += '<table>';
    
    // Encabezados
    html += '<tr><td></td>';
    for(let j = 0; j < resultado[0].length; j++) {
        html += `<td>Ciudad ${j + 1}</td>`;
    }
    html += '</tr>';
    
    // Datos
    for(let i = 0; i < resultado.length; i++) {
        html += `<tr><td>Bus ${i + 1}</td>`;
        for(let j = 0; j < resultado[i].length; j++) {
            html += `<td>${resultado[i][j]}</td>`;
        }
        html += '</tr>';
    }
    html += '</table>';
    
    html += `<p>Costo Total: ${costoTotal}</p>`;
    resultadoDiv.innerHTML = html;
}