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
// On homepage load, enable "learn how" accordion.
//
// https://jqueryui.com/accordion/#collapsible
//
$(function() {
    $('#accordion').accordion({
        active: false,
        collapsible: true,
    });
});
