const pricePerKm = 5.00;
const nominatimUrl = 'https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=';
const openRouteServiceApiKey = 'YOUR_OPENROUTESERVICE_API_KEY';

const map = L.map('map').setView([-23.55052, -46.633308], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

let routeLayer = null;

function calculatePrice(event) {
    event.preventDefault();

    const pickup = document.getElementById("pickup-location").value;
    const dropoff = document.getElementById("dropoff-location").value;

    if (pickup && dropoff) {
        calculateDistance(pickup, dropoff).then(distance => {
            if (distance !== null) {
                const price = distance * pricePerKm;
                document.getElementById('price-output').innerText = `Preço estimado: R$${price.toFixed(2)}`;
                plotRouteOnMap(pickup, dropoff);
            } else {
                document.getElementById('price-output').innerText = 'Erro ao calcular a distância. Verifique os endereços.';
            }
        }).catch(error => {
            document.getElementById('price-output').innerText = 'Erro ao calcular a distância. Tente novamente mais tarde.';
            console.error(error);
        });
    } else {
        document.getElementById('price-output').innerText = 'Por favor, preencha todos os campos.';
    }
}

function calculateDistance(pickup, dropoff) {
    return Promise.all([
        fetch(nominatimUrl + encodeURIComponent(pickup)).then(response => response.json()),
        fetch(nominatimUrl + encodeURIComponent(dropoff)).then(response => response.json())
    ]).then(results => {
        if (results[0].length > 0 && results[1].length > 0) {
            const pickupCoords = results[0][0];
            const dropoffCoords = results[1][0];
            return getDistanceFromLatLonInKm(pickupCoords.lat, pickupCoords.lon, dropoffCoords.lat, dropoffCoords.lon);
        } else {
            return null;
        }
    }).catch(error => {
        console.error(error);
        return null;
    });
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

function plotRouteOnMap(pickup, dropoff) {
    Promise.all([
        fetch(nominatimUrl + encodeURIComponent(pickup)).then(response => response.json()),
        fetch(nominatimUrl + encodeURIComponent(dropoff)).then(response => response.json())
    ]).then(results => {
        if (results[0].length > 0 && results[1].length > 0) {
            const pickupCoords = results[0][0];
            const dropoffCoords = results[1][0];
            if (routeLayer) map.removeLayer(routeLayer);
            const coords = [
                [pickupCoords.lat, pickupCoords.lon],
                [dropoffCoords.lat, dropoffCoords.lon]
            ];
            routeLayer = L.polyline(coords, { color: 'blue' }).addTo(map);
            map.fitBounds(routeLayer.getBounds());
        }
    }).catch(error => {
        console.error(error);
    });
}

// Inicializando o mapa
document.addEventListener("DOMContentLoaded", () => {
    const map = L.map("map").setView([-23.55052, -46.633308], 13); // Coordenadas iniciais (São Paulo)

    // Adicionando camada do OpenStreetMap
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

   
    L.marker([-23.55052, -46.633308])
        .addTo(map)
        .bindPopup("Bem-vindo ao mapa interativo!")
        .openPopup();
});
