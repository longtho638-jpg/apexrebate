export default function Navbar() {
  return (
    <nav className="border-b">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <div className="text-lg font-bold">ApexRebate</div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-blue-600">Home</a>
          <a href="#" className="hover:text-blue-600">Features</a>
          <a href="#" className="hover:text-blue-600">About</a>
        </div>
      </div>
    </nav>
  )
}
