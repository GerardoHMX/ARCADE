const hoverSound = new Audio('assets/sounds/hover.mp3');
const clickSound = new Audio('assets/sounds/click.mp3');
const coinSound = new Audio('assets/sounds/coin.mp3');
const bgMusic = document.getElementById('bgMusic');
const musicToggle = document.getElementById('musicToggle');

// Efectos de sonido
document.querySelectorAll('.game-card, .play-button').forEach(element => {
    element.addEventListener('mouseenter', () => {
        hoverSound.currentTime = 0;
        hoverSound.play();
    });
});

document.querySelectorAll('.play-button').forEach(button => {
    button.addEventListener('click', () => {
        clickSound.currentTime = 0;
        clickSound.play();
    });
});

// Control de música de fondo
musicToggle.addEventListener('click', () => {
    if (bgMusic.paused) {
        bgMusic.play();
        musicToggle.classList.add('active');
    } else {
        bgMusic.pause();
        musicToggle.classList.remove('active');
    }
});