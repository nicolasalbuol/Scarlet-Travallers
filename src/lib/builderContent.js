import {
  BUILDER_STEPS,
  ORIGIN_OPTIONS,
  RACE_OPTIONS,
  CLASS_OPTIONS,
  CASA_OPTIONS,
  BOND_OPTIONS,
} from "@/lib/builderData";

const DEFAULT_STEP_OPTIONS = {
  origem: ORIGIN_OPTIONS,
  raca: RACE_OPTIONS,
  classe: CLASS_OPTIONS,
  casa: CASA_OPTIONS,
  vinculos: BOND_OPTIONS,
};

/**
 * Transforms BuilderContent entity records into the step+options structure
 * used by the CharacterBuilder. Falls back to hardcoded defaults when no
 * records exist or a step is missing.
 */
export function buildContentFromRecords(records) {
  if (!records || records.length === 0) {
    return BUILDER_STEPS.map((step) => ({
      id: step.id,
      label: step.label,
      description: step.description,
      options: DEFAULT_STEP_OPTIONS[step.id] || [],
    }));
  }

  const sorted = [...records].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return sorted.map((rec) => ({
    id: rec.step_id,
    label: rec.label,
    description: rec.description || "",
    options: rec.options || DEFAULT_STEP_OPTIONS[rec.step_id] || [],
  }));
}

export { BUILDER_STEPS, DEFAULT_STEP_OPTIONS };