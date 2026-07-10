const equipos = [
  {
    "id": "1",
    "usuario_asignado_id": null,
    "Usuario": "Cristian Fernando Gutiérrez Gutiérrez"
  }
];

const legacyUsuarioNombre = "Cristian Fernando Gutiérrez Gutiérrez";
const usuarioId = "80e2bd11-590e-4158-8e5b-413dc4975720";
const dbUser = null;

const filtered = equipos.filter(eq => {
  if (usuarioId && eq.usuario_asignado_id === usuarioId) return true;
  if (eq['Usuario']) {
     const eqUser = eq['Usuario'].toLowerCase();
     if (dbUser && dbUser.nombre && eqUser.includes(dbUser.nombre.toLowerCase())) return true;
     if (dbUser && dbUser.email && eqUser.includes(dbUser.email.toLowerCase())) return true;
     if (legacyUsuarioNombre && eqUser.includes(legacyUsuarioNombre.toLowerCase())) return true;
  }
  return false;
});

console.log('Filtered length:', filtered.length);
