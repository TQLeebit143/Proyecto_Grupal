async function cargarHeladosAsync() {
  try {
    const res = await fetch('data/catalogo.json');
    return await res.json();
  } catch(e) {
    return (typeof catalogoHelados !== 'undefined') ? catalogoHelados : [];
  }
}
