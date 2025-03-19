document.addEventListener('DOMContentLoaded', () => {
    const loadingScreen = document.querySelector('.loading-screen');
    const pressStart = document.querySelector('.press-start');
    const bgMusic = document.getElementById('bgMusic');
    const musicToggle = document.getElementById('musicToggle');
    let coinInserted = false;

    // Inicializar sonidos
    const startSound = new Audio('assets/sounds/start.mp3');
    const coinSound = new Audio('assets/sounds/coin.mp3');

    // Función para ocultar la pantalla de carga
    function hideLoadingScreen() {
        loadingScreen.classList.add('hidden');
    }

    // Click en PRESS START
    pressStart.addEventListener('click', () => {
        if (coinInserted) {
            startTransition();
        }
    });

    // También mantener la opción de tecla Enter
    document.addEventListener('keypress', (e) => {
        if (e.code === 'Enter' && coinInserted) {
            startTransition();
        }
    });

    // Función para la transición
    function startTransition() {
        startSound.play().catch(error => console.log('Error reproduciendo sonido:', error));
        hideLoadingScreen();
        
        // Iniciar música de fondo después de la animación
        setTimeout(() => {
            bgMusic.play().catch(error => console.log('Error reproduciendo música:', error));
            musicToggle.classList.add('active');
            loadingScreen.style.display = 'none';
        }, 800);
    }

    // Insertar moneda
    document.addEventListener('keypress', (e) => {
        if (e.code === 'Space' && !coinInserted) {
            coinSound.play().catch(error => console.log('Error reproduciendo sonido:', error));
            coinInserted = true;
            pressStart.style.opacity = '1';
            pressStart.style.animation = 'fadeInOut 2s infinite';
            pressStart.style.cursor = 'pointer';
            pressStart.classList.add('neon', 'neon-blue');
        }
    });
});
