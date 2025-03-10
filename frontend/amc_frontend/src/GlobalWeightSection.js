// src/GlobalWeightSection.js
import React, { useEffect, useState } from 'react';

const GlobalWeightSection = ({
  selectedCriteria,      // Ej: [1, 3, 5]
  selectedSubcriteria,   // Ej: { 1: [ { id, name }, ... ], 3: [...] }
  allCriteria,           // Lista completa de criterios (con sus subcriterios)
  criteriaPriority,      // Ej: [0.4, 0.35, 0.25]
  subcriteriaPriority,   // Ej: { 1: [0.6, 0.4], 3: [...] }
  setGlobalItems         // Callback para elevar la lista global
}) => {
  const [globalItems, setGlobalItemsLocal] = useState([]);

  useEffect(() => {
    // Filtrar la lista completa para obtener los criterios seleccionados
    const selectedCriteriaDetails = allCriteria.filter(criterion =>
      selectedCriteria.includes(criterion.id)
    );

    const items = [];

    selectedCriteriaDetails.forEach((criterion, critIndex) => {
      // Obtener el peso del criterio (prioridad) o asumir 1 si no se encuentra
      const critWeight = (criteriaPriority && criteriaPriority[critIndex] !== undefined)
        ? criteriaPriority[critIndex]
        : 1;
      
      // Obtener los subcriterios seleccionados para este criterio
      const subs = selectedSubcriteria[criterion.id] || [];
      
      // Caso especial: si el criterio se llama "Espacio disponible", evaluación general
      if (criterion.name && criterion.name.toLowerCase() === "espacio disponible") {
        items.push({
          criterionId: criterion.id,
          criterionName: criterion.name,
          subcriterionId: null,
          subcriterionName: null,
          globalWeight: critWeight
        });
      } 
      // Si se han seleccionado al menos dos subcriterios y se cuenta con su vector de prioridad
      else if (subs.length >= 2 &&
               subcriteriaPriority &&
               subcriteriaPriority[criterion.id] &&
               subcriteriaPriority[criterion.id].length === subs.length) {
        subs.forEach((sub, subIndex) => {
          const subWeight = subcriteriaPriority[criterion.id][subIndex];
          items.push({
            criterionId: criterion.id,
            criterionName: criterion.name,
            subcriterionId: sub.id,
            subcriterionName: sub.name,
            globalWeight: critWeight * subWeight
          });
        });
      } 
      // Si no hay suficientes subcriterios, se usa el peso del criterio (evaluación general)
      else {
        items.push({
          criterionId: criterion.id,
          criterionName: criterion.name,
          subcriterionId: null,
          subcriterionName: null,
          globalWeight: critWeight
        });
      }
    });

    // Ordenar los elementos de mayor a menor según el peso global
    items.sort((a, b) => b.globalWeight - a.globalWeight);
    setGlobalItemsLocal(items);
    // Elevar la lista calculada al componente padre
    setGlobalItems(items);
  }, [selectedCriteria, selectedSubcriteria, allCriteria, criteriaPriority, subcriteriaPriority, setGlobalItems]);

  return (
    <div>
      <h2>Peso Global</h2>
      {globalItems.length === 0 ? (
        <p>No hay datos para evaluar.</p>
      ) : (
        <ul>
          {globalItems.map((item, idx) => (
            <li key={idx}>
              {item.subcriterionName 
                ? `${item.criterionName} - ${item.subcriterionName}` 
                : item.criterionName
              }: {item.globalWeight.toFixed(3)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default GlobalWeightSection;
