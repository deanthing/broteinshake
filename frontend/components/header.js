export default function Header() {
  return (
    <header className="flex flex-col items-center justify-center text-center font-black">
      <h1 className="leading-solid text-6xl md:text-8xl text-orange-500">
        BROTEIN <br></br> SHAKES
      </h1>
      {/* <div class="-mt-16 w-full md:-mt-32 md:w-[600px] lg:-mt-36"> */}
      <div>
        <img src="/art-example.png" />
      </div>
    </header>
  );
}
