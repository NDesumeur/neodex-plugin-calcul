// lancé par le test « local » de NeoDex : commence une série, répond juste 10 fois au clavier (en tapant le résultat), vérifie le bilan
module.exports = async ({ pj, sleep }) => {
  const key = k => pj(`document.dispatchEvent(new KeyboardEvent('keydown', {key: '${k}', bubbles: true})), 0`);
  const label = () => pj(`document.getElementById('cmCanvas').getAttribute('aria-label')`);
  const sc = await pj(`document.querySelector('[data-selfcheck]')?.dataset.selfcheck`); if (sc !== 'ok') throw new Error('vérification interne : ' + sc);
  await sleep(400); await key('Enter'); await sleep(300);
  for (let i = 0; i < 10; i++) {
    const l = await label(), m = /: (.+) = \?/.exec(l); if (!m) throw new Error('pas de calcul : ' + l);
    const v = Function('return ' + m[1].replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/(\d+)²/, '$1*$1').replace(/(\d+) % de (\d+)/, '$1*$2/100'))();
    for (const d of String(v)) await key(d);
    await key('Enter'); await sleep(320);
  }
  await sleep(600);
  const l = await label();
  if (!/série finie : 10 sur 10/.test(l)) throw new Error('la série devait finir à 10 sur 10 : « ' + l + ' »');
  // plein écran, et l'ardoise qui tient dans la fenêtre
  await pj(`document.getElementById('cmFs').click(), 0`); await sleep(700);
  const fs = await pj(`(() => { const c = document.getElementById('cmCanvas'), r = c.getBoundingClientRect(); return document.fullscreenElement === c.parentElement && (Math.abs(r.height - innerHeight) < 3 || Math.abs(r.width - innerWidth) < 3); })()`);
  await pj(`document.fullscreenElement && document.exitFullscreen(), 0`); await sleep(300);
  if (!fs) throw new Error('le plein écran ne remplit pas l’écran');
  const L = await pj(`(() => { const r = document.getElementById('cmCanvas').getBoundingClientRect(); let s = 0; for (let e = document.getElementById('cmCanvas').parentElement; e; e = e.parentElement) s += e.scrollTop; return { bottom: Math.round(r.bottom + s), h: Math.round(r.height), wh: innerHeight, ww: innerWidth, sw: document.documentElement.scrollWidth }; })()`);
  if (process.env.NEO_FIT_LOG) console.log('FIT', JSON.stringify(L));
  if (L.bottom > L.wh + 1 || L.sw > L.ww + 1) throw new Error('la zone de jeu dépasse la fenêtre : ' + JSON.stringify(L));
  return l + ' · plein écran · ardoise ' + L.h + ' px dans ' + L.ww + '×' + L.wh;
};
