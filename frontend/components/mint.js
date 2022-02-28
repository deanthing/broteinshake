import React from "react";
export default class Mint extends React.Component {
  render() {
    return (
      <div className="flex flex-col items-center justify-center text-center font-black">
        <h2 className="flex flex-col text-center text-stone-800 text-5xl md:text-8xl ">
          <span>{this.props.currMinted}/10000</span>
          <span className="text-5xl text-white">minted</span>
        </h2>
        <div className="space-y-4 p-4 text-center md:space-y-8">
          {this.props.publicSaleActive == 1 ||
          this.props.whitelistSaleActive == 1 ? (
            <div className="elative w-full overflow-hidden rounded-3xl bg-sea-400 bg-opacity-30 p-6 py-12">
              {this.props.userSigner == null ? (
                <button
                  onClick={() => this.props.walletConnect()}
                  className="btn bg-slate-100 text-orange-500 px-3 py-1 text-xl border-2 rounded-xl border-white hover:border-slate-300"
                >
                  Connect Your Wallet
                </button>
              ) : (
                <div className="grid md:items-center lg:grid-cols-2">
                  <div className="flex flex-col items-center justify-center text-center font-black">
                    <button className="bg-white rounded-lg mx-5 px-5 py-2 border-4 border-white hover:border-slate-300">
                      WHITELIST
                    </button>
                  </div>
                  <div className="flex flex-col items-center justify-center text-center font-black">
                    <button className="bg-white rounded-lg px-5 py-2 border-4 border-white hover:border-slate-300">
                      PUBLIC SALE
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p> sale not active</p>
          )}
        </div>
      </div>
    );
  }
}
