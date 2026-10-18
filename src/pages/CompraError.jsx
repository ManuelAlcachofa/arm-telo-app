import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Alerta from '../components/Alerta.jsx';
import Boton from '../components/Boton.jsx';
import CampoFormulario from '../components/CampoFormulario.jsx';
import EstadoVacio from '../components/EstadoVacio.jsx';
import Pagina from '../components/Pagina.jsx';
import ResumenOrden from '../components/ResumenOrden.jsx';
import { useCarrito } from '../context/CarritoContext.jsx';
import { useColeccion } from '../data/useColeccion.js';
import { RESULTADOS_PAGO, pagarOrden } from '../services/compras.js';

export default function CompraError() {
  const { id } = useParams();
  const ordenes = useColeccion('ordenes');
  const { vaciar } = useCarrito();
  const navegar = useNavigate();
  const [resultado, setResultado] = useState('aprobado');
  const [procesando, setProcesando] = useState(false);
  const [aviso, setAviso] = useState('');
  const orden = ordenes.find((o) => String(o.id) === String(id));

  if (!orden || orden.estado !== 'rechazada') {
    return (
      <Pagina>
        <EstadoVacio icono="bi-receipt" titulo="No encontramos ese pago">
          <Link to="/" className="btn btn-primary">
            Volver al inicio
          </Link>
        </EstadoVacio>
      </Pagina>
    );
  }

  const reintentar = async () => {
    setProcesando(true);
    setAviso('');
    const respuesta = await pagarOrden(orden.id, resultado);
    if (respuesta.ok) {
      vaciar();
      navegar(`/compra/exitosa/${orden.id}`);
    } else {
      setProcesando(false);
      setAviso('El pago volvió a ser rechazado. Puedes intentarlo otra vez.');
    }
  };

  return (
    <Pagina ancho="contenedor-angosto">
      <div className="card p-3 p-md-4">
        <h1 className="h3 text-danger">
          <i className="bi bi-x-circle me-2" aria-hidden="true" />
          No se pudo realizar el pago. nro #{orden.numero}
        </h1>
        <p className="text-secondary">{orden.motivo || 'El pago no pudo completarse.'} Tu carrito sigue guardado.</p>
        <Alerta mensaje={aviso} />
        <div className="row align-items-end g-2 mb-2">
          <div className="col-sm-7">
            <CampoFormulario
              id="resultado"
              tipo="select"
              etiqueta="Resultado del pago (simulación)"
              valor={resultado}
              onChange={(e) => setResultado(e.target.value)}
              opciones={RESULTADOS_PAGO.map((r) => ({ valor: r.id, etiqueta: r.etiqueta }))}
              className="mb-0"
            />
          </div>
          <div className="col-sm-5">
            <Boton
              etiqueta={procesando ? 'Procesando…' : 'Volver a realizar el pago'}
              variante="success"
              className="w-100"
              deshabilitado={procesando}
              onClick={reintentar}
            />
          </div>
        </div>
        <ResumenOrden orden={orden} />
        <div className="text-center mt-3">
          <Link to="/carrito" className="btn btn-outline-secondary btn-sm">
            Volver al carrito
          </Link>
        </div>
      </div>
    </Pagina>
  );
}
