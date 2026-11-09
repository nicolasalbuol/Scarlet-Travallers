import React from "react";
import { Check, Circle } from "lucide-react";

export default function StepNav({ steps, currentStep, completedSteps, onStepClick }) {
  return (
    <div className="border-b border-border bg-background/95 backdrop-blur-md">
      <div className="max-w-4xl mx-auto px-2">
        <div className="flex items-center gap-1 overflow-x-auto py-3 scrollbar-thin">
          {steps.map((step, index) => {
            const isCurrent = index === currentStep;
            const isCompleted = completedSteps[index];
            const isLast = index === steps.length - 1;

            return (
              <React.Fragment key={`${step.uid || step.id}-${index}`}>
                <button
                  onClick={() => onStepClick(index)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap text-sm transition-all ${
                    isCurrent
                      ? "text-primary font-semibold"
                      : isCompleted
                      ? "text-primary/70 hover:text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  ) : isCurrent ? (
                    <Circle className="w-3 h-3 fill-primary text-primary flex-shrink-0" />
                  ) : (
                    <Circle className="w-3 h-3 text-muted-foreground/40 flex-shrink-0" />
                  )}
                  <span>{step.label}</span>
                </button>
                {!isLast && (
                  <div className={`h-px w-4 flex-shrink-0 ${isCompleted ? "bg-primary/50" : "bg-border"}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}