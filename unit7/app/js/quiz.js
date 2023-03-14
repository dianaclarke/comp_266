//
// On page load, render a randomized quiz.
//
$(function() {
    Quiz.generate('bank');
});


//
// On page submit, grade the quiz.
// Do not refresh page on submit from:
//     https://stackoverflow.com/a/19454346
//
$(function() {
    const form = $('#quiz-form');
    function submit(event) {
        event.preventDefault();
        new Quiz(form).grade();
    }
    form.submit(submit);
});


//
// Display quiz error.
//
function quizError(message) {
    const msg = $('<h3>Quiz could not be loaded.</h3>');
    const why = $(`<h5>${message}</h5>`);
    msg.append(why);
    $('#quiz-form').hide();
    $('#quiz-form').parent().prepend(msg);
    $('#quiz-form').parent().removeClass('quiz');
}

//
// Use OpenAI quiz bank to generate a chapter quiz.
//
function bank() {
    if (window.location.href.startsWith('file://')) {
        quizError('because URL starts with file://');
        return;
    }

    fetch('ai-bank.json').then(
        (response) => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error(`${response.status}: ${response.statusText}`);
            }
        }).then(
            (answer) => {
                render(answer);
            }).then(
                (_) => {
                    new Quiz($('#quiz-form')).shuffle();
                }).catch(
                    (error) => {
                        quizError(error.message);
                    });
}


//
// Use OpenAI to generate a chapter quiz based on the title subject.
//
function make() {
    if (window.location.href.startsWith('file://')) {
        quizError('because URL starts with file://');
        return;
    }

    const subject = $('title').html().split(' - ')[1];
    const question = `Create me a multiple choice anatomy 101 quiz about ${subject} with 2 questions.
    There should be 4 options per question.
    Format the questions and answers in json like so:

{
    "quiz": [
        {
            "question": "Where is Edmonton?",
            "options": [
                "Canada",
                "Mexico",
                "Germany",
                "France"
            ],
            "answer": "Canada"
        },
        {
            "question": "Where is Calgary?",
            "options": [
                "Germany",
                "France",
                "Canada",
                "Mexico"
            ],
            "answer": "Canada"
        }
    ]
}
    `;
    console.log(question); // intentionally logging

    // wait for quiz
    $('#quiz-form').hide();
    $('#quiz-form').parent().removeClass('quiz');
    const please = $('<h3>Atrificial intelligence is creating a new quiz just for you!</h3>');
    $('#quiz-form').parent().prepend(please);
    const wait = $('<h5>Please wait... this should only take a few seconds.</h5>');
    please.append(wait);

    // quiz is generating
    openai(encodeURIComponent(question).then(
        (data) => {
            const answer = data['choices'][0]['message']['content'];
            console.log(answer);  // intentionally logging
            render(JSON.parse(answer));
            new Quiz($('#quiz-form')).shuffle();

            // quiz is ready
            please.hide();
            wait.hide();
            $('#quiz-form').parent().addClass('quiz');
            $('#quiz-form').show();
        }).catch(
            (error) => {
                please.hide();
                wait.hide();
                quizError(error.message);
            })
    );
}


//
// Using a Netlify function, query OpenAI.
//
async function openai(question) {
    const netlify = `/.netlify/functions/open-ai/open-ai.js?question=${question}`;
    const response = await fetch(netlify).catch(
        (error) => {
            throw new Error(error.message);
        });
    if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
    }
    return response.json();
};


//
// Render a json formatted quiz.
//
function render(answer) {
    const questions = $('<ol></ol>');
    $('#quiz-form').prepend(questions);
    const quiz = answer['quiz'];
    for (let i = 0; i < quiz.length; i++) {
        const question = $('<li></li>').text(quiz[i]['question']);
        questions.append(question);
        const options = $('<ol></ol>');
        question.append(options);
        for (let x = 0; x < quiz[i]['options'].length; x++) {
            const input = $('<input></input>');
            input.attr('name', `group-${i}`);
            input.attr('type', 'radio');
            const option = $('<li></li>');
            option.text(quiz[i]['options'][x]);
            options.append(option);
            option.prepend(input);
            if (quiz[i]['options'][x] === quiz[i]['answer']) {
                input.addClass('answer');
            }
        }
    }
}


//
// Moveable mixin (to reorder quiz questions and options).
//
class Moveable {
    constructor(element) {
        this.element = $(element).get(0);
        this.list = $(element).find('ol').get(0);
    }

    fill(array, type) {
        if (typeof this.list !== 'undefined') {
            for (let i = 0; i < this.list.children.length; i++) {
                array.push(new type(this.list.children[i]));
            }
        }
    }

    move(index) {
        if (typeof this.list !== 'undefined') {
            $(this.list).append(this.list.children[index]);
        }
    }
}


//
// Quiz model.
//
class Quiz extends Moveable {
    constructor(quiz) {
        super(quiz);
        this.questions = [];
        super.fill(this.questions, Question);
    }

