// src/AlternativeEvaluation.js
import React, { useEffect, useState } from 'react';

// Función auxiliar para generar pares de índices para n elementos
const generatePairs = (n) => {
  const pairs = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      pairs.push([i, j]);
    }
  }
  return pairs;
};

const AlternativeEvaluation = ({ alternatives, globalItems }) => {
  // Estado para almacenar los valores ingresados para cada par de alternativas, por ítem global.
  // Usaremos una clave única (globalKey) para cada ítem global.
  const [altPairValues, setAltPairValues] = useState({});
  // Estado para almacenar la puntuación global final de cada alternativa.
  const [alternativeScores, setAlternativeScores] = useState({});

  // Función para manejar cambios en el input para un ítem global
  const handleAltPairValueChange = (globalKey, pairIndex, event) => {
    const rawValue = event.target.value;
    setAltPairValues(prev => ({
      ...prev,
      [globalKey]: {
        ...(prev[globalKey] || {}),
        [pairIndex]: rawValue
      }
    }));
  };

  // Función para rellenar los valores por defecto (1) en inputs vacíos para cada ítem global
  const fillDefaultPairValues = () => {
    const newAltPairValues = { ...altPairValues };
    globalItems.forEach(item => {
      const globalKey = item.criterionId + "-" + (item.subcriterionId ? item.subcriterionId : "general");
      const n = alternatives.length;
      const pairs = generatePairs(n);
      if (!newAltPairValues[globalKey]) {
        newAltPairValues[globalKey] = {};
      }
      pairs.forEach((pair, index) => {
        if (newAltPairValues[globalKey][index] === undefined || newAltPairValues[globalKey][index] === "") {
          newAltPairValues[globalKey][index] = 1; // Valor por defecto
        }
      });
    });
    setAltPairValues(newAltPairValues);
  };

  // Cada vez que altPairValues, globalItems o alternatives cambien, recalcular los scores
  useEffect(() => {
    // Inicializar los scores de cada alternativa en 0
    const scores = {};
    alternatives.forEach(alt => { scores[alt.id] = 0; });

    globalItems.forEach(item => {
      const globalKey = item.criterionId + "-" + (item.subcriterionId ? item.subcriterionId : "general");
      const n = alternatives.length;
      if (n < 2) return; // Se requieren al menos dos alternativas

      const pairs = generatePairs(n);
      const pv = altPairValues[globalKey] || {};
      // Construir la matriz de comparación: n x n con 1 en la diagonal
      const matrix = Array.from({ length: n }, (_, i) =>
        Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))
      );
      pairs.forEach(([i, j], index) => {
        const value = (pv[index] === undefined || pv[index] === "") ? 1 : parseFloat(pv[index]);
        matrix[i][j] = value;
        matrix[j][i] = 1 / value;
      });
      // Calcular la media geométrica de cada fila
      const geoMeans = matrix.map(row => {
        const product = row.reduce((acc, val) => acc * val, 1);
        return Math.pow(product, 1 / n);
      });
      const sumGeo = geoMeans.reduce((acc, val) => acc + val, 0);
      const altPriority = geoMeans.map(val => val / sumGeo);
      // Acumular la contribución ponderada (prioridad * globalWeight) para cada alternativa
      alternatives.forEach((alt, index) => {
        scores[alt.id] += altPriority[index] * item.globalWeight;
      });
    });
    setAlternativeScores(scores);
  }, [altPairValues, globalItems, alternatives]);

  return (
    <div>
      <h2>Evaluación de Alternativas</h2>
      {globalItems.length === 0 ? (
        <p style={{ color: 'red' }}>No hay ítems globales para evaluar alternativas.</p>
      ) : (
        <>
          {globalItems.map(item => {
            const globalKey = item.criterionId + "-" + (item.subcriterionId ? item.subcriterionId : "general");
            const n = alternatives.length;
            const pairs = generatePairs(n);
            return (
              <div key={globalKey} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}>
                <h3>
                  {item.subcriterionName 
                    ? `${item.criterionName} - ${item.subcriterionName}` 
                    : item.criterionName
                  } (Peso Global: {item.globalWeight.toFixed(3)})
                </h3>
                <h4>Matriz de comparación entre alternativas para este ítem:</h4>
                <table border="1" cellPadding="5" style={{ borderCollapse: 'collapse', marginBottom: '10px' }}>
                  <thead>
                    <tr>
                      <th></th>
                      {alternatives.map((alt, idx) => (
                        <th key={idx}>{alt.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const pv = altPairValues[globalKey] || {};
                      const matrix = Array.from({ length: n }, (_, i) =>
                        Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))
                      );
                      pairs.forEach(([i, j], index) => {
                        const value = (pv[index] === undefined || pv[index] === "") ? 1 : parseFloat(pv[index]);
                        matrix[i][j] = value;
                        matrix[j][i] = 1 / value;
                      });
                      return matrix.map((row, i) => (
                        <tr key={i}>
                          <th>{alternatives[i].name}</th>
                          {row.map((val, j) => (
                            <td key={j}>{val.toFixed(3)}</td>
                          ))}
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
                <h4>Comparación manual entre alternativas para este ítem:</h4>
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                  {pairs.map(([i, j], index) => (
                    <li key={index} style={{ marginBottom: '5px' }}>
                      {alternatives[i].name} vs {alternatives[j].name}:
                      <input 
                        type="number"
                        min="1"
                        max="9"
                        step="1"
                        placeholder="1-9"
                        style={{ marginLeft: '10px', width: '50px' }}
                        onChange={(e) => handleAltPairValueChange(globalKey, index, e)}
                        value={
                          altPairValues[globalKey] && altPairValues[globalKey][index] !== undefined
                            ? altPairValues[globalKey][index]
                            : ""
                        }
                      />
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
          
          <h3>Resultados Globales de Alternativas</h3>
          <ul>
            {Object.entries(alternativeScores)
              .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
              .map(([altId, score]) => {
                const alt = alternatives.find(a => a.id === parseInt(altId, 10));
                return (
                  <li key={altId}>
                    {alt ? alt.name : altId}: {score.toFixed(3)}
                  </li>
                );
              })}
          </ul>
        </>
      )}
    </div>
  );
};

export default AlternativeEvaluation;
