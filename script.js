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

// 🔥 PASTE YOUR FIREBASE CONFIG HERE
const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_PROJECT_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ================= AUTH =================

window.signUp = async function () {
  const email = emailInput.value;
  const password = passwordInput.value;

  const userCred = await createUserWithEmailAndPassword(auth, email, password);

  await setDoc(doc(db, "users", userCred.user.uid), {
    wins: 0
  });

  alert("Account created!");
};

window.login = async function () {
  await signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
};

window.logout = async function () {
  await signOut(auth);
};

// ================= USER DISPLAY =================

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const userInfo = document.getElementById("userInfo");

onAuthStateChanged(auth, (user) => {
  if (user) {
    userInfo.textContent = "Player ID: " + user.uid;
    loadLeaderboard();
  } else {
    userInfo.textContent = "Not logged in";
  }
});

// ================= GAME =================

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

cells.forEach(cell => cell.addEventListener("click", handleClick));

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
  board.fill("");
  gameActive = true;
  currentPlayer = "X";
  statusText.textContent = "Player X's turn";
  cells.forEach(c => c.textContent = "");
};

// ================= SCORE =================

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

  loadLeaderboard();
}

// ================= LEADERBOARD =================

async function loadLeaderboard() {
  const list = document.getElementById("leaderboard");
  list.innerHTML = "";

  const q = query(collection(db, "users"), orderBy("wins", "desc"));
  const snapshot = await getDocs(q);

  snapshot.forEach(docSnap => {
    const li = document.createElement("li");
    li.textContent = docSnap.id + " - Wins: " + docSnap.data().wins;
    list.appendChild(li);
  });
}
