// Estado de la aplicación
let registros = [];
let archivosSeleccionados = [];

// Elementos del DOM
const btnAdjuntar = document.getElementById("btnAdjuntar");
const btnAlta = document.getElementById("btnAlta");
const inputDocumentos = document.getElementById("documentos");
const fileList = document.getElementById("fileList");
const registryList = document.getElementById("registryList");
const modal = document.getElementById("modal");
const modalBody = document.getElementById("modalBody");
const closeModal = document.querySelector(".close");

// Event Listeners
btnAdjuntar.addEventListener("click", () => {
  inputDocumentos.click();
});

inputDocumentos.addEventListener("change", (e) => {
  const files = Array.from(e.target.files);
  files.forEach((file) => {
    // Limpiar nombre de caracteres raros (BOM, etc.)
    const cleanName = file.name
      .replace(/^[\uFEFF\u200B\u00EF\u00BB\u00BF\xEF\xBB\xBF]+/, "")
      .replace(/^[^\w\d\s._-]+/, "");
    const blobUrl = URL.createObjectURL(file);
    archivosSeleccionados.push({
      file,
      name: cleanName,
      size: file.size,
      blobUrl,
    });
  });
  mostrarArchivos();
});

btnAlta.addEventListener("click", realizarAlta);

closeModal.addEventListener("click", () => {
  modal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});

// Funciones
function mostrarArchivos() {
  fileList.innerHTML = "";

  if (archivosSeleccionados.length === 0) return;

  archivosSeleccionados.forEach((archivo, index) => {
    const fileItem = document.createElement("div");
    fileItem.className = "file-item";
    fileItem.innerHTML = `
      <span>${archivo.name} (${formatFileSize(archivo.size)})</span>
      <span class="remove-file" data-index="${index}">×</span>
    `;
    fileList.appendChild(fileItem);
  });

  document.querySelectorAll(".remove-file").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const index = parseInt(e.target.dataset.index);
      archivosSeleccionados.splice(index, 1);
      mostrarArchivos();
    });
  });
}

function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

// IDs de todos los campos del formulario
const FIELD_IDS = [
  "clasificacion",
  "canalSalida",
  "canalEntrada",
  "nombre",
  "telefono1",
  "telefono2",
  "nif",
  "direccion",
  "cp",
  "poblacion",
  "provincia",
  "pais",
  "correo",
  "asunto",
  "motivoBDE",
  "tipologia",
  "motivo",
  "organismo",
  "descripcion",
];

const FIELD_LABELS = {
  clasificacion: "Clasificación",
  canalSalida: "Canal de Salida",
  canalEntrada: "Canal Entrada",
  nombre: "Nombre",
  telefono1: "Teléfono 1",
  telefono2: "Teléfono 2",
  nif: "NIF",
  direccion: "Dirección",
  cp: "CP",
  poblacion: "Población",
  provincia: "Provincia",
  pais: "País",
  correo: "Correo",
  asunto: "Asunto",
  motivoBDE: "Motivo BDE",
  tipologia: "Tipología",
  motivo: "Motivo",
  organismo: "Organismo",
  descripcion: "Descripción",
  urgente: "Urgente",
};

function realizarAlta() {
  const nuevoRegistro = {
    id: Date.now(),
    fecha: new Date().toLocaleString("es-ES"),
  };

  FIELD_IDS.forEach((id) => {
    nuevoRegistro[id] = document.getElementById(id).value;
  });
  nuevoRegistro.urgente = document.getElementById("urgente").checked;
  nuevoRegistro.documentos = [...archivosSeleccionados];

  // Validación básica
  if (!nuevoRegistro.nombre) {
    alert("Por favor, completa al menos el nombre del contacto");
    return;
  }

  registros.push(nuevoRegistro);
  limpiarFormulario();
  mostrarRegistros();
}

function limpiarFormulario() {
  FIELD_IDS.forEach((id) => {
    document.getElementById(id).value = "";
  });
  document.getElementById("urgente").checked = false;
  inputDocumentos.value = "";
  archivosSeleccionados = [];
  mostrarArchivos();
}

