// Importaciones de Firebase (requeridas por el entorno)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, setLogLevel } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Configuración de Firebase (accediendo a las variables globales del entorno)
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');

let app;
let auth;
let userId = null;

try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    setLogLevel('Debug'); // Para ver logs

    // Autenticación inicial
    if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
    } else {
        await signInAnonymously(auth);
    }

    // Establecer userId al cambiar el estado de autenticación
    onAuthStateChanged(auth, (user) => {
        if (user) {
            userId = user.uid;
            console.log("Authenticated with user ID:", userId);
        } else {
            userId = crypto.randomUUID(); 
            console.log("Signed out or anonymous session. Using UUID:", userId);
        }
    });

} catch (error) {
    console.error("Firebase initialization failed:", error);
    userId = crypto.randomUUID();
}

// --- 1. CONFIGURACIÓN Y FUNCIONES GLOBALES ---

const eventDate = new Date("December 20, 2025 18:00:00").getTime();
const music = document.getElementById('background-music');
const musicToggle = document.getElementById('music-toggle');
const enterButton = document.getElementById('enter-button');
const welcomeScreen = document.getElementById('welcome-screen');
const mainContent = document.querySelector('.invitation-content');
const modal = document.getElementById('rsvp-modal');
const openModalButton = document.getElementById('open-modal-button');
const closeModalButton = document.querySelector('.close-button');
const rsvpForm = document.getElementById('rsvp-form');
const formSubmitButton = document.querySelector('#rsvp-form button[type="submit"]');
const { jsPDF } = window.jspdf;


// --- 2. LÓGICA DE AUDIO ---
let isPlaying = false;

// Toca la música solo después de la interacción del usuario
musicToggle.addEventListener('click', () => {
    if (isPlaying) {
        music.pause();
        musicToggle.innerHTML = '<i class="fas fa-volume-mute"></i>';
    } else {
        music.play().catch(e => console.error("Error al reproducir música:", e));
        musicToggle.innerHTML = '<i class="fas fa-volume-up"></i>';
    }
    isPlaying = !isPlaying;
});

// --- 3. TRANSICIÓN DE PANTALLA DE BIENVENIDA ---
enterButton.addEventListener('click', () => {
    // Inicia la música inmediatamente al entrar (por si el usuario olvida el toggle)
    music.play().then(() => {
        isPlaying = true;
        musicToggle.innerHTML = '<i class="fas fa-volume-up"></i>';
    }).catch(e => console.log("Música no iniciada automáticamente:", e));

    // Desvanece la pantalla de bienvenida y muestra el contenido principal
    welcomeScreen.style.opacity = '0';
    setTimeout(() => {
        welcomeScreen.classList.add('hidden');
        welcomeScreen.style.display = 'none';
        mainContent.classList.remove('hidden');
        // Forzar la visualización inicial de animaciones si ya se cargó la página
        window.dispatchEvent(new Event('scroll'));
    }, 1000); 
});

// --- 4. CUENTA REGRESIVA ---
function updateCountdown() {
    const now = new Date().getTime();
    const distance = eventDate - now;

    if (distance < 0) {
        document.getElementById("countdown").innerHTML = "<p class='text-xl text-yellow-400'>¡EL DÍA HA LLEGADO!</p>";
        clearInterval(countdownInterval);
        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById("days").textContent = String(days).padStart(2, '0');
    document.getElementById("hours").textContent = String(hours).padStart(2, '0');
    document.getElementById("minutes").textContent = String(minutes).padStart(2, '0');
    document.getElementById("seconds").textContent = String(seconds).padStart(2, '0');
}

const countdownInterval = setInterval(updateCountdown, 1000);
updateCountdown();

// --- 5. ANIMACIONES AL HACER SCROLL ---
function checkScrollAnimations() {
    const sections = document.querySelectorAll('.animate-on-scroll');
    const triggerBottom = window.innerHeight * 0.85;

    sections.forEach(section => {
        const sectionTop = section.getBoundingClientRect().top;
        if (sectionTop < triggerBottom) {
            section.classList.add('visible');
        }
    });
}
window.addEventListener('scroll', checkScrollAnimations);
window.addEventListener('load', checkScrollAnimations);

// --- 6. LÓGICA DEL MODAL ---
openModalButton.addEventListener('click', () => {
    modal.style.display = 'block';
});

closeModalButton.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// --- 7. GENERACIÓN DEL PASE DIGITAL (PDF) ---
function generatePass(name, count) {
    const doc = new jsPDF();
    const width = doc.internal.pageSize.getWidth();

    doc.setFillColor('#111827'); 
    doc.rect(0, 0, width, doc.internal.pageSize.getHeight(), 'F');

    doc.setFont('helvetica', 'bold');
    doc.setTextColor('#FBBF24');
    doc.setFontSize(32);
    doc.text("PASE DIGITAL", width / 2, 20, { align: 'center' });

    doc.setFontSize(24);
    doc.setTextColor('#10B981');
    doc.text("Mis XV Años - Ximena Avila", width / 2, 30, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setTextColor('#F9FAFB');
    doc.setFontSize(14);
    doc.text("Presenta este pase al entrar al Salón.", width / 2, 45, { align: 'center' });

    // Información del invitado
    doc.line(20, 55, width - 20, 55); 
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor('#F9FAFB');
    doc.text(`Invitado Principal: ${name}`, 20, 65);
    doc.text(`Personas Confirmadas: ${count}`, 20, 75);
    doc.line(20, 80, width - 20, 80); 

    // Detalles del Evento
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor('#FBBF24');
    doc.text("DETALLES DEL EVENTO:", 20, 95);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor('#F9FAFB');
    doc.setFontSize(14);
    doc.text("Fecha: Sábado, 20 de Diciembre de 2025", 20, 105);
    doc.text("Lugar: [Nombre del Salón de Eventos]", 20, 115);
    doc.text("Hora de Recepción: [Hora de inicio de la Fiesta]", 20, 125);

    // Mensaje final
    doc.setFontSize(12);
    doc.setTextColor('#10B981');
    doc.text("¡Te esperamos con mucha alegría!", width / 2, 145, { align: 'center' });
    
    doc.save(`PaseDigital_XVAños_${name.replace(/\s/g, '_')}.pdf`);
}


// --- 8. ENVÍO DE FORMULARIO y ANIMACIÓN ---
rsvpForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (formSubmitButton.classList.contains('confirmed')) return;

    const name = document.getElementById('guest-name').value;
    const count = document.getElementById('guest-count').value;
    
    // 1. Iniciar Animación
    formSubmitButton.classList.add('confirmed');
    
    // 2. Generar y Descargar PDF (después de una breve pausa)
    setTimeout(() => {
        generatePass(name, count);
    }, 300);

    // 3. Abrir WhatsApp (después de que la animación termine un poco)
    setTimeout(() => {
        const message = encodeURIComponent(`Hola, mi nombre es ${name} y confirmo mi asistencia a los XV Años de Ximena Avila con un total de ${count} persona(s). ¡Nos vemos el 20 de diciembre!`);
        const whatsappUrl = `https://wa.me/XXXXXXXXXX?text=${message}`; // Reemplaza XXXXXXXXXX con tu número
        window.open(whatsappUrl, '_blank');
        
        // Opcional: Cerrar modal
        modal.style.display = 'none';
    }, 700);

});