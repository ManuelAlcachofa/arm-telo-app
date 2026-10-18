import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Alerta from '../components/Alerta.jsx';
import Boton from '../components/Boton.jsx';
import CampoFormulario from '../components/CampoFormulario.jsx';
import EstadoVacio from '../components/EstadoVacio.jsx';
import Pagina from '../components/Pagina.jsx';
import SelectorRegionComuna from '../components/SelectorRegionComuna.jsx';
import TablaItems from '../components/TablaItems.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useCarrito } from '../context/CarritoContext.jsx';
import { OPCIONES_ENTREGA, RESULTADOS_PAGO, calcularTotales, crearOrden, pagarOrden, productosSinStock } from '../services/compras.js';
import { formatoCLP } from '../utils/formato.js';
import { precioFinal, stockNumerico } from '../utils/productos.js';
import { sinErrores, validarEmail, validarRequerido } from '../utils/validaciones.js';

export default function Checkout() {
  const { items, vaciar } = useCarrito();
  const { usuario } = useAuth();
  const navegar = useNavigate();

  // Si la persona inició sesión, sus datos se cargan automáticamente.
  const [datos, setDatos] = useState(() => ({
    nombre: usuario?.nombre ?? '',
    apellidos: usuario?.apellidos ?? '',
    correo: usuario?.correo ?? '',
    calle: usuario?.calle ?? '',
    departamento: usuario?.departamento ?? '',
    region: usuario?.region ?? '',
    comuna: usuario?.comuna ?? '',
    indicaciones: '',
    entrega: 'despacho',
    resultado: 'aprobado',
  }));
  const [errores, setErrores] = useState({});
  const [aviso, setAviso] = useState('');
  const [procesando, setProcesando] = useState(false);

  if (items.length === 0 && !procesando) {
    return (
      <Pagina titulo="Checkout">
        <EstadoVacio icono="bi-cart-x" titulo="No tienes productos en el carrito">
          <Link to="/productos" className="btn btn-primary">
            Ver productos
          </Link>
        </EstadoVacio>
      </Pagina>
    );
  }

  const cambiar = (campo) => (e) => setDatos((d) => ({ ...d, [campo]: e.target.value }));
  const { subtotal, envio, total } = calcularTotales(items, datos.entrega);
  const despacho = datos.entrega === 'despacho';

  const validar = () => ({
    nombre: validarRequerido(datos.nombre, 'el nombre'),
    apellidos: validarRequerido(datos.apellidos, 'los apellidos'),
    correo: validarEmail(datos.correo),
    calle: despacho ? validarRequerido(datos.calle, 'la calle') : '',
    region: despacho ? validarRequerido(datos.region, 'una región', 'Selecciona') : '',
    comuna: despacho ? validarRequerido(datos.comuna, 'una comuna', 'Selecciona') : '',
  });

  const pagar = async (evento) => {
    evento.preventDefault();
    setAviso('');
    const nuevos = validar();
    setErrores(nuevos);
    if (!sinErrores(nuevos)) return;

    const faltantes = productosSinStock(items);
    if (faltantes.length > 0) {
      setAviso(`No hay stock suficiente de: ${faltantes.join(', ')}. Ajusta las cantidades en tu carrito.`);
      return;
    }

    setProcesando(true);
    const orden = crearOrden({
      cliente: { nombre: datos.nombre.trim(), apellidos: datos.apellidos.trim(), correo: datos.correo.trim() },
      direccion: despacho
        ? { calle: datos.calle.trim(), departamento: datos.departamento.trim(), region: datos.region, comuna: datos.comuna, indicaciones: datos.indicaciones.trim() }
        : {},
      entregaId: datos.entrega,
      items,
      usuarioId: usuario?.id ?? null,
    });
    const respuesta = await pagarOrden(orden.id, datos.resultado);
    if (respuesta.ok) {
      vaciar();
      navegar(`/compra/exitosa/${orden.id}`);
    } else {
      navegar(`/compra/error/${orden.id}`);
    }
  };

  const filas = items.map(({ producto, cantidad }) => ({
    id: producto.id,
    nombre: producto.nombre,
    imagen: producto.imagen,
    precio: precioFinal(producto),
    cantidad,
    max: stockNumerico(producto),
  }));

  return (
    <Pagina titulo="Checkout" subtitulo="Completa tus datos para finalizar la compra." ancho="contenedor-angosto">
      <Alerta mensaje={aviso} onCerrar={() => setAviso('')} />
      <form onSubmit={pagar} noValidate className="card p-3 p-md-4">
        <h2 className="h5">Resumen de tu compra</h2>
        <TablaItems filas={filas} />

        <h2 className="h5 mt-2">Información del cliente</h2>
        <div className="row">
          <div className="col-md-6">
            <CampoFormulario id="nombre" etiqueta="Nombre" requerido valor={datos.nombre} onChange={cambiar('nombre')} error={errores.nombre} autoComplete="given-name" />
          </div>
          <div className="col-md-6">
            <CampoFormulario id="apellidos" etiqueta="Apellidos" requerido valor={datos.apellidos} onChange={cambiar('apellidos')} error={errores.apellidos} autoComplete="family-name" />
          </div>
          <div className="col-md-6">
            <CampoFormulario id="correo" etiqueta="Correo" tipo="email" requerido valor={datos.correo} onChange={cambiar('correo')} error={errores.correo} autoComplete="email" />
          </div>
        </div>

        <h2 className="h5 mt-2">Opciones de entrega</h2>
        <div className="mb-3">
          {OPCIONES_ENTREGA.map((o) => (
            <div className="form-check" key={o.id}>
              <input
                className="form-check-input"
                type="radio"
                name="entrega"
                id={`entrega-${o.id}`}
                value={o.id}
                checked={datos.entrega === o.id}
                onChange={cambiar('entrega')}
              />
              <label className="form-check-label" htmlFor={`entrega-${o.id}`}>
                {o.etiqueta}
                {o.costo > 0 && <span className="text-secondary"> ({formatoCLP(o.costo)})</span>}
              </label>
            </div>
          ))}
        </div>

        {despacho && (
          <>
            <h2 className="h5">Dirección de entrega</h2>
            <div className="row">
              <div className="col-md-8">
                <CampoFormulario id="calle" etiqueta="Calle y número" requerido valor={datos.calle} onChange={cambiar('calle')} error={errores.calle} autoComplete="street-address" />
              </div>
              <div className="col-md-4">
                <CampoFormulario id="departamento" etiqueta="Departamento (opcional)" placeholder="Ej: 603" valor={datos.departamento} onChange={cambiar('departamento')} />
              </div>
            </div>
            <SelectorRegionComuna
              requerido
              region={datos.region}
              comuna={datos.comuna}
              errorRegion={errores.region}
              errorComuna={errores.comuna}
              onCambiarRegion={(region) => setDatos((d) => ({ ...d, region, comuna: '' }))}
              onCambiarComuna={(comuna) => setDatos((d) => ({ ...d, comuna }))}
            />
            <CampoFormulario
              id="indicaciones"
              tipo="textarea"
              etiqueta="Indicaciones para la entrega (opcional)"
              placeholder="Ej: entre calles, color del edificio, no tiene timbre."
              valor={datos.indicaciones}
              onChange={cambiar('indicaciones')}
            />
          </>
        )}

        <h2 className="h5">Pago</h2>
        <CampoFormulario
          id="resultado"
          tipo="select"
          etiqueta="Resultado del pago (simulación)"
          valor={datos.resultado}
          onChange={cambiar('resultado')}
          opciones={RESULTADOS_PAGO.map((r) => ({ valor: r.id, etiqueta: r.etiqueta }))}
          ayuda="Esta tienda es un proyecto académico: no se cobra dinero real. Elige cómo quieres que termine el pago."
        />

        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 border-top pt-3">
          <div>
            <div className="text-secondary small">
              Subtotal {formatoCLP(subtotal)} · Envío {formatoCLP(envio)}
            </div>
            <div className="fs-5">
              Total a pagar: <strong className="text-ember">{formatoCLP(total)}</strong>
            </div>
          </div>
          <Boton
            etiqueta={procesando ? 'Procesando pago…' : `Pagar ahora ${formatoCLP(total)}`}
            tipo="submit"
            deshabilitado={procesando}
          />
        </div>
      </form>
    </Pagina>
  );
}
