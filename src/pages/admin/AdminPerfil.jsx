import PerfilForm from '../../components/PerfilForm.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function AdminPerfil() {
  const { usuario, actualizarPerfil } = useAuth();
  return (
    <>
      <h1 className="h3">Perfil</h1>
      <p className="text-secondary">{usuario.correo}</p>
      <div className="card p-3 p-md-4 contenedor-formulario ms-0">
        <PerfilForm usuario={usuario} onGuardar={actualizarPerfil} />
      </div>
    </>
  );
}
