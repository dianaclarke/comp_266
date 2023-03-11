//
// On homepage load, sey hello to OpenAI chat.
//
$(function() {
    //const question = 'Create me an anatomy 101 quiz with 50 questions. Format the questions and answers in json, make options a dictionary, answer keyed by index.';
    const question = 'Hello again!';
    openai(question).then((data) => {
        const answer = data['choices'][0]['message']['content'];
        console.log(answer);
        $('#ai').text(answer);
    });
});


//
// Using Netlify functions, query OpenAI.
//
async function openai(question) {
    const response = await fetch(`/.netlify/functions/open-ai/open-ai.js?question=${question}`);
    return response.json();
};


//
// Make the entire chapter box on the homepage clickable, not just the link.
//
$(function() {
    $('.box>ul>li').each(function() {
        this.style.cursor = 'pointer';
        this.addEventListener('click', function() {
            window.open($(this).find('a').attr('href'), '_self');
        });
    });
});


//
// On homepage load, enable 'learn how' accordion.
//
// https://jqueryui.com/accordion/#collapsible
//
$(function() {
    $('#accordion').accordion({
        active: false,
        collapsible: true,
    });
});
