//
// On page submit, send an email.
// Do not refresh page on submit from:
//     https://stackoverflow.com/a/19454346
//
$(function() {
    const form = $('#contact-form');
    function submit(event) {
        event.preventDefault();

        // get the user input
        const name = event.target.elements['name'].value;
        const email = event.target.elements['email'].value;
        const message = event.target.elements['message'].value;

        // let the user know we sent the email
        $('#contact-form').hide();
        $('#contact-form').parent().find('p').hide();
        const sent = $('<h3>Message sent, thanks!</h3>');
        $('#contact-form').parent().prepend(sent);
        const confirm = $(`<div style="text-align: left;"><p>
          <pre><b>name</b>: ${name}</pre>
          <pre><b>email</b>: ${email}</pre>
          <pre><b>message</b>:</pre>
          <pre style="white-space: pre-wrap;">${message}</pre>
          </p></div>`
        );
        $('#contact-form').parent().append(confirm);

        // send the email
        send(name, email, message);
    }
    form.submit(submit);
});


//
// Using Sendgrid, send an email.
//
function send(name, email, message) {
    sendgrid(name, email, message).then((data) => {
        console.log(message);
    });
}


//
// Using a Netlify function, send an email.
//
async function sendgrid(name, email, message) {
    const response = await fetch(`/.netlify/functions/sendgrid/sendgrid.js?message=${message}&name=${name}&email=${email}`);
    return response.json();
};
