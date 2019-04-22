#!/usr/bin/env node
const notifier = require("node-notifier");
const request = require("request-promise");

async function pingCricbuzz() {
  let response = await request(
    "https://www.cricbuzz.com/match-api/livematches.json"
  );
  let matches = JSON.parse(response).matches;
  let iplMatch = [];
  for (let i in matches) {
    if (matches[i].series.id == 2810) {
      iplMatch.push(matches[i]);
    }
  }
  const matchinProgress = iplMatch.filter(match => {
    return match.state == "inprogress";
  })[0];
  if (matchinProgress) {
    const players = matchinProgress.players,
      score = matchinProgress.score.batting.score,
      status = matchinProgress.status,
      batsmenArr = matchinProgress.score.batsman,
      team_1 = matchinProgress.team1.name,
      team_2 = matchinProgress.team2.name,
      overState = matchinProgress.score["prev_overs"];
    // console.log(team_1,team_2)
    function getPlayerNameById(id) {
      let obj = players.filter(elem => {
        return id == elem.id;
      })[0];
      return obj;
    }
    const batsmen = batsmenArr.map(e => {
      let result = "";
      const playerName = Number(e.strike)
          ? getPlayerNameById(e.id).name + "*"
          : getPlayerNameById(e.id).name,
        playerRuns = e.r,
        ballsPlayed = Number(e.b),
        sixes = Number(e["6s"]),
        fours = Number(e["4s"]);
      result = `${playerName} ${playerRuns} (${ballsPlayed})
    6s: ${sixes} 4s: ${fours}`;
      return result;
    });
    console.log(batsmen);
    notifier.notify(
      {
        title: `${team_1} vs ${team_2}`,
        message: `${score} \n${status} \n${batsmen[0]} \n${
          batsmen[1] ? batsmen[1] : "OUT"
        } \n${overState}`
      },
      (err, res) => {
        console.log(err);
      }
    );
  }
}
setInterval(pingCricbuzz, 1 * 60000);
pingCricbuzz();
