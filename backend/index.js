const express = require("express");
const app = express();
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
const MAXSUPPLY = 5000;

const sqlite3 = require("sqlite3").verbose();
const sqlite = require("sqlite");
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

app.get("/", (req, res) => {
  res.send("hello world");
});

app.get("/init", (req, res) => {
  // serve JWT toke
});

app.get("/gen/:id", async (req, res) => {
  console.log("request for:" + req.params.id);
  /// check if minting is allowed
  if (req.params.id == 0 || isNaN(req.params.id) || req.params.id > MAXSUPPLY) {
    res.json("illegal mint");
    return;
  }
  const output = await db.get("select * from mint where mintId = ?", [
    req.params.id,
  ]);
  // const supply = await getSupply();

  // return
  console.log("output:" + output);
  const supply = 2;
  if (output != undefined || req.params.id > supply) {
    res.json("illegal mint");
    return;
  }

  /// post that row has been minted to block other equests from minting
  await db.run("INSERT INTO mint VALUES(?)", [req.params.id]);

  const postRes = await postToIpfs(req.params.id);
  /// post to ipfs
  if (postRes == -1) {
    res.json("failed to post to IPFS");
    return;
  }

  /// update json file with IPFS link
  url = "https://gateway.pinata.cloud/ipfs/" + postRes.IpfsHash;
  const fileLoc = "./data/metadata/unselected/" + req.params.id + ".json";
  var fileToUpdate = JSON.parse(fs.readFileSync(fileLoc));
  fileToUpdate.image = url;
  fs.writeFileSync(fileLoc, JSON.stringify(fileToUpdate));

  /// move img and metadata
  // move json
  const to = "./data/metadata/public/" + req.params.id + ".json";
  fsm.move(fileLoc, to, (err) => {
    if (err) return console.log(err);
    console.log("metadata moved");
  });

  // move img
  const imgFrom = "./data/images/unselected/" + req.params.id + ".png";
  const imgTo = "./data/images/public/" + req.params.id + ".png";
  fsm.move(imgFrom, imgTo, (err) => {
    if (err) return console.log(err);
    console.log("picture moved moved");
    res.sendFile(`/data/metadata/public/${req.params.id}.json`, {
      root: __dirname,
    });
    return;
  });
});
app.listen(port, () => {
  console.log("express is listening on port: 4000");
});
