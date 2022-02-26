import React from "react";
export default class Mint extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div class="flex flex-col items-center justify-center text-center font-black">
        <h2 class="flex flex-col text-center text-stone-800 text-5xl md:text-8xl ">
          <span>293/10000</span>
          <span class="text-5xl text-white">minted</span>
        </h2>
        <div class="space-y-4 p-4 text-center md:space-y-8">
          <div class="elative w-full overflow-hidden rounded-3xl bg-sea-400 bg-opacity-30 p-6 py-12">
            <button
              onClick={() => this.props.walletConnect()}
              class="btn bg-slate-100 text-orange-500 px-3 py-1 text-xl border-2 rounded-xl border-white hover:border-slate-300"
            >
              Connect Your Wallet
            </button>
          </div>
        </div>
      </div>
    );
  }
}
