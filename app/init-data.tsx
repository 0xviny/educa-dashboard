"use client"

import { useEffect } from "react"
import { initializeData } from "@/lib/storage-service"

export function InitData() {
  useEffect(() => {
    // Inicializar dados de exemplo
    initializeData()
  }, [])

  return null
}
