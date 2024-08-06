let score = 0;
let highScore = 0;
const target = document.getElementById('target');
const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');
const replayButton = document.getElementById('replay-button');
const highScoreDisplay = document.getElementById('high-score');
const gameContainer = document.getElementById('game-container');
const scopeOverlay = document.getElementById('scope-overlay');
const bullet = document.getElementById('bullet');
const character = document.getElementById('character');

// List of animal images
const animals = [
    'images/leopard.png', // Tiger
    'images/parrot.png',  // Parrot
    'images/monkey.png',
];

let timer = 60;
let gameActive = true;
let timerInterval; // Timer interval variable

function updateScore() {
    scoreDisplay.textContent = `Score: ${score}`;
}

function showDebug(message) {
    console.log(`[DEBUG]: ${message}`);
}

// Function to handle shooting
function shoot(event) {
    if (!gameActive) {
        showDebug('Game not active, cannot shoot');
        return;
    }

    const x = event.clientX;
    const y = event.clientY;
    
    const targetRect = target.getBoundingClientRect();
    const targetX = targetRect.left + targetRect.width / 2;
    const targetY = targetRect.top + targetRect.height / 2;
    
    const distance = Math.sqrt(Math.pow(x - targetX, 2) + Math.pow(y - targetY, 2));
    const hitRadius = targetRect.width / 2;

    if (distance < hitRadius && target.style.display === 'block') {
        stopTimer();  // Stop the timer when a shot hits the target
        showDebug('Hit detected, timer stopped');

        // Update score based on the animal type
        const isTiger = target.style.backgroundImage.includes('leopard');
        score += isTiger ? 1 : 2; // Tiger gives 1 points, others give 2 point

        // Stop the animation by freezing the target
        target.style.animation = 'none';

        // Trigger shot animation and feedback
        showShotFeedback(x, y, 'green');
        animateShot(targetX, targetY);
    } else {
        showShotFeedback(x, y, 'red');
    }

    updateScore();
    showDebug('Shot fired');
}

// Function to animate the shot
function animateShot(targetX, targetY) {
    gameActive = false; // Temporarily disable shooting
    character.style.display = 'block'; // Show character
    bullet.style.display = 'block'; // Show bullet

    // Determine if the target is on the left or right
    const screenWidth = window.innerWidth;
    if (targetX < screenWidth / 2) {
        // Target is on the left, sniper from right
        character.classList.add('flip'); // Face left
        character.style.left = '90%'; // Sniper from right
        bullet.style.transformOrigin = 'right center'; // Adjust bullet direction to start from the right
    } else {
        // Target is on the right, sniper from left
        character.classList.remove('flip'); // Face right
        character.style.left = '10%'; // Sniper from left
        bullet.style.transformOrigin = 'left center'; // Adjust bullet direction to start from the left
    }

    // Calculate bullet trajectory
    const characterRect = character.getBoundingClientRect();
    const barrelEndX = characterRect.left + characterRect.width * 0.5; // Center of character
    const barrelEndY = characterRect.top + characterRect.height * 0.4;

    // Calculate the difference in position
    const bulletDeltaX = targetX - barrelEndX;
    const bulletDeltaY = targetY - barrelEndY;

    // Set bullet position
    bullet.style.left = `${barrelEndX}px`;
    bullet.style.top = `${barrelEndY}px`;

    // Apply transformation for bullet movement
    // Apply rotation based on the direction
    const angle = Math.atan2(bulletDeltaY, bulletDeltaX) * (180 / Math.PI);

    bullet.style.setProperty('--bullet-x', `${bulletDeltaX}px`);
    bullet.style.setProperty('--bullet-y', `${bulletDeltaY}px`);
    bullet.style.transform = `rotate(${angle}deg)`; // Rotate the bullet based on the calculated angle
    bullet.style.animation = 'bulletTravel 0.2s linear forwards'; // Move bullet

    // Set timeout to hide the bullet and the target when the bullet "hits"
    setTimeout(() => {
        target.style.display = 'none'; // Hide the target after bullet animation
        bullet.style.display = 'none'; // Hide the bullet
        bullet.style.animation = ''; // Reset bullet animation
        character.style.display = 'none'; // Hide character
        gameActive = true; // Reactivate shooting
        startTimer();  // Resume timer after the shot completes
        showRandomAnimal(); // Show another animal
        showDebug('Shot animation complete, game active, target and bullet disappeared');
    }, 500); // This duration matches the bullet animation duration
}

// Function to show visual feedback on shot
function showShotFeedback(x, y, color) {
    const feedback = document.createElement('div');
    feedback.className = 'shot-feedback';
    feedback.style.left = `${x}px`;
    feedback.style.top = `${y}px`;
    feedback.style.backgroundColor = color;
    gameContainer.appendChild(feedback);
    
    setTimeout(() => {
        gameContainer.removeChild(feedback);
    }, 500);
}

// Event listener for shooting
gameContainer.addEventListener('click', shoot);

