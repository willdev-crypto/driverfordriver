// Função para calcular o preço
function calculatePrice() {
    const pricePerKm = 2.00;
    const pickup = document.getElementById("pickup-location").value;
    const dropoff = document.getElementById("dropoff-location").value;

    if (pickup && dropoff) {
        calculateDistance(pickup, dropoff).then(distance => {
            if (distance !== null) {
                const price = distance * pricePerKm;
                document.getElementById('price-output').innerText = `Preço estimado: R$${price.toFixed(2)}`;
            } else {
                document.getElementById('price-output').innerText = 'Erro ao calcular a distância. Verifique os endereços.';
            }
        });
    } else {
        document.getElementById('price-output').innerText = 'Por favor, preencha todos os campos.';
    }
}

function calculateDistance(pickup, dropoff) {
    const nominatimUrl = 'https://nominatim.openstreetmap.org/search?format=json&q=';

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
    const R = 6371; // Raio da Terra em km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distância em km
}

function deg2rad(deg) {
    return deg * (Math.PI/180);
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
    // Adicionar lógica de validação de login aqui
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
    // Adicionar lógica de validação e armazenamento de dados aqui
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
