//
// On page submit, send an email.
// Do not refresh page on submit from:
//     https://stackoverflow.com/a/19454346
//
$(function() {
    const form = $('#contact-form');
    function submit(event) {
        event.preventDefault();

        if (window.location.href.startsWith('file://')) {
            contactError('because URL starts with file://');
            return;
        }

        // get the user input
        const name = event.target.elements['name'].value;
        const email = event.target.elements['email'].value;
        const message = event.target.elements['message'].value;
        const token = event.target.elements['g-recaptcha-response'].value;

        // verify the user & send email
        recaptcha(encodeURIComponent(token)).then(
            (response) => {
                if (!response.success) {
                    // did not pass recaptcha
                    contactError('Are you a robot?');
                    return;
                }
                // send the email
                sendgrid(
                    encodeURIComponent(name),
                    encodeURIComponent(email),
                    encodeURIComponent(message),
                ).then(
                    (_) => {
                        // let the user know we sent the email
                        display(name, email, message);
                    }).catch(
                        (error) => {
                            contactError(error.message);
                        });
            }).catch(
                (error) => {
                    contactError(error.message);
                });
    }
    form.submit(submit);
});


//
// Display the sent email
//
function display(name, email, message) {
    $('#contact-form').hide();
    $('#contact-form').parent().find('p').hide();
    const sent = $('<h3>Message sent, thanks!</h3>');
    $('#contact-form').parent().prepend(sent);
    const confirm = $(`
        <div style="text-align: left;"><p>
        <pre><b>name</b>: ${name}</pre>
        <pre><b>email</b>: ${email}</pre>
        <pre><b>message</b>:</pre>
        <pre style="white-space: pre-wrap;">${message}</pre>
        </p></div>
    `);
    $('#contact-form').parent().append(confirm);
}


//
// Display contact form error.
//
function contactError(message) {
    const msg = $('<h3>Message could not be sent.</h3>');
    const why = $(`<h5>${message}</h5>`);
    msg.append(why);
    $('#contact-form').hide();
    $('#contact-form').parent().find('p').hide();
    $('#contact-form').parent().prepend(msg);
    $('#contact-form').parent().removeClass('quiz');
}


//
// Using a Netlify function, send an email.
//
async function sendgrid(name, email, message) {
    const netlify = `/.netlify/functions/sendgrid/sendgrid.js?message=${message}&name=${name}&email=${email}`;
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
// Using a Netlify function, verify recaptcha.
//
async function recaptcha(token) {
    const netlify = `/.netlify/functions/recaptcha/recaptcha.js?token=${token}`;
    const response = await fetch(netlify).catch(
        (error) => {
            throw new Error(error.message);
        });
    if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
    }
    return response.json();
};
