const express = require("express");
const port = 4000;
const { ethers } = require("ethers");
const contractAddres = "0x5fbdb2315678afecb367f032d93f642f64180aa3";
const abi = require("./data/abi.json");
const fs = require("fs");
const axios = require("axios");
const ipfsApiUrl = "https://api.pinata.cloud/pinning/pinFileToIPFS";
require("dotenv").config();
const FormData = require("form-data");
const fsm = require("fs-extra");
const cors = require("cors");
const MAXSUPPLY = 5000;

const app = express();
app.use(cors());
const sqlite3 = require("sqlite3").verbose();
const sqlite = require("sqlite");
const { send } = require("process");
var db;
(async () => {
  // open the database
  db = await sqlite.open({
    filename: "./data/db.sqlite",
    driver: sqlite3.cached.Database,
  });
})();

async function getSupply() {
  const prov = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545/");
  const contract = new ethers.Contract(contractAddres, abi["abi"], prov);
  const supply = await contract.totalSupply();
  return supply.toString();
}

async function postToIpfs(id) {
  const data = new FormData();
  data.append(
    "file",
    fs.createReadStream("./data/images/unselected/" + id + ".png")
  );
  const config = {
    headers: {
      "Content-Type": `multipart/form-data; boundary= ${data._boundary}`,
      pinata_api_key: process.env.KEY,
      pinata_secret_api_key: process.env.SECRET,
    },
  };
  return await axios
    .post(ipfsApiUrl, data, config)
    .catch((err) => {
      console.log("axios post error:" + err);
      return -1;
    })
    .then((res) => {
      console.log(res.data);
      return res.data;
    });
}

function moveMetadata(id) {
  /// move img and metadata
  // move json
  const to = "./data/metadata/public/" + id + ".json";
  fsm.move("./data/metadata/unselected/" + id + ".json", to, (err) => {
    if (err) return console.log(err);
    console.log("metadata moved");
    return;
  });
}

function checkFileExists(file) {
  return fs.promises
    .access(file, fs.constants.F_OK)
    .then(() => true)
    .catch(() => false);
}

app.get("/", (req, res) => {
  res.send("hello world");
});

app.get("/nft/:id", async (req, res) => {
  console.log(req.params.id);
  const data = require(`./data/metadata/public/${req.params.id}.json`);
  var exists = checkFileExists(data);
  if (exists) {
    res.json(data);
  } else {
    res.sendStatus(404);
  }
});

app.get("/gen/:id", async (req, res) => {
  console.log("request for:" + req.params.id);
  /// check if minting is allowed
  if (isNaN(req.params.id) || req.params.id > MAXSUPPLY) {
    console.log("id NaN or id greather tahn max supply");
    res.sendStatus(405);
    return;
  }
  const output = await db.get("select * from mint where mintId = ?", [
    req.params.id,
  ]);
  const supply = await getSupply();

  if (output != undefined || parseInt(req.params.id) > parseInt(supply)) {
    console.log("output: " + output);
    console.log("id: " + req.params.id + " supply: " + supply);
    console.log("already moved file or id not minted yet");
    res.sendStatus(405);
    return;
  }
  /// post that row has been minted to block other equests from minting
  await db.run("INSERT INTO mint VALUES(?)", [req.params.id]);

  console.log("moving files");
  moveMetadata(req.params.id);
  res.sendStatus(200);
  return;
});

app.listen(port, () => {
  console.log("express is listening on port: 4000");
});
