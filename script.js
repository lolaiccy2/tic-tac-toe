// ================= FIREBASE SETUP =================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔴 PUT YOUR FIREBASE DETAILS HERE
const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_PROJECT_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ================= GET HTML ELEMENTS =================
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const userInfo = document.getElementById("userInfo");

// ================= AUTH FUNCTIONS =================
window.signUp = async function () {
  try {
    const userCred = await createUserWithEmailAndPassword(
      auth,
      emailInput.value,
      passwordInput.value
    );

    await setDoc(doc(db, "users", userCred.user.uid), {
      wins: 0
    });

    alert("Account created!");
    goGame();
  } catch (err) {
    alert(err.message);
  }
};

window.login = async function () {
  try {
    await signInWithEmailAndPassword(
      auth,
      emailInput.value,
      passwordInput.value
    );

    goGame();
  } catch (err) {
    alert(err.message);
  }
};

window.logout = async function () {
  await signOut(auth);
  window.location.href = "index.html";
};

// ================= PAGE NAVIGATION =================
function goGame() {
  window.location.href = "game.html";
}

window.goLeaderboard = function () {
  window.location.href = "leaderboard.html";
};

window.goGame = function () {
  window.location.href = "game.html";
};

// ================= AUTH CHECK =================
onAuthStateChanged(auth, (user) => {
  const path = window.location.pathname;

  // Protect pages
  if (!user && (path.includes("game.html") || path.includes("leaderboard.html"))) {
    window.location.href = "index.html";
  }

  // Show Player ID
  if (user && userInfo) {
    userInfo.textContent = "Player ID: " + user.uid;
  }
});

// ================= GAME LOGIC =================
let currentPlayer = "X";
let board = ["", "", "", "", "", "", "", "", ""];
let gameActive = true;

const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");

const winPatterns = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

// Only run game code if board exists
if (cells.length > 0) {
  cells.forEach(cell => cell.addEventListener("click", handleClick));
}

function handleClick() {
  const i = this.dataset.index;

  if (board[i] || !gameActive) return;

  board[i] = currentPlayer;
  this.textContent = currentPlayer;

  if (checkWin()) {
    statusText.textContent = currentPlayer + " Wins!";
    updateScore();
    gameActive = false;
    return;
  }

  if (!board.includes("")) {
    statusText.textContent = "Draw!";
    gameActive = false;
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  statusText.textContent = "Player " + currentPlayer + "'s turn";
}

function checkWin() {
  return winPatterns.some(([a,b,c]) =>
    board[a] && board[a] === board[b] && board[a] === board[c]
  );
}

window.resetGame = function () {
  board = ["", "", "", "", "", "", "", "", ""];
  gameActive = true;
  currentPlayer = "X";

  if (statusText) {
    statusText.textContent = "Player X's turn";
  }

  cells.forEach(c => c.textContent = "");
};

// ================= SCORE SYSTEM =================
async function updateScore() {
  const user = auth.currentUser;
  if (!user) return;

  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    await updateDoc(ref, {
      wins: snap.data().wins + 1
    });
  }
}

// ================= LEADERBOARD =================
async function loadLeaderboard() {
  const list = document.getElementById("leaderboard");
  if (!list) return;

  list.innerHTML = "";

  const q = query(collection(db, "users"), orderBy("wins", "desc"));
  const snapshot = await getDocs(q);

  snapshot.forEach(docSnap => {
    const li = document.createElement("li");
    li.textContent = docSnap.id + " - Wins: " + docSnap.data().wins;
    list.appendChild(li);
  });
}

// Run leaderboard only if page has it
loadLeaderboard();
