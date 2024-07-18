const pricePerKm = 5.00;
const nominatimUrl = 'https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=';
const openRouteServiceApiKey = 'YOUR_OPENROUTESERVICE_API_KEY';

// Inicializa o mapa
const map = L.map('map').setView([-23.55052, -46.633308], 13); // São Paulo como centro inicial
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

let routeLayer = null;

// Função para calcular o preço e exibir a rota no mapa
function calculatePrice() {
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

// Função para calcular a distância entre dois endereços
function calculateDistance(pickup, dropoff) {
    return Promise.all([
        fetch(nominatimUrl + encodeURIComponent(pickup)).then(response => response.json()),
        fetch(nominatimUrl + encodeURIComponent(dropoff)).then(response => response.json())
    ]).then(results => {
        if (results[0].length > 0 && results[1].length > 0) {
            const pickupCoords = getBestMatch(results[0]);
            const dropoffCoords = getBestMatch(results[1]);
            if (pickupCoords && dropoffCoords) {
                return getDistanceFromLatLonInKm(pickupCoords.lat, pickupCoords.lon, dropoffCoords.lat, dropoffCoords.lon);
            } else {
                return null;
            }
        } else {
            return null;
        }
    }).catch(error => {
        console.error(error);
        return null;
    });
}

// Função para obter a melhor correspondência a partir dos resultados da pesquisa
function getBestMatch(results) {
    for (let result of results) {
        if (result.address && result.address.road) {
            return result;
        }
    }
    return results[0];
}

// Função para calcular a distância entre duas coordenadas
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Função para converter graus em radianos
function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

// Função para exibir a rota no mapa usando a API OpenRouteService
function plotRouteOnMap(pickup, dropoff) {
    Promise.all([
        fetch(nominatimUrl + encodeURIComponent(pickup)).then(response => response.json()),
        fetch(nominatimUrl + encodeURIComponent(dropoff)).then(response => response.json())
    ]).then(results => {
        if (results[0].length > 0 && results[1].length > 0) {
            const pickupCoords = getBestMatch(results[0]);
            const dropoffCoords = getBestMatch(results[1]);
            if (pickupCoords && dropoffCoords) {
                const coords = [
                    [pickupCoords.lat, pickupCoords.lon],
                    [dropoffCoords.lat, dropoffCoords.lon]
                ];

                fetch(`https://api.openrouteservice.org/v2/directions/driving-car?api_key=${openRouteServiceApiKey}&start=${coords[0][1]},${coords[0][0]}&end=${coords[1][1]},${coords[1][0]}`)
                    .then(response => response.json())
                    .then(data => {
                        if (routeLayer) {
                            map.removeLayer(routeLayer);
                        }
                        const routeCoords = data.features[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
                        routeLayer = L.polyline(routeCoords, { color: 'blue' }).addTo(map);
                        map.fitBounds(routeLayer.getBounds());
                    }).catch(error => {
                        console.error(error);
                    });
            }
        }
    }).catch(error => {
        console.error(error);
    });
}

// Funções para exibir e fechar modais
function showModal(modalId) {
    document.getElementById(modalId).style.display = "block";
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = "none";
}

// Função para validar e submeter formulário de login
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const rg = document.getElementById('loginRg').value;
    const password = document.getElementById('loginPassword').value;
    alert(`Login com RG: ${rg}`);
    closeModal('loginModal');
});

// Função para validar e submeter formulário de cadastro
document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const rg = document.getElementById('registerRg').value;
    const phone = document.getElementById('registerPhone').value;
    const address = document.getElementById('registerAddress').value;
    const workAddress = document.getElementById('registerWorkAddress').value;
    const password = document.getElementById('registerPassword').value;
    const photo = document.getElementById('registerPhoto').files[0];
    alert(`Cadastro realizado com sucesso para o RG: ${rg}`);
    closeModal('registerModal');
});

// Função para adicionar sistema de avaliação
function addRating(rating) {
    const ratingValue = parseInt(rating);
    if (ratingValue >= 0 && ratingValue <= 5) {
        alert(`Avaliação: ${ratingValue} estrelas`);
    } else {
        alert('Avaliação inválida. Deve ser entre 0 e 5.');
    }
}

// Função para aplicar cupons de desconto
function applyCoupon(couponCode) {
    const discount = 0.1; // 10% de desconto
    const totalPrice = calculatePrice(); // Calcular o preço total antes do desconto
    if (couponCode === 'VALID_COUPON') { // Verificar se o cupom é válido
        const discountedPrice = totalPrice * (1 - discount);
        alert(`Preço com desconto: R$${discountedPrice.toFixed(2)}`);
    } else {
        alert('Cupom inválido');
    }
}
