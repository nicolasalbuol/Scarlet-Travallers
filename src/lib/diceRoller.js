/**
 * Rolagem de testes (perícias e atributos) com vantagem/desvantagem.
 *
 * Regra:
 *  - Número de d20 = valor do atributo + vantagens − desvantagens.
 *  - Se >= 1: rola essa quantidade e usa o MAIOR.
 *  - Se <= 0: rola 2d20 e usa o PIOR.
 *  - Treino, bônus e extra somam ao dado escolhido.
 */
function rollD20() {
  return Math.floor(Math.random() * 20) + 1;
}

export function computeDiceCount(attributeValue = 0, advantages = 0, disadvantages = 0) {
  return (Number(attributeValue) || 0) + (Number(advantages) || 0) - (Number(disadvantages) || 0);
}

export function rollTest({
  attributeValue = 0,
  training = 0,
  bonus = 0,
  extraBonus = 0,
  advantages = 0,
  disadvantages = 0,
}) {
  const attr = Math.max(0, Number(attributeValue) || 0);
  const adv = Math.max(0, Number(advantages) || 0);
  const dis = Math.max(0, Number(disadvantages) || 0);
  const net = attr + adv - dis;
  const worst = net <= 0;
  const numDice = worst ? 2 : net;

  const rolls = [];
  for (let i = 0; i < numDice; i++) rolls.push(rollD20());

  const selectedRoll = worst ? Math.min(...rolls) : Math.max(...rolls);
  const selectedIndex = rolls.indexOf(selectedRoll);

  const total = selectedRoll + (Number(training) || 0) + (Number(bonus) || 0) + (Number(extraBonus) || 0);

  return {
    rolls,
    selectedRoll,
    selectedIndex,
    attributeValue: attr,
    training: Number(training) || 0,
    bonus: Number(bonus) || 0,
    extraBonus: Number(extraBonus) || 0,
    total,
    isCritical: selectedRoll === 20,
    isCriticalFail: selectedRoll === 1,
    numDice,
    net,
    advantages: adv,
    disadvantages: dis,
    worst,
    mode: worst ? "disadvantage" : adv > dis ? "advantage" : "normal",
  };
}

// Compatibilidade com chamadas antigas.
export const rollDice = rollTest;