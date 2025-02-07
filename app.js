// app.js
const { useState } = React;

// Define the algorithm tree.
const steps = {
  step1: {
    name: "HBsAg",
    positive: { next: "step2" },
    negative: { next: "step4" }
  },
  step2: {
    name: "IgM anti-HBc",
    positive: { next: "step3" },
    negative: { result: "Chronic HBV carrier" }
  },
  step3: {
    name: "IgG anti-HBc",
    positive: { result: "Acute flare of chronic HBV" },
    negative: { result: "Acute HBV: early phase" }
  },
  step4: {
    name: "IgM anti-HBc",
    positive: { result: "Acute HBV: window phase" },
    negative: { next: "step5" }
  },
  step5: {
    name: "IgG anti-HBc",
    positive: { next: "step6" },
    negative: { result: "Vaccinated for HBV" }
  },
  step6: {
    name: "Anti-HBe",
    positive: { result: "Acute HBV: recovery phase" },
    negative: { result: "Immune due to natural HBV infection" }
  }
};

function App() {
  // History stores past decisions so that going back clears later selections.
  const [history, setHistory] = useState([]); // each item: { stepKey, selection }
  const [currentStepKey, setCurrentStepKey] = useState("step1");
  const [currentSelection, setCurrentSelection] = useState(null);
  const [isFinal, setIsFinal] = useState(false);
  const [finalResult, setFinalResult] = useState("");
  // transitionDirection determines whether the new card slides in from the right (“next”) or left (“back”)
  const [transitionDirection, setTransitionDirection] = useState("next");

  // When the user clicks one of the checkbox options.
  const handleSelection = (selection) => {
    // Since we want mutually exclusive checkboxes, simply set the selection.
    setCurrentSelection(selection);
  };

  // When the user clicks “Next”
  const handleNext = () => {
    if (!currentSelection) return; // safeguard; button is disabled until selection is made
    const currentNode = steps[currentStepKey];
    const outcome = currentNode[currentSelection];
    if (outcome.result) {
      // Final conclusion reached.
      setHistory(prev => [...prev, { stepKey: currentStepKey, selection: currentSelection }]);
      setFinalResult(outcome.result);
      setIsFinal(true);
      setTransitionDirection("next");
    } else if (outcome.next) {
      // Proceed to the next decision step.
      setHistory(prev => [...prev, { stepKey: currentStepKey, selection: currentSelection }]);
      setCurrentStepKey(outcome.next);
      setCurrentSelection(null);
      setTransitionDirection("next");
    }
  };

  // When the user clicks “Back”
  const handleBack = () => {
    setTransitionDirection("back");
    if (isFinal) {
      // If on the final conclusion card, return to the previous decision step.
      setIsFinal(false);
      setFinalResult("");
      setCurrentSelection(null);
    } else {
      if (history.length > 0) {
        const newHistory = [...history];
        newHistory.pop();
        const lastEntry = newHistory[newHistory.length - 1];
        // If there is a previous step, go back to that step; otherwise return to the very first step.
        setCurrentStepKey(lastEntry ? lastEntry.stepKey : "step1");
        setHistory(newHistory);
        setCurrentSelection(null);
      }
    }
  };

  // When the user clicks “Reset” on the final card.
  const handleReset = () => {
    setHistory([]);
    setCurrentStepKey("step1");
    setCurrentSelection(null);
    setIsFinal(false);
    setFinalResult("");
    setTransitionDirection("next");
  };

  // Choose which card to display based on whether we’re at a decision step or the final result.
  let cardContent;
  if (isFinal) {
    cardContent = (
      <FinalCard 
        result={finalResult}
        onBack={handleBack}
        onReset={handleReset}
        transitionDirection={transitionDirection}
      />
    );
  } else {
    const currentNode = steps[currentStepKey];
    cardContent = (
      <DecisionCard 
        stepName={currentNode.name}
        currentSelection={currentSelection}
        onSelection={handleSelection}
        onNext={handleNext}
        onBack={handleBack}
        disableBack={history.length === 0}
        transitionDirection={transitionDirection}
      />
    );
  }

  return (
    <div className="app-container">
      {cardContent}
    </div>
  );
}

// The decision card shows the current step (e.g. “HBsAg”) with two checkboxes.
function DecisionCard({ stepName, currentSelection, onSelection, onNext, onBack, disableBack, transitionDirection }) {
  return (
    <div className={`card ${transitionDirection === "next" ? "slide-in-right" : "slide-in-left"}`}>
      <div className="card-header">
        Hepatitis B Serology Interpretator
      </div>
      <div className="card-body">
        <div className="step-title">{stepName}</div>
        <div className="checkbox-container">
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              checked={currentSelection === "positive"} 
              onChange={() => onSelection("positive")}
              name="serology" 
            />
            Positive
          </label>
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              checked={currentSelection === "negative"} 
              onChange={() => onSelection("negative")}
              name="serology" 
            />
            Negative
          </label>
        </div>
      </div>
      <div className="card-footer">
        <button onClick={onBack} disabled={disableBack}>Back</button>
        <button onClick={onNext} disabled={!currentSelection}>Next</button>
      </div>
    </div>
  );
}

// The final card displays the conclusion text.
function FinalCard({ result, onBack, onReset, transitionDirection }) {
  return (
    <div className={`card ${transitionDirection === "next" ? "slide-in-right" : "slide-in-left"}`}>
      <div className="card-header">
        Hepatitis B Serology Interpretator
      </div>
      <div className="card-body">
        <div className="final-result">{result}</div>
      </div>
      <div className="card-footer">
        <button onClick={onBack}>Back</button>
        <button onClick={onReset}>Reset</button>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);

