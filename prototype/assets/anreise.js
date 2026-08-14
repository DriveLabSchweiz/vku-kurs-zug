/* ══════════════════════════════════════════════════════════════════════
   Eintrag 00 · Deine Anreise — signature of the Anfahrtsprotokoll sheets
   Shared by ort-baar.html and ort-steinhausen.html.

   The main sheet's signature computes an obligation from published rules.
   This one computes an arrival from published facts: the course begins at
   18:00, the walk from Bahnhof Zug takes 9 minutes, the GIBZ car park is
   opposite the room. The recommended times are marked as recommendations.

   What it will not do: invent a departure time out of the municipality.
   No timetable is held here, so that leg stays a dash. A record that
   admits a gap is worth more than one that fills it in.
   ══════════════════════════════════════════════════════════════════════ */
(() => {
  const box = document.getElementById('e00');
  if (!box) return;

  const out   = document.getElementById('e00v');
  const chop  = document.getElementById('e00c');
  const state = document.getElementById('e00s');
  const plan  = document.getElementById('e00p');
  const ort   = box.dataset.ort || 'der Gemeinde';

  const LEGS = {
    bahn: [
      { t: '—',     pt: 'Abfahrt ' + ort,      note: 'nach Fahrplan',                        open: true },
      { t: '17:45', pt: 'Bahnhof Zug',         note: 'empfohlen — Ausgang Nord' },
      { t: '17:54', pt: 'Industriestrasse 50', note: 'Kursraum erreicht, 9 Minuten zu Fuss' },
      { t: '18:00', pt: 'Beginn Modul 01',     note: 'Verkehrssehen',                        last: true }
    ],
    auto: [
      { t: '—',     pt: 'Abfahrt ' + ort,      note: 'nach Verkehrslage',                    open: true },
      { t: '17:50', pt: 'Parkhaus GIBZ',       note: 'empfohlen — auch für Motorräder' },
      { t: '—',     pt: 'Industriestrasse 50', note: 'Kursraum, direkt gegenüber',           open: true },
      { t: '18:00', pt: 'Beginn Modul 01',     note: 'Verkehrssehen',                        last: true }
    ]
  };

  const VERDICT = {
    bahn: 'Der Fussweg ab Bahnhof Zug dauert <b>9 Minuten</b>. Wer um <b>17:45</b> in Zug ankommt, '
        + 'sitzt vor Kursbeginn im Raum. Die Verbindung ab ' + ort + ' richtet sich nach dem '
        + 'offiziellen Fahrplan — dieses Protokoll führt keine Fahrpläne.',
    auto: 'Das <b>Parkhaus GIBZ</b> liegt direkt gegenüber dem Kursraum und nimmt auch Motorräder auf. '
        + 'Fahrzeit und Verkehrslage ab ' + ort + ' sind nicht Teil dieses Protokolls.'
  };

  box.querySelectorAll('.opts').forEach(group => {
    group.addEventListener('click', ev => {
      const btn = ev.target.closest('.opt');
      if (!btn) return;
      group.querySelectorAll('.opt').forEach(o => o.setAttribute('aria-pressed', String(o === btn)));
      render(btn.dataset.v);
    });
  });

  function render(modus) {
    const legs = LEGS[modus];
    if (!legs) return;

    plan.textContent = '';
    legs.forEach(leg => {
      const row = document.createElement('div');
      if (leg.open) row.className = 'open';
      if (leg.last) row.className = 'last';
      const dt = document.createElement('dt');
      dt.textContent = leg.t;
      const dd = document.createElement('dd');
      dd.textContent = leg.pt;
      const em = document.createElement('em');
      em.textContent = leg.note;
      dd.appendChild(em);
      row.append(dt, dd);
      plan.appendChild(row);
    });

    plan.hidden = false;
    box.dataset.done = '1';
    state.textContent = 'ausgefüllt';
    chop.textContent = 'Ankunft geplant';
    out.innerHTML = VERDICT[modus];
  }
})();
