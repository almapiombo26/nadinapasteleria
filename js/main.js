// ============================================================
//  NADINA PASTELERÍA — main.js
// ============================================================

// ---- Agregar al carrito ----
function agregarAlCarrito(nombre, precio, imagen) {
  let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  const existente = carrito.find(p => p.nombre === nombre);

  if (existente) {
    existente.cantidad += 1;
  } else {
    carrito.push({
      nombre,
      precio,
      imagen: imagen || '',
      cantidad: 1
    });
  }

  localStorage.setItem('carrito', JSON.stringify(carrito));
  actualizarBadge();
  mostrarToast('✓ ' + nombre + ' agregada al carrito');
}

// ---- Actualizar el número en el ícono del carrito ----
function actualizarBadge() {
  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  const total = carrito.reduce((acc, p) => acc + (p.cantidad || 1), 0);
  const badge = document.getElementById('carrito-count');
  if (badge) {
    badge.textContent = total;
    badge.style.display = total > 0 ? 'inline-flex' : 'none';
  }
}

// ---- Toast de confirmación ----
function mostrarToast(mensaje) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = mensaje;
  toast.classList.add('show');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2400);
}

// ---- Lógica de precios y talles (NUEVO) ----

function actualizarPrecioCard(selectElement) {
  const precio = selectElement.options[selectElement.selectedIndex].getAttribute('data-precio');
  const cardBody = selectElement.closest('.card-body');
  const display = cardBody.querySelector('.precio-display');
  if (display) {
    display.textContent = `$${parseInt(precio).toLocaleString('es-AR')}`;
  }
}

function prepararCompra(boton, nombreBase, imagen) {
  const cardBody = boton.closest('.card-body');
  const selector = cardBody.querySelector('.tamanio-select');
  
  // AQUÍ ESTABA EL ERROR: se cambió "tam seleccionado" por "tamanioSeleccionado"
  const tamanioSeleccionado = selector.value; 
  const opcionSeleccionada = selector.options[selector.selectedIndex];
  const precio = parseInt(opcionSeleccionada.getAttribute('data-precio'));
  const porciones = opcionSeleccionada.getAttribute('data-porciones');
  
  const nombreCompleto = `${nombreBase} (${tamanioSeleccionado}cm - ${porciones} porc.)`;
  
  agregarAlCarrito(nombreCompleto, precio, imagen);
}

// ---- Al cargar la página ----
document.addEventListener('DOMContentLoaded', () => {
  actualizarBadge();

  // Configurar fecha mínima de entrega (Hoy + 2 días)
  const inputFecha = document.getElementById('fecha');
  if (inputFecha) {
    const minFecha = new Date();
    minFecha.setDate(minFecha.getDate() + 2);
    // Formato ISO YYYY-MM-DD
    const stringFecha = minFecha.toISOString().split('T')[0];
    inputFecha.min = stringFecha;
  }
});