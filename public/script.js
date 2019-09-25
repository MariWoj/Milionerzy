const question = document.querySelector('#question');
const gameBoard = document.querySelector('#game-board');
const h2 = document.querySelector('h2');

function showWonMoney(wonMoney) {
    if (wonMoney > 0) {
        const score = document.querySelector(`#b${wonMoney}`);

        score.classList.add('active');
    }
}

function fillQuestionElements(data) {
    if (data.winner === true) {
        gameBoard.style.display = "none";
        h2.innerText = "Wygrana!";
        return;
    }

    if (data.loser === true) {
        gameBoard.style.display = "none";
        h2.innerText = "Tym razem się nie udało. Spróbuj ponownie!";
        return;
    }

    question.innerText = data.question;

    const divCrowdResult = [...document.querySelectorAll('div.crowd-result')];
    for (let i = 0; i < data.answers.length; i++) {
        if (divCrowdResult.length > 0) {
            divCrowdResult[i].innerText = '';
        }
        tipDiv.innerText = '';
        const answerEl = document.querySelector(`#answer${i + 1}`);
        answerEl.innerText = data.answers[i];
        answerEl.removeAttribute('disabled');
    };
}

function showNextQuestion() {
    fetch('/question', {
        method: 'GET',
    })
        .then(res => res.json())
        .then(data => {
            fillQuestionElements(data);
        })
};

showNextQuestion();

const goodAnswersSpan = document.querySelector('#good-answers');

function handleAnswerFeedback(data) {
    goodAnswersSpan.innerText = data.goodAnswers;
    showNextQuestion();
}

function sendAnswer(answerIndex) {
    fetch(`/answer/${answerIndex}`, {
        method: 'POST',
    })
        .then(r => r.json())
        .then(data => {
            showWonMoney(data.goodAnswers);
            handleAnswerFeedback(data);
        })
};

const buttons = document.querySelectorAll('.answer-btn');
buttons.forEach(button => button.addEventListener('click', (e) => {
    const answerIndex = e.target.dataset.answer;
    sendAnswer(answerIndex);
}));

const tipDiv = document.querySelector('#tip');

function handleFriendAnswer(data) {
    tipDiv.innerText = '';
    tipDiv.innerText = data.text;
}

function callToAFriend() {
    fetch('/help/friend', {
        method: 'GET',
    })
        .then(r => r.json())
        .then(data => {
            handleFriendAnswer(data);
        });
}

document.querySelector('#callToAFriend').addEventListener('click', callToAFriend);

function handleFiftyFiftyAnswer(data) {
    tipDiv.innerText = '';
    if (typeof data.text === 'string') {
        tipDiv.innerText = data.text;
    } else {
        for (const button of buttons) {
            if (data.answersToRemove.indexOf(button.innerText) > -1) {
                button.setAttribute('disabled', 'disabled');
            }
        }
    }
}

function fiftyFifty() {
    fetch('/help/fifty', {
        method: 'GET',
    })
        .then(r => r.json())
        .then(data => {
            handleFiftyFiftyAnswer(data);
        });
}

document.querySelector('#fiftyFifty').addEventListener('click', fiftyFifty);

function handleCrowdAnswer(data) {
    tipDiv.innerText = '';
    if (typeof data.text === 'string') {
        tipDiv.innerText = data.text;
    } else {
        const btnContainers = [...document.querySelectorAll('.btn-container')];
        data.chart.forEach((percent, index) => {
            const divCrowdResult = document.createElement('div');
            divCrowdResult.classList.add('crowd-result');
            btnContainers[index].appendChild(divCrowdResult).innerText = `${percent}% `;
        });
    }
}

function questionToTheCrowd() {
    fetch('/help/crowd', {
        method: 'GET',
    })
        .then(r => r.json())
        .then(data => {
            handleCrowdAnswer(data);
        });
}
document.querySelector('#questionToTheCrowd').addEventListener('click', questionToTheCrowd);