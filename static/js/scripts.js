document.addEventListener('DOMContentLoaded', function() {
    // Efecto ripple para botones
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', function(e) {
            // Crear efecto ripple
            const ripple = document.createElement('span');
            ripple.classList.add('ripple-effect');
            
            // Posicionar el efecto
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            
            // Agregar y luego remover el efecto
            button.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
    });

    // Efectos hover para tarjetas y elementos
    const hoverElements = document.querySelectorAll('.hover-effect');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            el.style.transform = 'translateY(-5px)';
            el.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.2)';
        });
        
        el.addEventListener('mouseleave', () => {
            el.style.transform = '';
            el.style.boxShadow = '';
        });
    });

    // Confirmación para eliminación con SweetAlert
    document.querySelectorAll('.btn-delete').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const url = this.getAttribute('href');
            
            Swal.fire({
                title: '¿Eliminar reserva?',
                text: "Esta acción no se puede deshacer",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#107c10',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar',
                background: '#1a1a1a',
                color: '#f5f5f5'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = url;
                }
            });
        });
    });

    // Animación de carga para formularios
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function() {
            const submitBtn = this.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Procesando...';
                submitBtn.disabled = true;
            }
        });
    });

    // Efecto parallax para el fondo
    window.addEventListener('mousemove', function(e) {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        
        document.body.style.backgroundPosition = 
            `${x * 20}px ${y * 20}px`;
    });

    // Mostrar elementos con animación al hacer scroll
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.animate-on-scroll');
        
        elements.forEach(el => {
            const elementPosition = el.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementPosition < windowHeight - 100) {
                el.classList.add('animated');
            }
        });
    };
    
    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll(); // Ejecutar al cargar
});