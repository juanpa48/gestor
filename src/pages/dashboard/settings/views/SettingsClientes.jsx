import React, { useState, useEffect } from 'react';

export const SettingsClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentCliente, setCurrentCliente] = useState({ id: '', nombre: '', nit: '' });

  const loadClientes = () => {
    try {
      const db = JSON.parse(localStorage.getItem('db_clientes') || '[]');
      // Sort alphabetically by nombre
      db.sort((a, b) => a.nombre.localeCompare(b.nombre));
      setClientes(db);
    } catch {
      setClientes([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadClientes();
  }, []);

  const handleSave = () => {
    if (!currentCliente.nombre || !currentCliente.nombre.trim()) return;

    let updatedList = [...clientes];
    
    if (editMode) {
      updatedList = updatedList.map(c => c.id === currentCliente.id ? { ...currentCliente } : c);
    } else {
      const newId = `CLI-${Date.now()}`;
      updatedList.push({ ...currentCliente, id: newId });
    }

    localStorage.setItem('db_clientes', JSON.stringify(updatedList));
    setClientes(updatedList.sort((a, b) => a.nombre.localeCompare(b.nombre)));
    setShowModal(false);
    setCurrentCliente({ id: '', nombre: '', nit: '' });
  };

  const handleEdit = (cliente) => {
    setCurrentCliente({ ...cliente });
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar este cliente? Esta acción no se puede deshacer.')) {
      const updatedList = clientes.filter(c => c.id !== id);
      localStorage.setItem('db_clientes', JSON.stringify(updatedList));
      setClientes(updatedList);
    }
  };

  const openNewModal = () => {
    setCurrentCliente({ id: '', nombre: '', nit: '' });
    setEditMode(false);
    setShowModal(true);
  };

  const filteredClientes = clientes.filter(c => 
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.nit || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', color: 'var(--text-light)' }}>Directorio de Clientes</h2>
          <p style={{ margin: '5px 0 0 0', color: 'var(--text-muted)', fontSize: '14px' }}>Administra la base de datos de clientes disponibles para el reporte de asistencia.</p>
        </div>
        <button className="btn-primary" onClick={openNewModal}>
          <i className="fa-solid fa-plus"></i> Agregar Cliente
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px' }}>
        <div style={{ marginBottom: '20px' }}>
          <div className="search-box">
            <i className="fa-solid fa-search"></i>
            <input 
              type="text" 
              placeholder="Buscar cliente por nombre o NIT..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="glass-input"
            />
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <i className="fa-solid fa-spinner fa-spin fa-2x text-blue"></i>
          </div>
        ) : filteredClientes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <i className="fa-solid fa-building-user fa-3x" style={{ marginBottom: '15px', opacity: 0.5 }}></i>
            <p>No se encontraron clientes en la base de datos.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
            {filteredClientes.map(c => (
              <div key={c.id} style={{ background: 'var(--bg-dark)', border: '1px solid var(--card-border)', padding: '15px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: '0 0 5px 0', fontSize: '15px', color: '#3b82f6' }}>{c.nombre}</h4>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    <i className="fa-solid fa-hashtag"></i> NIT: {c.nit || 'N/A'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button className="btn-secondary" style={{ padding: '5px 8px', fontSize: '12px', margin: 0 }} onClick={() => handleEdit(c)}>
                    <i className="fa-solid fa-pen"></i>
                  </button>
                  <button className="btn-secondary" style={{ padding: '5px 8px', fontSize: '12px', color: '#ef4444', margin: 0 }} onClick={() => handleDelete(c.id)}>
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ width: '450px' }}>
            <div className="modal-header">
              <h3>{editMode ? 'Editar Cliente' : 'Nuevo Cliente'}</h3>
              <button className="btn-close" onClick={() => setShowModal(false)}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Nombre de la Empresa o Cliente *</label>
                <input 
                  type="text" 
                  className="glass-input" 
                  required 
                  value={currentCliente.nombre}
                  onChange={(e) => setCurrentCliente({...currentCliente, nombre: e.target.value})}
                  placeholder="Ej: Grupo Éxito S.A."
                />
              </div>
              <div className="form-group">
                <label className="form-label">NIT / Documento (Opcional)</label>
                <input 
                  type="text" 
                  className="glass-input" 
                  value={currentCliente.nit}
                  onChange={(e) => setCurrentCliente({...currentCliente, nit: e.target.value})}
                  placeholder="Ej: 890.900.608-9"
                />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="button" className="btn-primary" style={{ margin: 0 }} onClick={() => handleSave()}>
                  {editMode ? 'Guardar Cambios' : 'Agregar Cliente'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
