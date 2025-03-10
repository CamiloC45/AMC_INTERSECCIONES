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
  // Filtra los criterios completos seleccionados
  const selectedCriteriaDetails = allCriteria.filter(criterion =>
    selectedCriteria.includes(criterion.id)
  );

  // Estado para almacenar los valores ingresados para cada par (clave: índice del par, valor: string)
  const [pairValues, setPairValues] = useState({});
  // Estados para la matriz de comparación y el vector de prioridades
  const [matrix, setMatrix] = useState([]);
  const [priorityVector, setPriorityVector] = useState([]);

  // Genera los pares de índices para los criterios seleccionados
  const pairs = generatePairs(selectedCriteriaDetails.length);

  // Manejar el cambio del valor en el input; se guarda como string para permitir borrar.
  const handlePairValueChange = (pairIndex, event) => {
    const rawValue = event.target.value;
    setPairValues(prev => ({
      ...prev,
      [pairIndex]: rawValue
    }));
  };

  // Cada vez que cambien los pairValues o la cantidad de criterios, recalcula la matriz y el vector
  useEffect(() => {
    const n = selectedCriteriaDetails.length;
    if (n < 2) {
      setMatrix([]);
      setPriorityVector([]);
      setCriteriaPriority([]); //Eleva un vector vacio su ni hay suficientes criterios
      return;
    }
    // Inicializa la matriz n x n con 1 en la diagonal
    const newMatrix = Array.from({ length: n }, (_, i) =>
      Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))
    );
    // Para cada par, usa el valor ingresado (o 1 si está vacío) y asigna el recíproco
    pairs.forEach(([i, j], index) => {
      const rawVal = pairValues[index];
      const value = (rawVal === undefined || rawVal === "") ? 1 : parseFloat(rawVal);
      newMatrix[i][j] = value;
      newMatrix[j][i] = 1 / value;
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
    setCriteriaPriority(newPriorityVector); //Eleva el vector de prioridades
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
                {selectedCriteriaDetails[i] ? selectedCriteriaDetails[i].name : "N/A"} vs {selectedCriteriaDetails[j] ? selectedCriteriaDetails[j].name : "N/A"}:
                <input 
                  type="number"
                  min="1"
                  max="9"
                  step="1"
                  placeholder="1-9"
                  style={{ marginLeft: '10px', width: '50px' }}
                  onChange={(e) => handlePairValueChange(index, e)}
                  value={pairValues[index] !== undefined ? pairValues[index] : ""}
                />
              </li>
            ))}
          </ul>
          <h3>Matriz de comparación:</h3>
          <table border="1" cellPadding="5" style={{ borderCollapse: 'collapse', marginBottom: '10px' }}>
            <thead>
              <tr>
                <th></th>
                {selectedCriteriaDetails.map((crit, idx) => (
                  <th key={idx}>{crit ? crit.name : "N/A"}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.map((row, i) => (
                <tr key={i}>
                  <th>{selectedCriteriaDetails[i] ? selectedCriteriaDetails[i].name : "N/A"}</th>
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
                {selectedCriteriaDetails[idx] ? selectedCriteriaDetails[idx].name : "N/A"}: {val.toFixed(3)}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default CriteriaAHP;
