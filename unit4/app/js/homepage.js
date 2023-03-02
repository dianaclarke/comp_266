//
// Make the entire chapter box on the homepage clickable, not just the link.
//
$(document).ready(function() {
    // https://softauthor.com/javascript-for-loop-click-event-issues-solutions/
    const container = document.getElementsByClassName('box')[0];
    const chapters = container.getElementsByTagName('li');
    for (let i = 0; i < chapters.length; i++) {
        const chapter = chapters[i];
        const link = chapter.getElementsByTagName('a')[0];
        const href = link.getAttribute('href');
        chapter.style.cursor = 'pointer';
        chapter.addEventListener('click', function() { window.open(href, '_self'); });
    }
});
