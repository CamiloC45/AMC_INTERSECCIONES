// src/AddItems.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AddItems() {
  // Estado para gestionar la lista de criterios existentes (se carga desde el backend)
  const [criteriaList, setCriteriaList] = useState([]);

  // --- Sección: Agregar Criterio ---
  const [criterionName, setCriterionName] = useState('');
  const [criterionDescription, setCriterionDescription] = useState('');

  // --- Sección: Agregar Subcriterio ---
  const [selectedCriterionId, setSelectedCriterionId] = useState('');
  const [subCriterionName, setSubCriterionName] = useState('');
  const [subCriterionDescription, setSubCriterionDescription] = useState('');

  // --- Sección: Agregar Comparación ---
  const [comparisonCriterion1, setComparisonCriterion1] = useState('');
  const [comparisonCriterion2, setComparisonCriterion2] = useState('');
  const [comparisonValue, setComparisonValue] = useState('');

  // Cargar la lista de criterios al montar el componente
  useEffect(() => {
    fetchCriteria();
  }, []);

  // Función para obtener criterios del backend
  const fetchCriteria = () => {
    axios.get('http://127.0.0.1:8000/api/criteria/')
      .then(response => {
        // Asumimos que la respuesta es un arreglo de objetos con { id, name, description, weight, subcriteria }
        setCriteriaList(response.data);
      })
      .catch(error => {
        console.error("Error al obtener criterios:", error);
      });
  };

  // Función para agregar un criterio nuevo
  const handleAddCriterion = () => {
    // Preparamos el objeto con los datos del criterio
    const data = {
      name: criterionName,
      description: criterionDescription
    };
    axios.post('http://127.0.0.1:8000/api/criteria/', data)
      .then(response => {
        alert("Criterio agregado exitosamente");
        // Limpiar campos
        setCriterionName('');
        setCriterionDescription('');
        // Actualizar la lista de criterios
        fetchCriteria();
      })
      .catch(error => {
        console.error("Error al agregar criterio:", error);
      });
  };

  // Función para agregar un subcriterio a un criterio seleccionado
  const handleAddSubCriterion = () => {
    if (!selectedCriterionId) {
      alert("Seleccione un criterio primero");
      return;
    }
    const data = {
      // Se asume que el campo "criterion" espera el ID del criterio padre
      criterion: selectedCriterionId,
      name: subCriterionName,
      description: subCriterionDescription
    };
    // Nota: Se asume que en el backend se ha configurado un endpoint para subcriterios en /api/subcriteria/
    axios.post('http://127.0.0.1:8000/api/subcriteria/', data)
      .then(response => {
        alert("Subcriterio agregado exitosamente");
        setSubCriterionName('');
        setSubCriterionDescription('');
        fetchCriteria(); // Actualizar lista para reflejar los subcriterios
      })
      .catch(error => {
        console.error("Error al agregar subcriterio:", error);
      });
  };

  // Función para agregar una comparación entre dos criterios
  const handleAddComparison = () => {
    if (!comparisonCriterion1 || !comparisonCriterion2 || !comparisonValue) {
      alert("Complete todos los campos de la comparación");
      return;
    }
    const data = {
      // Se espera que los campos "criterion1" y "criterion2" sean los IDs de los criterios
      criterion1: comparisonCriterion1,
      criterion2: comparisonCriterion2,
      value: parseFloat(comparisonValue)
    };
    // Se asume que el endpoint para comparaciones es /api/comparisons/
    axios.post('http://127.0.0.1:8000/api/comparisons/', data)
      .then(response => {
        alert("Comparación agregada exitosamente");
        setComparisonCriterion1('');
        setComparisonCriterion2('');
        setComparisonValue('');
      })
      .catch(error => {
        console.error("Error al agregar comparación:", error);
      });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Administrar Análisis Multicriterio</h1>
      
      {/* Sección para Agregar Criterio */}
      <section style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '20px' }}>
        <h2>Agregar Criterio</h2>
        <input 
          type="text" 
          placeholder="Nombre del criterio" 
          value={criterionName}
          onChange={(e) => setCriterionName(e.target.value)}
        />
        <br />
        <textarea 
          placeholder="Descripción del criterio" 
          value={criterionDescription}
          onChange={(e) => setCriterionDescription(e.target.value)}
        />
        <br />
        <button onClick={handleAddCriterion}>Agregar Criterio</button>
      </section>

      {/* Sección para Agregar Subcriterio */}
      <section style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '20px' }}>
        <h2>Agregar Subcriterio</h2>
        <label>Seleccione un criterio: </label>
        <select 
          value={selectedCriterionId} 
          onChange={(e) => setSelectedCriterionId(e.target.value)}
        >
          <option value="">--Seleccione--</option>
          {criteriaList.map(criterion => (
            <option key={criterion.id} value={criterion.id}>
              {criterion.name}
            </option>
          ))}
        </select>
        <br />
        <input 
          type="text" 
          placeholder="Nombre del subcriterio" 
          value={subCriterionName}
          onChange={(e) => setSubCriterionName(e.target.value)}
        />
        <br />
        <textarea 
          placeholder="Descripción del subcriterio" 
          value={subCriterionDescription}
          onChange={(e) => setSubCriterionDescription(e.target.value)}
        />
        <br />
        <button onClick={handleAddSubCriterion}>Agregar Subcriterio</button>
      </section>

      {/* Sección para Agregar Comparación */}
      <section style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '20px' }}>
        <h2>Agregar Comparación</h2>
        <label>Criterio 1: </label>
        <select 
          value={comparisonCriterion1} 
          onChange={(e) => setComparisonCriterion1(e.target.value)}
        >
          <option value="">--Seleccione--</option>
          {criteriaList.map(criterion => (
            <option key={criterion.id} value={criterion.id}>
              {criterion.name}
            </option>
          ))}
        </select>
        <br />
        <label>Criterio 2: </label>
        <select 
          value={comparisonCriterion2} 
          onChange={(e) => setComparisonCriterion2(e.target.value)}
        >
          <option value="">--Seleccione--</option>
          {criteriaList.map(criterion => (
            <option key={criterion.id} value={criterion.id}>
              {criterion.name}
            </option>
          ))}
        </select>
        <br />
        <input 
          type="text" 
          placeholder="Valor de comparación (ej. 1, 3, 5, 7, 9)" 
          value={comparisonValue}
          onChange={(e) => setComparisonValue(e.target.value)}
        />
        <br />
        <button onClick={handleAddComparison}>Agregar Comparación</button>
      </section>
    </div>
  );
}

export default AddItems;
