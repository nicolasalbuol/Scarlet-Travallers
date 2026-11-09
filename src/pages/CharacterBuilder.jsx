import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DEFAULT_SKILLS } from "@/lib/gameConstants";
import {
  ATTRIBUTE_ORDER,
  CLASS_SKILLS,
  ORIGIN_SKILL_COUNT,
  mergeRaceVantagens,
} from "@/lib/builderData";
import {
  ORIGIN_FREE_POINTS,
  ATTRIBUTE_MAX,
  emptyPoints,
  availablePointsFor,
  attributeTotal,
  sumPoints,
} from "@/lib/attributeBonuses";
import { buildContentFromRecords } from "@/lib/builderContent";
import StepNav from "@/components/builder/StepNav";
import NavArrows from "@/components/builder/NavArrows";
import SelectionSection from "@/components/builder/SelectionSection";
import AttributesStep from "@/components/builder/AttributesStep";
import ToquesStep from "@/components/builder/ToquesStep";
import RaceStep from "@/components/builder/RaceStep";
import RaceHybridModal from "@/components/builder/RaceHybridModal";
import ClassSkillsModal from "@/components/builder/ClassSkillsModal";
import PassadoStep from "@/components/builder/PassadoStep";
import CasaBonusModal from "@/components/builder/CasaBonusModal";
import VinculosStep from "@/components/builder/VinculosStep";
import { PASSADO_DEFAULTS } from "@/lib/passadoData";
import { buildPrereqState, evaluatePrerequisites } from "@/lib/prerequisites";
import { startingKit, applyCasaSkillBonus, matchSkill, TRAINED_VALUE } from "@/lib/autoBuild";
import PericiasStep, { periciaLimit } from "@/components/builder/PericiasStep";
import AutoKitPreview from "@/components/builder/AutoKitPreview";

// Maps each (possibly duplicated) step screen to the character field it edits
const FIELD_BY_UID = {
  origem: "origin",
  passado: "passado",
  raca: "race",
  classe: "char_class",
  classe_1: "char_class",
  classe_2: "char_class_2",
  casa: "casa",
  casa_1: "casa",
  casa_2: "casa_2",
  vinculos: "bond",
};

// Origens cuja C.A.S.A. concede bônus de atributo (pop-up de distribuição)
const needsCasaBonus = (origin, uid) =>
  (origin === "Ômega" && uid === "casa") || (origin === "Delta" && uid === "casa_1");

// Builds the actual navigable step list based on the chosen Origem
function computeVisibleSteps(baseSteps, origin) {
  const result = [];
  baseSteps.forEach((step) => {
    if (step.id === "casa") {
      if (origin === "Zeta" || origin === "Alpha") {
        return; // Zeta/Alpha have no C.A.S.A.
      }
      if (origin === "Delta") {
        result.push({ ...step, uid: "casa_1", label: `${step.label} 1 (Principal)` });
        result.push({ ...step, uid: "casa_2", label: `${step.label} 2` });
      } else {
        result.push({ ...step, uid: "casa" });
      }
    } else if (step.id === "classe") {
      if (origin === "Alpha") {
        result.push({ ...step, uid: "classe_1", label: `${step.label} 1` });
        result.push({ ...step, uid: "classe_2", label: `${step.label} 2` });
      } else {
        result.push({ ...step, uid: "classe" });
      }
    } else {
      result.push({ ...step, uid: step.id });
    }
  });
  return result;
}