    //
    // Generate a new quiz using AI.
    // (unless one is already defined in the HTML)
    //
    static generate(strategy) {
        const quiz = new Quiz($('#quiz-form'));
        if (quiz.questions.length == 0) {
            if (strategy === 'bank') {
                // no questions, generate quiz from AI bank
                bank();
            } else if (strategy === 'make') {
                // no questions, generate new quiz with AI
                // (probably too slow – netflify timeout)
                make();
            }
        } else {
            quiz.shuffle();
        }
    }

    //
    // Shuffle the quiz: randomize if it passes validation.
    //
    shuffle() {
        const warnings = this.validate();
        if (warnings.length > 0) {
            const ul = $('<ul></ul>');
            $('#dialog').append(ul);
            for (let i = 0; i < warnings.length; i++) {
                ul.append($('<li></li>').text(warnings[i]));
            }

            // https://stackoverflow.com/a/18276997
            // TODO: figure out how to remove the blue in general
            $.ui.dialog.prototype._focusTabbable = function() { };

            // https://jqueryui.com/dialog/
            $('#dialog').dialog({
                title: 'Quiz Validation',
            });
        } else {
            this.randomize();
        }
    }

    //
    // Grade the quiz.
    //
    grade() {
        let correct = 0;
        const total = this.questions.length;

        this.clear();

        for (let i = 0; i < this.questions.length; i++) {
            const question = this.questions[i];
            for (let x = 0; x < question.options.length; x++) {
                const option = question.options[x];
                option.unstyle();
                correct += option.check();
            }
        }

        this.mark(correct, total);
    }

    //
    // Display quiz mark.
    //
    mark(correct, total) {
        const percent = (correct / total) * 100 | 0;
        $(this.element).append(
            $('<h4></h4>').attr('id', 'quiz-result').text(
                `${percent}% (${correct}/${total})`
            )
        );
    }

    //
    // Clear past results and remove background image from quiz.
    //
    clear() {
        // remove lightbulb image
        $(this.element).parent().css('background', 'none');

        // clear past result
        const result = $('#quiz-result');
        if (result) {
            result.remove();

        }
    }

    //
    // Make quiz questions appear in random order.
    //
    // Random reordering of list items taken from:
    //     https://stackoverflow.com/a/11972692
    //
    randomize() {
        for (let i = this.questions.length; i >= 0; i--) {
            if (i > 0) {
                // randomize quiz options too
                this.questions[i - 1].randomize();
            }
            this.move(Math.random() * i | 0);
        }
    }

    //
    // Validate quiz.
    //
    validate() {
        const warnings = [];
        const all = new Set();
        for (let i = 0; i < this.questions.length; i++) {
            let found = false;
            const question = this.questions[i];
            const groups = new Set();
            for (let x = 0; x < question.options.length; x++) {
                const option = question.options[x];
                const group = option.group;
                if (x == 0 && all.has(group)) {
                    warnings.push(`Question ${i + 1} is using a group from another question`);
                }
                all.add(group);
                groups.add(group);
                if (option.answer) {
                    found = true;
                }
            }
            if (groups.size != 1) {
                warnings.push(`Question ${i + 1} has different group names`);
            }
            if (!found) {
                warnings.push(`Question ${i + 1} is missing an answer`);
            }
        }
        return warnings;
    }

}


//
// Question model.
//
class Question extends Moveable {
    constructor(question) {
        super(question);
        this.options = [];
        super.fill(this.options, Option);
    }

    //
    // Make question options appear in random order.
    //
    // Random reordering of list items taken from:
    //     https://stackoverflow.com/a/11972692
    //
    randomize() {
        // do not randomize qustions with only 2 options
        // (like true/false, yes/no)
        if (this.options.length == 2) {
            return;
        }

        for (let i = this.options.length; i >= 0; i--) {
            this.move(Math.random() * i | 0);
        }
    }
}


//
// Option model.
//
class Option {
    constructor(option) {
        this.element = option;
        this.checked = $(option).find('input').is(':checked');
        this.answer = $(option).find('input').attr('class') === 'answer';
        this.group = $(option).find('input').attr('name');
    }

    //
    // Check one question. Return 1 if correct, 0 otherwise.
    //
    check() {
        if (this.answer) {
            this.right();
            if (this.checked) {
                return 1;
            }
        } else if (this.checked) {
            this.wrong();
        }

        return 0;
    }

    //
    // Display right answer.
    //
    right() {
        // TODO: $(this.element).addClass('right-answer');
        this.element.style.color = '#77a352';
        this.element.style.border = '1px solid grey';
        this.element.style.borderRadius = '25px';
    }

    //
    // Display wrong answer.
    //
    wrong() {
        // TODO: $(this.element).addClass('wrong-answer');
        this.element.style.color = '#e46e4e';
        this.element.style.border = 'none';
    }

    //
    // Unstyle any prior correct/incorrect markings.
    //
    unstyle() {
        // For example, they:
        //   1. select a wrong answer, submit
        //   2. select the right answer instead, submit
        //   3. the wrong answer would still be red w/o unstyle
        // TODO: $(this.element).addClass('clear-answer');
        this.element.style.color = '#53565e';
        this.element.style.border = 'none';
    }
}
