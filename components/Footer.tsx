import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full border-t bg-white py-6 px-4 text-sm text-center text-muted-foreground">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
        <p>&copy; {new Date().getFullYear()} Inmobilaria MYA by DH. All rights reserved.</p>
        <div className="flex gap-4">
          <Link href="/journal" className="hover:underline">
            Journal
          </Link>
          <Link href="/contact" className="hover:underline">
            Contact
          </Link>
          <Link href="/legal" className="hover:underline">
            Legal
          </Link>
        </div>
      </div>
    </footer>
  );
}