import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import CampoFormulario from './CampoFormulario.jsx';

describe('<CampoFormulario />', () => {
  it('asocia la etiqueta con el campo', () => {
    render(<CampoFormulario id="correo" etiqueta="Correo" valor="" onChange={() => {}} />);
    expect(screen.getByLabelText('Correo')).toBeTruthy();
  });

  it('muestra el mensaje de error solo cuando hay un error', () => {
    const { rerender } = render(<CampoFormulario id="nombre" etiqueta="Nombre" valor="" onChange={() => {}} />);
    expect(screen.queryByRole('alert')).toBeNull();

    rerender(<CampoFormulario id="nombre" etiqueta="Nombre" valor="" onChange={() => {}} error="Falta el nombre." />);
    expect(screen.getByRole('alert').textContent).toBe('Falta el nombre.');
    expect(screen.getByLabelText('Nombre').getAttribute('aria-invalid')).toBe('true');
  });

  it('actualiza el valor del campo cuando la persona escribe (estado del padre)', () => {
    function Padre() {
      const [valor, setValor] = useState('');
      return <CampoFormulario id="nombre" etiqueta="Nombre" valor={valor} onChange={(e) => setValor(e.target.value)} />;
    }
    render(<Padre />);
    const campo = screen.getByLabelText('Nombre');
    fireEvent.change(campo, { target: { value: 'Ana' } });
    expect(campo.value).toBe('Ana');
  });

  it('dibuja las opciones de una lista desplegable', () => {
    render(
      <CampoFormulario
        id="region"
        tipo="select"
        etiqueta="Región"
        valor=""
        onChange={() => {}}
        opciones={[
          { valor: '', etiqueta: 'Selecciona' },
          { valor: 'a', etiqueta: 'Región A' },
        ]}
      />,
    );
    expect(screen.getAllByRole('option').length).toBe(2);
  });
});
