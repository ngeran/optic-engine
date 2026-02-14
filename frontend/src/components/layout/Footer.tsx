export default function Footer() {
  return (
    <footer className="border-b border-border bg-card py-4">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Optic Engine. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
