// src/AlternativeInput.js
import React from 'react';

const AlternativeInput = ({ alternatives, setAlternatives, onAlternativesLoad }) => {
  // Maneja el cambio en el input de una alternativa
  const handleChange = (id, event) => {
    const newName = event.target.value;
    setAlternatives(prev =>
      prev.map(alt => alt.id === id ? { ...alt, name: newName } : alt)
    );
  };

  // Agrega un nuevo input de alternativa
  const addAlternative = () => {
    setAlternatives(prev => {
      // Genera un nuevo id basado en el id máximo existente + 1
      const newId = prev.length > 0 ? Math.max(...prev.map(a => a.id)) + 1 : 1;
      return [...prev, { id: newId, name: "" }];
    });
  };

  const removeAlternative = (id) => {
    setAlternatives(prev => prev.filter(alt => alt.id !== id));
  };

  const handleLoadAlternatives = () => {
    const validAlternatives = alternatives.filter(alt => alt.name.trim() !== "");
    if (validAlternatives.length < 2) {
      alert("Debe existir al menos dos alternativas para poder realizar la evaluación.");
      return;
    }
    if (onAlternativesLoad) {
      onAlternativesLoad(validAlternatives);
    }
  };

  return (
    <div>
      <h2>Ingrese Alternativas</h2>
      {alternatives.map(alt => (
        <div key={alt.id} style={{ marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="Nombre de la alternativa"
            value={alt.name}
            onChange={(e) => handleChange(alt.id, e)}
          />
          <button onClick={() => removeAlternative(alt.id)}>
            Eliminar
          </button>
        </div>
      ))}
      <button onClick={addAlternative}>Agregar Alternativa</button>
    </div>
  );
};

export default AlternativeInput;
