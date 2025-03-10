// src/CriteriaSelection.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Collapse } from 'react-collapse';

const CriteriaSelection = ({ setLocalSelectedCriteria, setLocalSelectedSubcriteria, setAllCriteria }) => {
  const [criteria, setCriteria] = useState([]);
  // Estado local para controlar la selección de cada criterio (clave: criterionId, valor: true/false)
  const [localSelectedCriteria, setLocalSelectedCriteriaLocal] = useState({});
  // Estado para controlar la expansión de cada criterio (mostrar sus subcriterios)
  const [expanded, setExpanded] = useState({});
  // Estado local para almacenar, para cada criterio, un array de subcriterios seleccionados
  const [localSelectedSubcriteria, setLocalSelectedSubcriteriaLocal] = useState({});

  // Cargar criterios (con subcriterios) desde el backend
  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/criteria/')
      .then(response => {
        setCriteria(response.data);
        // Propagar la lista completa de criterios al componente padre
        setAllCriteria(response.data);
      })
      .catch(error => {
        console.error('Error al obtener los criterios:', error);
      });
  }, [setAllCriteria]);

  // Función para actualizar la selección en el componente padre
  const updateParent = (criteriaObj, subcriteriaObj) => {
    const selectedCriteriaArray = Object.keys(criteriaObj)
      .filter(key => criteriaObj[key])
      .map(id => parseInt(id, 10));
    setLocalSelectedCriteria(selectedCriteriaArray);
    setLocalSelectedSubcriteria(subcriteriaObj);
  };

  // Manejar el cambio del checkbox de un criterio
  const handleCriterionChange = (criterionId, event) => {
    const isChecked = event.target.checked;
    // Actualiza la expansión para mostrar/ocultar subcriterios
    const newExpanded = { ...expanded, [criterionId]: isChecked };
    setExpanded(newExpanded);
    // Actualiza la selección local del criterio
    const newCriteriaSelection = { ...localSelectedCriteria, [criterionId]: isChecked };
    setLocalSelectedCriteriaLocal(newCriteriaSelection);
    // Si se desmarca, eliminar la selección de sus subcriterios
    let newSubcriteriaSelection = { ...localSelectedSubcriteria };
    if (!isChecked) {
      delete newSubcriteriaSelection[criterionId];
      setLocalSelectedSubcriteriaLocal(newSubcriteriaSelection);
    }
    updateParent(newCriteriaSelection, newSubcriteriaSelection);
  };

  // Manejar el cambio del checkbox de un subcriterio
  const handleSubcriterionChange = (criterionId, sub, event) => {
    const isChecked = event.target.checked;
    const current = localSelectedSubcriteria[criterionId] || [];
    let newArray;
    if (isChecked) {
      if (!current.some(item => item.id === sub.id)) {
        newArray = [...current, sub];
      } else {
        newArray = current;
      }
    } else {
      newArray = current.filter(item => item.id !== sub.id);
    }
    const newSubcriteriaSelection = { ...localSelectedSubcriteria, [criterionId]: newArray };
    setLocalSelectedSubcriteriaLocal(newSubcriteriaSelection);
    updateParent(localSelectedCriteria, newSubcriteriaSelection);
  };

  return (
    <div>
      <h2>Selecciona los criterios y subcriterios a evaluar</h2>
      <form>
        {criteria.map(criterion => (
          <div key={criterion.id} style={{ marginBottom: '10px' }}>
            <label>
              <input
                type="checkbox"
                checked={!!localSelectedCriteria[criterion.id]}
                onChange={(e) => handleCriterionChange(criterion.id, e)}
              />
              {criterion.name}
            </label>
            <Collapse isOpened={expanded[criterion.id]}>
              <div style={{ paddingLeft: '20px', transition: 'all 0.3s ease' }}>
                {criterion.subcriteria && criterion.subcriteria.length > 0 ? (
                  <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
                    {criterion.subcriteria.map(sub => (
                      <li key={sub.id}>
                        <label>
                          <input
                            type="checkbox"
                            checked={
                              localSelectedSubcriteria[criterion.id]
                                ? localSelectedSubcriteria[criterion.id].some(item => item.id === sub.id)
                                : false
                            }
                            onChange={(e) => handleSubcriterionChange(criterion.id, sub, e)}
                          />
                          {sub.name}
                        </label>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ fontStyle: 'italic' }}>No hay subcriterios</p>
                )}
              </div>
            </Collapse>
          </div>
        ))}
      </form>
    </div>
  );
};

export default CriteriaSelection;
