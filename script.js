const sceneOrder = ['welcome', 'objectives', 'definition', 'energy', 'trophic', 'simulation', 'dragdrop', 'scenario', 'foodweb', 'quiz', 'summary', 'reflection', 'completion'];
const organisms = [
  { name: 'Sun', icon: '☀️', role: 'Energy source', description: 'The Sun provides light energy that producers capture.', trophic: 'Energy Source' },
  { name: 'Grass', icon: '🌱', role: 'Producer', description: 'Makes food using sunlight through photosynthesis.', trophic: 'Producer' },
  { name: 'Grasshopper', icon: '🦗', role: 'Primary consumer', description: 'Eats grass and gains stored plant energy.', trophic: 'Primary Consumer' },
  { name: 'Frog', icon: '🐸', role: 'Secondary consumer', description: 'Eats grasshoppers and controls herbivore population.', trophic: 'Secondary Consumer' },
  { name: 'Snake', icon: '🐍', role: 'Tertiary consumer', description: 'Eats frogs and transfers energy to higher predators.', trophic: 'Tertiary Consumer' },
  { name: 'Hawk', icon: '🦅', role: 'Top predator', description: 'Eats snakes and helps balance the upper food chain.', trophic: 'Quaternary Consumer' }
];
const chainOnly = organisms.slice(1);
const basePopulations = { Grass: 80, Grasshopper: 45, Frog: 35, Snake: 25, Hawk: 18 };
const simulationEffects = {
  Grass: { Grass: 0, Grasshopper: 5, Frog: 8, Snake: 10, Hawk: 9, text: 'Removing grass eliminates the producer, so grasshoppers lose food and higher consumers decline.' },
  Grasshopper: { Grass: 100, Grasshopper: 0, Frog: 6, Snake: 12, Hawk: 11, text: 'Removing grasshoppers lets grass increase, but frogs and predators above them lose energy.' },
  Frog: { Grass: 35, Grasshopper: 92, Frog: 0, Snake: 9, Hawk: 10, text: 'Removing the frog disrupts ecosystem balance because grasshoppers reproduce rapidly while snakes lose their food source.' },
  Snake: { Grass: 70, Grasshopper: 50, Frog: 80, Snake: 0, Hawk: 7, text: 'Removing snakes can increase frog numbers while hawks lose an important prey source.' },
  Hawk: { Grass: 72, Grasshopper: 50, Frog: 38, Snake: 78, Hawk: 0, text: 'Removing hawks may allow snakes to increase, which can change pressure on frogs and lower levels.' }
};
let score = 0;
let answered = new Set();

function showScene(name) {
  document.querySelectorAll('.scene').forEach((scene) => scene.classList.remove('active'));
  document.querySelector(`#scene-${name}`).classList.add('active');
  document.querySelector('#scene-counter').textContent = `Scene ${sceneOrder.indexOf(name) + 1} of ${sceneOrder.length}`;
}

document.querySelectorAll('[data-goto]').forEach((button) => button.addEventListener('click', () => showScene(button.dataset.goto)));
document.querySelectorAll('#exit-button, #final-exit').forEach((button) => button.addEventListener('click', () => {
  button.textContent = 'Lesson closed — refresh to return';
  button.disabled = true;
}));

function cardMarkup(item) {
  return `<span class="icon">${item.icon}</span><strong>${item.name}</strong><small>${item.role}</small>`;
}

function renderVerticalChain(targetId, includeSun = true) {
  const target = document.querySelector(targetId);
  const list = includeSun ? organisms : chainOnly;
  target.innerHTML = '';
  list.forEach((item, index) => {
    const button = document.createElement('button');
    button.className = 'organism-card';
    button.innerHTML = cardMarkup(item);
    button.addEventListener('click', () => {
      document.querySelector('#organism-popup').innerHTML = `<strong>${item.name}</strong><br>${item.role}<br>${item.description}`;
      target.querySelectorAll('.organism-card').forEach((card) => card.classList.remove('active'));
      button.classList.add('active');
    });
    target.appendChild(button);
    if (index < list.length - 1) {
      const arrow = document.createElement('div');
      arrow.className = targetId === '#energy-chain' ? 'arrow energy-arrow' : 'arrow';
      arrow.textContent = '↓';
      target.appendChild(arrow);
    }
  });
}

function renderTrophic() {
  const levels = [
    ['Hawk', 'Quaternary consumer', 'Top predator that helps regulate lower predator populations.'],
    ['Snake', 'Tertiary consumer', 'Carnivore that eats secondary consumers such as frogs.'],
    ['Frog', 'Secondary consumer', 'Consumer that eats primary consumers such as grasshoppers.'],
    ['Grasshopper', 'Primary consumer', 'Herbivore that eats producers.'],
    ['Grass', 'Producer', 'Autotroph that makes food from sunlight.']
  ];
  const pyramid = document.querySelector('#trophic-pyramid');
  levels.forEach(([name, role, info]) => {
    const level = document.createElement('button');
    level.className = 'pyramid-level';
    level.textContent = `${name} — ${role}`;
    level.addEventListener('click', () => document.querySelector('#trophic-info').innerHTML = `<strong>${role}</strong><br>Role: ${info}<br>Example: ${name}`);
    pyramid.appendChild(level);
  });
}

