import Link from "next/link";

export default function NotFound() {
  return (
    <div className="beatora-page flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400 mb-2">
        404 - Not Found
      </h2>
      <p className="text-zinc-400 text-sm mb-6">Could not find requested resource</p>
      <Link
        href="/"
        className="px-6 py-2.5 rounded-full text-xs font-semibold bg-gradient-to-r from-fuchsia-600 to-cyan-600 text-white shadow-lg shadow-fuchsia-600/30"
      >
        Return Home
      </Link>
    </div>
  );
}

