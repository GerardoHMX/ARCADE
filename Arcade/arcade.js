// Agregar al final del archivo o donde manejas el botón de música

const musicBtn = document.getElementById('musicBtn');

musicBtn.addEventListener('click', () => {
    musicBtn.classList.toggle('muted');
    // Tu lógica existente para silenciar/activar la música
});