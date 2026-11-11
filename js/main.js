// ===== LPP · Legnar Proyectos Privados =====

// ============================================================
// CONFIGURACIÓN DE CONTACTO
// Formspree: los mensajes del formulario llegan a tu correo.
// ============================================================
const CONTACTO = {
  formspreeId: "mppdalrj",
  email: "",
};

// ── Selector de tema ─────────────────────────────────────────
const root = document.documentElement;
const dots = document.querySelectorAll(".theme-dot");

function setTheme(theme) {
  root.setAttribute("data-theme", theme);
  dots.forEach((dot) => {
    dot.classList.toggle("active", dot.dataset.theme === theme);
  });
  try {
    localStorage.setItem("lpp-theme", theme);
  } catch (_) {}
}

dots.forEach((dot) => {
  dot.addEventListener("click", () => setTheme(dot.dataset.theme));
});

(function syncDot() {
  const current = root.getAttribute("data-theme") || "oro";
  dots.forEach((dot) => {
    dot.classList.toggle("active", dot.dataset.theme === current);
  });
})();

// ── Menú móvil ───────────────────────────────────────────────
const navToggle = document.getElementById("navToggle");
const navLinks  = document.getElementById("navLinks");

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

// ── Animación reveal al desplazarse ──────────────────────────
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        currentObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
} else {
  document.querySelectorAll(".reveal").forEach((el) => el.classList.add("visible"));
}

// ============================================================
// FORMULARIO DE CONTACTO
// ============================================================
const form     = document.getElementById("contactForm");
const formNote = document.getElementById("formNote");

function setNote(text, isError) {
  if (!formNote) return;
  formNote.textContent = text;
  formNote.style.color = isError ? "var(--danger, #e05252)" : "";
}

async function enviarConFormspree(datos) {
  const endpoint = "https://formspree.io/f/" + CONTACTO.formspreeId;
  const respuesta = await fetch(endpoint, {
    method:  "POST",
    headers: { "Accept": "application/json" },
    body:    datos,
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
  const nombre  = datos.get("nombre")  || "";
  const email   = datos.get("email")   || "";
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

    const datos  = new FormData(form);
    const boton  = form.querySelector("button[type=submit]");
    const txtOri = boton ? boton.textContent : null;

    if (CONTACTO.formspreeId) {
      if (boton) { boton.disabled = true; boton.textContent = "Enviando…"; }
      try {
        await enviarConFormspree(datos);
      } catch (_) {
        setNote("No se pudo enviar el mensaje. Revisa tu conexión e intenta de nuevo.", true);
      } finally {
        if (boton) { boton.disabled = false; if (txtOri) boton.textContent = txtOri; }
      }
    } else if (CONTACTO.email) {
      enviarPorCorreo(datos);
    } else {
      setNote("El envío de mensajes aún no está configurado. Escríbeme por GitHub.", true);
    }
  });
}

// ============================================================
// BUSCADOR DEL CATÁLOGO LPP
// ============================================================
const projectSearch  = document.getElementById("projectSearch");
const projectResults = document.getElementById("projectResults");

if (projectSearch && projectResults) {
  const projects = [
    {
      title:       "ARCS IA",
      description: "Investigación y desarrollo de inteligencia artificial local.",
      url:         "proyectos/arcs-ia.html",
      tags:        ["ia", "inteligencia artificial", "python", "conversacional", "investigacion", "desarrollo"],
    },
    {
      title:       "PYCLEG",
      description: "Herramientas, utilidades y experimentación de software.",
      url:         "proyectos/pycleg.html",
      tags:        ["software", "javascript", "python", "herramientas", "web", "programacion"],
    },
    {
      title:       "Barbería Legnar",
      description: "Iniciativa comercial y presencia digital de barbería.",
      url:         "proyectos/barberia-legnar.html",
      tags:        ["barberia", "negocio", "servicios", "corte", "comercial"],
    },
  ];

  const normalize = (v) =>
    v.toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const findMatches = (query) => {
    const q = normalize(query.trim());
    if (!q) return projects;
    return projects.filter((p) =>
      normalize(p.title).includes(q) ||
      normalize(p.description).includes(q) ||
      p.tags.some((t) => normalize(t).includes(q))
    );
  };

  const render = (matches) => {
    if (!matches.length) {
      projectResults.innerHTML =
        '<p class="search-empty">No encontramos proyectos relacionados con esa búsqueda.</p>';
      return;
    }
    projectResults.innerHTML = matches.map((p) =>
      '<a class="search-result" href="' + p.url + '">' +
        '<span class="search-result-title">'       + p.title       + '</span>' +
        '<span class="search-result-description">' + p.description + '</span>' +
        '<span class="search-result-open">Ver información <span aria-hidden="true">→</span></span>' +
      '</a>'
    ).join("");
  };

  projectSearch.addEventListener("input", () => {
    const q = projectSearch.value;
    if (q.trim()) render(findMatches(q));
    else projectResults.innerHTML =
      '<p class="search-hint">Escribe para buscar o explora todos los proyectos.</p>';
  });

  projectSearch.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const first = projectResults.querySelector(".search-result");
      if (first) window.location.href = first.href;
    }
  });

  projectSearch.addEventListener("focus", () => {
    if (!projectSearch.value.trim()) render(projects);
  });

  projectSearch.addEventListener("blur", () => {
    window.setTimeout(() => {
      if (!projectSearch.value.trim())
        projectResults.innerHTML =
          '<p class="search-hint">Escribe para buscar o explora todos los proyectos.</p>';
    }, 140);
  });
}
