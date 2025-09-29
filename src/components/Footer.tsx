export function Footer() {
  return (
    <footer className="mt-16 border-t bg-gray-50 text-sm text-gray-600">
      <div className="mx-auto max-w-7xl px-4 py-10 grid gap-8 md:grid-cols-4">
        <div>
          <h3 className="font-semibold mb-3 text-gray-900">Brand</h3>
          <p className="text-xs leading-relaxed">Modern shoe store starter. Replace this block with brand story, mission or value proposition.</p>
        </div>
        <div>
          <h4 className="font-medium mb-2 text-gray-900">Shop</h4>
          <ul className="space-y-1">
            <li><a href="#" className="hover:text-gray-900">All Products</a></li>
            <li><a href="#" className="hover:text-gray-900">Sneakers</a></li>
            <li><a href="#" className="hover:text-gray-900">Boots</a></li>
            <li><a href="#" className="hover:text-gray-900">Accessories</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium mb-2 text-gray-900">Support</h4>
          <ul className="space-y-1">
            <li><a href="#" className="hover:text-gray-900">Shipping</a></li>
            <li><a href="#" className="hover:text-gray-900">Returns</a></li>
            <li><a href="#" className="hover:text-gray-900">Size Guide</a></li>
            <li><a href="#" className="hover:text-gray-900">Contact</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium mb-2 text-gray-900">Stay Updated</h4>
          <form className="flex gap-2">
            <input type="email" placeholder="Email" className="w-full rounded border px-3 py-2 text-sm" />
            <button className="rounded bg-brand-accent px-4 py-2 text-white text-sm font-medium">Join</button>
          </form>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs">© {new Date().getFullYear()} Brand. All rights reserved.</div>
    </footer>
  );
}
