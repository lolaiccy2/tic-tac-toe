<!DOCTYPE html>
<html>
<head>
  <title>Tic Tac Toe</title>

  <style>
    body {
      text-align: center;
      font-family: Arial;
    }

    #board {
      display: grid;
      grid-template-columns: repeat(3, 100px);
      gap: 5px;
      justify-content: center;
      margin: 20px;
    }

    .cell {
      width: 100px;
      height: 100px;
      background: #eee;
      font-size: 2em;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }

    button {
      margin: 5px;
      padding: 10px;
      font-size: 16px;
    }
  </style>
</head>

<body>

<h2 id="userInfo"></h2>

<h1>Tic Tac Toe</h1>

<!-- ✅ START BUTTON -->
<button onclick="startGame()">Start Game</button>

<!-- GAME BOARD -->
<div id="board">
  <div class="cell" data-index="0"></div>
  <div class="cell" data-index="1"></div>
  <div class="cell" data-index="2"></div>
  <div class="cell" data-index="3"></div>
  <div class="cell" data-index="4"></div>
  <div class="cell" data-index="5"></div>
  <div class="cell" data-index="6"></div>
  <div class="cell" data-index="7"></div>
  <div class="cell" data-index="8"></div>
</div>

<h3 id="status">Click "Start Game"</h3>

<button onclick="resetGame()">Restart</button>
<button onclick="logout()">Logout</button>

<hr>

<!-- FRIEND SYSTEM -->
<h3>Find Friend</h3>
<input id="friendId" placeholder="Enter Player ID">
<button onclick="sendRequest()">Send Request</button>

<h3>Requests</h3>
<ul id="requestsList"></ul>

<h3>Friends</h3>
<ul id="friendsList"></ul>

<!-- CONNECT JS -->
<script type="module" src="script.js"></script>

</body>
</html>
