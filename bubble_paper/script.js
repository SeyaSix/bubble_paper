const viewport = document.getElementById('viewport');
        const container = document.getElementById('bubbleContainer');
        const bubbleWrap = document.getElementById('bubbleWrap');
        const counter = document.getElementById('counter');
        
        let popped = 0;
        let isDragging = false;
        let startX, startY;
        let scrollLeft = 0;
        let scrollTop = 0;
        let velocityX = 0;
        let velocityY = 0;

      
        const rows = 100;
        const cols = 100;
        const bubbleSize = 70;
        const gap = 20;
        const padding = 50;
        const gridWidth = cols * bubbleSize + (cols - 1) * gap + padding * 2;
        const gridHeight = rows * bubbleSize + (rows - 1) * gap + padding * 2;

    
        let translateX = window.innerWidth / 2 - gridWidth / 2;
        let translateY = window.innerHeight / 2 - gridHeight / 2;

   
        const maxX = 0;
        const minX = window.innerWidth - gridWidth;
        const maxY = 0;
        const minY = window.innerHeight - gridHeight;

        function updatePosition() {
            container.style.transform = `translate(${translateX}px, ${translateY}px)`;
        }

       
        const popAudio = new Audio('assets/bubble.mp3');
        popAudio.preload = 'auto';
        
        function playPopSound() {
         
            const sound = popAudio.cloneNode();
            sound.volume = 0.5;
            sound.play().catch(e => console.log('Erreur audio:', e));
        }

        function createBubbles() {
            bubbleWrap.innerHTML = '';
            popped = 0;
            const colors = ['blue', 'green', 'pink', 'purple', 'orange', 'cyan'];
            
            for (let i = 0; i < rows * cols; i++) {
                const bubble = document.createElement('div');
                const randomColor = colors[Math.floor(Math.random() * colors.length)];
                bubble.className = `bubble ${randomColor}`;
                bubble.addEventListener('mousedown', popBubble);
                bubble.addEventListener('touchstart', popBubble);
                bubbleWrap.appendChild(bubble);
            }
            updateCounter();
        }

        function popBubble(e) {
            if (!isDragging && !this.classList.contains('popped')) {
                e.preventDefault();
                e.stopPropagation();
                

                const rect = this.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const bubbleColor = getComputedStyle(this).borderColor;
                
    
                for (let i = 0; i < 8; i++) {
                    const particle = document.createElement('div');
                    particle.className = 'particle';
                    particle.style.left = centerX + 'px';
                    particle.style.top = centerY + 'px';
                    particle.style.backgroundColor = bubbleColor;
                    
                    const angle = (i / 8) * Math.PI * 2;
                    const distance = 40 + Math.random() * 30;
                    const tx = Math.cos(angle) * distance;
                    const ty = Math.sin(angle) * distance;
                    
                    particle.style.setProperty('--tx', tx + 'px');
                    particle.style.setProperty('--ty', ty + 'px');
                    
                    document.body.appendChild(particle);
                    
                    setTimeout(() => particle.remove(), 600);
                }
                
                this.classList.add('popped');
                popped++;
                updateCounter();
                playPopSound();
            }
        }

        function updateCounter() {
            counter.textContent = `Éclatées : ${popped}`;
        }

        function resetBubbles() {
            createBubbles();
            translateX = window.innerWidth / 2 - gridWidth / 2;
            translateY = window.innerHeight / 2 - gridHeight / 2;
            translateX = Math.max(minX, Math.min(maxX, translateX));
            translateY = Math.max(minY, Math.min(maxY, translateY));
            updatePosition();
        }


        viewport.addEventListener('mousedown', (e) => {
            if (e.target === viewport || e.target === container || e.target === bubbleWrap) {
                isDragging = true;
                viewport.classList.add('grabbing');
                startX = e.clientX;
                startY = e.clientY;
                scrollLeft = translateX;
                scrollTop = translateY;
                velocityX = 0;
                velocityY = 0;
            }
        });

        viewport.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const x = e.clientX;
            const y = e.clientY;
            const walkX = x - startX;
            const walkY = y - startY;
            velocityX = walkX;
            velocityY = walkY;
            translateX = scrollLeft + walkX;
            translateY = scrollTop + walkY;
            
            // Limiter le déplacement
            translateX = Math.max(minX, Math.min(maxX, translateX));
            translateY = Math.max(minY, Math.min(maxY, translateY));
            
            updatePosition();
        });

        viewport.addEventListener('mouseup', () => {
            isDragging = false;
            viewport.classList.remove('grabbing');
        });

        viewport.addEventListener('mouseleave', () => {
            isDragging = false;
            viewport.classList.remove('grabbing');
        });


        viewport.addEventListener('touchstart', (e) => {
            if (e.target === viewport || e.target === container || e.target === bubbleWrap) {
                isDragging = true;
                const touch = e.touches[0];
                startX = touch.clientX;
                startY = touch.clientY;
                scrollLeft = translateX;
                scrollTop = translateY;
                velocityX = 0;
                velocityY = 0;
            }
        }, { passive: true });

        viewport.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            const touch = e.touches[0];
            const x = touch.clientX;
            const y = touch.clientY;
            const walkX = x - startX;
            const walkY = y - startY;
            velocityX = walkX;
            velocityY = walkY;
            translateX = scrollLeft + walkX;
            translateY = scrollTop + walkY;
            
            // Limiter le déplacement
            translateX = Math.max(minX, Math.min(maxX, translateX));
            translateY = Math.max(minY, Math.min(maxY, translateY));
            
            updatePosition();
        }, { passive: true });

        viewport.addEventListener('touchend', () => {
            isDragging = false;
        });


        viewport.addEventListener('click', (e) => {
            if (Math.abs(velocityX) > 5 || Math.abs(velocityY) > 5) {
                e.preventDefault();
                e.stopPropagation();
            }
        }, true);

    
        createBubbles();
        updatePosition();