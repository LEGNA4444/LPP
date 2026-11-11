// ===== LPP · Legnar Proyectos Privados =====

// ============================================================
// CONFIGURACIÓN DE CONTACTO (edita solo este bloque)
// ------------------------------------------------------------
// OPCIÓN 1 (recomendada): Formspree — crea una cuenta gratis en
//   https://formspree.io , registra el formulario y pega tu ID.
//   Queda algo como: formspreeId: "xldojkva"
// OPCIÓN 2 (respaldo sin registro): pon tu correo en "email".
//   Si formspreeId está vacío, se abre la app de correo del visitante.
// ============================================================
const CONTACTO = {
  formspreeId: "", // pega aquí tu ID de Formspree
  email: "",       // correo de respaldo (se usa solo si formspreeId está vacío)
};

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

// ============================================================
// FORMULARIO DE CONTACTO REAL
// - Con Formspree configurado: envía y llega a tu correo.
// - Sin Formspree pero con correo de respaldo: abre la app
//   de correo del visitante con el mensaje ya escrito.
// ============================================================
const form = document.getElementById("contactForm");
const formNote = document.getElementById("formNote");

function setNote(text, isError) {
  if (!formNote) return;
  formNote.textContent = text;
  formNote.style.color = isError ? "var(--danger, #e05252)" : "";
}

async function enviarConFormspree(datos) {
  const endpoint = "https://formspree.io/f/" + CONTACTO.formspreeId;
  const respuesta = await fetch(endpoint, {
    method: "POST",
    headers: { "Accept": "application/json" },
    body: datos,
  });

  if (respuesta.ok) {
    setNote("¡Gracias por tu mensaje! Te contactaré pronto.", false);
    form.reset();
    return true;
  }

  if (respuesta.status === 422) {
    setNote("Hubo un problema con los datos del formulario. Revisa los campos.", true);
  } else {
    setNote("No se pudo enviar el mensaje. Intenta de nuevo en un momento.", true);
  }
  return false;
}

function enviarPorCorreo(datos) {
  const nombre = datos.get("nombre") || "";
  const email = datos.get("email") || "";
  const mensaje = datos.get("mensaje") || "";

  const asunto = encodeURIComponent("Contacto desde LPP — " + nombre);
  const cuerpo = encodeURIComponent(
    "Nombre: " + nombre + "\nCorreo: " + email + "\n\n" + mensaje +
    "\n\n(Enviado desde el formulario de LPP)"
  );

  window.location.href = "mailto:" + CONTACTO.email + "?subject=" + asunto + "&body=" + cuerpo;
  setNote("Se abrirá tu aplicación de correo para enviar el mensaje.", false);
}

if (form && formNote) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const datos = new FormData(form);

    if (CONTACTO.formspreeId) {
      const boton = form.querySelector("button[type=submit]");
      const textoOriginal = boton ? boton.textContent : null;
      if (boton) { boton.disabled = true; boton.textContent = "Enviando..."; }

      try {
        await enviarConFormspree(datos);
      } catch (error) {
        // Sin conexión u otro fallo de red.
        setNote("No se pudo enviar el mensaje. Revisa tu conexión e intenta de nuevo.", true);
      } finally {
        if (boton) {
          boton.disabled = false;
          if (textoOriginal) boton.textContent = textoOriginal;
        }
      }
    } else if (CONTACTO.email) {
      enviarPorCorreo(datos);
    } else {
      // Sin configurar: no le mentimos al visitante.
      setNote("El envío de mensajes aún no está configurado. Escríbeme por GitHub.", true);
    }
  });
}