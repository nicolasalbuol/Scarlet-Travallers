import React from "react";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NavArrows({ currentStep, totalSteps, onPrev, onNext, onCreate, canCreate, isCreating }) {
  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;

  return (
    <>
      {/* Left arrow - previous */}
      {!isFirst && (
        <button
          onClick={onPrev}
          className="fixed left-2 sm:left-4 top-1/2 -translate-y-1/2 z-40 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-card border border-border shadow-lg flex items-center justify-center text-primary hover:bg-primary/10 transition-all"
          aria-label="Etapa anterior"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}

      {/* Right arrow - next or create */}
      {!isLast ? (
        <button
          onClick={onNext}
          className="fixed right-2 sm:right-4 top-1/2 -translate-y-1/2 z-40 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-all"
          aria-label="Próxima etapa"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      ) : (
        <Button
          onClick={onCreate}
          disabled={!canCreate || isCreating}
          className="fixed right-2 sm:right-4 top-1/2 -translate-y-1/2 z-40 h-10 sm:h-12 px-4 rounded-full bg-primary text-primary-foreground shadow-lg"
        >
          {isCreating ? (
            "Criando..."
          ) : (
            <>
              <Check className="w-4 h-4 mr-1" /> Criar Ficha
            </>
          )}
        </Button>
      )}
    </>
  );
}