"use client"

import { useState } from "react"
import ShortsModal from "./shorts-modal"

export default function ShortsPage() {
  const [isOpen, setIsOpen] = useState(true)

  return <ShortsModal open={isOpen} onOpenChange={setIsOpen} />
}