function mostrarRegistros() {
  registryList.innerHTML = "";

  if (registros.length === 0) {
    registryList.innerHTML =
      '<div class="empty-registry">No hay registros aún</div>';
    return;
  }

  registros.forEach((registro) => {
    const registryItem = document.createElement("div");
    registryItem.className = "registry-item";

    const detalles = [
      registro.nif ? `NIF: ${registro.nif}` : "",
      registro.asunto ? `Asunto: ${registro.asunto}` : "",
      `Fecha: ${registro.fecha}`,
    ]
      .filter(Boolean)
      .join(" | ");

    registryItem.innerHTML = `
      <div class="registry-item-info" data-id="${registro.id}">
        <div class="registry-item-name">${registro.nombre || "Sin nombre"}</div>
        <div class="registry-item-details">${detalles}</div>
      </div>
      <button class="btn-delete" data-id="${registro.id}">Borrar</button>
    `;

    registryList.appendChild(registryItem);
  });

  document.querySelectorAll(".registry-item-info").forEach((item) => {
    item.addEventListener("click", (e) => {
      const id = parseInt(e.currentTarget.dataset.id);
      mostrarDetalles(id);
    });
  });

  document.querySelectorAll(".btn-delete").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = parseInt(e.target.dataset.id);
      borrarRegistro(id);
    });
  });
}

function mostrarDetalles(id) {
  const r = registros.find((reg) => reg.id === id);
  if (!r) return;

  let html = `
    <div class="modal-field">
      <div class="modal-field-label">Fecha de Alta</div>
      <div class="modal-field-value">${r.fecha}</div>
    </div>
    <h3 style="margin: 12px 0 6px 0; color: #4a7ab5; font-size: 13px;">Información Adicional</h3>
  `;

  ["clasificacion", "canalSalida", "canalEntrada"].forEach((key) => {
    if (r[key])
      html += `<div class="modal-field"><div class="modal-field-label">${FIELD_LABELS[key]}</div><div class="modal-field-value">${r[key]}</div></div>`;
  });

  html += `<h3 style="margin: 12px 0 6px 0; color: #4a7ab5; font-size: 13px;">Contacto</h3>`;

  [
    "nombre",
    "telefono1",
    "telefono2",
    "nif",
    "direccion",
    "cp",
    "poblacion",
    "provincia",
    "pais",
    "correo",
  ].forEach((key) => {
    if (r[key])
      html += `<div class="modal-field"><div class="modal-field-label">${FIELD_LABELS[key]}</div><div class="modal-field-value">${r[key]}</div></div>`;
  });

  html += `<h3 style="margin: 12px 0 6px 0; color: #4a7ab5; font-size: 13px;">Detalle</h3>`;

  [
    "asunto",
    "motivoBDE",
    "tipologia",
    "motivo",
    "organismo",
    "descripcion",
  ].forEach((key) => {
    if (r[key])
      html += `<div class="modal-field"><div class="modal-field-label">${FIELD_LABELS[key]}</div><div class="modal-field-value">${r[key]}</div></div>`;
  });

  if (r.urgente) {
    html += `<div class="modal-field"><div class="modal-field-label">Urgente</div><div class="modal-field-value">Sí</div></div>`;
  }

  if (r.documentos.length > 0) {
    html += `
    <div class="modal-field">
      <div class="modal-field-label">Documentos Adjuntos (${r.documentos.length})</div>
      <div class="modal-documents">
        ${r.documentos.map((doc) => `<a href="${doc.blobUrl}" download="${doc.name}" class="modal-document-item">${doc.name} (${formatFileSize(doc.size)})</a>`).join("")}
      </div>
    </div>`;
  }

  modalBody.innerHTML = html;
  modal.style.display = "block";
}

function borrarRegistro(id) {
  registros = registros.filter((r) => r.id !== id);
  mostrarRegistros();
}

// Inicializar
mostrarArchivos();
mostrarRegistros();
