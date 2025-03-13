// src/CriteriaAHP.js
import React, { useEffect, useState } from 'react';

const generatePairs = (n) => {
  const pairs = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      pairs.push([i, j]);
    }
  }
  return pairs;
};

const CriteriaAHP = ({ selectedCriteria, allCriteria, setCriteriaPriority }) => {
  // Filtrar los criterios seleccionados
  const selectedCriteriaDetails = allCriteria.filter(criterion =>
    selectedCriteria.includes(criterion.id)
  );

  // Estado para almacenar los valores de comparación para cada par
  // Estructura: { [pairIndex]: { value: string, inverted: boolean } }
  const [pairValues, setPairValues] = useState({});
  // Estados para la matriz de comparación y el vector de prioridades
  const [matrix, setMatrix] = useState([]);
  const [priorityVector, setPriorityVector] = useState([]);

  // Genera los pares de índices según la cantidad de criterios seleccionados
  const pairs = generatePairs(selectedCriteriaDetails.length);

  // Manejador para el slider: actualiza la propiedad 'value'
  const handlePairValueChange = (pairIndex, event) => {
    const rawValue = event.target.value; // valor como string
    setPairValues(prev => ({
      ...prev,
      [pairIndex]: {
        ...((prev[pairIndex]) || { inverted: false }),
        value: rawValue
      }
    }));
  };

  // Manejador para el checkbox de inversión
  const handleInversionChange = (pairIndex, event) => {
    const inverted = event.target.checked;
    setPairValues(prev => ({
      ...prev,
      [pairIndex]: {
        ...((prev[pairIndex]) || { value: "1" }),
        inverted: inverted
      }
    }));
  };

  // Cada vez que cambien pairValues o la cantidad de criterios, recalcula la matriz y el vector
  useEffect(() => {
    const n = selectedCriteriaDetails.length;
    if (n < 2) {
      setMatrix([]);
      setPriorityVector([]);
      setCriteriaPriority([]);
      return;
    }
    // Inicializa la matriz n x n con 1 en la diagonal
    const newMatrix = Array.from({ length: n }, (_, i) =>
      Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))
    );
    // Para cada par, se extrae el objeto correspondiente y se calcula el valor efectivo
    pairs.forEach(([i, j], index) => {
      const pairObj = pairValues[index] || {};
      const rawVal = pairObj.value;
      const value = (rawVal === undefined || rawVal === "") ? 1 : parseFloat(rawVal);
      const effective = pairObj.inverted ? 1 / value : value;
      newMatrix[i][j] = effective;
      newMatrix[j][i] = 1 / effective;
    });
    // Calcular la media geométrica de cada fila
    const geoMeans = newMatrix.map(row => {
      const product = row.reduce((acc, val) => acc * val, 1);
      return Math.pow(product, 1 / n);
    });
    const sumGeo = geoMeans.reduce((acc, val) => acc + val, 0);
    const newPriorityVector = geoMeans.map(val => val / sumGeo);
    setMatrix(newMatrix);
    setPriorityVector(newPriorityVector);
    setCriteriaPriority(newPriorityVector); // Eleva el vector de prioridades al padre
  }, [pairValues, selectedCriteriaDetails.length, pairs, setCriteriaPriority]);

  return (
    <div>
      {selectedCriteriaDetails.length < 2 ? (
        <p style={{ color: 'red' }}>Debe seleccionar al menos dos criterios para la evaluación.</p>
      ) : (
        <>
          <h3>Comparación entre criterios</h3>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {pairs.map(([i, j], index) => (
              <li key={index} style={{ marginBottom: '5px' }}>
                {selectedCriteriaDetails[i]?.name || "N/A"} vs {selectedCriteriaDetails[j]?.name || "N/A"}:
                <input 
                  type="range"
                  min="1"
                  max="9"
                  step="1"
                  style={{ marginLeft: '10px' }}
                  onChange={(e) => handlePairValueChange(index, e)}
                  value={pairValues[index] && pairValues[index].value !== undefined ? pairValues[index].value : "1"}
                />
                <span style={{ marginLeft: '5px' }}>
                  {pairValues[index] && pairValues[index].value !== undefined ? pairValues[index].value : "1"}
                </span>
                <label style={{ marginLeft: '10px' }}>
                  <input 
                    type="checkbox"
                    onChange={(e) => handleInversionChange(index, e)}
                    checked={pairValues[index] && pairValues[index].inverted ? true : false}
                  />
                  Invertir
                </label>
              </li>
            ))}
          </ul>
          <h3>Matriz de comparación:</h3>
          <table border="1" cellPadding="5" style={{ borderCollapse: 'collapse', marginBottom: '10px' }}>
            <thead>
              <tr>
                <th></th>
                {selectedCriteriaDetails.map((crit, idx) => (
                  <th key={idx}>{crit?.name || "N/A"}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.map((row, i) => (
                <tr key={i}>
                  <th>{selectedCriteriaDetails[i]?.name || "N/A"}</th>
                  {row.map((val, j) => (
                    <td key={j}>{val.toFixed(3)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <h3>Vector de prioridades:</h3>
          <ul>
            {priorityVector.map((val, idx) => (
              <li key={idx}>
                {selectedCriteriaDetails[idx]?.name || "N/A"}: {val.toFixed(3)}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default CriteriaAHP;
