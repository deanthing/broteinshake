import Image from "next/image";

export default function Nav() {
  return (
    <nav className="flex items-center justify-between flex-wrap p-6">
      <div className="flex items-center flex-shrink-0 text-white mr-6">
        <svg
          className="fill-current mr-2"
          width="70"
          height="70"
          viewBox="0 0 70 70"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M13.5 22.1c1.8-7.2 6.3-10.8 13.5-10.8 10.8 0 12.15 8.1 17.55 9.45 3.6.9 6.75-.45 9.45-4.05-1.8 7.2-6.3 10.8-13.5 10.8-10.8 0-12.15-8.1-17.55-9.45-3.6-.9-6.75.45-9.45 4.05zM0 38.3c1.8-7.2 6.3-10.8 13.5-10.8 10.8 0 12.15 8.1 17.55 9.45 3.6.9 6.75-.45 9.45-4.05-1.8 7.2-6.3 10.8-13.5 10.8-10.8 0-12.15-8.1-17.55-9.45-3.6-.9-6.75.45-9.45 4.05z" />
        </svg>
      </div>
      <div className="block lg:hidden">
        <button className="flex items-center px-3 py-2 border rounded text-teal-200 border-teal-400 hover:text-white hover:border-white">
          <svg
            className="fill-current h-3 w-3"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>Menu</title>
            <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
          </svg>
        </button>
      </div>
      <div className="w-full block flex-grow lg:flex lg:items-center lg:w-auto">
        <div className="text-sm lg:flex-grow"></div>
        <div>
          <a
            href="#"
            className="mr-4 inline-block text-sm px-4 py-2 leading-none text-white hover:bg-gray-900 mt-4 lg:mt-0"
          >
            <img src="/twitter-logo.svg" width="40" height="40" />
          </a>
          <a
            href="#"
            className="mr-4 inline-block text-sm px-4 py-2 leading-none text-white hover:bg-gray-900 mt-4 lg:mt-0"
          >
            <img src="/opensea-logo.svg" width="40" height="40" />
          </a>
          <a
            href="#"
            className="mr-4 inline-block text-sm px-4 py-2 leading-none text-white hover:bg-gray-900 mt-4 lg:mt-0"
          >
            <img src="/etherscan-logo.svg" width="40" height="40" />
          </a>
        </div>
      </div>
    </nav>
  );
}
