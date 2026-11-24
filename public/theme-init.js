// Aplica o tema salvo (claro/escuro e cor) antes da página aparecer, sem piscar.
// Fica num arquivo próprio (e não dentro do index.html) para a política de segurança
// (CSP) poder proibir qualquer script embutido na página.
try {
  if (localStorage.getItem("st-theme") === "light") document.documentElement.classList.remove("dark");
  var p = localStorage.getItem("st-palette");
  if (p && /^[a-z]{1,20}$/.test(p) && p !== "jade") document.documentElement.dataset.palette = p;
} catch (e) {}
