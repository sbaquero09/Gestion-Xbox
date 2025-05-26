document.addEventListener('DOMContentLoaded', function() {
    // Animación de aparición escalonada para elementos
    const items = document.querySelectorAll('.animate-item');
    items.forEach((item, index) => {
        item.style.animationDelay = `${index * 0.1}s`;
    });

    // Efecto hover para elementos de reserva
    document.querySelectorAll('.reservation-item').forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.boxShadow = '0 0 15px rgba(16, 124, 16, 0.2)';
            this.querySelector('.student-id').classList.add('glow');
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.boxShadow = 'none';
            this.querySelector('.student-id').classList.remove('glow');
        });
    });

    // Inicializar tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Efecto al agregar nueva reserva (simulado)
    const addBtn = document.querySelector('.add-reservation-btn');
    if (addBtn) {
        addBtn.addEventListener('click', function(e) {
            if (!this.href) e.preventDefault();
            
            // Efecto visual
            this.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Cargando...';
            this.classList.add('disabled');
            
            // Simular carga
            setTimeout(() => {
                if (this.href) {
                    window.location.href = this.href;
                }
            }, 800);
        });
    }

    // Mostrar notificación al agregar reserva desde URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('added')) {
        showNotification('Reserva agregada exitosamente!', 'success');
    }

    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2"></i>
            ${message}
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
});