import React from "react";
import MintTranaction from "./mint-transaction";
export default class Mint extends React.Component {
  render() {
    return (
      <div className="flex flex-col items-center justify-center text-center font-black">
        <h2 className="flex flex-col text-center text-stone-800 text-5xl md:text-8xl ">
          <span>{this.props.currMinted}/10000</span>
          <span className="text-5xl text-white">minted</span>
        </h2>

        {/* connect wallet  */}
        <div className="space-y-4 p-4 text-center md:space-y-8">
          {this.props.userSigner == null && (
            <div className="elative w-full overflow-hidden rounded-3xl bg-sea-400 bg-opacity-30 p-6 py-12">
              <button
                onClick={() => this.props.walletConnect()}
                className="btn bg-slate-100 text-orange-500 px-3 py-1 text-xl border-2 rounded-xl border-white hover:border-slate-300"
              >
                Connect Your Wallet
              </button>
            </div>
          )}
          {this.props.walletConnectionError == true && (
            <p className="text-rose-600">Couldn't connect to your wallet.</p>
          )}
          {this.props.userSigner != null && (
            <MintTranaction
              {...this.props}
              updateCurrMinted={(count) => this.props.updateCurrMinted(count)}
            />
          )}
        </div>
      </div>
    );
  }
}
