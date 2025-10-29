const viewport = document.getElementById('viewport');
        const container = document.getElementById('bubbleContainer');
        const bubbleWrap = document.getElementById('bubbleWrap');
        const counter = document.getElementById('counter');
        
        let popped = 0;
        let isDragging = false;
        let isPopping = false;
        const supportsPointer = 'onpointerdown' in window;
        let startX, startY;
        let scrollLeft = 0;
        let scrollTop = 0;
        let velocityX = 0;
        let velocityY = 0;

      
        const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
        const rows = isMobile ? 30 : 100;
        const cols = isMobile ? 18 : 100;
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

        
       
        let audioCtx;
        let popBuffer = null;
        let htmlAudioFallback = new Audio('assets/bubble.mp3');
        htmlAudioFallback.preload = 'auto';

        async function initAudio() {
            if (audioCtx) return;
            
            if (window.location.protocol === 'file:') {
            
                return;
            }
            audioCtx = new (window.AudioContext || window.webkitAudioContext)({ latencyHint: 'interactive' });
            try {
                const res = await fetch('assets/bubble.mp3');
                const arr = await res.arrayBuffer();
                popBuffer = await audioCtx.decodeAudioData(arr);
            } catch (e) {
                console.log('Erreur init audio:', e);
               
            }
        }

        function unlockAudioContext() {
            if (!audioCtx) {
                initAudio().then(() => {
                    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
                });
            } else if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
        }

        function playPopSound() {
           
            if (!audioCtx || (audioCtx && audioCtx.state === 'suspended')) {
                unlockAudioContext();
            }
            if (audioCtx && popBuffer) {
                const src = audioCtx.createBufferSource();
                src.buffer = popBuffer;
                const gain = audioCtx.createGain();
                gain.gain.value = 0.5;
                src.connect(gain).connect(audioCtx.destination);
                src.start(0);
                return;
            }
            if (htmlAudioFallback) {
                const sound = htmlAudioFallback.cloneNode();
                sound.volume = 0.5;
                sound.play().catch(() => {});
            }
        }

        function createBubbles() {
            bubbleWrap.innerHTML = '';
            popped = 0;
            const colors = ['blue', 'green', 'pink', 'purple', 'orange', 'cyan'];
          
            bubbleWrap.style.gridTemplateColumns = `repeat(${cols}, ${bubbleSize}px)`;
            
            for (let i = 0; i < rows * cols; i++) {
                const bubble = document.createElement('div');
                const randomColor = colors[Math.floor(Math.random() * colors.length)];
                bubble.className = `bubble ${randomColor}`;
                if (supportsPointer) {
                    bubble.addEventListener('pointerdown', function(e) {
                        isPopping = true;
                        popBubble.call(this, e);
                    });
                } else {
                    bubble.addEventListener('mousedown', popBubble);
                    bubble.addEventListener('touchstart', popBubble);
                }
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
                
                const particleCount = isMobile ? 4 : 8;
                for (let i = 0; i < particleCount; i++) {
                    const particle = document.createElement('div');
                    particle.className = 'particle';
                    particle.style.left = centerX + 'px';
                    particle.style.top = centerY + 'px';
                    particle.style.backgroundColor = bubbleColor;
                    
                    const angle = (i / particleCount) * Math.PI * 2;
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

       
        window.addEventListener('pointerdown', unlockAudioContext, { once: true });
        window.addEventListener('touchstart', unlockAudioContext, { once: true, passive: true });
        window.addEventListener('mousedown', unlockAudioContext, { once: true });

       
        if (supportsPointer) {
            window.addEventListener('pointermove', (e) => {
                if (!isPopping) return;
                const el = document.elementFromPoint(e.clientX, e.clientY);
                if (el && el.classList && el.classList.contains('bubble') && !el.classList.contains('popped')) {
                    popBubble.call(el, e);
                }
            }, { passive: true });
            window.addEventListener('pointerup', () => {
                isPopping = false;
            });
            window.addEventListener('pointercancel', () => {
                isPopping = false;
            });
        } else {
           
            window.addEventListener('mousemove', (e) => {
                if (!isPopping) return;
                const el = document.elementFromPoint(e.clientX, e.clientY);
                if (el && el.classList && el.classList.contains('bubble') && !el.classList.contains('popped')) {
                    popBubble.call(el, e);
                }
            });
            window.addEventListener('mouseup', () => {
                isPopping = false;
            });
            window.addEventListener('touchmove', (e) => {
                if (!isPopping) return;
                const t = e.touches[0];
                if (!t) return;
                const el = document.elementFromPoint(t.clientX, t.clientY);
                if (el && el.classList && el.classList.contains('bubble') && !el.classList.contains('popped')) {
                    popBubble.call(el, e);
                }
            }, { passive: true });
            window.addEventListener('touchend', () => {
                isPopping = false;
            });
            window.addEventListener('touchcancel', () => {
                isPopping = false;
            });
        }

        createBubbles();
        updatePosition();