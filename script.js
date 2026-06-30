const organisms = [
  {
    name: 'Grass',
    icon: '🌱',
    role: 'Producer',
    description: 'Grass is the producer. It uses sunlight to make food and starts the energy flow for the whole chain.',
    impact: 'Without grass, the grasshopper loses its food source and the rest of the chain weakens.'
  },
  {
    name: 'Grasshopper',
    icon: '🦗',
    role: 'Primary consumer',
    description: 'The grasshopper is a primary consumer. It eats grass and passes plant energy to predators.',
    impact: 'Without grasshoppers, frogs lose their main prey while grass may grow more freely.'
  },
  {
    name: 'Frog',
    icon: '🐸',
    role: 'Secondary consumer',
    description: 'The frog is a secondary consumer. It eats grasshoppers and helps keep herbivore numbers balanced.',
    impact: 'Without frogs, grasshoppers can increase and snakes lose an important food source.'
  },
  {
    name: 'Snake',
    icon: '🐍',
    role: 'Tertiary consumer',
    description: 'The snake is a tertiary consumer. It eats frogs and transfers energy toward the top predator.',
    impact: 'Without snakes, frogs may increase and hawks lose prey.'
  },
  {
    name: 'Hawk',
    icon: '🦅',
    role: 'Top predator',
    description: 'The hawk is the top predator. It eats snakes and helps regulate the upper level of the food chain.',
    impact: 'Without hawks, snakes may increase because their main predator is gone.'
  }
];

const chain = document.querySelector('#chain');
const roleTitle = document.querySelector('#role-title');
const roleDescription = document.querySelector('#role-description');
const energyPath = document.querySelector('#energy-path');
const impactText = document.querySelector('#impact-text');
const removeButton = document.querySelector('#remove-button');
const resetButton = document.querySelector('#reset-button');

let activeName = null;
let removedNames = new Set();
let removalIndex = 0;

function renderChain() {
  chain.innerHTML = '';

  organisms.forEach((organism, index) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'organism';
    card.setAttribute('aria-label', `${organism.name}: ${organism.role}`);

    if (organism.name === activeName) card.classList.add('active');
    if (removedNames.has(organism.name)) card.classList.add('removed');

    card.innerHTML = `
      <span class="icon" aria-hidden="true">${organism.icon}</span>
      <span class="name">${organism.name}</span>
      <span class="role">${organism.role}</span>
    `;

    card.addEventListener('click', () => selectOrganism(organism));
    chain.appendChild(card);

    if (index < organisms.length - 1) {
      const arrow = document.createElement('span');
      arrow.className = 'arrow';
      arrow.textContent = '→';
      arrow.setAttribute('aria-hidden', 'true');
      if (removedNames.has(organism.name) || removedNames.has(organisms[index + 1].name)) {
        arrow.classList.add('broken');
        arrow.textContent = '✕';
      }
      chain.appendChild(arrow);
    }
  });

  updateEnergyPath();
}

function selectOrganism(organism) {
  activeName = organism.name;
  roleTitle.textContent = `${organism.name}: ${organism.role}`;
  roleDescription.textContent = organism.description;
  impactText.textContent = removedNames.has(organism.name)
    ? `${organism.name} has been removed. ${organism.impact}`
    : organism.impact;
  renderChain();
}

function updateEnergyPath() {
  const remaining = organisms.filter((organism) => !removedNames.has(organism.name));
  energyPath.textContent = remaining.length
    ? remaining.map((organism) => organism.name).join(' → ')
    : 'No organisms remain in the chain.';

  if (removedNames.size === 0) {
    impactText.textContent = activeName
      ? organisms.find((organism) => organism.name === activeName).impact
      : 'The full food chain is balanced.';
  } else if (!activeName) {
    const removedList = [...removedNames].join(', ');
    impactText.textContent = `Removed: ${removedList}. Red break marks show where energy can no longer flow directly.`;
  }

  removeButton.disabled = removedNames.size === organisms.length;
}

function removeNextOrganism() {
  const organism = organisms[removalIndex % organisms.length];
  removedNames.add(organism.name);
  removalIndex += 1;

  while (removedNames.has(organisms[removalIndex % organisms.length]?.name) && removedNames.size < organisms.length) {
    removalIndex += 1;
  }

  activeName = null;
  roleTitle.textContent = `${organism.name} removed`;
  roleDescription.textContent = organism.impact;
  impactText.textContent = `The food chain now has ${organisms.length - removedNames.size} organism(s) still active.`;
  renderChain();
}

function resetChain() {
  activeName = null;
  removedNames = new Set();
  removalIndex = 0;
  roleTitle.textContent = 'Select an organism';
  roleDescription.textContent = 'Choose grass, grasshopper, frog, snake, or hawk to highlight its role in the food chain.';
  impactText.textContent = 'The full food chain is balanced.';
  renderChain();
}

removeButton.addEventListener('click', removeNextOrganism);
resetButton.addEventListener('click', resetChain);

renderChain();
