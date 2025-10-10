        // Modal functionality
        function toggleModal(show) {
            const modal = document.getElementById('navModal');
            modal.style.display = show ? 'flex' : 'none';
        }

        function navigate(select) {
            if (select.value) {
                window.location.href = select.value;
            }
        }

        // Profile card spin animation
        function spinCard(card) {
            card.classList.add('spin');
            setTimeout(() => {
                card.classList.remove('spin');
            }, 600);
        }

        function randomizeHeightEye() {
            const card = document.getElementById('heightEyeCard');
            const label = document.getElementById('heightEyeLabel');
            const value = document.getElementById('heightEyeValue');
            
            if (Math.random() < 0.5) {
                label.textContent = 'Eye Color';
                value.textContent = 'Hazel';
            } else {
                label.textContent = 'Height';
                value.textContent = '6\'0"';
            }
        }

        document.addEventListener('DOMContentLoaded', function () {
            randomizeHeightEye();
            
            const fallbackAnimation = () => {
                document.getElementById('progress-80')?.classList.add('animate-80');
                document.getElementById('progress-98')?.classList.add('animate-98');
                document.getElementById('progress-40')?.classList.add('animate-49');
                document.getElementById('progress-55')?.classList.add('animate-55');
            };
        
            // Animation for fade-ins
            const observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            };
        
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            }, observerOptions);
        
            document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
        
            // Fetch config JSON
            fetch('./json/socmed.json')
                .then(res => {
                    if (!res.ok) throw new Error('Failed to fetch config');
                    return res.json();
                })
                .then(config => {
                    document.querySelectorAll('.progress-fill').forEach(el => {
                        const platform = el.dataset.platform;
                        if (!platform || !config[platform]) return;
        
                        const { current, goal } = config[platform];
                        const percent = Math.min((current / goal) * 100, 100);
        
                        el.style.width = percent + '%';
                    });
        
                    // Update small text values as well
                    document.querySelectorAll('.progress-info').forEach(info => {
                        const link = info.querySelector('a');
                        const small = info.querySelector('small');
                        if (link && small && config[link.textContent]) {
                            const { current, goal } = config[link.textContent];
                            small.textContent = `${current}/${goal}`;
                        }
                    });
                })
                .catch(err => {
                    console.warn('Using fallback progress animations due to error:', err);
                    fallbackAnimation(); // Use existing hardcoded CSS animation
                });
        });