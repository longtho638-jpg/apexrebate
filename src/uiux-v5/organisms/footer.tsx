export default function Footer() {
  return (
    <footer className="border-t mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <h3 className="font-semibold mb-2">ApexRebate</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Optimize your trading profits
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Links</h3>
            <ul className="space-y-1 text-sm">
              <li><a href="#" className="text-gray-600 hover:text-blue-600 dark:text-gray-400">About</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600 dark:text-gray-400">Contact</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Legal</h3>
            <ul className="space-y-1 text-sm">
              <li><a href="#" className="text-gray-600 hover:text-blue-600 dark:text-gray-400">Terms</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600 dark:text-gray-400">Privacy</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-gray-600 dark:text-gray-400">
          © 2024 ApexRebate. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
