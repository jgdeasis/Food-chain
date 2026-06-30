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
const quizList = document.querySelector('#quiz-list');

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

const quizQuestions = [
  {
    question: 'Which organism is the producer in this food chain?',
    answers: ['Grass', 'Frog', 'Hawk'],
    correctAnswer: 'Grass',
    explanation: 'Grass is correct because producers use sunlight to make their own food and provide energy for consumers.'
  },
  {
    question: 'What is most likely to happen if frogs are removed?',
    answers: [
      'Grasshoppers may increase because fewer frogs eat them.',
      'Hawks immediately become producers.',
      'Grass disappears because snakes eat it.'
    ],
    correctAnswer: 'Grasshoppers may increase because fewer frogs eat them.',
    explanation: 'Frogs eat grasshoppers, so removing frogs can allow more grasshoppers to survive and can also reduce food for snakes.'
  }
];

function renderQuiz() {
  quizQuestions.forEach((item, questionIndex) => {
    const quizCard = document.createElement('article');
    quizCard.className = 'quiz-card';

    const question = document.createElement('p');
    question.className = 'quiz-question';
    question.textContent = `${questionIndex + 1}. ${item.question}`;
    quizCard.appendChild(question);

    const answerList = document.createElement('div');
    answerList.className = 'answer-list';

    item.answers.forEach((answer) => {
      const answerButton = document.createElement('button');
      answerButton.type = 'button';
      answerButton.className = 'answer-choice';
      answerButton.textContent = answer;
      answerButton.addEventListener('click', () => checkAnswer(item, answer, quizCard, answerList));
      answerList.appendChild(answerButton);
    });

    quizCard.appendChild(answerList);
    quizList.appendChild(quizCard);
  });
}

function checkAnswer(item, selectedAnswer, quizCard, answerList) {
  const isCorrect = selectedAnswer === item.correctAnswer;

  answerList.querySelectorAll('.answer-choice').forEach((button) => {
    button.disabled = true;
    if (button.textContent === item.correctAnswer) button.classList.add('correct');
    if (button.textContent === selectedAnswer && !isCorrect) button.classList.add('incorrect');
  });

  const previousFeedback = quizCard.querySelector('.feedback');
  if (previousFeedback) previousFeedback.remove();

  const feedback = document.createElement('p');
  feedback.className = `feedback ${isCorrect ? 'correct' : 'incorrect'}`;
  feedback.textContent = isCorrect
    ? `Great job! ${item.explanation}`
    : `Good try! The correct answer is “${item.correctAnswer}.” ${item.explanation}`;
  quizCard.appendChild(feedback);
}

removeButton.addEventListener('click', removeNextOrganism);
resetButton.addEventListener('click', resetChain);

renderChain();
renderQuiz();
