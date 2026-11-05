// Conteúdo exibido na seção "Características" dos cards da construção de ficha.
// Itens antigos ("O que tem acesso" + "Bônus") são reunidos automaticamente aqui,
// garantindo que nenhum dado cadastrado antes da mudança seja perdido.
export function optionCaracteristicas(option) {
  const list = option?.caracteristicas;
  if (Array.isArray(list) && list.filter(Boolean).length > 0) {
    return list.filter(Boolean);
  }
  return [...(option?.access || []), ...(option?.bonuses || [])].filter(Boolean);
}