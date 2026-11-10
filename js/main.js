// ===== LPP · Legnar Proyectos Privados =====

// Selector de tema (guardado en el navegador)
const root = document.documentElement;
const dots = document.querySelectorAll(".theme-dot");

function setTheme(theme) {
  root.setAttribute("data-theme", theme);
  dots.forEach((dot) => {
    dot.classList.toggle("active", dot.dataset.theme === theme);
  });

  try {
    localStorage.setItem("lpp-theme", theme);
  } catch (error) {
    // El almacenamiento puede estar bloqueado; la página sigue funcionando.
  }
}

dots.forEach((dot) => {
  dot.addEventListener("click", () => setTheme(dot.dataset.theme));
});

// Restaurar el tema guardado al recargar.
try {
  const savedTheme = localStorage.getItem("lpp-theme");
  if (savedTheme) setTheme(savedTheme);
} catch (error) {
  // Se conserva el tema predeterminado.
}

// Menú móvil.
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

// Animación de aparición al desplazarse.
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        currentObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll(".reveal").forEach((element) => {
    observer.observe(element);
  });
} else {
  // Evita dejar contenido invisible en navegadores antiguos.
  document.querySelectorAll(".reveal").forEach((element) => {
    element.classList.add("visible");
  });
}

// Formulario de contacto (demo local; todavía no envía correos).
const form = document.getElementById("contactForm");
const formNote = document.getElementById("formNote");

if (form && formNote) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    formNote.textContent = "¡Gracias por tu mensaje! Te contactaré pronto.";
    form.reset();
  });
}
