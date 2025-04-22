import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

export default function VideoSection() {
  return (
    <div className="relative w-full h-full">
      {/* Video Background */}
      <video
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
        src="https://www.shutterstock.com/shutterstock/videos/1093882337/preview/stock-footage-timelapse-of-growing-plants-of-basil-with-lens-flare-alfalfa-grows-dynamically-the-birth-of-a-new.webm"
        autoPlay
        muted
        loop
        playsInline
      />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center gap-6 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <Image
            src="/images/logos/oliveaFTT.svg"
            alt="Olivea Logo"
            width={200}
            height={100}
            priority
            className="mx-auto"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <Link href="/es/restaurant">
            <Button variant="secondary" size="lg">Olivea Farm To Table</Button>
          </Link>
          <Link href="/es/casa">
            <Button variant="ghost" size="lg">Casa Olivea</Button>
          </Link>
          <Link href="/es/cafe">
            <Button variant="ghost" size="lg">Olivea Café</Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
        >
          <Link href="/es/reservations">
            <Button className="mt-4" size="lg">Reservar</Button>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}