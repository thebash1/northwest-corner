document.addEventListener('DOMContentLoaded', () => {
    const modal = document.querySelector('.modal');
    const btnAbrir = document.getElementById('modalFunctObj');
    const btnCerrar = document.querySelector('.btn-close');
    
    // Función para alternar la modal
    function toggleModal() {
        modal.classList.toggle('show');
        document.body.style.overflow = modal.classList.contains('show') ? 'hidden' : '';
    }

    // Event Listeners
    btnAbrir.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleModal();
    });

    btnCerrar.addEventListener('click', toggleModal);

    // Cerrar al hacer clic fuera
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            toggleModal();
        }
    });

    // Cerrar con ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            toggleModal();
        }
    });

    // Prevenir conflictos con otros elementos
    document.querySelectorAll('.modal-content').forEach(element => {
        element.addEventListener('click', (e) => e.stopPropagation());
    });
});