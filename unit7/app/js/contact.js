//
// Using a Netlify function, send email.
//
async function sendgrid(name, email, message) {
    const response = await fetch(`/.netlify/functions/sendgrid/sendgrid.js?message=${message}&name=${name}&email=${email}`);
    return response.json();
};
