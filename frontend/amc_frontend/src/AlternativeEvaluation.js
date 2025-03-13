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
  // Estado para almacenar, para cada ítem global, los datos de cada par.
  // Estructura: { [globalKey]: { [pairIndex]: { value: string, inverted: boolean } } }
  const [altPairValues, setAltPairValues] = useState({});
  // Estado para almacenar la puntuación global final de cada alternativa.
  const [alternativeScores, setAlternativeScores] = useState({});

  // Manejar cambio en el deslizador: actualiza la propiedad 'value'
  const handleAltPairValueChange = (globalKey, pairIndex, event) => {
    const rawValue = event.target.value;
    setAltPairValues(prev => ({
      ...prev,
      [globalKey]: {
        ...(prev[globalKey] || {}),
        [pairIndex]: {
          ...(prev[globalKey]?.[pairIndex] || { inverted: false }),
          value: rawValue
        }
      }
    }));
  };

  // Manejar el cambio del checkbox de inversión
  const handleAltPairInversionChange = (globalKey, pairIndex, event) => {
    const inverted = event.target.checked;
    setAltPairValues(prev => ({
      ...prev,
      [globalKey]: {
        ...(prev[globalKey] || {}),
        [pairIndex]: {
          ...(prev[globalKey]?.[pairIndex] || { value: "1" }),
          inverted: inverted
        }
      }
    }));
  };

  useEffect(() => {
    // Inicializar los scores de cada alternativa en 0
    const scores = {};
    alternatives.forEach(alt => { scores[alt.id] = 0; });

    // Para cada ítem global, generar la matriz de comparación para alternativas y calcular el vector de prioridades
    globalItems.forEach(item => {
      // Generar clave única para este ítem global
      const globalKey = item.criterionId + "-" + (item.subcriterionId ? item.subcriterionId : "general");
      const n = alternatives.length;
      if (n < 2) return; // Se requieren al menos dos alternativas

      const pairs = generatePairs(n);
      const pv = altPairValues[globalKey] || {};
      // Construir una matriz n x n con 1 en la diagonal
      const matrix = Array.from({ length: n }, (_, i) =>
        Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))
      );
      pairs.forEach(([i, j], index) => {
        const pairObj = pv[index] || {};
        const rawVal = pairObj.value;
        const inverted = pairObj.inverted;
        const value = (rawVal === undefined || rawVal === "") ? 1 : parseFloat(rawVal);
        // Si se marcó invertir, se toma el recíproco como valor para la posición (i,j)
        const effective = inverted ? 1 / value : value;
        matrix[i][j] = effective;
        matrix[j][i] = 1 / effective;
      });
      // Calcular la media geométrica de cada fila
      const geoMeans = matrix.map(row => {
        const product = row.reduce((acc, val) => acc * val, 1);
        return Math.pow(product, 1 / n);
      });
      const sumGeo = geoMeans.reduce((acc, val) => acc + val, 0);
      const altPriority = geoMeans.map(val => val / sumGeo);
      // Acumular la contribución ponderada (prioridad * globalWeight) a cada alternativa
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
                        const pairObj = pv[index] || {};
                        const rawVal = pairObj.value;
                        const inverted = pairObj.inverted;
                        const value = (rawVal === undefined || rawVal === "") ? 1 : parseFloat(rawVal);
                        const effective = inverted ? 1 / value : value;
                        matrix[i][j] = effective;
                        matrix[j][i] = 1 / effective;
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
                        type="range"
                        min="1"
                        max="9"
                        step="1"
                        style={{ marginLeft: '10px' }}
                        onChange={(e) => handleAltPairValueChange(globalKey, index, e)}
                        value={
                          altPairValues[globalKey] && altPairValues[globalKey][index] && altPairValues[globalKey][index].value !== undefined
                            ? altPairValues[globalKey][index].value
                            : "1"
                        }
                      />
                      <span style={{ marginLeft: '5px' }}>
                        {altPairValues[globalKey] && altPairValues[globalKey][index] && altPairValues[globalKey][index].value !== undefined
                          ? altPairValues[globalKey][index].value
                          : "1"}
                      </span>
                      <label style={{ marginLeft: '10px' }}>
                        <input 
                          type="checkbox"
                          onChange={(e) => handleAltPairInversionChange(globalKey, index, e)}
                          checked={
                            altPairValues[globalKey] && altPairValues[globalKey][index] && altPairValues[globalKey][index].inverted
                              ? true
                              : false
                          }
                        />
                        Invertir
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
          <hr />
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
