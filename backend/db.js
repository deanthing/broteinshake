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

// let db = new sqlite3.Database(
//   "./data/db.sqlite",
//   sqlite3.OPEN_READWRITE,
//   (err) => {
//     if (err) {
//       console.error(err.message);
//     }
//     if (err) {
//       // Cannot open database
//       console.error(err.message);
//       throw err;
//     } else {
//       console.log("Connected to the SQLite database.");
//       const createTable = "CREATE TABLE mint(mintId INTEGER)";
//       db.run(createTable, (err) => {
//         if (err) {
//           console.log("table created");
//           console.log(err);
//         }
//       });
//     }
//   }
// );
