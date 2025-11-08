        // Start of the JavaScript plugin implementation
        function setupSynopsisToggle() {
            const container = document.getElementById('synopsis-container');
            if (!container) return; // Exit if the container isn't found

            let isExpanded = false;

            // 1. Capture the full original content and remove it from the DOM
            // We use the data-original-content attribute to identify all parts of the synopsis
            const originalElements = container.querySelectorAll('[data-original-content]');
            let originalHtml = '';

            originalElements.forEach(el => {
                // Collect the HTML before removing
                originalHtml += el.outerHTML; 
                el.remove();
            });

            // 2. Define the new, tighter summary paragraph (as requested)
            const shortSummaryText = `A short story following Elaine Prowler and Spencer Erichson. The two walk to Theodore's Manor to give Stacy Prowler the good news that she will not be expelled from Montana Swallow University.`;

            // 3. Create the toggle button element
            const toggleButton = document.createElement('button');
            toggleButton.className = 'synopsis-toggle-button';
            
            // 4. Word Count Calculation (based on the captured original text)
            const countElement = document.getElementById('wordCount');
            const fullSynopsisText = originalHtml.replace(/<[^>]*>/g, '').trim(); // Strip HTML tags
            const wordCount = fullSynopsisText.split(/\s+/).filter(word => word.length > 0).length;

            if (countElement) {
                countElement.textContent = wordCount;
            }

            // 5. Toggle function logic
            function toggleSynopsis() {
                isExpanded = !isExpanded;
                
                if (isExpanded) {
                    // Switch to long version
                    container.innerHTML = originalHtml;
                    toggleButton.textContent = 'read less';
                } else {
                    // Switch to short version
                    container.innerHTML = `<p>${shortSummaryText}</p>`;
                    toggleButton.textContent = 'read more';
                }
                
                // Re-append the button after updating innerHTML
                const lastParagraph = container.querySelector('p:last-child');
                if (lastParagraph) {
                    lastParagraph.appendChild(document.createTextNode('...'));
                    lastParagraph.appendChild(toggleButton);
                } else {
                    // Fallback in case of weird structure
                    container.appendChild(toggleButton);
                }
            }

            // Initial setup (default to short version)
            toggleButton.addEventListener('click', toggleSynopsis);
            toggleButton.textContent = 'read more';
            
            // Display the short version initially
            container.innerHTML = `<p>${shortSummaryText}</p>`;
            
            // Append the button to the last paragraph of the short summary
            const initialParagraph = container.querySelector('p:last-child');
            if (initialParagraph) {
                initialParagraph.appendChild(document.createTextNode('... '));
                initialParagraph.appendChild(toggleButton);
            }
        }

        // Run the script once the document is fully loaded
        window.addEventListener('DOMContentLoaded', setupSynopsisToggle);