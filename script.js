// script.js
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const countElement = document.getElementById('count');
    const incrementButton = document.getElementById('increment');
    const decrementButton = document.getElementById('decrement');
    
    // Initialize count
    let count = 0;
    
    // Update count display
    function updateCount() {
        countElement.textContent = count;
        
        // Change color based on count value
        if (count > 0) {
            countElement.style.color = '#4caf50';
        } else if (count < 0) {
            countElement.style.color = '#f44336';
        } else {
            countElement.style.color = '#333';
        }
    }
    
    // Increment count
    incrementButton.addEventListener('click', function() {
        count++;
        updateCount();
        animateButton(this);
    });
    
    // Decrement count
    decrementButton.addEventListener('click', function() {
        count--;
        updateCount();
        animateButton(this);
    });
    
    // Button animation
    function animateButton(button) {
        button.classList.add('active');
        setTimeout(() => {
            button.classList.remove('active');
        }, 150);
    }
    
    // Card click effect
    const card = document.querySelector('.card');
    card.addEventListener('click', function(e) {
        if (e.target === card || e.target === card.querySelector('.card-content')) {
            // Create ripple effect
            const ripple = document.createElement('div');
            ripple.classList.add('ripple');
            card.appendChild(ripple);
            
            // Position ripple
            const rect = card.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${e.clientX - rect.left - size/2}px`;
            ripple.style.top = `${e.clientY - rect.top - size/2}px`;
            
            // Remove ripple after animation
            setTimeout(() => {
                ripple.remove();
            }, 600);
        }
    });
    
    // Initialize
    updateCount();
});
