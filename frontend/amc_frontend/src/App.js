// src/App.js
import React, { useState } from 'react';
import CriteriaSelection from './CriteriaSelection';
import SubcriteriaComparison from './SubcriteriaComparison';
import AHPAnalysis from './AHPAnalysis';
import CriteriaAHP from './CriteriaAHP';
import GlobalWeightSection from './GlobalWeightSection';
import AlternativeEvaluation from './AlternativeEvaluation';
import AlternativeInput from './AlternativeInput';

function App() {
  const [selectedCriteria, setSelectedCriteria] = useState([]);
  const [selectedSubcriteria, setSelectedSubcriteria] = useState({});
  const [allCriteria, setAllCriteria] = useState([]);
  const [pairValues, setPairValues] = useState({});
  const [criteriaPriority, setCriteriaPriority] = useState([]);  
  const [subcriteriaPriority, setSubcriteriaPriority] = useState({});
  const [globalItems, setGlobalItems] = useState([]);
  const [alternatives, setAlternatives] = useState([{ id: 1, name: "" }]);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Evaluación de Intersecciones</h1>
      <CriteriaSelection 
        setLocalSelectedCriteria={setSelectedCriteria}
        setLocalSelectedSubcriteria={setSelectedSubcriteria}
        setAllCriteria={setAllCriteria}
      />
      <hr />
      <h2>Evaluación entre subcriterios</h2>
      <SubcriteriaComparison 
        selectedCriteria={selectedCriteria}
        selectedSubcriteria={selectedSubcriteria}
        allCriteria={allCriteria}
        pairValues={pairValues}
        setPairValues={setPairValues}
        setSubcriteriaPriority={setSubcriteriaPriority}
        subcriteriaPriority={subcriteriaPriority}
      />
      <hr />
      <h2>Análisis de subcriterios</h2>
      <AHPAnalysis 
        selectedCriteria={selectedCriteria}
        selectedSubcriteria={selectedSubcriteria}
        allCriteria={allCriteria}
        pairValues={pairValues}
        setSubcriteriaPriority={setSubcriteriaPriority}
      />
      <hr />
      <h2>Análisis de criterios</h2>
      <CriteriaAHP 
        selectedCriteria={selectedCriteria}
        allCriteria={allCriteria}
        setCriteriaPriority={setCriteriaPriority}
      />
      <hr />
      <h2>Peso Global de los criterios o subcriterios</h2>
      <GlobalWeightSection 
        selectedCriteria={selectedCriteria}
        selectedSubcriteria={selectedSubcriteria}
        allCriteria={allCriteria}
        criteriaPriority={criteriaPriority}
        subcriteriaPriority={subcriteriaPriority}
        setGlobalItems={setGlobalItems}
      />
      <hr />
      <AlternativeInput 
        alternatives={alternatives}
        setAlternatives={setAlternatives}
      />
      <hr />
      <AlternativeEvaluation
        alternatives={alternatives}
        globalItems={globalItems}
      />
    </div>
  );
}

export default App;
