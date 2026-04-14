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
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD2-VEYTz9KoZYHFU2odRJfF7ook2R50Hc",
  authDomain: "tic-tac-toe-dd634.firebaseapp.com",
  projectId: "tic-tac-toe-dd634",
  storageBucket: "tic-tac-toe-dd634.firebasestorage.app",
  messagingSenderId: "840551072219",
  appId: "1:840551072219:web:dddf98d9a9b31bd8bfe7fe",
  measurementId: "G-GRJYVVRHKF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

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
  wins: 0,
  friends: [],
  requests: []
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
// ================= FRIEND SYSTEM =================

// Send friend request
window.sendRequest = async function () {
  const friendId = document.getElementById("friendId").value;
  const user = auth.currentUser;

  if (!friendId || !user) return alert("Invalid");

  const friendRef = doc(db, "users", friendId);
  const friendSnap = await getDoc(friendRef);

  if (!friendSnap.exists()) {
    alert("User not found!");
    return;
  }

  // Add request to friend's account
  await updateDoc(friendRef, {
    requests: [...(friendSnap.data().requests || []), user.uid]
  });

  alert("Friend request sent!");
};

// Load friend requests
async function loadRequests() {
  const user = auth.currentUser;
  const list = document.getElementById("requestsList");

  if (!user || !list) return;

  list.innerHTML = "";

  const snap = await getDoc(doc(db, "users", user.uid));
  const requests = snap.data().requests || [];

  requests.forEach(id => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${id}
      <button onclick="acceptRequest('${id}')">Accept</button>
    `;
    list.appendChild(li);
  });
}

// Accept request
window.acceptRequest = async function (friendId) {
  const user = auth.currentUser;
  if (!user) return;

  const userRef = doc(db, "users", user.uid);
  const friendRef = doc(db, "users", friendId);

  const userSnap = await getDoc(userRef);
  const friendSnap = await getDoc(friendRef);

  // Add each other as friends
  await updateDoc(userRef, {
    friends: [...(userSnap.data().friends || []), friendId],
    requests: userSnap.data().requests.filter(id => id !== friendId)
  });

  await updateDoc(friendRef, {
    friends: [...(friendSnap.data().friends || []), user.uid]
  });

  loadRequests();
  loadFriends();
};

// Load friends list
async function loadFriends() {
  const user = auth.currentUser;
  const list = document.getElementById("friendsList");

  if (!user || !list) return;

  list.innerHTML = "";

  const snap = await getDoc(doc(db, "users", user.uid));
  const friends = snap.data().friends || [];

  friends.forEach(id => {
    const li = document.createElement("li");
    li.textContent = id;
    list.appendChild(li);
  });
}

// Load everything when logged in
onAuthStateChanged(auth, (user) => {
  if (user) {
    loadRequests();
    loadFriends();
  }
});
