const creature = {
  name: 'Sproutlet',
  hunger: 70,
  energy: 65,
  trust: 30,
};

const wildCreatures = ['Pebblit', 'Fizzlefox', 'Mossling', 'Bubbloon', 'Tidepup'];
const collection = [creature.name];

const hungerEl = document.getElementById('hunger');
const energyEl = document.getElementById('energy');
const trustEl = document.getElementById('trust');
const moodEl = document.getElementById('creature-mood');
const collectionEl = document.getElementById('collection-list');
const exploreResultEl = document.getElementById('explore-result');

function clamp(value) {
  return Math.max(0, Math.min(100, value));
}

function moodText() {
  if (creature.energy < 20) return 'Mood: Sleepy';
  if (creature.hunger < 25) return 'Mood: Hungry';
  if (creature.trust > 75) return 'Mood: Loyal';
  return 'Mood: Happy';
}

function render() {
  hungerEl.value = creature.hunger;
  energyEl.value = creature.energy;
  trustEl.value = creature.trust;
  moodEl.textContent = moodText();

  collectionEl.innerHTML = '';
  collection.forEach((name) => {
    const li = document.createElement('li');
    li.textContent = name;
    collectionEl.append(li);
  });
}

function decay() {
  creature.hunger = clamp(creature.hunger - 2);
  creature.energy = clamp(creature.energy - 1);
  creature.trust = clamp(creature.trust - 1);
  render();
}

document.getElementById('feed-btn').addEventListener('click', () => {
  creature.hunger = clamp(creature.hunger + 18);
  creature.trust = clamp(creature.trust + 4);
  render();
});

document.getElementById('play-btn').addEventListener('click', () => {
  creature.energy = clamp(creature.energy - 10);
  creature.hunger = clamp(creature.hunger - 8);
  creature.trust = clamp(creature.trust + 10);
  render();
});

document.getElementById('rest-btn').addEventListener('click', () => {
  creature.energy = clamp(creature.energy + 20);
  creature.hunger = clamp(creature.hunger - 5);
  render();
});

document.getElementById('explore-btn').addEventListener('click', () => {
  if (creature.energy < 20) {
    exploreResultEl.textContent = `${creature.name} is too tired to explore.`;
    return;
  }

  creature.energy = clamp(creature.energy - 18);
  creature.hunger = clamp(creature.hunger - 12);

  const encounterChance = Math.random();
  if (encounterChance > 0.4) {
    const found = wildCreatures[Math.floor(Math.random() * wildCreatures.length)];
    if (!collection.includes(found)) {
      collection.push(found);
      exploreResultEl.textContent = `You befriended ${found}!`;
    } else {
      exploreResultEl.textContent = `You met ${found} again.`;
    }
  } else {
    exploreResultEl.textContent = 'No creature found this time. Try again!';
  }

  render();
});

setInterval(decay, 6000);
render();