// Function to move the scope with the mouse
function moveScope(event) {
    const x = event.clientX - scopeOverlay.offsetWidth / 2;
    const y = event.clientY - scopeOverlay.offsetHeight / 2;
    scopeOverlay.style.transform = `translate(${x}px, ${y}px)`;
}

gameContainer.addEventListener('mousemove', moveScope);

let animalTimeout; // Declare a variable to hold the timeout reference

function showRandomAnimal() {
    const containerWidth = gameContainer.clientWidth;
    const containerHeight = gameContainer.clientHeight;

    const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
    target.style.backgroundImage = `url(${randomAnimal})`;

    let randomY;
    if (randomAnimal.includes('leopard')) {
        target.style.width = '70px'; // Size for tiger
        target.style.height = '70px';
        randomY = Math.random() * (containerHeight / 4) + (containerHeight * 3 / 4); // Bottom quarter
    } else if (randomAnimal.includes('parrot')) {
        target.style.width = '30px'; // Size for parrot
        target.style.height = '30px';
        randomY = Math.random() * (containerHeight / 4); // Top quarter
    } else if (randomAnimal.includes('monkey')) {
        target.style.width = '50px'; // Size for monkey
        target.style.height = '50px';
        randomY = Math.random() * (containerHeight / 4); // Top quarter
    }else if (randomAnimal.includes('palestine')) {
        target.style.width = '60px'; // Size for parrot
        target.style.height = '60px';
        randomY = Math.random() * (containerHeight / 4);
    } else {
        target.style.width = '100px';
        target.style.height = '100px';
        randomY = Math.random() * (containerHeight - parseInt(target.style.height)); // Full screen
    }

    const randomX = Math.random() * (containerWidth - parseInt(target.style.width));
    
    target.style.left = `${randomX}px`;
    target.style.top = `${randomY}px`;
    target.style.display = 'block';

    // Start the movement animation
    target.style.animation = 'moveTarget 2s infinite alternate ease-in-out';

    showDebug('New target appeared');

    // Add this code to set a timeout for hiding the target
    clearTimeout(animalTimeout); // Clear any existing timeout to avoid stacking
    animalTimeout = setTimeout(() => {
        if (target.style.display === 'block') { // Check if the target is still visible
            target.style.display = 'none'; // Hide the target
            showDebug('Target disappeared after 2 seconds');
            showRandomAnimal(); // Show another animal immediately
        }
    }, 2000); // 2 seconds delay
}

// Timer function
function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (timer <= 0) {
            clearInterval(timerInterval);
            endGame();
        }
        if (!gameActive) {
            return;
        }
        timer--;
        timerDisplay.textContent = `Time: ${timer}`;
    }, 1000);
}

// Function to stop the timer
function stopTimer() {
    if (timerInterval) clearInterval(timerInterval);
}

// End game function
function endGame() {
    gameActive = false;
    target.style.display = 'none';
    replayButton.style.display = 'block';
    highScoreDisplay.style.display = 'block';
    highScore = Math.max(highScore, score);
    highScoreDisplay.textContent = `High Score: ${highScore}`;
    showDebug('Game ended');
}

// Replay game function
function replayGame() {
    score = 0;
    timer = 60;
    gameActive = true;
    updateScore();
    timerDisplay.textContent = `Time: ${timer}`;
    replayButton.style.display = 'none';
    highScoreDisplay.style.display = 'none';
    showRandomAnimal();
    startTimer();
    showDebug('Game replayed');
}

document.addEventListener('DOMContentLoaded', function() {
    const jungleSound = document.getElementById('jungle-sound');

    // Play the sound
    jungleSound.play();

    // Example: Pause and play button functionality
    const pauseButton = document.createElement('button');
    pauseButton.textContent = 'Pause Sound';
    pauseButton.style.position = 'absolute';
    pauseButton.style.top = '20px';
    pauseButton.style.left = 'calc(50% - 50px)';
    pauseButton.style.zIndex = 5;
    document.body.appendChild(pauseButton);

    pauseButton.addEventListener('click', function() {
        if (jungleSound.paused) {
            jungleSound.play();
            pauseButton.textContent = 'Pause Sound';
        } else {
            jungleSound.pause();
            pauseButton.textContent = 'Play Sound';
        }
    });
});

// Add event listener for replay button
replayButton.addEventListener('click', replayGame);

// Show the first animal after a short delay
setTimeout(showRandomAnimal, 1000);
startTimer();

// Parallax background effect
document.getElementById('game-container').addEventListener('mousemove', function(event) {
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    const centerX = windowWidth / 2;
    const centerY = windowHeight / 2;

    const offsetX = (mouseX - centerX) / windowWidth * 50; // Adjust the divisor for sensitivity
    const offsetY = (mouseY - centerY) / windowHeight * 50; // Adjust the divisor for sensitivity

    const background = document.getElementById('background');
    background.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(1.1)`;
});
