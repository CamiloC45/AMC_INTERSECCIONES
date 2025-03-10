// src/AHPAnalysis.js
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

const AHPAnalysis = ({ selectedCriteria, selectedSubcriteria, allCriteria, pairValues, setSubcriteriaPriority }) => {
  const [results, setResults] = useState([]);

  useEffect(() => {
    const analysisResults = [];
    // Filtrar los criterios seleccionados
    const selectedCriteriaDetails = allCriteria.filter(criterion =>
      selectedCriteria.includes(criterion.id)
    );
    const newSubcriteriaPriority = {}; // Para almacenar el vector de prioridad de cada criterio
    selectedCriteriaDetails.forEach(criterion => {
      if (criterion.name.toLowerCase() === "espacio disponible") {
        // No tiene subcriterios
        analysisResults.push({
          criterionId: criterion.id,
          criterionName: criterion.name,
          type: "general",
          message: "Evaluación general (sin subcriterios)."
        });
        return;
      }
      const subs = selectedSubcriteria[criterion.id] || [];
      if (subs.length < 2) {
        analysisResults.push({
          criterionId: criterion.id,
          criterionName: criterion.name,
          type: "general",
          message: "Evaluación general entre criterios (no se han seleccionado subcriterios)."
        });
        return;
      }
      const n = subs.length;
      const matrix = Array.from({ length: n }, (_, i) =>
        Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))
      );
      const pairs = generatePairs(n);
      const pv = pairValues[criterion.id] || {};
      pairs.forEach(([i, j], index) => {
        const value = pv[index] ? parseFloat(pv[index]) : 1;
        matrix[i][j] = value;
        matrix[j][i] = 1 / value;
      });
      const geoMeans = matrix.map(row => {
        const product = row.reduce((acc, val) => acc * val, 1);
        return Math.pow(product, 1 / n);
      });
      const sumGeo = geoMeans.reduce((acc, val) => acc + val, 0);
      const priorityVector = geoMeans.map(val => val / sumGeo);
      newSubcriteriaPriority[criterion.id] = priorityVector;
      analysisResults.push({
        criterionId: criterion.id,
        criterionName: criterion.name,
        type: "matrix",
        matrix,
        priorityVector,
        subs
      });
    });
    setResults(analysisResults);
    // Elevar el vector de prioridad de subcriterios al componente padre
    setSubcriteriaPriority(newSubcriteriaPriority);
  }, [selectedCriteria, selectedSubcriteria, allCriteria, pairValues, setSubcriteriaPriority]);

  return (
    <div>
      {/* Aquí se muestran los resultados (puedes dejarlo igual o ajustar según necesites) */}
      {results.map(result => {
        if (result.type === "general" || result.type === "error") {
          return (
            <div key={result.criterionId} style={{ marginBottom: '20px', color: result.type === "error" ? 'red' : 'black' }}>
              <h4>{result.criterionName}</h4>
              <p>{result.message}</p>
            </div>
          );
        }
        if (result.type === "matrix") {
          return (
            <div key={result.criterionId} style={{ marginBottom: '20px' }}>
              <h4>{result.criterionName} - Análisis de subcriterios</h4>
              <table border="1" cellPadding="5" style={{ borderCollapse: 'collapse', marginBottom: '10px' }}>
                <thead>
                  <tr>
                    <th></th>
                    {result.subs.map((sub, idx) => (
                      <th key={idx}>{sub.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.matrix.map((row, i) => (
                    <tr key={i}>
                      <th>{result.subs[i].name}</th>
                      {row.map((val, j) => (
                        <td key={j}>{val.toFixed(3)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <p>Vector de prioridades:</p>
              <ul>
                {result.priorityVector.map((val, idx) => (
                  <li key={idx}>
                    {result.subs[idx].name}: {val.toFixed(3)}
                  </li>
                ))}
              </ul>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
};

export default AHPAnalysis;