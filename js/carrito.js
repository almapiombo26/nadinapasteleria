// ============================================================
//  NADINA PASTELERÍA — carrito.js
// ============================================================

let metodoPago = 'transferencia';

const imagenesTortas = {
  'Torta de Chocolate': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200&h=200&fit=crop',
  'Torta de Frutilla':  'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=200&h=200&fit=crop',
  'Cheesecake':         'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=200&h=200&fit=crop',
  'Red Velvet':         'https://images.unsplash.com/photo-1562440499-64c9a111f713?w=200&h=200&fit=crop',
  'Torta de Limón':     'https://images.unsplash.com/photo-1519869325930-281384150729?w=200&h=200&fit=crop',
  'Carrot Cake':        'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=200&h=200&fit=crop',
};

const fallbackImg = 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=200&h=200&fit=crop';

function mostrarCarrito() {
  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  const contenedor = document.getElementById('carrito-contenedor');
  if (!contenedor) return;

  if (carrito.length === 0) {
    contenedor.innerHTML = `
      <div class="carrito-vacio">
        <p>Tu carrito está vacío 🌿</p>
        <a href="tortas.html" class="btn">Ver tortas</a>
      </div>`;
    actualizarTotales(carrito);
    return;
  }

  contenedor.innerHTML = carrito.map((producto, index) => {
    const img = producto.imagen || imagenesTortas[producto.nombre.split(' (')[0]] || fallbackImg;
    const subtotalItem = producto.precio * (producto.cantidad || 1);
    return `
      <div class="item-carrito">
        <img src="${img}" alt="${producto.nombre}" onerror="this.src='${fallbackImg}'">
        <div class="item-info">
          <h4>${producto.nombre}</h4>
          <span class="item-detalle">Torta entera</span>
          <div class="item-controles">
            <button onclick="cambiarCantidad(${index}, -1)">−</button>
            <span class="cantidad-num">${producto.cantidad || 1}</span>
            <button onclick="cambiarCantidad(${index}, 1)">+</button>
          </div>
        </div>
        <span class="item-precio">$${subtotalItem.toLocaleString('es-AR')}</span>
        <button class="item-eliminar" onclick="eliminarProducto(${index})">✕</button>
      </div>`;
  }).join('');

  actualizarTotales(carrito);
  actualizarBadgeHeader(carrito);
}

function cambiarCantidad(index, cambio) {
  let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  carrito[index].cantidad = (carrito[index].cantidad || 1) + cambio;
  if (carrito[index].cantidad <= 0) carrito.splice(index, 1);
  localStorage.setItem('carrito', JSON.stringify(carrito));
  mostrarCarrito();
}

function eliminarProducto(index) {
  let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  carrito.splice(index, 1);
  localStorage.setItem('carrito', JSON.stringify(carrito));
  mostrarCarrito();
}

function actualizarTotales(carrito) {
  const subtotal = carrito.reduce((acc, p) => acc + p.precio * (p.cantidad || 1), 0);
  const recargo = metodoPago === 'transferencia' ? subtotal * 0.10 : 0;
  const total = subtotal + recargo;

  document.getElementById('subtotal').textContent = '$' + subtotal.toLocaleString('es-AR');
  document.getElementById('recargo').textContent = recargo > 0 ? '+$' + recargo.toLocaleString('es-AR') : '$0';
  document.getElementById('total').textContent = '$' + Math.round(total).toLocaleString('es-AR');
}

function seleccionarPago(tipo) {
  metodoPago = tipo;
  document.querySelectorAll('.pago-opcion').forEach(el => el.classList.remove('activo'));
  const activo = document.querySelector(`.pago-opcion[data-pago="${tipo}"]`);
  if (activo) activo.classList.add('activo');
  actualizarTotales(JSON.parse(localStorage.getItem('carrito')) || []);
}

function actualizarBadgeHeader(carrito) {
  const badge = document.getElementById('carrito-count');
  if (!badge) return;
  const total = carrito.reduce((acc, p) => acc + (p.cantidad || 1), 0);
  badge.textContent = total;
  badge.style.display = total > 0 ? 'inline-flex' : 'none';
}

function enviarWhatsApp() {
  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  const fecha = document.getElementById('fecha')?.value;
  const horario = document.getElementById('horario')?.value;

  if (carrito.length === 0) return alert('Tu carrito está vacío.');
  if (!fecha) return alert('Por favor seleccioná una fecha de retiro (mínimo 48hs de anticipación).');

  const subtotal = carrito.reduce((acc, p) => acc + p.precio * (p.cantidad || 1), 0);
  const total = metodoPago === 'transferencia' ? Math.round(subtotal * 1.10) : subtotal;

  let mensaje = `¡Hola Nadina! Quiero confirmar un pedido 🎂\n\n`;
  mensaje += `*Detalle:*\n`;
  carrito.forEach(p => {
    mensaje += `• ${p.nombre} x${p.cantidad} — $${(p.precio * p.cantidad).toLocaleString('es-AR')}\n`;
  });

  mensaje += `\n *Retiro en Palermo* (Costa Rica 4824, Palermo, CABA)`;
  mensaje += `\n Fecha: ${fecha}`;
  mensaje += `\n Horario: ${horario}`;
  mensaje += `\n Pago: ${metodoPago === 'transferencia' ? 'Transferencia (+10%)' : 'Efectivo'}`;
  mensaje += `\n\n *Total: $${total.toLocaleString('es-AR')}*`;

  const url = `https://wa.me/5491136337422?text=${encodeURIComponent(mensaje)}`;
  window.open(url, '_blank');
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  // 1. Setear fecha mínima (Hoy + 2 días)
  const inputFecha = document.getElementById('fecha');
  if (inputFecha) {
    const minF = new Date();
    minF.setDate(minF.getDate() + 2);
    inputFecha.min = minF.toISOString().split('T')[0];
  }

  // 2. Renderizar carrito
  mostrarCarrito();

  // 3. Listeners de pago
  document.querySelectorAll('.pago-opcion').forEach(el => {
    el.addEventListener('click', () => {
      seleccionarPago(el.dataset.pago);
      el.querySelector('input').checked = true;
    });
  });
});