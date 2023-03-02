//
// Make quiz questions appear in random order.
//
// Random reordering of list items taken from:
//     https://stackoverflow.com/a/11972692
//
$(document).ready(function() {
    const quiz = document.getElementById('quiz-form');
    const questions = quiz.getElementsByTagName('ol')[0];
    for (let i = questions.children.length; i >= 0; i--) {
        const index = Math.random() * i | 0;
        questions.appendChild(questions.children[index]);
    }
});
