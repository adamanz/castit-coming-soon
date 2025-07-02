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
    
    // Submit to backend
    this.textContent = 'Submitting...';
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
            showMessage(data.message, 'success');
        } else {
            showMessage(data.message || 'Something went wrong', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('Failed to submit. Please try again.', 'error');
    } finally {
        this.textContent = 'Notify Me';
        this.disabled = false;
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

// Start wave animation
animateWaves();