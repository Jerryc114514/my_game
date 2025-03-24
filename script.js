// Game variables
let scene, camera, renderer;
let score = 0;
let timeLeft = 60;
let balloons = [];
const scoreDiv = document.getElementById("score");
const timerDiv = document.getElementById("timer");
const usernameDiv = document.getElementById("username");
const crosshair = document.getElementById("crosshair");
let gameStarted = false;
let username = "Player";
let timerInterval;
let raycaster, mouse;

// Initialize Three.js scene
function init() {
  // Create scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87CEEB); // Sky blue background

  // Create camera
  camera = new THREE.PerspectiveCamera(
    75, window.innerWidth / window.innerHeight, 0.1, 1000
  );

  // Create renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Add lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(10, 20, 10);
  scene.add(directionalLight);

  // Add floor
  const floorGeometry = new THREE.PlaneGeometry(100, 100);
  const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0x444444,
    roughness: 0.7,
    metalness: 0.1,
  });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -2;
  scene.add(floor);

  // Set camera position (first-person perspective)
  camera.position.set(0, 1.6, 0);

  // Initialize raycaster for shooting
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  // Handle window resize
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

// Start the game
function startGame() {
  // Get username if provided
  const userInput = document.getElementById("user").value;
  if (userInput.trim() !== "") {
    username = userInput;
  }

  // Hide username input and show crosshair
  usernameDiv.style.display = "none";
  crosshair.style.display = "block";

  // Initialize game if not already started
  if (!gameStarted) {
    init();
    gameStarted = true;

    // Create initial balloons
    for (let i = 0; i < 5; i++) {
      createBalloon();
    }

    // Start animation loop
    animate();

    // Add click event listener for shooting
    window.addEventListener("click", shoot, false);
  } else {
    // Reset game state if restarting
    score = 0;
    timeLeft = 60;
    scoreDiv.textContent = "Score: 0";
    timerDiv.textContent = "Time: 60";

    // Clear existing balloons
    balloons.forEach((balloon) => scene.remove(balloon));
    balloons = [];

    // Create new balloons
    for (let i = 0; i < 5; i++) {
      createBalloon();
    }
  }

  // Start timer
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  timerInterval = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      timerDiv.textContent = "Time: " + timeLeft;
    } else {
      endGame();
    }
  }, 1000);
}

// End the game
function endGame() {
  clearInterval(timerInterval);
  alert(`Time's up, ${username}! Your score: ${score}`);
  // Reset for a new game
  usernameDiv.style.display = "block";
  crosshair.style.display = "none";
}

// Create a balloon
function createBalloon() {
  const geometry = new THREE.SphereGeometry(0.5, 16, 16);
  const material = new THREE.MeshStandardMaterial({
    color: 0xff0000,
    roughness: 0.3,
    metalness: 0.2,
    emissive: 0x330000,
  });
  const balloon = new THREE.Mesh(geometry, material);

  // Random position
  balloon.position.set(
    (Math.random() - 0.5) * 20,
    Math.random() * 5 - 2,
    -Math.random() * 10 - 5
  );

  scene.add(balloon);
  balloons.push(balloon);
}

// Update balloon positions
function updateBalloons() {
  for (let i = balloons.length - 1; i >= 0; i--) {
    const balloon = balloons[i];
    // Float upward
    balloon.position.y += 0.02;
    // If balloon goes too high, remove it and create a new one
    if (balloon.position.y > 10) {
      scene.remove(balloon);
      balloons.splice(i, 1);
      createBalloon();
    }
  }
}

// Handle shooting
function shoot(event) {
  // Convert mouse position to normalized device coordinates
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Set up raycaster
  raycaster.setFromCamera(mouse, camera);

  // Check for intersections with balloons
  const intersects = raycaster.intersectObjects(balloons);
  if (intersects.length > 0) {
    // Hit a balloon
    const hitBalloon = intersects[0].object;
    scene.remove(hitBalloon);
    balloons.splice(balloons.indexOf(hitBalloon), 1);
    // Update score
    score++;
    scoreDiv.textContent = "Score: " + score;
    // Create a new balloon
    createBalloon();
  }
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  updateBalloons();
  renderer.render(scene, camera);
}

