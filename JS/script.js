document.addEventListener("DOMContentLoaded", () => {
    
    // --- 0. LÓGICA DE LA PANTALLA DE BIENVENIDA (INTRO) Y MÚSICA ---
    const welcomeScreen = document.getElementById('welcome-screen');
    const invitationContent = document.querySelector('.invitation-content');
    const enterButton = document.getElementById('enter-button');
    const backgroundMusic = document.getElementById('background-music');
    const musicToggleButton = document.getElementById('music-toggle');
    const musicIcon = musicToggleButton.querySelector('i');
    let isPlaying = false;

    function startInvitation() {
        if (!welcomeScreen.classList.contains('hidden')) {
            welcomeScreen.classList.add('hidden');
            invitationContent.classList.remove('hidden');
            
            backgroundMusic.play().then(() => {
                musicIcon.classList.remove('fa-music');
                musicIcon.classList.add('fa-volume-up');
                musicToggleButton.classList.add('playing');
                isPlaying = true;
            }).catch(error => {
                console.log("Música bloqueada. El usuario debe usar el botón flotante.");
                musicIcon.classList.remove('fa-volume-up');
                musicIcon.classList.add('fa-music');
                musicToggleButton.classList.remove('playing');
                isPlaying = false;
            });
        }
    }

    enterButton.addEventListener('click', startInvitation);
    
    function toggleMusic() {
        if (isPlaying) {
            backgroundMusic.pause();
            musicIcon.classList.remove('fa-volume-up');
            musicIcon.classList.add('fa-music');
            musicToggleButton.classList.remove('playing');
            isPlaying = false;
        } else {
            backgroundMusic.play().catch(error => console.error("Error al reproducir:", error));
            musicIcon.classList.remove('fa-music');
            musicIcon.classList.add('fa-volume-up');
            musicToggleButton.classList.add('playing');
            isPlaying = true;
        }
    }
    musicToggleButton.addEventListener('click', toggleMusic);


    // --- 1. LÓGICA DEL CONTADOR (DÍAS, HORAS, MINUTOS, SEGUNDOS) ---
    
    // ✅ CORRECCIÓN DE FECHA (Formato Numérico para evitar NaN)
    // new Date(Año, Mes, Día, Hora, Minuto, Segundo)
    // IMPORTANTE: Los meses en JavaScript cuentan desde 0 (Enero=0, Diciembre=11)
    const targetDate = new Date(2025, 11, 20, 20, 0, 0).getTime(); 
    
    const countdownFunction = setInterval(() => {
        const now = new Date().getTime();
        const distance = targetDate - now;

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Asegura que los elementos existan antes de actualizarlos
        if (document.getElementById("days")) {
            document.getElementById("days").innerText = String(days).padStart(2, '0');
            document.getElementById("hours").innerText = String(hours).padStart(2, '0');
            document.getElementById("minutes").innerText = String(minutes).padStart(2, '0');
            document.getElementById("seconds").innerText = String(seconds).padStart(2, '0');
        }

        if (distance < 0) {
            clearInterval(countdownFunction);
            if (document.getElementById("countdown")) {
                document.getElementById("countdown").innerHTML = "<h3>¡La fiesta ha comenzado!</h3>";
            }
        }
    }, 1000);

    // --- 2. LÓGICA DE ANIMACIÓN DE SCROLL ---
    const elementsToAnimate = document.querySelectorAll(".animate-on-scroll");
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
            }
        });
    }, { threshold: 0.1 });
    
    setTimeout(() => {
        elementsToAnimate.forEach(element => { observer.observe(element); });
    }, 500); 


    // --- 3. LÓGICA DEL MODAL Y CONFIRMACIÓN (PDF + WA SOLAMENTE) ---

    const modal = document.getElementById("rsvp-modal");
    const openModalBtn = document.getElementById("open-modal-button");
    const closeBtn = document.querySelector(".close-button");
    const rsvpForm = document.getElementById("rsvp-form");
    
    if (openModalBtn) {
        openModalBtn.addEventListener('click', () => { modal.style.display = "block"; });
    }
    if (closeBtn) {
        closeBtn.addEventListener('click', () => { modal.style.display = "none"; });
    }
    window.addEventListener('click', (event) => {
        if (event.target == modal) { modal.style.display = "none"; }
    });

    if (rsvpForm) {
        rsvpForm.addEventListener('submit', (event) => {
            event.preventDefault(); 

            const guestName = document.getElementById('guest-name').value.trim();
            const guestCount = document.getElementById('guest-count').value;
            
            if (!guestName || guestCount < 1) {
                alert("Por favor, ingresa tu nombre y un número válido de personas.");
                return;
            }

            modal.style.display = "none"; 

            // 1. Generar y descargar el PDF
            generateAndDownloadPass(guestName, guestCount);

            // 2. Abrir WhatsApp 
            const whatsappNumber = "526567043627"; 
            const quinceName = "Ximena Guadalupe Guevara Avila"; 
            
            const message = `¡Hola! Confirmo mi asistencia a los XV Años de ${quinceName}. Estaré ahí con un total de ${guestCount} persona(s). Mi nombre es ${guestName}.`;
            
            window.open(`https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(message)}`, '_blank');
            
            alert(`¡Gracias, ${guestName}! El pase digital se ha descargado y se abrirá WhatsApp para enviar la confirmación final.`);

        });
    }
    
    
    // --- 4. FUNCIÓN QUE GENERA EL PDF PERSONALIZADO ---
    function generateAndDownloadPass(name, count) {
        
        if (typeof jsPDF === 'undefined') {
            console.error("jsPDF no está cargado. Asegúrate de que la librería esté en tu HTML.");
            alert("Error: No se pudo generar el pase PDF.");
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'p', 
            unit: 'mm',
            format: 'a6'
        });

        // Diseño del Pase (Colores para el PDF)
        doc.setDrawColor("#d106e0"); 
        doc.setLineWidth(1.5);
        doc.rect(5, 5, doc.internal.pageSize.width - 10, doc.internal.pageSize.height - 10); 

        doc.setFont("Dancing Script", "bold");
        doc.setFontSize(22);
        doc.setTextColor("#FFD700"); 
        doc.text("Mis XV Años", doc.internal.pageSize.width / 2, 25, { align: 'center' });

        doc.setFont("Cormorant Garamond", "normal");
        doc.setFontSize(14);
        doc.setTextColor("#333333"); 
        doc.text(`Invitado: ${name}`, doc.internal.pageSize.width / 2, 40, { align: 'center' });
        
        doc.setLineWidth(0.5);
        doc.line(15, 48, doc.internal.pageSize.width - 15, 48);

        doc.setFont("Cormorant Garamond", "bold");
        doc.setFontSize(18);
        doc.text("PASE DE ENTRADA", doc.internal.pageSize.width / 2, 65, { align: 'center' });

        doc.setFont("Cormorant Garamond", "italic");
        doc.setFontSize(10);
        doc.text("Presenta este pase en el salón.", doc.internal.pageSize.width / 2, 80, { align: 'center' });
        
        doc.setFont("Cormorant Garamond", "bold");
        doc.setFontSize(12);
        doc.text(`Válido para: ${count} persona(s)`, doc.internal.pageSize.width / 2, 87, { align: 'center' });

        // Detalles del Evento
        doc.setFont("Cormorant Garamond", "bold");
        doc.setFontSize(12);
        doc.text("Detalles de la Fiesta:", 15, 105);
        
        doc.setFont("Cormorant Garamond", "normal");
        doc.setFontSize(11);
        doc.text("Fecha: [Sábado, 20 de Diciembre]", 15, 112); 
        doc.text("Lugar: [Nombre del Salón]", 15, 119);
        doc.text("Hora: [8:00 PM]", 15, 126);

        doc.setFontSize(9);
        doc.setTextColor("#d106e0"); 
        doc.text("¡Te esperamos con alegría!", doc.internal.pageSize.width / 2, 138, { align: 'center' });

        doc.save(`Pase_XV_${name.replace(/ /g, '_')}.pdf`);
    }
});