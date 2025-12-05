document.addEventListener('DOMContentLoaded', () => {
    // 1. Select all the question headers
    const questions = document.querySelectorAll('.faq-question');

    // 2. Loop through each question
    questions.forEach(question => {
        // 3. Attach a click event listener to each question
        question.addEventListener('click', () => {
            // Find the parent 'faq-item' element
            const faqItem = question.closest('.faq-item');

            // 4. Toggle the 'active' class on the parent
            // This is what the CSS uses to open/close the answer
            faqItem.classList.toggle('active');

            /* // OPTIONAL: Uncomment this section if you want only ONE answer open at a time (classic accordion)
            // Close all other open answers
            document.querySelectorAll('.faq-item.active').forEach(item => {
                if (item !== faqItem) {
                    item.classList.remove('active');
                }
            });
            */
        });
    });
});