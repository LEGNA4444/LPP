// ===== LPP · Legnar Proyectos Privados =====

// ============================================================
// CONFIGURACIÓN DE CONTACTO
// Formspree: los mensajes del formulario llegan a tu correo.
// ============================================================
const CONTACTO = {
  formspreeId: "mppdalrj", // ID de tu formulario en Formspree
  email: "",               // respaldo opcional (se ignora mientras haya ID)
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
// FORMULARIO DE CONTACTO
// Envía el mensaje a tu correo a través de Formspree.
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

// ============================================================
// BUSCADOR DEL CATÁLOGO LPP
// Adaptación del filtrado de proyectos de PYCLEG.
// Los resultados llevan a páginas informativas dentro de LPP.
// ============================================================
const projectSearch = document.getElementById("projectSearch");
const projectResults = document.getElementById("projectResults");

if (projectSearch && projectResults) {
  const projects = [
    { title: "ARCS IA", description: "Investigación y desarrollo de inteligencia artificial local.", url: "proyectos/arcs-ia.html", tags: ["ia", "inteligencia artificial", "python", "conversacional", "investigación", "desarrollo"] },
    { title: "PYCLEG", description: "Herramientas, utilidades y experimentación de software.", url: "proyectos/pycleg.html", tags: ["software", "javascript", "python", "herramientas", "web", "programación"] },
    { title: "Barbería Legnar", description: "Iniciativa comercial y presencia digital de barbería.", url: "proyectos/barberia-legnar.html", tags: ["barbería", "negocio", "servicios", "corte", "comercial"] }
  ];

  function renderProjects(matches, query) {
    if (!matches.length) {
      projectResults.innerHTML = '<p class="search-empty">No encontramos proyectos relacionados con esa búsqueda.</p>';
      return;
    }
    projectResults.innerHTML = matches.map((project) =>
      '<a class="search-result" href="' + project.url + '">' +
        '<span class="search-result-title">' + project.title + '</span>' +
        '<span class="search-result-description">' + project.description + '</span>' +
        '<span class="search-result-open">Ver información <span aria-hidden="true">→</span></span>' +
      '</a>'
    ).join("");
  }

  function findProjects(query) {
    const normalized = query.trim().toLocaleLowerCase("es");
    if (!normalized) return projects;
    return projects.filter((project) =>
      project.title.toLocaleLowerCase("es").includes(normalized) ||
      project.description.toLocaleLowerCase("es").includes(normalized) ||
      project.tags.some((tag) => tag.includes(normalized))
    );
  }

  projectSearch.addEventListener("input", () => {
    const query = projectSearch.value;
    if (!query.trim()) {
      projectResults.innerHTML = '<p class="search-hint">Escribe para buscar o explora todos los proyectos.</p>';
      return;
    }
    renderProjects(findProjects(query), query);
  });

  projectSearch.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      const firstResult = projectResults.querySelector(".search-result");
      if (firstResult) window.location.href = firstResult.href;
    }
  });

  projectSearch.addEventListener("focus", () => {
    if (!projectSearch.value.trim()) {
      renderProjects(projects, "");
    }
  });

  projectSearch.addEventListener("blur", () => {
    window.setTimeout(() => {
      if (!projectSearch.value.trim()) {
        projectResults.innerHTML = '<p class="search-hint">Escribe para buscar o explora todos los proyectos.</p>';
      }
    }, 140);
  });
}


// Buscador del catálogo LPP: filtra proyectos por nombre, área o palabras clave.
const projectSearch = document.getElementById("projectSearch");
const projectResults = document.getElementById("projectResults");

if (projectSearch && projectResults) {
  const projects = [
    { title: "ARCS IA", description: "Investigación y desarrollo de inteligencia artificial local.", url: "proyectos/arcs-ia.html", tags: ["ia", "inteligencia artificial", "python", "conversacional", "investigación", "desarrollo"] },
    { title: "PYCLEG", description: "Herramientas, utilidades y experimentación de software.", url: "proyectos/pycleg.html", tags: ["software", "javascript", "python", "herramientas", "web", "programación"] },
    { title: "Barbería Legnar", description: "Iniciativa comercial y presencia digital de barbería.", url: "proyectos/barberia-legnar.html", tags: ["barbería", "negocio", "servicios", "corte", "comercial"] }
  ];

  const render = (matches) => {
    if (!matches.length) {
      projectResults.innerHTML = '<p class="search-empty">No encontramos proyectos relacionados con esa búsqueda.</p>';
      return;
    }
    projectResults.innerHTML = matches.map((project) =>
      '<a class="search-result" href="' + project.url + '">' +
        '<span class="search-result-title">' + project.title + '</span>' +
        '<span class="search-result-description">' + project.description + '</span>' +
        '<span class="search-result-open">Ver información <span aria-hidden="true">→</span></span>' +
      '</a>'
    ).join("");
  };

  const findMatches = (query) => {
    const q = query.trim().toLocaleLowerCase("es");
    if (!q) return projects;
    return projects.filter((project) =>
      project.title.toLocaleLowerCase("es").includes(q) ||
      project.description.toLocaleLowerCase("es").includes(q) ||
      project.tags.some((tag) => tag.includes(q))
    );
  };

  projectSearch.addEventListener("input", () => {
    const query = projectSearch.value;
    if (!query.trim()) {
      projectResults.innerHTML = '<p class="search-hint">Escribe para buscar o explora todos los proyectos.</p>';
    } else {
      render(findMatches(query));
    }
  });

  projectSearch.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      const first = projectResults.querySelector(".search-result");
      if (first) window.location.href = first.href;
    }
  });

  projectSearch.addEventListener("focus", () => {
    if (!projectSearch.value.trim()) render(projects);
  });

  projectSearch.addEventListener("blur", () => {
    window.setTimeout(() => {
      if (!projectSearch.value.trim()) {
        projectResults.innerHTML = '<p class="search-hint">Escribe para buscar o explora todos los proyectos.</p>';
      }
    }, 140);
  });
}