function renderSimulation(removed = null) {
  const chain = document.querySelector('#simulation-chain');
  chain.innerHTML = '';
  chainOnly.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = `organism-card ${removed === item.name ? 'removed' : ''}`;
    card.innerHTML = cardMarkup(item);
    chain.appendChild(card);
    if (index < chainOnly.length - 1) chain.insertAdjacentHTML('beforeend', '<span class="arrow">→</span>');
  });
  const values = removed ? simulationEffects[removed] : basePopulations;
  const bars = document.querySelector('#population-bars');
  bars.innerHTML = '';
  chainOnly.forEach((item) => bars.insertAdjacentHTML('beforeend', `<div class="bar-row"><strong>${item.name}</strong><div class="bar" style="width:${values[item.name]}%"></div><span>${values[item.name]}%</span></div>`));
  document.querySelector('#ai-feedback').textContent = removed ? simulationEffects[removed].text : 'Choose an organism to remove and watch the ecosystem respond.';
}

function setupSimulationButtons() {
  const wrap = document.querySelector('#remove-buttons');
  chainOnly.forEach((item) => {
    const button = document.createElement('button');
    button.className = 'primary';
    button.textContent = `Remove ${item.name}`;
    button.addEventListener('click', () => renderSimulation(item.name));
    wrap.appendChild(button);
  });
  document.querySelector('#reset-simulation').addEventListener('click', () => renderSimulation());
}

function setupDragDrop() {
  const shuffled = ['Snake', 'Grass', 'Hawk', 'Grasshopper', 'Frog'];
  const bank = document.querySelector('#card-bank');
  const drop = document.querySelector('#drop-zone');
  shuffled.forEach((name) => {
    const card = document.createElement('button');
    card.className = 'drag-card'; card.draggable = true; card.textContent = name;
    card.addEventListener('dragstart', (event) => event.dataTransfer.setData('text/plain', name));
    card.addEventListener('click', () => drop.appendChild(card));
    bank.appendChild(card);
  });
  drop.addEventListener('dragover', (event) => event.preventDefault());
  drop.addEventListener('drop', (event) => {
    event.preventDefault();
    const card = [...bank.children].find((child) => child.textContent === event.dataTransfer.getData('text/plain'));
    if (card) drop.appendChild(card);
  });
  document.querySelector('#check-order').addEventListener('click', () => {
    const answer = [...drop.children].map((child) => child.textContent);
    const correct = ['Grass', 'Grasshopper', 'Frog', 'Snake', 'Hawk'];
    [...drop.children].forEach((child, index) => child.className = `drag-card ${child.textContent === correct[index] ? 'correct' : 'incorrect'}`);
    document.querySelector('#drag-feedback').textContent = answer.join(' → ') === correct.join(' → ') ? 'Correct! Energy flows from producer to top predator.' : 'Some cards are out of order. Try producer first, then consumers.';
  });
  document.querySelector('#hint-order').addEventListener('click', () => document.querySelector('#drag-feedback').textContent = 'Hint: Start with the organism that makes its own food using sunlight.');
}

function setupScenario() {
  const options = { A: 'Grasshopper increases', B: 'Grasshopper decreases', C: 'Snake increases' };
  const list = document.querySelector('#scenario-options');
  Object.entries(options).forEach(([letter, text]) => {
    const button = document.createElement('button');
    button.className = 'answer-choice'; button.textContent = `${letter}. ${text}`;
    button.addEventListener('click', () => {
      const correct = letter === 'B';
      button.classList.add(correct ? 'correct' : 'incorrect');
      document.querySelector('#scenario-feedback').textContent = correct ? 'Correct. Without grass, grasshoppers lose their food source and decrease.' : 'Not quite. Grass is the grasshopper’s food source, so grasshoppers would decrease.';
    });
    list.appendChild(button);
  });
}

