// Wave animation
function createWavePath(amplitude, frequency, phase, offset) {
    const points = [];
    const width = 1440;
    const height = 800;
    
    for (let x = 0; x <= width; x += 10) {
        const y = height / 2 + amplitude * Math.sin((x / width) * frequency * Math.PI * 2 + phase) + offset;
        points.push(`${x},${y}`);
    }
    
    return `M${points.join(' L')}`;
}

function animateWaves() {
    let phase = 0;
    
    function update() {
        phase += 0.02;
        
        document.querySelector('.wave1').setAttribute('d', createWavePath(60, 2, phase, -100));
        document.querySelector('.wave2').setAttribute('d', createWavePath(40, 3, phase * 1.5, 0));
        document.querySelector('.wave3').setAttribute('d', createWavePath(50, 2.5, phase * 0.8, 100));
        document.querySelector('.wave4').setAttribute('d', createWavePath(35, 4, phase * 1.2, 200));
        
        requestAnimationFrame(update);
    }
    
    update();
}

// Email validation and submission
document.querySelector('.notify-btn').addEventListener('click', async function() {
    const emailInput = document.querySelector('.email-input');
    const email = emailInput.value.trim();
    
    if (!email) {
        showMessage('Please enter your email', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showMessage('Please enter a valid email', 'error');
        return;
    }
    
    // Trigger podcast animation
    createPodcastAnimation();
    
    // Submit to backend
    this.textContent = 'Recording...';
    this.disabled = true;
    
    try {
        const response = await fetch('https://castit-email-backend-vg5x5kemyq-uc.a.run.app/api/subscribe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            emailInput.value = '';
            showMessage('Welcome to the podcast revolution! 🎧', 'success');
        } else {
            showMessage(data.message || 'Something went wrong', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('Failed to submit. Please try again.', 'error');
    } finally {
        setTimeout(() => {
            this.textContent = 'Notify Me';
            this.disabled = false;
        }, 500);
    }
});

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showMessage(message, type) {
    const messageEl = document.createElement('div');
    messageEl.className = `message ${type}`;
    messageEl.textContent = message;
    messageEl.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        padding: 1rem 2rem;
        background: ${type === 'success' ? 'linear-gradient(135deg, #10B981, #059669)' : 'linear-gradient(135deg, #EF4444, #DC2626)'};
        color: white;
        border-radius: 50px;
        font-size: 0.9rem;
        z-index: 1000;
        animation: slideDown 0.5s ease-out;
    `;
    
    document.body.appendChild(messageEl);
    
    setTimeout(() => {
        messageEl.style.animation = 'slideUp 0.5s ease-out';
        setTimeout(() => messageEl.remove(), 500);
    }, 3000);
}

// Add enter key support
document.querySelector('.email-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        document.querySelector('.notify-btn').click();
    }
});

// Add animations CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translate(-50%, -100%);
        }
        to {
            opacity: 1;
            transform: translate(-50%, 0);
        }
    }
    
    @keyframes slideUp {
        from {
            opacity: 1;
            transform: translate(-50%, 0);
        }
        to {
            opacity: 0;
            transform: translate(-50%, -100%);
        }
    }
`;
document.head.appendChild(style);

// Interactive hover effects
document.querySelector('.logo').addEventListener('mouseenter', function() {
    this.style.transform = 'scale(1.1)';
});

document.querySelector('.logo').addEventListener('mouseleave', function() {
    this.style.transform = 'scale(1)';
});

// Parallax effect on mouse move
document.addEventListener('mousemove', (e) => {
    const { clientX, clientY } = e;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    const moveX = (clientX - centerX) / centerX;
    const moveY = (clientY - centerY) / centerY;
    
    document.querySelectorAll('.icon').forEach((icon, index) => {
        const speed = 20 + (index * 10);
        icon.style.transform = `translate(${moveX * speed}px, ${moveY * speed}px)`;
    });
});

// Podcast animation function
function createPodcastAnimation() {
    // Create animation container
    const animContainer = document.createElement('div');
    animContainer.className = 'podcast-animation';
    animContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 9999;
        pointer-events: none;
        overflow: hidden;
    `;
    
    // Create microphone that slides in
    const mic = document.createElement('div');
    mic.className = 'podcast-mic';
    mic.innerHTML = '🎙️';
    mic.style.cssText = `
        position: absolute;
        font-size: 80px;
        top: 50%;
        left: -100px;
        transform: translateY(-50%);
        animation: slideInMic 0.8s ease-out forwards;
    `;
    
    // Create sound waves
    for (let i = 0; i < 5; i++) {
        const wave = document.createElement('div');
        wave.className = 'sound-wave';
        wave.style.cssText = `
            position: absolute;
            border: 2px solid #F59E0B;
            border-radius: 50%;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: ${100 + i * 60}px;
            height: ${100 + i * 60}px;
            opacity: 0;
            animation: soundWave 1.5s ease-out ${i * 0.2}s;
        `;
        animContainer.appendChild(wave);
    }
    
    // Create floating music notes
    const notes = ['🎵', '🎶', '🎼', '🎤', '🎧'];
    notes.forEach((note, index) => {
        const noteEl = document.createElement('div');
        noteEl.innerHTML = note;
        noteEl.style.cssText = `
            position: absolute;
            font-size: 40px;
            bottom: 20%;
            left: ${20 + index * 15}%;
            opacity: 0;
            animation: floatUp 2s ease-out ${index * 0.2}s forwards;
        `;
        animContainer.appendChild(noteEl);
    });
    
    // Create "ON AIR" sign
    const onAir = document.createElement('div');
    onAir.innerHTML = 'ON AIR';
    onAir.style.cssText = `
        position: absolute;
        top: 20%;
        right: 20%;
        background: #EF4444;
        color: white;
        padding: 10px 20px;
        border-radius: 8px;
        font-weight: bold;
        font-size: 24px;
        opacity: 0;
        box-shadow: 0 0 20px rgba(239, 68, 68, 0.8);
        animation: pulseOnAir 1.5s ease-in-out 0.5s forwards;
    `;
    
    animContainer.appendChild(mic);
    animContainer.appendChild(onAir);
    document.body.appendChild(animContainer);
    
    // Add animation styles
    if (!document.querySelector('#podcast-animations')) {
        const animStyles = document.createElement('style');
        animStyles.id = 'podcast-animations';
        animStyles.textContent = `
            @keyframes slideInMic {
                to {
                    left: 50%;
                    transform: translate(-50%, -50%) scale(1.2);
                }
            }
            
            @keyframes soundWave {
                0% {
                    opacity: 0.8;
                    transform: translate(-50%, -50%) scale(0.5);
                }
                100% {
                    opacity: 0;
                    transform: translate(-50%, -50%) scale(2);
                }
            }
            
            @keyframes floatUp {
                0% {
                    transform: translateY(0) rotate(0deg);
                    opacity: 0;
                }
                50% {
                    opacity: 1;
                }
                100% {
                    transform: translateY(-200px) rotate(360deg);
                    opacity: 0;
                }
            }
            
            @keyframes pulseOnAir {
                0% {
                    opacity: 0;
                    transform: scale(0.5);
                }
                50% {
                    opacity: 1;
                    transform: scale(1.1);
                }
                100% {
                    opacity: 1;
                    transform: scale(1);
                }
            }
            
            .podcast-animation {
                background: radial-gradient(circle at center, rgba(245, 158, 11, 0.1), transparent);
            }
        `;
        document.head.appendChild(animStyles);
    }
    
    // Remove animation after 3 seconds
    setTimeout(() => {
        animContainer.style.animation = 'fadeOut 0.5s ease-out forwards';
        setTimeout(() => animContainer.remove(), 500);
    }, 2500);
}

// Start wave animation
animateWaves();