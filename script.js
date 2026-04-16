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
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔴 YOUR CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyD2-VEYTz9KoZYHFU2odRJfF7ook2R50Hc",
  authDomain: "tic-tac-toe-dd634.firebaseapp.com",
  projectId: "tic-tac-toe-dd634",
  appId: "1:840551072219:web:dddf98d9a9b31bd8bfe7fe"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ================= INPUTS =================
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

// ================= SIGN UP =================
window.signUp = async () => {
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
  } catch (err) {
    alert(err.message);
  }
};

// ================= LOGIN =================
window.login = async () => {
  try {
    await signInWithEmailAndPassword(
      auth,
      emailInput.value,
      passwordInput.value
    );

    // ✅ REDIRECT TO GAME
    window.location.href = "game.html";

  } catch (err) {
    alert(err.message);
  }
};

// ================= LOGOUT =================
window.logout = async () => {
  await signOut(auth);
  window.location.href = "index.html";
};

// ================= AUTH STATE =================
onAuthStateChanged(auth, (user) => {
  const userInfo = document.getElementById("userInfo");

  if (user && userInfo) {
    userInfo.textContent = "Player ID: " + user.uid;

    loadRequests();
    loadFriends();
  }
});

// ================= GAME =================
let board = ["","","","","","","","",""];
let currentPlayer = "X";

const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");

if (cells.length > 0) {
  cells.forEach(cell => cell.addEventListener("click", handleClick));
}

function handleClick() {
  const i = this.dataset.index;

  if (board[i]) return;

  board[i] = currentPlayer;
  this.textContent = currentPlayer;

  if (checkWin()) {
    statusText.textContent = currentPlayer + " wins!";
    updateScore();
    return;
  }

  if (!board.includes("")) {
    statusText.textContent = "Draw!";
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  statusText.textContent = currentPlayer + "'s turn";
}

function checkWin() {
  const wins = [[0,1,2],[3,4,5],[6,7,8],[0,4,8],[2,4,6]];
  return wins.some(([a,b,c]) => board[a] && board[a]===board[b] && board[a]===board[c]);
}

window.resetGame = () => {
  board = ["","","","","","","","",""];
  currentPlayer = "X";

  cells.forEach(c => c.textContent = "");
  if (statusText) statusText.textContent = "Player X's turn";
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
}

// ================= FRIEND SYSTEM =================
window.sendRequest = async () => {
  const friendId = document.getElementById("friendId").value;
  const user = auth.currentUser;

  if (!friendId || !user) return alert("Invalid");

  const friendRef = doc(db, "users", friendId);
  const friendSnap = await getDoc(friendRef);

  if (!friendSnap.exists()) {
    alert("User not found!");
    return;
  }

  await updateDoc(friendRef, {
    requests: [...(friendSnap.data().requests || []), user.uid]
  });

  alert("Request sent!");
};

async function loadRequests() {
  const user = auth.currentUser;
  const list = document.getElementById("requestsList");

  if (!user || !list) return;

  list.innerHTML = "";

  const snap = await getDoc(doc(db, "users", user.uid));
  const requests = snap.data().requests || [];

  requests.forEach(id => {
    const li = document.createElement("li");
    li.innerHTML = `${id} <button onclick="acceptRequest('${id}')">Accept</button>`;
    list.appendChild(li);
  });
}

window.acceptRequest = async (friendId) => {
  const user = auth.currentUser;

  const userRef = doc(db, "users", user.uid);
  const friendRef = doc(db, "users", friendId);

  const userSnap = await getDoc(userRef);
  const friendSnap = await getDoc(friendRef);

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
