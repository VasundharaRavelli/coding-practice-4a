const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "circketTeam.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT
      *
    FROM
      cricket_team
    ORDER BY
      player_id;`;
  const playersArray = await db.all(getPlayersQuery);
  response.send(playersArray);
});

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { player_id, player_name, jersey_number, role } = playerDetails;

  const addPlayerQuery = `
    INSERT INTO
      circket_team (   player_id,
    player_name,
    jersey_number,
    role)
    VALUES
      (
        '${player_id}',
        '${player_name}',
        '${jersey_number}',
        '${role}',

      );`;

  const dbResponse = await db.run(addPlayerQuery);
  const playerId = dbResponse.lastID;
  response.send("Player Added to Team");
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `SELECT 
        * 
        FROM
         circket_team
    WHERE 
        player_id=${playerId} `;

  const player = await db.get(getPlayerQuery);
  response.send(player);
});

app.put("/player/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;

  const { player_id, player_name, jersey_number, role } = playerDetails;
  const updatePlayerQuery = `
    UPDATE
      circket_team
    SET
    playerId='${player_id}',
      playerName='${player_name}',
      jerseyNumber=${jersey_number},
     role =${role},
      
    WHERE
      player_id = ${player_id};`;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
    DELETE FROM
      circket_team
    WHERE
      player_id = ${playerId};`;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});
