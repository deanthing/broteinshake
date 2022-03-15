// you would have to import / invoke this in another file
var db;
const sqlite3 = require("sqlite3").verbose();
const sqlite = require("sqlite");
var db;
(async () => {
  // open the database
  db = await sqlite.open({
    filename: "./data/db.sqlite",
    driver: sqlite3.cached.Database,
  });

  await db.exec("drop table if exists mint");

  await db.exec("CREATE TABLE mint(mintId INTEGER)");
})();
