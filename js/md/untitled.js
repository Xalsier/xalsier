document.addEventListener('DOMContentLoaded', () => {
    fetch('./md/project.md')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(markdownText => {
            const markdownContainer = document.getElementById('profileMarkdown');
            
            // Use marked.js to convert markdown to HTML
            markdownContainer.innerHTML = marked.parse(markdownText);
            
            // Post-render processing to add IDs to headers
            const headers = markdownContainer.querySelectorAll('h1, h2, h3, h4, h5, h6');
            headers.forEach(header => {
                const text = header.innerText.replace(/[^a-zA-Z0-9- ]/g, '').toLowerCase().replace(/ /g, '-');
                header.id = text;
            });
            
            // Calculate word count from markdown text
            const wordCount = markdownText
                .replace(/[#*_`\[\]()]/g, '') // Remove markdown syntax
                .trim()
                .split(/\s+/)
                .filter(word => word.length > 0).length;
            
            // Update word count display
            const wordCountElement = document.getElementById('wordCount');
            if (wordCountElement) {
                wordCountElement.textContent = `${wordCount.toLocaleString()} Words`;
            }
        })
        .catch(error => {
            console.error('Error fetching or parsing markdown:', error);
            document.getElementById('markdown-container').innerHTML = `<p style="color:red;">Error loading content. Please ensure the file 'untitled.md' exists in the 'md' directory.</p>`;
            
            // Update word count to show error
            const wordCountElement = document.getElementById('wordCount');
            if (wordCountElement) {
                wordCountElement.textContent = 'Word count unavailable';
            }
        });
});