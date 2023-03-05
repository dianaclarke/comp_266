//
// On page load, randomize the quiz (if it passes validation).
//
$(function() {
    const quiz = new Quiz($('#quiz-form'));
    warnings = quiz.validate();
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
        quiz.randomize();
    }
});


//
// Add an on submit event listener to the quiz form (to grade quiz).
//
// Do not refresh page on submit from:
//     https://stackoverflow.com/a/19454346
//
$(function() {
    const form = $('#quiz-form');
    function submit(event) {
        event.preventDefault();
        const quiz = new Quiz(form);
        quiz.grade();
    }
    form.submit(submit);
});


//
// Moveable mixin (to reorder quiz questions and options).
//
class Moveable {
    constructor(element) {
        this.element = $(element).get(0);
        this.list = $(element).find('ol').get(0);
    }

    fill(array, type) {
        for (let i = 0; i < this.list.children.length; i++) {
            array.push(new type(this.list.children[i]));
        }
    }

    move(index) {
        $(this.list).append(this.list.children[index]);
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
        this.element.style.color = '#77a352';
        this.element.style.border = '1px solid grey';
        this.element.style.borderRadius = '25px';
    }

    //
    // Display wrong answer.
    //
    wrong() {
        this.element.style.color = '#e46e4e';
        this.element.style.borderRadius = '25px';
    }

    //
    // Unstyle any prior correct/incorrect markings.
    //
    unstyle() {
        // For example, they:
        //   1. select a wrong answer, submit
        //   2. select the right answer instead, submit
        //   3. the wrong answer would still be red w/o unstyle
        this.element.style.color = '#53565e';
        this.element.style.border = 'none';
    }
}
