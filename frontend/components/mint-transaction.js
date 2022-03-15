import React, { Component } from "react";
import { ethers } from "ethers";

export class MintTranaction extends Component {
  state = { saleType: "", chosen: false };

  saleChoice(chosen) {
    this.setState({
      chosen: true,
      saleType: chosen,
      txSuccess: null,
      publicSaleQty: 1,
    });
  }

  async publicMint() {
    try {
      const price = (
        this.props.publicSalePrice * this.state.publicSaleQty
      ).toFixed(2);
      const options = { value: ethers.utils.parseEther(price) };
      let tx = await this.props.userContract.publicSaleMint(
        this.state.publicSaleQty,
        options
      );
      const txReceipt = await tx.wait();
      console.log(txReceipt);

      var urls = await Promise.all(
        txReceipt.logs.map((element) => {
          return (
            "http://localhost:4000/gen/" + parseInt(Number(element.topics[3]))
          );
        })
      );

      console.log("urls generated: " + urls);

      try {
        console.log("fetching");
        let res = await Promise.all(urls.map((e) => fetch(e)));
        console.log("result of fetch: " + res);
        let resJson = await Promise.all(res.map((e) => e.json()));
        console.log(resJson);
      } catch (err) {
        console.log(err);
      }

      // await fetch(genUrls[0])
      //   .then((res) => {
      //     console.log(res.json());
      //   })
      //   .catch(console.log(res.json));

      // Promise.all(
      //   genUrls.map((u) => {
      //     console.log("fetching for: " + u);
      //     fetch(u);
      //   })
      // );

      // Promise.all(genUrls.map((u) => fetch(u)))
      //   .then(function (responses) {
      //     console.log("got respone");
      //     // Get a JSON object from each of the responses
      //     return Promise.all(
      //       responses.map(function (response) {
      //         return response.json();
      //       })
      //     );
      //   })
      //   .then(function (data) {
      //     // Log the data to the console
      //     // You would do something with both sets of data here
      //     console.log("fetching" + data);
      //   })
      //   .catch(function (error) {
      //     // if there's an error, log it
      //     console.log("error:" + error);
      //   });

      this.props.updateCurrMinted(this.state.publicSaleQty);
      this.setState({ txSuccess: true });
    } catch (e) {
      this.setState({ txSuccess: false });
    }
  }

  async whitelistMint() {
    try {
      const options = {
        value: ethers.utils.parseEther(this.props.whitelistSalePrice),
      };
      let tx = await this.props.userContract.whitelistMint(options);
      const txReceipt = await tx.wait();
      var uris = await Promise.all(
        txReceipt.logs.map((element) => {
          return this.props.userContract.tokenURI(
            parseInt(Number(element.topics[3]))
          );
        })
      );

      this.props.updateCurrMinted(1);

      this.setState({ txSuccess: true });
    } catch (e) {
      console.log(e);
      this.setState({ txSuccess: false });
    }
  }

  updateCounter(increment) {
    if (increment == true && this.state.publicSaleQty < 5) {
      this.setState({ publicSaleQty: this.state.publicSaleQty + 1 });
    }
    if (increment == false && this.state.publicSaleQty > 1) {
      this.setState({ publicSaleQty: this.state.publicSaleQty - 1 });
    }
  }

  render() {
    return (
      <div>
        {!this.state.chosen ? (
          <div className="grid md:items-center lg:grid-cols-2">
            <div className="flex flex-col items-center justify-center text-center font-black">
              <button onClick={() => this.saleChoice("public")}>PUBLIC</button>
            </div>
            <div className="flex flex-col items-center justify-center text-center font-black">
              <button onClick={() => this.saleChoice("whitelist")}>
                WHITELIST
              </button>
            </div>
          </div>
        ) : this.state.saleType == "public" ? (
          <div>
            <div>
              <p className="text-3xl my-3">
                {(
                  this.props.publicSalePrice * this.state.publicSaleQty
                ).toFixed(2)}
              </p>
            </div>
            <div className="grid grid-cols-3 my-5">
              {this.state.publicSaleQty != 1 ? (
                <div
                  className={
                    "flex flex-col items-center justify-center text-center text-4xl "
                  }
                >
                  <button onClick={() => this.updateCounter(false)}>-</button>
                </div>
              ) : (
                <div></div>
              )}
              <div className="flex flex-col items-center justify-center text-center text-4xl">
                {this.state.publicSaleQty}
              </div>
              {this.state.publicSaleQty != 5 && (
                <div className="flex flex-col items-center justify-center text-center text-4xl">
                  <button onClick={() => this.updateCounter(true)}>+</button>
                </div>
              )}
            </div>
            <button
              onClick={() => this.publicMint()}
              className="bg-white my-3 px-3 py-2 text-4xl rounded-lg"
            >
              MINT
            </button>
          </div>
        ) : (
          <div>
            <div>
              <p className="text-3xl my-3">{this.props.whitelistSalePrice}</p>
            </div>
            <button
              onClick={() => this.whitelistMint()}
              className="bg-white my-3 px-3 py-2 text-4xl rounded-lg"
            >
              MINT
            </button>
          </div>
        )}
        {this.state.txSuccess == true && (
          <p className="text-emerald-700">
            Mint succesful! Head over to opean sea to see what you got.
          </p>
        )}
        {this.state.txSuccess == false && (
          <p className="text-rose-700">Error processing your transaction.</p>
        )}
      </div>
    );
  }
}

export default MintTranaction;
