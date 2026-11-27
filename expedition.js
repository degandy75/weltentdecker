// Jede Expedition verwendet fünf verschiedene, gut voneinander unterscheidbare Ziele.
const destinations = new Set([
  'Berlin', 'London', 'Madrid', 'Oslo', 'Kairo', 'Nairobi', 'Dakar', 'Tokio',
  'Peking', 'Bangkok', 'Neu-Delhi', 'Canberra', 'Wellington', 'Ottawa',
  'Mexiko-Stadt', 'Lima', 'Santiago', 'Brasília', 'Buenos Aires', 'Reykjavik'
]);
const home = $('reset').onclick;
$('showResult').onclick = () => choose(cities[+$('cities').value]);

function startExpedition() {
  const pool = cities.filter(city => destinations.has(city[0]));
  const route = [];
  while (route.length < 5) route.push(pool.splice(Math.floor(Math.random()*pool.length), 1)[0]);
  game = {route, index: 0, score: 0, dots: $('dots').checked, previous: {sel, lat, lon, z}};
  $('dots').checked = true;
  $('dots').disabled = true;
  $('finder').hidden = $('info').hidden = true;
  $('mission').hidden = false;
  $('play').textContent = 'Zurück zum freien Globus';
  nextMission();
}
function nextMission() {
  game.solved = false;
  game.value = 3;
  game.misses = new Set();
  const city = game.route[game.index];
  sel = null;
  lat = 15;
  lon = 0;
  z = 1;
  $('task').textContent = fmt(city[2],1,2)+' / '+fmt(city[3],0,2);
  $('progress').textContent = 'Etappe '+(game.index+1)+' von 5 · '+game.score+' Sterne';
  $('feedback').textContent = 'Drehe den Globus und tippe den gesuchten Hauptstadtpunkt an.';
  $('hint').hidden = false;
  $('advance').hidden = true;
  draw();
}
function guess(city) {
  if (game.solved) return;
  const target = game.route[game.index];
  if (!city) {
    $('feedback').textContent = 'Tippe auf einen dunklen Stadtpunkt. Zoomen hilft!';
    return;
  }
  if (city !== target) {
    if (!game.misses.has(city)) game.value = Math.max(1, game.value-1);
    game.misses.add(city);
    const north = target[2]-city[2], east = wrap(target[3]-city[3]);
    const direction = Math.abs(north)>Math.abs(east) ? (north>0?'Norden':'Süden') : (east>0?'Osten':'Westen');
    $('feedback').textContent = 'Das ist '+city[0]+'. Suche weiter Richtung '+direction+'.';
    return;
  }
  game.solved = true;
  game.score += game.value;
  choose(target);
  $('hint').hidden = true;
  $('feedback').textContent = 'Gefunden! '+target[0]+' liegt in '+target[1]+'. '+(game.value===1?'Ein Stern':game.value+' Sterne')+' für dich.';
  $('progress').textContent = 'Etappe '+(game.index+1)+' von 5 · '+game.score+' Sterne';
  const finished = game.index === game.route.length-1;
  if (finished) $('progress').textContent = 'Expedition geschafft! 5 Städte gefunden · '+game.score+' von 15 Sternen';
  $('advance').hidden = false;
  $('advance').textContent = finished?'Neue Expedition':'Nächste Etappe';
}
function leaveExpedition() {
  const previous = game.previous;
  $('dots').checked = game.dots;
  $('dots').disabled = false;
  game = null;
  $('finder').hidden = $('info').hidden = false;
  $('mission').hidden = true;
  $('play').textContent = 'Koordinaten-Expedition starten';
  choose(previous.sel);
  ({lat,lon,z} = previous);
  draw();
}
$('play').onclick = () => game ? leaveExpedition() : startExpedition();
$('hint').onclick = () => {
  const target = game.route[game.index];
  $('feedback').textContent = 'Schaue im Land '+target[1]+'. Lies zuerst die Breite, dann die Länge ab.';
  game.value = Math.max(1,game.value-1);
  $('hint').hidden = true;
};
$('advance').onclick = () => {
  if (++game.index < game.route.length) nextMission();
  else { leaveExpedition(); startExpedition(); }
};
$('reset').onclick = () => {
  if (!game) return home();
  lat=15; lon=0; z=1;
  draw();
};
