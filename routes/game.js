function gameRoutes(app) {
    let goodAnswers = 0;
    let isGameOver = false;
    let callToAFriendUsed = false;
    let questionToTheCrowdUsed = false;
    let fiftyFiftyUsed = false;
    const allQuestions = require('../questions');

    let questions = [];

    function drawQuestion(copy) {
        const index = Math.floor(Math.random() * copy.length);
        const item = copy[index];
        copy.splice(index, 1);
        return item;
    }

    const drawQuestions = () => {
        const copy = [...allQuestions];
        for (let i = 0; i < 12; i++) {
            const add = drawQuestion(copy);
            questions.push(add);
        }
    }
    drawQuestions();

    app.get('/question', (req, res) => {
        if (goodAnswers === questions.length) {
            res.json({
                winner: true,
            });
        } else if (isGameOver) {
            res.json({
                loser: true,
            });
        } else {
            const nextQuestion = questions[goodAnswers];
            const { question, answers } = nextQuestion;

            res.json({
                question,
                answers,
            });
        }

    });

    app.post('/answer/:index', (req, res) => {

        if (isGameOver) res.json({
            loser: true,
        });
        const { index } = req.params;
        const question = questions[goodAnswers];
        const correctAnswer = question.correctAnswer === Number(index);

        if (correctAnswer) {
            goodAnswers++;
        } else {
            isGameOver = true;
        }

        res.json({
            correct: correctAnswer,
            goodAnswers,
        });
    })

    app.get('/help/friend', (req, res) => {

        if (callToAFriendUsed) {
            return res.json({
                text: "To koło ratunkowe było już wykorzystane",
            });
        };

        callToAFriendUsed = true;

        const possibleAnswers = ['yes', 'no', 'maybe', 'yes', 'no', 'maybe', 'yes', 'no', 'maybe', 'maybe'];
        const doesFriendKnowAnswer = possibleAnswers[Math.floor(Math.random() * possibleAnswers.length)];
        let answer = '';
        const question = questions[goodAnswers];
        const correctAnswer = question.correctAnswer;

        if (doesFriendKnowAnswer === 'yes') {
            answer = `Poprawna odpowiedź to ${question.answers[question.correctAnswer]}, jestem pewien`;
        } else if (doesFriendKnowAnswer === 'no') {
            answer = 'Przykro mi, ale niestety nie znam odpowiedzi na to pytanie';
        } else {
            const badAnswers = question.answers.filter((answer, index) => index !== correctAnswer);
            const goodChoice = question.answers[correctAnswer];
            const friendChoices = [goodChoice, goodChoice, badAnswers[0], goodChoice, goodChoice, goodChoice, badAnswers[1], goodChoice, goodChoice, badAnswers[2]];
            const friendAnswer = friendChoices[Math.floor(Math.random() * friendChoices.length)];
            answer = `Hmm, wydaje mi się, że poprawna odpowiedź to ${friendAnswer}, ale nie jestem tego pewien`;
        }

        res.json({
            text: answer,
        });
    });

    app.get('/help/fifty', (req, res) => {

        if (fiftyFiftyUsed) {
            return res.json({
                text: "To koło ratunkowe było już wykorzystane",
            });
        };

        fiftyFiftyUsed = true;

        const question = questions[goodAnswers];

        const answersCopy = question.answers.filter((answer, index) => (
            index !== question.correctAnswer
        ));

        answersCopy.splice(Math.floor(Math.random()) * 3, 1);

        res.json({
            answersToRemove: answersCopy,
        });
    });

    app.get('/help/crowd', (req, res) => {

        if (questionToTheCrowdUsed) {
            return res.json({
                text: "To koło ratunkowe było już wykorzystane",
            });
        };

        questionToTheCrowdUsed = true;

        const chart = [10, 20, 30, 40];

        for (let i = chart.length - 1; i > 0; i--) {
            const change = Math.floor(Math.random() * 20 - 10);
            chart[i] += change;
            chart[i - 1] -= change;
        }
        const question = questions[goodAnswers];
        const { correctAnswer } = question;

        [chart[3], chart[correctAnswer]] = [chart[correctAnswer], chart[3]];

        res.json({
            chart,
        });
    });
}

module.exports = gameRoutes;