export default function CharacterBuilder() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: contentRecords = [] } = useQuery({
    queryKey: ["builderContent"],
    queryFn: () => base44.entities.BuilderContent.list("order", 50),
  });

  const { data: passadoRecords = [] } = useQuery({
    queryKey: ["passados"],
    queryFn: () => base44.entities.Passado.list("order", 100),
  });

  const BUILDER_STEPS = buildContentFromRecords(contentRecords);
  const STEP_DATA = {};
  BUILDER_STEPS.forEach((step) => { STEP_DATA[step.id] = step.options; });
  const passadoOptions = passadoRecords.length > 0 ? passadoRecords : PASSADO_DEFAULTS;

  const [currentStep, setCurrentStep] = useState(0);
  const [character, setCharacter] = useState({
    name: "",
    origin: "",
    passado: "",
    race: "",
    race_2: "",
    race_mode: "",
    race_advantage: "",
    race_disadvantage: "",
    char_class: "",
    char_class_2: "",
    casa: "",
    casa_2: "",
    bond: "",
    bond_plano: "",
    bond_circulo: "",
    bond_elemento: "",
    classSkills: [],
    classSkills_2: [],
    attributePoints: emptyPoints(),
    casaBonus: emptyPoints(),
    attributes: { FOR: 0, DES: 0, CON: 0, INT: 0, SAB: 0, CAR: 0 },
    alignment: "Neutro Neutro",
    mental_state: "",
    level: 1,
    age: "",
    rank: "",
    deslocamento: "",
    lore: "",
    lore_image: "",
  });

  // UI-only flags for the Raça/Classe pop-up flows
  const [raceHybridConfirmed, setRaceHybridConfirmed] = useState(false);
  const [showRaceHybridModal, setShowRaceHybridModal] = useState(false);
  const [showClassSkillsModal, setShowClassSkillsModal] = useState(false);
  const [activeClassSlot, setActiveClassSlot] = useState("");
  const [classSkillsConfirmed, setClassSkillsConfirmed] = useState(false);
  const [classSkillsConfirmed2, setClassSkillsConfirmed2] = useState(false);
  const [showCasaBonusModal, setShowCasaBonusModal] = useState(false);
  const [activeCasaSlot, setActiveCasaSlot] = useState("");

  // Raça options with vantagem/desvantagem merged from defaults
  const raceOptions = mergeRaceVantagens(STEP_DATA.raca || []);
  const requiredSkillCount = ORIGIN_SKILL_COUNT[character.origin] || 2;
  const prereqState = useMemo(() => buildPrereqState(character), [character]);

  // Navigation bar reacts instantly to the chosen Origem (Alpha gets a 2nd
  // Classe step, Delta a 2nd C.A.S.A. step, Zeta/Alpha drop C.A.S.A.)
  const visibleSteps = useMemo(
    () => computeVisibleSteps(BUILDER_STEPS, character.origin),
    [BUILDER_STEPS, character.origin]
  );

  // Keep currentStep valid whenever the step list is rebuilt
  useEffect(() => {
    if (currentStep > visibleSteps.length - 1) {
      setCurrentStep(Math.max(0, visibleSteps.length - 1));
    }
  }, [visibleSteps.length, currentStep]);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Character.create(data),
    onSuccess: (newChar) => {
      queryClient.invalidateQueries({ queryKey: ["characters"] });
      toast.success("Ficha criada!");
      navigate(`/character/${newChar.id}`);
    },
    onError: () => toast.error("Erro ao criar ficha"),
  });

  // Switch to an independent step screen (no continuous scroll)
  const goToStep = (index) => {
    const clamped = Math.max(0, Math.min(index, visibleSteps.length - 1));
    setCurrentStep(clamped);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Atributos finais (pontos + bônus da C.A.S.A.)
  const finalAttributes = ATTRIBUTE_ORDER.reduce((acc, k) => {
    acc[k] = attributeTotal(character.casaBonus, character.attributePoints, k);
    return acc;
  }, {});

  // Perícias da ficha: treino +5 nas escolhidas, +2 do Passado, +2 da passiva da C.A.S.A. principal
  const buildSkills = (withTraining = true) => {
    const skills = DEFAULT_SKILLS.map((s) => ({ ...s }));
    if (withTraining) {
      (character.trainedSkills || []).forEach((name) => {
        const sk = matchSkill(skills, name);
        if (sk) sk.training = TRAINED_VALUE;
      });
    }
    const passadoOpt =
      passadoOptions.find((p) => p.name === character.passado) ||
      PASSADO_DEFAULTS.find((p) => p.name === character.passado);
    if (passadoOpt) {
      const bv = passadoOpt.bonus_value || 2;
      [passadoOpt.skill_1, passadoOpt.skill_2].forEach((skillName) => {
        if (!skillName) return;
        const existing = matchSkill(skills, skillName);
        if (existing) existing.bonus = (existing.bonus || 0) + bv;
        else skills.push({ name: skillName, attribute: "CAR", training: 0, bonus: bv });
      });
    }
    const casaOpt = (STEP_DATA.casa || []).find((o) => o.name === character.casa);
    applyCasaSkillBonus(skills, casaOpt);
    return skills;
  };
  const skillBonusPreview = buildSkills(false).reduce((acc, s) => {
    if (s.bonus) acc[s.name] = s.bonus;
    return acc;
  }, {});

  // Step completion check (per visible screen, including duplicated steps)
  const completedSteps = visibleSteps.map((step) => {
    switch (step.uid) {
      case "origem": return !!character.origin;
      case "passado": return !!character.passado;
      case "raca":
        if (character.race_mode === "hibrida") {
          return !!character.race && !!character.race_2 && !!character.race_advantage && !!character.race_disadvantage;
        }
        return !!character.race && !!character.race_advantage;
      case "classe":
      case "classe_1": return !!character.char_class && classSkillsConfirmed;
      case "classe_2": return !!character.char_class_2 && classSkillsConfirmed2;
      case "casa":
      case "casa_1":
        return !!character.casa && (!needsCasaBonus(character.origin, step.uid) || sumPoints(character.casaBonus) > 0);
      case "casa_2": return !!character.casa_2;
      case "vinculos":
        return !!character.bond_plano && !!character.bond_circulo && !!character.bond_elemento;
      case "atributos":
        return availablePointsFor(character.origin, character.attributePoints) === 0;
      case "pericias": return (character.trainedSkills || []).length === periciaLimit(finalAttributes, character.pericia_attr);
      case "toques": return !!character.name.trim();
      default: return false;
    }
  });

  const availableAttrPoints = useMemo(
    () => availablePointsFor(character.origin, character.attributePoints),
    [character.origin, character.attributePoints]
  );

  // Ao aplicar/trocar o bônus da C.A.S.A., nenhum atributo pode passar de 3:
  // o excedente é ajustado e os pontos voltam para a reserva.
  useEffect(() => {
    setCharacter((prev) => {
      const casa = prev.casaBonus || {};
      const points = { ...(prev.attributePoints || {}) };
      let changed = false;
      ATTRIBUTE_ORDER.forEach((key) => {
        const over = (casa[key] || 0) + (points[key] || 0) - ATTRIBUTE_MAX;
        if (over > 0) {
          points[key] = Math.max(0, (points[key] || 0) - over);
          changed = true;
        }
      });
      if (!changed) return prev;
      return {
        ...prev,
        attributePoints: points,
        attributes: ATTRIBUTE_ORDER.reduce((acc, k) => {
          acc[k] = attributeTotal(casa, points, k);
          return acc;
        }, {}),
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [character.casaBonus]);

  // Remove seleções que deixaram de cumprir o pré-requisito ao mudar escolhas anteriores
  useEffect(() => {
    const state = buildPrereqState(character);
    const lockedNames = (opts) =>
      new Set((opts || []).filter((o) => evaluatePrerequisites(o, state).locked).map((o) => o.name));

    const patch = {};
    const removed = [];
    const check = (field, opts, label) => {
      const val = character[field];
      if (!val || !opts || !opts.length) return;
      if (lockedNames(opts).has(val)) {
        patch[field] = "";
        removed.push(`${label} "${val}"`);
      }
    };

    check("origin", STEP_DATA.origem, "Origem");
    check("passado", passadoOptions, "Passado");
    check("race", STEP_DATA.raca, "Raça");
    check("race_2", STEP_DATA.raca, "Raça");
    check("char_class", STEP_DATA.classe, "Classe");
    check("char_class_2", STEP_DATA.classe, "Classe");
    check("casa", STEP_DATA.casa, "C.A.S.A.");
    check("casa_2", STEP_DATA.casa, "C.A.S.A.");

    if (!removed.length) return;
    if (patch.char_class !== undefined) patch.classSkills = [];
    if (patch.char_class_2 !== undefined) patch.classSkills_2 = [];
    if (patch.casa !== undefined || patch.casa_2 !== undefined) patch.casaBonus = emptyPoints();
    setCharacter((prev) => ({ ...prev, ...patch }));
    toast.error(
      `Sua escolha de ${removed[0]} foi removida porque o pré-requisito não é mais atendido.`
    );
  }, [character, passadoOptions]);

  const handleSelect = (field, value) => {
    setCharacter((prev) => ({ ...prev, [field]: value }));
  };

  // Changing Origem rebuilds the nav bar and discards choices that no
  // longer make sense (e.g. a C.A.S.A. pick when switching to Zeta/Alpha)
  const handleOriginChange = (newOrigin) => {
    setCharacter((prev) => {
      const next = { ...prev, origin: newOrigin };
      const hasCasa = newOrigin !== "Zeta" && newOrigin !== "Alpha";
      const hasSecondCasa = newOrigin === "Delta";
      const hasSecondClass = newOrigin === "Alpha";

      if (!hasCasa) {
        next.casa = "";
        next.casa_2 = "";
      } else if (!hasSecondCasa) {
        next.casa_2 = "";
      }
      if (!hasSecondClass) {
        next.char_class_2 = "";
        next.classSkills_2 = [];
      }
      // A troca de origem invalida as skills de classe já escolhidas
      next.classSkills = [];
      // A troca de origem muda o pool de pontos e o bônus da C.A.S.A. — redistribui do zero
      next.attributePoints = emptyPoints();
      next.casaBonus = emptyPoints();
      return next;
    });
    setClassSkillsConfirmed(false);
    setClassSkillsConfirmed2(false);
  };

  // ---- Raça flow ----
  const handleRaceChooseMode = (mode) => {
    setCharacter((prev) => ({
      ...prev,
      race_mode: mode,
      race: "",
      race_2: "",
      race_advantage: "",
      race_disadvantage: "",
      attributePoints: emptyPoints(),
    }));
    setRaceHybridConfirmed(false);
  };

  const handleRaceSelectUnica = (raceName) => {
    const opt = raceOptions.find((o) => o.name === raceName);
    setCharacter((prev) => ({
      ...prev,
      race: raceName,
      race_advantage: opt?.vantagem || "",
      race_disadvantage: opt?.desvantagem || "",
      attributePoints: emptyPoints(),
    }));
  };

  const handleRaceToggle = (raceName) => {
    setCharacter((prev) => {
      const selected = [prev.race, prev.race_2].filter(Boolean);
      let next;
      if (selected.includes(raceName)) {
        next = selected.filter((r) => r !== raceName);
      } else {
        if (selected.length >= 2) {
          toast.error("Você já selecionou 2 raças");
          return prev;
        }
        next = [...selected, raceName];
      }
      return {
        ...prev,
        race: next[0] || "",
        race_2: next[1] || "",
        race_advantage: "",
        race_disadvantage: "",
        attributePoints: emptyPoints(),
      };
    });
    setRaceHybridConfirmed(false);
  };

  const handleRaceHybridConfirm = (advRace, disRace) => {
    const advOpt = raceOptions.find((o) => o.name === advRace);
    const disOpt = raceOptions.find((o) => o.name === disRace);
    setCharacter((prev) => ({
      ...prev,
      race_advantage: advOpt?.vantagem || "",
      race_disadvantage: disOpt?.desvantagem || "",
      attributePoints: emptyPoints(),
    }));
    setRaceHybridConfirmed(true);
    setShowRaceHybridModal(false);
    goToStep(currentStep + 1);
  };

  // ---- Classe + Skills flow ----
  const handleClassSelect = (slot, className) => {
    setCharacter((prev) => {
      const field = slot === "classe_2" ? "char_class_2" : "char_class";
      if (prev[field] === className) return prev;
      const skillsKey = slot === "classe_2" ? "classSkills_2" : "classSkills";
      return { ...prev, [field]: className, [skillsKey]: [] };
    });
    if (slot === "classe_2") setClassSkillsConfirmed2(false);
    else setClassSkillsConfirmed(false);
  };

  const handleClassSkillToggle = (item) => {
    const slot = activeClassSlot;
    const skillsKey = slot === "classe_2" ? "classSkills_2" : "classSkills";
    setCharacter((prev) => {
      const current = prev[skillsKey] || [];
      const exists = current.some((s) => s.name === item.name && s.type === item.type);
      let next;
      if (exists) {
        next = current.filter((s) => !(s.name === item.name && s.type === item.type));
      } else {
        if (current.length >= requiredSkillCount) {
          toast.error(`Selecione apenas ${requiredSkillCount} skill(s)`);
          return prev;
        }
        next = [...current, item];
      }
      return { ...prev, [skillsKey]: next };
    });
  };

  const handleClassSkillsConfirm = () => {
    if (activeClassSlot === "classe_2") setClassSkillsConfirmed2(true);
    else setClassSkillsConfirmed(true);
    setShowClassSkillsModal(false);
    goToStep(currentStep + 1);
  };

  // ---- C.A.S.A. + bônus de atributo flow ----
  const handleCasaSelect = (slot, casaName) => {
    setCharacter((prev) => ({
      ...prev,
      [slot === "casa_2" ? "casa_2" : "casa"]: casaName,
      // Trocar a C.A.S.A. invalida o bônus de atributo já distribuído
      casaBonus: needsCasaBonus(prev.origin, slot) ? emptyPoints() : prev.casaBonus,
    }));
  };

  const handleCasaBonusConfirm = (bonus, entidade) => {
    setCharacter((prev) => ({ ...prev, casaBonus: bonus, casa_entidade: entidade || "" }));
    setShowCasaBonusModal(false);
    goToStep(currentStep + 1);
  };

  // Intercepta a seta de avançar para abrir os pop-ups de Raça (híbrida) e
  // Classe (skills) antes de mudar de etapa.
  const handleNext = () => {
    const step = visibleSteps[currentStep];
    if (!step) return;

    if (step.uid === "raca") {
      if (!character.race_mode) return;
      if (character.race_mode === "hibrida") {
        if (!character.race || !character.race_2) {
          toast.error("Selecione 2 raças");
          return;
        }
        if (!raceHybridConfirmed) {
          setShowRaceHybridModal(true);
          return;
        }
      } else if (!character.race) {
        toast.error("Selecione uma raça");
        return;
      }
      goToStep(currentStep + 1);
      return;
    }

    if (step.uid === "classe" || step.uid === "classe_1" || step.uid === "classe_2") {
      const field = FIELD_BY_UID[step.uid];
      if (!character[field]) {
        toast.error("Selecione uma classe");
        return;
      }
      const confirmed = step.uid === "classe_2" ? classSkillsConfirmed2 : classSkillsConfirmed;
      if (!confirmed) {
        setActiveClassSlot(step.uid);
        setShowClassSkillsModal(true);
        return;
      }
      goToStep(currentStep + 1);
      return;
    }

    if (step.uid === "casa" || step.uid === "casa_1" || step.uid === "casa_2") {
      const field = FIELD_BY_UID[step.uid];
      if (!character[field]) {
        toast.error("Selecione uma C.A.S.A.");
        return;
      }
      if (needsCasaBonus(character.origin, step.uid) && sumPoints(character.casaBonus) === 0) {
        setActiveCasaSlot(step.uid);
        setShowCasaBonusModal(true);
        return;
      }
      goToStep(currentStep + 1);
      return;
    }

    if (step.uid === "vinculos") {
      if (!character.bond_plano || !character.bond_circulo || !character.bond_elemento) {
        toast.error("Selecione Plano, Círculo e Elemento");
        return;
      }
      goToStep(currentStep + 1);
      return;
    }

    if (step.uid === "atributos") {
      const remaining = availableAttrPoints;
      if (remaining > 0) {
        toast.error(`Você ainda tem ${remaining} ponto(s) para distribuir`);
        return;
      }
      goToStep(currentStep + 1);
      return;
    }

    goToStep(currentStep + 1);
  };

  const kit = startingKit({
    character,
    originOptions: STEP_DATA.origem,
    casaOptions: STEP_DATA.casa,
    attributes: finalAttributes,
    skills: buildSkills(true),
  });
  const chosenClassAbilities = [...(character.classSkills || []), ...(character.classSkills_2 || [])];

  const handleCreate = () => {
    if (!character.name.trim()) {
      toast.error("Digite um nome para o personagem");
      goToStep(visibleSteps.length - 1);
      return;
    }
    const charClassValue = character.char_class_2
      ? `${character.char_class} / ${character.char_class_2}`
      : character.char_class;
    const casaMain = character.casa_entidade ? `${character.casa} (${character.casa_entidade})` : character.casa;
    const casaValue = character.casa_2 ? `${casaMain} (Principal) / ${character.casa_2}` : casaMain;
    const raceValue = character.race_2
      ? `${character.race} / ${character.race_2}`
      : character.race;

    // Skills de Classe (livro): passivas e habilidades vão para a aba Habilidades.
    const allSelected = [...(character.classSkills || []), ...(character.classSkills_2 || [])];
    const classAbilities = allSelected.map((s) =>
      s.type === "passiva"
        ? { name: s.name, cost: 0, ed: "Passiva", damage: "—", description: s.description }
        : { name: s.name, cost: s.cost, ed: s.ed, damage: s.damage, description: s.description }
    );

    const skills = buildSkills(true);

    // Origem e C.A.S.A. entram sozinhas: PV/PS/PE, dinheiro, slots, CA e características.
    const finalKit = startingKit({
      character,
      originOptions: STEP_DATA.origem,
      casaOptions: STEP_DATA.casa,
      attributes: finalAttributes,
      skills,
    });
    const strip = ({ source, ...rest }) => rest;
    const abilities = [...finalKit.traits.map(strip), ...classAbilities];
    const vital = (v) => ({ total: v.total, current: v.total, temp: 0 });
    toast.success(`PV ${finalKit.pv.total} · PS ${finalKit.ps.total} · PE ${finalKit.pe.total} · CA ${finalKit.ca.fisica}/${finalKit.ca.magica}`);

    createMutation.mutate({
      name: character.name,
      origin: character.origin,
      passado: character.passado,
      race: raceValue,
      race_advantage: character.race_advantage,
      race_disadvantage: character.race_disadvantage,
      char_class: charClassValue,
      power_technique: casaValue,
      elemental_bond: character.bond_elemento
        ? `${character.bond_plano} · ${character.bond_circulo} · ${character.bond_elemento}`
        : character.bond,
      level: character.level || 1,
      alignment: character.alignment,
      mental_state: character.mental_state,
      age: character.age || "",
      rank: character.rank || "",
      deslocamento: character.deslocamento || "",
      lore_image: character.lore_image || "",
      lore: character.lore || "",
      skills,
      abilities,
      inventory: finalKit.inventory,
      attributes: finalAttributes,
      ca_physical: finalKit.ca.fisica,
      ca_magical: finalKit.ca.magica,
      pv: vital(finalKit.pv),
      pe: vital(finalKit.pe),
      ps: vital(finalKit.ps),
    });
  };

  const canCreate = !!character.name.trim();

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 max-w-4xl mx-auto">
        <Button variant="ghost" size="sm" onClick={() => navigate("/characters")} className="text-muted-foreground">
          <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
        </Button>
        <h1 className="font-cinzel text-xl font-bold text-foreground">Construção de Ficha</h1>
      </div>

      {/* Sticky Step Nav */}
      <div className="sticky top-0 z-30">
        <StepNav
          steps={visibleSteps}
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={goToStep}
        />
      </div>

      {/* Navigation Arrows */}
      <NavArrows
        currentStep={currentStep}
        totalSteps={visibleSteps.length}
        onPrev={() => goToStep(currentStep - 1)}
        onNext={handleNext}
        onCreate={handleCreate}
        canCreate={canCreate}
        isCreating={createMutation.isPending}
      />

      {/* Current step screen (only the active step is visible) */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {(() => {
              const step = visibleSteps[currentStep];
              if (!step) return null;
              const selectedField = FIELD_BY_UID[step.uid];
              return (
                <section>
                  <div className="mb-4">
                    <h2 className="font-cinzel text-lg font-bold text-primary mb-1">{step.label}</h2>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>

                  {step.id === "raca" ? (
                    <RaceStep
                      options={raceOptions}
                      mode={character.race_mode}
                      race={character.race}
                      race2={character.race_2}
                      onChooseMode={handleRaceChooseMode}
                      onBack={() => goToStep(currentStep - 1)}
                      onSelectRace={handleRaceSelectUnica}
                      onToggleRace={handleRaceToggle}
                    />
                  ) : step.id === "passado" ? (
                    <PassadoStep
                      selected={character.passado}
                      onSelect={(value) => handleSelect("passado", value)}
                      state={prereqState}
                    />
                  ) : step.id === "vinculos" ? (
                    <VinculosStep
                      plano={character.bond_plano}
                      circulo={character.bond_circulo}
                      elemento={character.bond_elemento}
                      onChange={({ plano, circulo, elemento }) =>
                        setCharacter((prev) => ({
                          ...prev,
                          bond_plano: plano,
                          bond_circulo: circulo,
                          bond_elemento: elemento,
                        }))
                      }
                    />
                  ) : STEP_DATA[step.id] ? (
                    <SelectionSection
                      options={
                        step.uid === "classe_2"
                          ? (STEP_DATA[step.id] || []).filter(
                              (o) => o.name !== character.char_class
                            )
                          : STEP_DATA[step.id]
                      }
                      state={prereqState}
                      selectedValue={character[selectedField]}
                      onSelect={(value) => {
                        if (step.uid === "origem") {
                          handleOriginChange(value);
                        } else if (
                          step.uid === "classe" ||
                          step.uid === "classe_1" ||
                          step.uid === "classe_2"
                        ) {
                          handleClassSelect(step.uid, value);
                        } else if (
                          step.uid === "casa" ||
                          step.uid === "casa_1" ||
                          step.uid === "casa_2"
                        ) {
                          handleCasaSelect(step.uid, value);
                        } else {
                          handleSelect(selectedField, value);
                        }
                      }}
                    />
                  ) : step.id === "atributos" ? (
                    <AttributesStep
                      points={character.attributePoints}
                      casaBonus={character.casaBonus}
                      availablePoints={availableAttrPoints}
                      onChange={(points) => {
                        const totals = ATTRIBUTE_ORDER.reduce((acc, k) => {
                          acc[k] = attributeTotal(character.casaBonus, points, k);
                          return acc;
                        }, {});
                        setCharacter((prev) => ({
                          ...prev,
                          attributePoints: points,
                          attributes: totals,
                        }));
                      }}
                    />
                  ) : step.id === "pericias" ? (
                    <PericiasStep
                      character={character}
                      attributes={finalAttributes}
                      bonusBySkill={skillBonusPreview}
                      onChange={setCharacter}
                    />
                  ) : step.id === "toques" ? (
                    <>
                      <ToquesStep character={character} onChange={setCharacter} />
                      <AutoKitPreview
                        kit={kit}
                        classAbilities={chosenClassAbilities}
                        attributes={finalAttributes}
                      />
                    </>
                  ) : null}

                  {step.id !== "atributos" && step.id !== "pericias" && step.id !== "toques" && step.id !== "raca" && step.id !== "passado" && step.id !== "vinculos" && (
                    <div className="mt-3 text-xs text-muted-foreground">
                      {character[selectedField] ? (
                        <span className="text-primary">✓ {character[selectedField]} selecionado</span>
                      ) : (
                        <span>Nenhuma seleção ainda</span>
                      )}
                    </div>
                  )}
                </section>
              );
            })()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pop-up de Vantagem/Desvantagem (Raça Híbrida) */}
      {showRaceHybridModal && character.race && character.race_2 && (
        <RaceHybridModal
          race1={character.race}
          race2={character.race_2}
          options={raceOptions}
          onConfirm={handleRaceHybridConfirm}
          onClose={() => setShowRaceHybridModal(false)}
        />
      )}

      {/* Pop-up de Skills da Classe */}
      {showClassSkillsModal && activeClassSlot && (() => {
        const field = activeClassSlot === "classe_2" ? "char_class_2" : "char_class";
        const className = character[field];
        const classData = CLASS_SKILLS[className];
        const selectedSkills =
          activeClassSlot === "classe_2" ? character.classSkills_2 : character.classSkills;
        return (
          <ClassSkillsModal
            className={className}
            classData={classData}
            requiredCount={requiredSkillCount}
            selected={selectedSkills || []}
            onToggle={handleClassSkillToggle}
            onConfirm={handleClassSkillsConfirm}
            onClose={() => setShowClassSkillsModal(false)}
          />
        );
      })()}

      {/* Pop-up de Bônus de Atributo da C.A.S.A. */}
      {showCasaBonusModal && activeCasaSlot && (() => {
        const field = activeCasaSlot === "casa_2" ? "casa_2" : "casa";
        return (
          <CasaBonusModal
            casaName={character[field]}
            casaOption={(STEP_DATA.casa || []).find((o) => o.name === character[field])}
            onConfirm={handleCasaBonusConfirm}
            onClose={() => setShowCasaBonusModal(false)}
          />
        );
      })()}
    </div>
  );
}