function setupFoodWeb() {
  const chains = {
    Grass: ['Grass', 'Rabbit', 'Hawk', 'Grasshopper', 'Bird'], Rabbit: ['Grass', 'Rabbit', 'Hawk'], Mouse: ['Grass', 'Mouse', 'Snake', 'Hawk'], Grasshopper: ['Grass', 'Grasshopper', 'Bird', 'Hawk'], Bird: ['Grasshopper', 'Bird', 'Snake', 'Hawk'], Snake: ['Mouse', 'Snake', 'Hawk', 'Bird'], Hawk: ['Rabbit', 'Mouse', 'Snake', 'Bird', 'Hawk']
  };
  const icons = { Grass: '🌱', Rabbit: '🐇', Mouse: '🐁', Grasshopper: '🦗', Bird: '🐦', Snake: '🐍', Hawk: '🦅' };
  const web = document.querySelector('#food-web');
  Object.keys(icons).forEach((name) => {
    const node = document.createElement('button');
    node.className = 'web-node'; node.textContent = `${icons[name]} ${name}`;
    node.addEventListener('click', () => {
      web.querySelectorAll('.web-node').forEach((n) => { n.classList.toggle('highlight', chains[name].some((c) => n.textContent.includes(c))); n.classList.toggle('dim', !chains[name].some((c) => n.textContent.includes(c))); });
      document.querySelector('#web-feedback').textContent = `Highlighted chain connections for ${name}: ${chains[name].join(' → ')}.`;
    });
    web.appendChild(node);
  });
}

const quizQuestions = [
  ['Which organism is the producer?', ['Grass', 'Frog', 'Hawk', 'Snake'], 'Grass'],
  ['What does a food chain show?', ['Energy flow', 'Weather only', 'Rock layers', 'Moon phases'], 'Energy flow'],
  ['Which organism is a primary consumer?', ['Grasshopper', 'Grass', 'Hawk', 'Sun'], 'Grasshopper'],
  ['What happens to available energy at higher trophic levels?', ['It decreases', 'It becomes infinite', 'It stays exactly the same', 'It turns into soil only'], 'It decreases'],
  ['Which organism is the top predator in this chain?', ['Hawk', 'Grass', 'Grasshopper', 'Frog'], 'Hawk'],
  ['What role do decomposers play?', ['Recycle nutrients', 'Make sunlight', 'Stop all energy flow', 'Become clouds'], 'Recycle nutrients'],
  ['If frogs disappear, what may increase?', ['Grasshoppers', 'Grass only', 'Hawks immediately', 'Sunlight'], 'Grasshoppers'],
  ['Which process lets grass make food?', ['Photosynthesis', 'Metamorphosis', 'Hibernation', 'Predation'], 'Photosynthesis'],
  ['A snake eating a frog is an example of what?', ['Predation', 'Pollination', 'Germination', 'Condensation'], 'Predation'],
  ['Why is ecosystem balance important?', ['Changes at one level affect others', 'It removes all predators', 'It stops organisms eating', 'It makes energy increase upward'], 'Changes at one level affect others']
];
function renderQuiz() {
  const list = document.querySelector('#quiz-list');
  quizQuestions.forEach(([question, answers, correct], index) => {
    const card = document.createElement('article'); card.className = 'quiz-card';
    card.innerHTML = `<p class="quiz-question">${index + 1}. ${question}</p><div class="answer-list"></div>`;
    const answerList = card.querySelector('.answer-list');
    answers.forEach((answer) => {
      const button = document.createElement('button'); button.className = 'answer-choice'; button.textContent = answer;
      button.addEventListener('click', () => {
        if (!answered.has(index)) { answered.add(index); if (answer === correct) score += 1; }
        answerList.querySelectorAll('button').forEach((b) => { b.disabled = true; b.classList.toggle('correct', b.textContent === correct); });
        if (answer !== correct) button.classList.add('incorrect');
        card.insertAdjacentHTML('beforeend', `<p class="feedback-panel">${answer === correct ? 'Correct!' : `The correct answer is ${correct}.`} ${question.includes('producer') ? 'Producers make food from sunlight.' : 'Keep tracing how energy and populations are connected.'}</p>`);
        document.querySelector('#score-display').textContent = `Score: ${score} / ${quizQuestions.length}`;
      });
      answerList.appendChild(button);
    });
    list.appendChild(card);
  });
}

document.querySelector('#play-energy').addEventListener('click', () => document.querySelector('#energy-chain').classList.toggle('paused'));
document.querySelector('#ask-energy').addEventListener('click', () => document.querySelector('#chatbot-answer').textContent = 'Most energy is lost as heat during metabolism, movement, and life processes, so less energy is available at each higher trophic level.');
document.querySelector('#reflect-submit').addEventListener('click', () => {
  const text = document.querySelector('#reflection-response').value.trim();
  document.querySelector('#reflection-feedback').textContent = text.length < 30 ? 'Add more detail: name a prey population that might increase and explain how plants or other animals could be affected.' : 'Strong reflection. You connected predator removal with population increases and ecosystem imbalance; consider also mentioning competition and habitat pressure.';
});

renderVerticalChain('#definition-chain');
renderVerticalChain('#energy-chain');
renderTrophic();
renderSimulation();
setupSimulationButtons();
setupDragDrop();
setupScenario();
setupFoodWeb();
renderQuiz();
