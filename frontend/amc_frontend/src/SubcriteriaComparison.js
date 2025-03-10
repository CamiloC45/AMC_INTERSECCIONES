// src/SubcriteriaComparison.js
import React, { useState } from 'react';

const generatePairs = (array) => {
  const pairs = [];
  for (let i = 0; i < array.length; i++) {
    for (let j = i + 1; j < array.length; j++) {
      pairs.push([array[i], array[j]]);
    }
  }
  return pairs;
};

const SubcriteriaComparison = ({ selectedCriteria, selectedSubcriteria, allCriteria, pairValues, setPairValues }) => {
  // Declaramos el estado para almacenar los valores ingresados para cada par,
  // en un objeto con clave = criterio y valor = objeto con índice de par y valor ingresado.

  // Obtener detalles completos de los criterios seleccionados
  const selectedCriteriaDetails = allCriteria.filter(criterion =>
    selectedCriteria.includes(criterion.id)
  );

  if (selectedCriteriaDetails.length < 2) {
    return (
      <p style={{ color: 'red' }}>
        Debe seleccionar al menos dos criterios para realizar la evaluación.
      </p>
    );
  }
  
  // Función para manejar el cambio en el input para un par
  const handlePairValueChange = (criterionId, pairIndex, event) => {
    const value = parseFloat(event.target.value);
    if (value >= 1 && value <= 9) {
      setPairValues(prev => ({
        ...prev,
        [criterionId]: {
          ...(prev[criterionId] || {}),
          [pairIndex]: value,
        }
      }));
    }
  };
  
  return (
    <div>
      {selectedCriteriaDetails.map(criterion => {
        // Caso especial: "Espacio disponible" se evalúa de forma general
        if (criterion.name.toLowerCase() === "espacio disponible") {
          return (
            <div key={criterion.id} style={{ marginBottom: '10px' }}>
              <h4>{criterion.name}</h4>
              <p>Evaluación general (sin subcriterios).</p>
            </div>
          );
        }
        const subs = selectedSubcriteria[criterion.id] || [];
        if (!subs || subs.length === 0) {
          return (
            <div key={criterion.id} style={{ marginBottom: '10px' }}>
              <h4>{criterion.name}</h4>
              <p>Evaluación general entre criterios (no se han seleccionado subcriterios).</p>
            </div>
          );
        }
        if (subs.length === 1) {
          return (
            <div key={criterion.id} style={{ marginBottom: '10px', color: 'red' }}>
              <h4>{criterion.name}</h4>
              <p>
                Para el criterio "{criterion.name}" se debe seleccionar al menos dos subcriterios para evaluar.
              </p>
            </div>
          );
        }
        // Genera los pares automáticamente
        const pairs = generatePairs(subs);
        return (
          <div key={criterion.id} style={{ marginBottom: '20px' }}>
            <h4>{criterion.name}</h4>
            <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
              {pairs.map((pair, index) => (
                <li key={index} style={{ marginBottom: '5px' }}>
                  {pair[0].name} vs {pair[1].name} 
                  <input 
                    type="number"
                    min="1"
                    max="9"
                    placeholder="1-9"
                    style={{ marginLeft: '10px', width: '50px' }}
                    onChange={(e) => handlePairValueChange(criterion.id, index, e)}
                    value={
                      pairValues[criterion.id] && pairValues[criterion.id][index] 
                        ? pairValues[criterion.id][index]
                        : ''
                    }
                  />
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
};

export default SubcriteriaComparison;