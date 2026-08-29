import EmptyState from "@/components/EmptyState";

export default function NotFound() {
  return (
    <main className="bg-sky-50">
      <section className="mx-auto max-w-lg px-4 py-16">
        <h1 className="text-2xl font-bold text-gray-900">Page not found</h1>
        <p className="mt-2 text-gray-600">
          That link doesn&apos;t match a current page.
        </p>
        <div className="mt-6">
          <EmptyState
            title="Try one of these instead."
            actions={[
              { label: "Today", href: "/" },
              { label: "Kids Eat Free Tonight", href: "/kids-eat-free" },
              { label: "Calendar", href: "/calendar" },
            ]}
          />
        </div>
      </section>
    </main>
  );
}
