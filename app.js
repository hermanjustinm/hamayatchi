const creature = {
  name: 'Sproutlet',
  hunger: 70,
  energy: 65,
  trust: 30,
  health: 85,
  xp: 0,
  level: 1,
};

const wildCreatures = [
  { name: 'Pebblit', bonus: 'sturdy' },
  { name: 'Fizzlefox', bonus: 'fast' },
  { name: 'Mossling', bonus: 'healer' },
  { name: 'Bubbloon', bonus: 'lucky' },
  { name: 'Tidepup', bonus: 'balanced' },
  { name: 'Voltfin', bonus: 'agile' },
  { name: 'Glintowl', bonus: 'wise' },
];

const gameState = {
  day: 1,
  berries: 10,
  collection: [{ name: creature.name, bonus: 'starter' }],
};

const ui = {
  level: document.getElementById('creature-level'),
  hunger: document.getElementById('hunger'),
  energy: document.getElementById('energy'),
  trust: document.getElementById('trust'),
  health: document.getElementById('health'),
  xp: document.getElementById('xp'),
  mood: document.getElementById('creature-mood'),
  day: document.getElementById('day-counter'),
  resources: document.getElementById('resources'),
  objective: document.getElementById('objective'),
  collection: document.getElementById('collection-list'),
  exploreResult: document.getElementById('explore-result'),
  healBtn: document.getElementById('heal-btn'),
};

function clamp(value) {
  return Math.max(0, Math.min(100, value));
}

function addXp(amount) {
  creature.xp += amount;
  while (creature.xp >= 100) {
    creature.xp -= 100;
    creature.level += 1;
    creature.health = clamp(creature.health + 12);
    creature.energy = clamp(creature.energy + 10);
    ui.exploreResult.textContent = `${creature.name} reached level ${creature.level}!`;
  }
}

function moodText() {
  if (creature.health < 30) return 'Mood: Weak';
  if (creature.energy < 20) return 'Mood: Sleepy';
  if (creature.hunger < 25) return 'Mood: Hungry';
  if (creature.trust > 80) return 'Mood: Loyal';
  return 'Mood: Ready';
}

function objectiveText() {
  if (creature.level >= 3 && gameState.collection.length >= 3) {
    return 'Objective complete! Keep exploring for rare friends.';
  }
  return `Objective: Reach Level 3 and collect 3 creatures (${creature.level}/3, ${gameState.collection.length}/3).`;
}

function renderCollection() {
  ui.collection.innerHTML = '';
  gameState.collection.forEach((entry) => {
    const li = document.createElement('li');
    li.textContent = `${entry.name} (${entry.bonus})`;
    ui.collection.append(li);
  });
}

function render() {
  ui.level.textContent = `Lv. ${creature.level}`;
  ui.hunger.value = creature.hunger;
  ui.energy.value = creature.energy;
  ui.trust.value = creature.trust;
  ui.health.value = creature.health;
  ui.xp.value = creature.xp;

  ui.mood.textContent = moodText();
  ui.day.textContent = `Day ${gameState.day}`;
  ui.resources.textContent = `Berries: ${gameState.berries}`;
  ui.objective.textContent = objectiveText();
  ui.healBtn.disabled = gameState.berries < 5;

  renderCollection();
}

function dailyDecay() {
  gameState.day += 1;
  creature.hunger = clamp(creature.hunger - 4);
  creature.energy = clamp(creature.energy - 3);

  if (creature.hunger < 20) creature.health = clamp(creature.health - 8);
  if (creature.energy < 15) creature.health = clamp(creature.health - 5);
  if (creature.health <= 0) {
    creature.health = 25;
    creature.energy = 30;
    creature.hunger = 35;
    ui.exploreResult.textContent = `${creature.name} fainted and recovered at camp. Take better care!`;
  }

  render();
}

document.getElementById('feed-btn').addEventListener('click', () => {
  if (gameState.berries < 1) {
    ui.exploreResult.textContent = 'No berries left. Forage for more!';
    return;
  }

  gameState.berries -= 1;
  creature.hunger = clamp(creature.hunger + 20);
  creature.trust = clamp(creature.trust + 5);
  addXp(8);
  render();
});

document.getElementById('play-btn').addEventListener('click', () => {
  creature.energy = clamp(creature.energy - 10);
  creature.hunger = clamp(creature.hunger - 8);
  creature.trust = clamp(creature.trust + 9);
  addXp(10);
  render();
});

document.getElementById('rest-btn').addEventListener('click', () => {
  creature.energy = clamp(creature.energy + 22);
  creature.hunger = clamp(creature.hunger - 5);
  creature.health = clamp(creature.health + 6);
  addXp(6);
  render();
});

document.getElementById('train-btn').addEventListener('click', () => {
  if (creature.energy < 25 || creature.health < 20) {
    ui.exploreResult.textContent = `${creature.name} needs more rest before training.`;
    return;
  }

  creature.energy = clamp(creature.energy - 20);
  creature.hunger = clamp(creature.hunger - 10);
  creature.health = clamp(creature.health - 4);
  creature.trust = clamp(creature.trust + 6);
  addXp(24);
  ui.exploreResult.textContent = `${creature.name} completed a tough training session.`;
  render();
});

document.getElementById('heal-btn').addEventListener('click', () => {
  if (gameState.berries < 5) {
    ui.exploreResult.textContent = 'Need 5 berries to craft healing tonic.';
    return;
  }

  gameState.berries -= 5;
  creature.health = clamp(creature.health + 30);
  creature.energy = clamp(creature.energy + 8);
  ui.exploreResult.textContent = `${creature.name} recovered with a berry tonic.`;
  render();
});

document.getElementById('forage-btn').addEventListener('click', () => {
  const found = 2 + Math.floor(Math.random() * 5);
  gameState.berries += found;
  creature.energy = clamp(creature.energy - 8);
  creature.hunger = clamp(creature.hunger - 5);
  addXp(7);
  ui.exploreResult.textContent = `You foraged ${found} berries.`;
  render();
});

document.getElementById('explore-btn').addEventListener('click', () => {
  if (creature.energy < 20 || creature.health < 15) {
    ui.exploreResult.textContent = `${creature.name} is not fit enough to explore right now.`;
    return;
  }

  creature.energy = clamp(creature.energy - 16);
  creature.hunger = clamp(creature.hunger - 11);

  const roll = Math.random();
  if (roll < 0.2) {
    creature.health = clamp(creature.health - 10);
    gameState.berries += 3;
    ui.exploreResult.textContent = 'A rough encounter! You escaped and found 3 berries.';
  } else if (roll < 0.58) {
    const found = wildCreatures[Math.floor(Math.random() * wildCreatures.length)];
    const alreadyOwned = gameState.collection.some((entry) => entry.name === found.name);

    if (alreadyOwned) {
      addXp(12);
      ui.exploreResult.textContent = `You met ${found.name} again and learned from the encounter.`;
    } else {
      gameState.collection.push(found);
      creature.trust = clamp(creature.trust + 8);
      addXp(18);
      ui.exploreResult.textContent = `You befriended ${found.name}! (${found.bonus} bonus)`;
    }
  } else {
    addXp(14);
    gameState.berries += 1;
    ui.exploreResult.textContent = 'You mapped a new route and found a berry stash.';
  }

  render();
});

setInterval(dailyDecay, 7000);
render();
