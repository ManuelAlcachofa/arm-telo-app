import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/** Buscador de la barra superior: lleva a /productos?q=texto. */
export default function BarraBusqueda({ onBuscar }) {
  const [texto, setTexto] = useState('');
  const navegar = useNavigate();

  const enviar = (evento) => {
    evento.preventDefault();
    const buscado = texto.trim();
    navegar(buscado ? `/productos?q=${encodeURIComponent(buscado)}` : '/productos');
    onBuscar?.();
  };

  return (
    <form className="d-flex" role="search" onSubmit={enviar}>
      <input
        type="search"
        className="form-control form-control-sm me-2 buscador"
        placeholder="Buscar"
        aria-label="Buscar productos"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
      />
      <button type="submit" className="btn btn-outline-primary btn-sm" aria-label="Buscar">
        <i className="bi bi-search" aria-hidden="true" />
      </button>
    </form>
  );
}
