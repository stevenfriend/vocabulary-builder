'use strict'

const vocabulary = JSON.parse(sessionStorage.getItem('vocabulary'));
const menu = document.getElementById('menu');
const questionsInput = document.getElementById('questions-input');
const start = document.getElementById('start');
const quiz = document.getElementById('quiz');
const scoreBoard = document.getElementById('score');
const question = document.getElementById('question');
const circle = document.getElementById('circle');
const cross = document.getElementById('cross');
const endCard = document.getElementById('end-card');
const endMessage = document.getElementById('end-message');
const replay = document.getElementById('replay');
const rightAudio = new Audio('audio/right.mp3');
const wrongAudio = new Audio('audio/wrong.mp3');
const timer = { 
  element: document.getElementById('timer'),
  total: ((3 * 60) + 1) * 1000
};
let audioContext;
let options = [];
let questionsCount = 20;
let score = 0;
let answer;
let questions = [];
let allQuestions = [];
let review = [];
let ended = false;

init();

function init() {
  getQuestions();
  if(questionsCount > vocabulary.length) {
    questionsInput.innerHTML = vocabulary.length
    questionsCount = vocabulary.length;
  }
  addOptionEventLiseners();
}

function getQuestions() {
  for (const data of vocabulary) {
    const image = new Image();
    image.src = `/images/${data.image}`;
    image.className = 'image';
    questions.push({image, data});
  }
  allQuestions = questions.map((x) => x);
}

start.addEventListener('click', () => {
  menu.style.display = 'none';
  quiz.style.display = 'grid';
  requestAnimationFrame(initializeTimer);
  setAudioContext();
  handleNext();
});

replay.addEventListener('click', () => {
  resetQuiz();
  endCard.classList.toggle('raised');
});

function resetQuiz() {
  score = 0;
  scoreBoard.innerText = '00';
  review = [];
  questions = allQuestions.map((x) => x);
  ended = false;
  requestAnimationFrame(initializeTimer);
  handleNext();
}

function initializeTimer(now) {
  timer.initial = now;
  timer.s = 1000;
  timer.m = timer.s * 60;
  requestAnimationFrame(runTimer);
}

function runTimer(now) {
  const options = {minimumIntegerDigits: 2, useGrouping: false};
  const runtime = now - timer.initial;
  const remaining = timer.total - runtime;
  if(remaining < 0) timesUp();
  else {
    const minutes = Math.floor(remaining/timer.m).toLocaleString('en-US', options);
    const seconds = Math.floor((remaining%timer.m)/timer.s).toLocaleString('en-US', options);
    const display = `${minutes}:${seconds}`
    if(timer.display !== display) {
      timer.element.innerText = display;
      timer.display = display;
    }
    if(!ended) requestAnimationFrame(runTimer);
  }
}

function timesUp() {
  ended = true;
  endMessage.innerText = 'Game Over'
  endCard.style.backgroundColor = 'rgb(46, 46, 46)';
  endCard.classList.toggle('raised');
}

function addOptionEventLiseners() {
  const optionElements = [...document.getElementsByClassName('option')];
  optionElements.forEach( option => option.addEventListener('click', handleAnwser));
}

function removeOptionEventLiseners() {
  const optionElements = [...document.getElementsByClassName('option')];
  optionElements.forEach( option => option.removeEventListener('click', handleAnwser));
}

function handleAnwser(e) {
  if(e.target.innerHTML == answer.data.vocabulary) {
    right(e.target);
  } else {
    const optionElements = [...document.getElementsByClassName('option')];
    const rightOption = optionElements.find( x => x.innerHTML == answer.data.vocabulary );
    wrong(rightOption, e.target);
  }
}

function right(option) {
  removeOptionEventLiseners();
  giveFeedback(rightAudio, circle, option, null);
  window.setTimeout(() => {
    removeQuestion();
    increaseScore();
    handleNext();
    addOptionEventLiseners();
    resetFeedback(circle, option, null)
  }, 1000);
}

function wrong(rightOption, wrongOption) {
  removeOptionEventLiseners();
  giveFeedback(wrongAudio, cross, rightOption, wrongOption);
  window.setTimeout(() => {
    if(!answer.review) reviewQuestion();
    handleNext();
    addOptionEventLiseners();
    resetFeedback(cross, rightOption, wrongOption)
  }, 1500);
}

function giveFeedback(audio, element, rightOption, wrongOption) {
  playAudio(audio);
  element.classList.add('feedback-animation');
  if(rightOption) rightOption.classList.add('right-option');
  if(wrongOption) wrongOption.classList.add('wrong-option');
}

function resetFeedback(element, rightOption, wrongOption) {
  element.classList.remove('feedback-animation');
  if(rightOption) rightOption.classList.remove('right-option');
  if(wrongOption) wrongOption.classList.remove('wrong-option');
}

function removeQuestion() {
  if(answer.review) {
    const i = review.findIndex(x => x.data.vocabulary == answer.data.vocabulary);
    review.splice(i, 1);
  } else {
    const i = questions.findIndex(x => x.data.vocabulary == answer.data.vocabulary);
    questions.splice(i, 1);
  }
}

function reviewQuestion() {
  const i = questions.findIndex(x => x.data.vocabulary == answer.data.vocabulary);
  review.push(questions[i]);
  questions.splice(i, 1);
}

function increaseScore() {
  const options = {minimumIntegerDigits: 2, useGrouping: false};
  score++;
  scoreBoard.innerText = score.toLocaleString('en-US', options);
}

function handleNext() {
  if(score >= questionsCount) {
    finished();
  } else if(score + review.length < questionsCount) {
    ask(questions);
  } else if(score - review.length < questionsCount) {
    ask(review);
  }
}

function finished() {
  ended = true;
  endMessage.innerText = 'Well Done!';
  endCard.style.backgroundColor = '#007007';
  endCard.classList.toggle('raised');
}

function ask(arr) {
  const index = Math.floor(Math.random() * arr.length);
  answer = arr[index];
  answer.review = (arr == review);
  showQuestion(index);
  pickOptions(index);
  shuffleOptions()
  showOptions();
}

function showQuestion(index) {
  question.innerHTML = '';
  question.appendChild(answer.image);
}

function pickOptions() {
  options = [answer.data.vocabulary];
  while (options.length < 4) {
    const available = vocabulary.filter(x => !options.includes(x.vocabulary));
    const pick = Math.floor(Math.random() * available.length);
    options.push(available[pick].vocabulary);  
  }
}

function shuffleOptions() {
  const shuffled = [];
  while (shuffled.length < options.length) {
    const available = options.filter(x => !shuffled.includes(x));
    const element = available[Math.floor(Math.random() * available.length)];
    shuffled.push(element);
  }
  options = shuffled;
}

function showOptions() {
  const optionElements = [...document.getElementsByClassName('option')];
  for(const i in optionElements) {
    optionElements[i].innerHTML = options[i];
  }
}

function setAudioContext() {
  audioContext = new AudioContext();
  if(audioContext.state === 'suspended') {
    audioContext.resume();
  }
  const right = audioContext.createMediaElementSource(rightAudio);
  right.connect(audioContext.destination);
  const wrong = audioContext.createMediaElementSource(wrongAudio);
  wrong.connect(audioContext.destination);
}

function playAudio(element) {
  element.currentTime = 0;
  element.play();
}