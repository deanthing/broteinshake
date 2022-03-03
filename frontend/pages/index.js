import React from "react";
import Head from "next/head";
import Header from "../components/header";
import Mint from "../components/mint";
import Nav from "../components/nav";

import { ethers } from "ethers";

export default class Home extends React.Component {
  state = {
    contractAddress: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    userSigner: null,
    abi: null,
    userProvider: null,
    rpcProvider: null,
    userContract: null,
    providerContract: null,
    currMinted: null,
    whitelistSaleActive: false,
    publicSaleActive: false,
    publicSalePrice: 0,
    whitelistSalePrice: 0,
    walletConnectionError: false,
  };

  updateCurrMinted(increase) {
    console.log("updating curr minted: " + increase);
    if (increase != null)
      this.setState({
        currMinted: parseInt(this.state.currMinted) + parseInt(increase),
      });
  }

  async componentDidMount() {
    // pull abi
    await fetch("/abi.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        this.setState({ abi: data["abi"] });
      });

    // get webProvider (for loading all info other than mint)
    const prov = new ethers.providers.JsonRpcProvider();
    const contract = new ethers.Contract(
      this.state.contractAddress,
      this.state.abi,
      prov
    );
    const supply = await contract.totalSupply();
    const publicActive = await contract.isWhitelistSaleActive();
    const whitelistActive = await contract.isPublicSaleActive();
    const whitelistPrice = await contract.getWhitelistPrice();
    const publicPrice = await contract.getPublicSalePrice();
    this.setState({
      rpcProvider: prov,
      providerContract: contract,
      currMinted: supply.toString(),
      publicSaleActive: publicActive,
      whitelistSaleActive: whitelistActive,
      publicSalePrice: ethers.utils.formatEther(publicPrice).toString(),
      whitelistSalePrice: ethers.utils.formatEther(whitelistPrice).toString(),
    });
  }

  async connectWallet() {
    console.log("connecting wallet");
    // connect to provicer
    var walletProvider;
    try {
      walletProvider = new ethers.providers.Web3Provider(window.ethereum);
      await walletProvider.send("eth_requestAccounts", []);
    } catch (e) {
      this.setState({ walletConnectionError: true });
      return;
    }

    // get signer
    const signer = walletProvider.getSigner();
    if (signer == null) {
      console.log("signer not created");
      return;
    }

    const contract = new ethers.Contract(
      this.state.contractAddress,
      this.state.abi,
      signer
    ); // might want to use provider instead of
    if (contract == null) {
      console.log("contract not created");
      return;
    }

    this.setState({
      userSigner: signer,
      userProvider: walletProvider,
      userContract: contract,
      walletConnectionError: false,
    });
  }

  render() {
    return (
      <div className="bg-blue-300 min-h-screen">
        <Head>
          <title>BROTEIN SHAKES</title>
          <meta name="description" content="Mint exclusive shaker art." />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <Nav />

        <div className="grid md:items-center lg:grid-cols-2">
          <Header />
          <Mint
            {...this.state}
            walletConnect={() => this.connectWallet()}
            updateCurrMinted={(count) => this.updateCurrMinted(count)}
          />
        </div>
        {/* 
        <footer className={styles.footer}>
          <a
            href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Powered by{" "}
            <span className={styles.logo}>
              <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
            </span>
          </a>
        </footer> */}
      </div>
    );
  }
}
