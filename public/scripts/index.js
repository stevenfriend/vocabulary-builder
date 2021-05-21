'use strict'

const books = document.getElementById('books');
const quizButton = document.getElementById('quiz-btn');
const vocabList = document.getElementById('vocab-list');
const selected = [];

let vocabData;

fetch(`${window.location.origin}/api/books/list`)
  .then(res => res.json())
  .then(data => generateBookList(data))

books.addEventListener('change', (e) => {
  clearSelected();
  fetch(`${window.location.origin}/api/vocabulary/${e.target.value}`)
    .then(res => res.json())
    .then(data => {
      vocabData = data.vocabulary;
      generateContent(data);
    })
})

quizButton.addEventListener('click', (e) => {
  startQuiz();
})

function startQuiz() {
  selected.sort((a, b) => (a.id > b.id) ? 1 : -1 );
  sessionStorage.setItem('vocabulary', JSON.stringify(selected));
  window.location.href = `${window.location.origin}/quiz.html`
}

function generateBookList(data) {
  const html = data.books.map(book => 
    `<option value="${book.value}">${book.title}</li>`
  ).join('');
  books.innerHTML += html;
}

function generateContent(data) {
  generateMenu(data);
  generateVocabList(data);
}

function generateMenu(data) {

};

function generateVocabList(data) {
  removeChildren(vocabList);
  const units = generateUnits(data);
  populateUnits(units, data);
  units.forEach(unit => {
    vocabList.appendChild(unit);
  });
}

function generateUnits(data) {
  const units = [];
  for (let x of data.units) {
    const unit = document.createElement('div');
    unit.className = 'unit';
    const header = document.createElement('header');
    header.className = 'unit-heading';
    addTitle(header, x)
    addSwitch(header, unit);
    unit.appendChild(header);
    units.push(unit);
  }
  return units
}

function addTitle(header, x) {
  const title = document.createElement('h3');
  title.className = 'unit-title';
  const text = document.createTextNode(`${x}`);
  title.appendChild(text);
  header.appendChild(title);
}

function addSwitch(header, unit) {
  const slider = document.createElement('label');
  slider.className = 'switch';
  const input = document.createElement('input');
  input.type = 'checkbox';
  const span = document.createElement('span');
  span.className = 'slider round';
  input.addEventListener('change', e => {
    e.target.checked? selectAllVocab(unit): deselectAllVocab(unit);
  })
  slider.append(input, span);
  header.appendChild(slider);
}

function populateUnits(units, data) {
  for (let i=0; i<units.length; i++) {
    const grid = document.createElement('div');
    grid.className = 'vocab-grid';
    const unitVocab = data.vocabulary.filter(vocab => vocab.unit == (i+1));
    unitVocab.forEach(vocab => {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.setAttribute('id', vocab.id);
      cell.addEventListener('click', () => {
        selectVocab(cell, vocab);
      });
      populateCell(cell, vocab);
      grid.appendChild(cell);
    });
    units[i].appendChild(grid);
  }
}

function selectVocab(cell, vocab) {
  cell.classList.toggle('selected');
  if(!selected.includes(vocab)){
    selected.push(vocab);
  }else{
    selected.splice(selected.indexOf(vocab), 1);
  }
}

function selectAllVocab(unit) {
  const cells = unit.getElementsByClassName('cell');
  for (const cell of cells) {
    const id = cell.getAttribute('id');
    const vocab = vocabData.find( element => element.id == id);
    if(!cell.classList.contains('selected')) {
      selectVocab(cell, vocab);
    }
  }
}

function deselectAllVocab(unit) {
  const cells = unit.getElementsByClassName('cell');
  for (const cell of cells) {
    cell.classList.remove('selected');
    const id = cell.getAttribute('id');
    const vocab = vocabData.find( element => element.id == id);
    selected.splice(selected.indexOf(vocab), 1);
  }
}

function populateCell(cell, vocab) {
  cell.innerHTML = `
    <div class="thumbnail">
      <svg class="thumbnail-tick" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 100 100";" xml:space="preserve">
        <path class="tick" d="M50,0C22.4,0,0,22.4,0,50c0,27.6,22.4,50,50,50s50-22.4,50-50C100,22.4,77.6,0,50,0z M37.1,81.6L11.3,55.8l9.1-9.1l16.7,16.6l42.5-42.5l9.1,9.1L37.1,81.6z"/>
      </svg>
      <div class="thumbnail-overlay"></div>
      <div class="vocab-id">${vocab.id}.</div>
      <img class="thumbnail-image" src="/thumbnails/${vocab.image}">
    </div>
    <p class="label">${vocab.vocabulary}</p>`;
}

function clearSelected() {
  while (selected.length) {
    selected.pop();
  }
}

function removeChildren(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}