const fs = require("fs");
const axios = require("axios");
const ipfsApiUrl = "https://api.pinata.cloud/pinning/pinFileToIPFS";
require("dotenv").config();
const FormData = require("form-data");
const count = 50;

async function postToIpfs(id) {
  const data = new FormData();
  data.append("file", fs.createReadStream("./data/images/" + id + ".png"));
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

function updateJson(hash, id) {
  url = "https://gateway.pinata.cloud/ipfs/" + hash;
  const fileLoc = "./data/metadata/unselected/" + id + ".json";
  var fileToUpdate = JSON.parse(fs.readFileSync(fileLoc));
  fileToUpdate.image = url;
  fs.writeFileSync(fileLoc, JSON.stringify(fileToUpdate));
}
void (async function main() {
  // for each NFT post to IPFS
  for (let i = 0; i < 2; i++) {
    // get hash
    try {
      const res = await postToIpfs(i);
      updateJson(res.IpfsHash, i);
      return;
    } catch (e) {
      console.log("error: " + e);
    }
  }
})();

// then we need tp update backend/index.js so that
