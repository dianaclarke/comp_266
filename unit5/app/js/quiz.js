//
// Randomize quiz on page load.
//
$(document).ready(function() {
    const form = document.getElementById('quiz-form');
    randomizeQuestions(new Quiz(form));

});


//
// Make quiz questions appear in random order.
//
// Random reordering of list items taken from:
//     https://stackoverflow.com/a/11972692
//
function randomizeQuestions(quiz) {
    for (let i = quiz.questions.length; i >= 0; i--) {
        if (i > 0) {
            randomizeOptions(quiz.questions[i - 1]);
        }
        quiz.move(Math.random() * i | 0);
    }
};


//
// Make question options appear in random order.
//
// Random reordering of list items taken from:
//     https://stackoverflow.com/a/11972692
//
function randomizeOptions(question) {
    // do not randomize qustions with only 2 options
    // (like true/false, yes/no)
    if (question.options.length == 2) {
        return;
    }

    for (let i = question.options.length; i >= 0; i--) {
        question.move(Math.random() * i | 0);
    }
};


//
// Add an on submit event listener to the quiz form (to grade quiz).
//
// Do not refresh page on submit from:
//     https://stackoverflow.com/a/19454346
//
$(document).ready(function() {
    const form = document.getElementById('quiz-form');
    function submit(event) {
        event.preventDefault();
        grade(new Quiz(form));
    }
    form.addEventListener('submit', submit);
});


//
// Grade the quiz.
//
function grade(quiz) {
    let correct = 0;
    const total = quiz.questions.length;

    clear(quiz);

    for (let i = 0; i < quiz.questions.length; i++) {
        const question = quiz.questions[i];
        for (let x = 0; x < question.options.length; x++) {
            const option = question.options[x];
            unstyle(option);
            correct += check(option);
        }
    }

    mark(quiz, correct, total);
};


//
// Check one question. Return 1 if correct, 0 otherwise.
//
function check(option) {
    if (option.answer) {
        right(option);
        if (option.checked) {
            return 1;
        }
    } else if (option.checked) {
        wrong(option);
    }

    return 0;
};


//
// Display quiz mark.
//
function mark(quiz, correct, total) {
    // calculate result
    percent = (correct / total) * 100 | 0;

    // display result
    result = document.createElement('h4');
    result.id = 'quiz-result';
    result.innerHTML = `${percent}% (${correct}/${total})`;
    quiz.element.appendChild(result);
};


//
// Display right answer.
//
function right(option) {
    option.element.style.color = '#77a352';
    option.element.style.border = '1px solid grey';
    option.element.style.borderRadius = '25px';
};


//
// Display wrong answer.
//
function wrong(option) {
    option.element.style.color = '#e46e4e';
    option.element.style.borderRadius = '25px';
};


//
// Clear past results and remove background image from quiz.
//
function clear(quiz) {
    // remove the background from graded quizzes
    container = quiz.element.parentElement;
    container.style.background = 'none';

    // clear past result
    result = document.getElementById('quiz-result');
    if (result) {
        result.remove();
    }
};


//
// Unstyle any prior correct/incorrect markings.
//
function unstyle(option) {
    // For example, they:
    //   1. select a wrong answer, submit
    //   2. select the right answer instead, submit
    //   3. the wrong answer would still be red w/o unstyle
    option.element.style.color = '#53565e';
    option.element.style.border = 'none';
};


//
// Validate quiz on page load.
//
$(document).ready(function() {
    const form = document.getElementById('quiz-form');
    validate(new Quiz(form));
});


//
// Validate quiz.
//
function validate(quiz) {
    const warnings = [];
    const allGroups = new Set();
    for (let i = 0; i < quiz.questions.length; i++) {
        let hasAnswer = false;
        const question = quiz.questions[i];
        const thisGroup = new Set();
        for (let x = 0; x < question.options.length; x++) {
            const option = question.options[x];
            const group = option.group;
            if (x == 0 && allGroups.has(group)) {
                warnings.push(`Question ${i + 1} is using a group from another question`);
            }
            allGroups.add(group);
            thisGroup.add(group);
            if (option.answer) {
                hasAnswer = true;
            }
        }
        if (thisGroup.size != 1) {
            warnings.push(`Question ${i + 1} has different group names`);
        }
        if (!hasAnswer) {
            warnings.push(`Question ${i + 1} is missing an answer`);
        }
    }
    if (warnings.length > 0) {
        window.alert(warnings.join('\n'));
    }
};


//
// Moveable mixin (to reorder quiz questions and options).
//
class Moveable {
    constructor(element) {
        this.element = element;
        this.list = element.getElementsByTagName('ol')[0];
    }

    fill(array, type) {
        for (let i = 0; i < this.list.children.length; i++) {
            array.push(new type(this.list.children[i]));
        }
    }

    move(index) {
        this.list.appendChild(this.list.children[index]);
    }
}


//
// Quiz model.
//
// To access the underlying DOM, use:
//   - quiz.element
//   - quiz.list
//
class Quiz extends Moveable {
    constructor(quiz) {
        super(quiz);
        this.questions = [];
        super.fill(this.questions, Question);
    }
}


//
// Question model.
//
// To access the underlying DOM, use:
//   - question.element
//   - question.list
//
class Question extends Moveable {
    constructor(question) {
        super(question);
        this.options = [];
        super.fill(this.options, Option);
    }
}

//
// Option model.
//
// To access the underlying DOM, use:
//   - option.element
//
class Option {
    constructor(option) {
        this.element = option;
        this.input = option.getElementsByTagName('input')[0];
        this.checked = this.input.checked;
        this.answer = this.input.getAttribute('class') === 'answer';
        this.group = this.input.getAttribute('name');
    }
}
