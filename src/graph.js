// Clase para manejar el grafo de buses y ciudades
class TransportGraph {
    constructor() {
        this.buses = [];
        this.cities = [];
        this.connections = [];
    }

    addBus(id) {
        if (!this.buses.includes(id)) {
            this.buses.push(id);
        }
    }

    addCity(name) {
        if (!this.cities.includes(name)) {
            this.cities.push(name);
        }
    }

    addConnection(busId, cityName, type) {
        this.connections.push({
            bus: busId,
            city: cityName,
            type: type // 'pasajeros' o 'costo'
        });
    }

    toJSON() {
        return {
            buses: this.buses,
            cities: this.cities,
            connections: this.connections,
            timestamp: new Date().toISOString(),
            created_by: 'thebash1'
        };
    }
}

// Función para guardar el grafo en localStorage
function saveGraphData(graph) {
    localStorage.setItem('transportGraph', JSON.stringify(graph.toJSON()));
}

// Función para cargar el grafo desde localStorage
function loadGraphData() {
    const data = localStorage.getItem('transportGraph');
    if (data) {
        return JSON.parse(data);
    }
    return null;
}