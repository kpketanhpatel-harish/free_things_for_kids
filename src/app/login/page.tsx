import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="bg-sky-50">
      <section className="mx-auto flex max-w-md flex-col px-4 py-16">
        <h1 className="text-3xl font-bold text-gray-900">Login</h1>

        <p className="mt-3 text-gray-600">
          Account sign-in is coming soon. Check back later to save favorites
          and get personalized recommendations.
        </p>

        <Link
          href="/"
          className="mt-8 inline-block font-medium text-blue-700 hover:underline"
        >
          Back to home
        </Link>
      </section>
    </main>
  );
}
