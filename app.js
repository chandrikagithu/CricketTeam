const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log("Server Running at http://localhost:3001/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();
//API 1
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT * 
    FROM 
    cricket_team
    ORDER BY 
    player_id;`;
  const playersArray = await db.all(getPlayersQuery);
  let DBobjects_array = [];
  for (let object of playersArray) {
    const DBobject = convertDbObjectToResponseObject(object);
    DBobjects_array.push(DBobject);
  }
  response.send(DBobjects_array);
});
//API 2
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerDetails = `
    INSERT INTO 
    cricket_team(player_name,jersey_number,role)
    VALUES 
    (
        '${playerName}',
         ${jerseyNumber},
        '${role}'
    );`;
  const dbResponse = await db.run(addPlayerDetails);
  response.send("Player Added to Team");
});
//API 3
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerDetails = `
    SELECT 
    * 
    FROM 
    cricket_team 
    WHERE 
    player_id=${playerId};`;
  const playerDetails = await db.get(getPlayerDetails);
  response.send(convertDbObjectToResponseObject(playerDetails));
});
//API 4
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerDetails = `
     UPDATE 
     cricket_team 
     SET 
      player_name='${playerName}',
      jersey_number=${jerseyNumber},
      role='${role}' 
     WHERE 
     player_id=${playerId};`;
  await db.run(updatePlayerDetails);
  response.send("Player Details Updated");
});
//API 5
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerDetails = `
    DELETE FROM 
    cricket_team 
    WHERE 
      player_id=${playerId};`;
  await db.run(deletePlayerDetails);
  response.send("Player Removed");
});
module.exports = app;
