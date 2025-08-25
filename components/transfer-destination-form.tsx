"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { CheckCircle, Info, Copy, Building } from "lucide-react"

interface Product {
  id: string
  name: string
  price: string
  qty: number
  images: Array<{
    src: string
    alt: string
  }>
  categories?: string[] | { name: string }[]
}

interface TransferDestinationFormProps {
  onDestinationSelected: (destination: DestinationBank) => void
  onDestinationCleared: () => void
  firstProduct?: Product
}

export interface DestinationBank {
  bankName: string
  accountNumber: string
  accountName: string
}

const bankAccounts = {
  elektronik: {
    bca: {
      bankName: "Bank BCA",
      accountNumber: "6105558833",
      accountName: "PT Membangun Berkat Bersama",
    },
    mandiri: {
      bankName: "Bank Mandiri",
      accountNumber: "420070907091",
      accountName: "PT. Membangun Berkat Bersama",
    },
  },
  sepedaListrik: {
    bca: {
      bankName: "Bank BCA",
      accountNumber: "6105863636",
      accountName: "PT. TRI Kasih Karunia",
    },
    mandiri: {
      bankName: "Bank Mandiri",
      accountNumber: "1420500068878",
      accountName: "PT. TRI Kasih Karunia",
    },
  },
  default: {
    bca: {
      bankName: "Bank BCA",
      accountNumber: "6105863636",
      accountName: "PT. Topsel Raharja Indonesia",
    },
    mandiri: {
      bankName: "Bank Mandiri",
      accountNumber: "1420099191990",
      accountName: "PT. Topsel Raharja Indonesia",
    },
  },
}

export default function TransferDestinationForm({
  onDestinationSelected,
  onDestinationCleared,
  firstProduct,
}: TransferDestinationFormProps) {
  const [selectedDestination, setSelectedDestination] = useState<DestinationBank | null>(null)
  const [destinationBanks, setDestinationBanks] = useState(bankAccounts.default)
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null)

  const extractProductCategory = (product: Product): string | null => {
    console.log("[DEBUG] Product for category extraction:", product.name)
    console.log("[DEBUG] Product categories:", product.categories)

    // First, check categories array
    if (product.categories && product.categories.length > 0) {
      // Check for Sepeda Listrik first (highest priority)
      const hasSepedaListrik = product.categories.some((cat) => {
        const categoryName = typeof cat === "object" && cat !== null && "name" in cat
          ? (cat as any).name
          : typeof cat === "string" ? cat : ""
        
        const normalizedName = categoryName.toLowerCase().trim()
        return normalizedName === "sepeda listrik" || 
               normalizedName.includes("sepeda listrik") ||
               normalizedName.includes("e-bike") ||
               normalizedName.includes("ebike")
      })

      if (hasSepedaListrik) {
        console.log("[DEBUG] Found Sepeda Listrik category")
        return "Sepeda Listrik"
      }

      // Check for Elektronik
      const hasElektronik = product.categories.some((cat) => {
        const categoryName = typeof cat === "object" && cat !== null && "name" in cat
          ? (cat as any).name
          : typeof cat === "string" ? cat : ""
        
        const normalizedName = categoryName.toLowerCase().trim()
        return normalizedName === "elektronik" || normalizedName.includes("elektronik")
      })

      if (hasElektronik) {
        console.log("[DEBUG] Found Elektronik category")
        return "Elektronik"
      }

      // Check for other priority categories
      const priorityCategories = ["Handphone", "Aksesoris", "Laptop"]
      for (const priority of priorityCategories) {
        const hasCategory = product.categories.some((cat) => {
          const categoryName = typeof cat === "object" && cat !== null && "name" in cat
            ? (cat as any).name
            : typeof cat === "string" ? cat : ""
          
          return categoryName.toLowerCase().includes(priority.toLowerCase())
        })

        if (hasCategory) {
          console.log(`[DEBUG] Found ${priority} category`)
          return priority
        }
      }

      // Return first category name if no priority match
      const firstCategory = product.categories[0]
      if (typeof firstCategory === "object" && firstCategory !== null && "name" in firstCategory) {
        const categoryName = (firstCategory as any).name
        console.log("[DEBUG] Using first category:", categoryName)
        return categoryName
      } else if (typeof firstCategory === "string") {
        console.log("[DEBUG] Using first category string:", firstCategory)
        return firstCategory
      }
    }

    // Extract from product name if no categories field
    const productName = product.name.toLowerCase().trim()
    console.log("[DEBUG] Checking product name:", productName)

    // Check for sepeda listrik in name
    if (productName.includes("sepeda listrik") || 
        (productName.includes("sepeda") && productName.includes("listrik"))) {
      console.log("[DEBUG] Found 'sepeda listrik' in product name")
      return "Sepeda Listrik"
    }
    
    if (productName.includes("e-bike") || 
        productName.includes("ebike") || 
        productName.includes("sepeda")) {
      console.log("[DEBUG] Found electric bike related terms in product name")
      return "Sepeda Listrik"
    }

    // Check for elektronik in name
    if (productName.includes("fan") ||
        productName.includes("ac") ||
        productName.includes("tv") ||
        productName.includes("kulkas") ||
        productName.includes("mesin") ||
        productName.includes("elektronik")) {
      console.log("[DEBUG] Found elektronik related terms in product name")
      return "Elektronik"
    }

    // Check other categories in name
    if (productName.includes("phone") || 
        productName.includes("smartphone") || 
        productName.includes("hp")) {
      return "Handphone"
    }
    
    if (productName.includes("laptop") || 
        productName.includes("notebook") || 
        productName.includes("computer")) {
      return "Laptop"
    }
    
    if (productName.includes("case") ||
        productName.includes("charger") ||
        productName.includes("kabel") ||
        productName.includes("aksesoris") ||
        productName.includes("cover")) {
      return "Aksesoris"
    }

    console.log("[DEBUG] No category match found, returning null")
    return null
  }

  const determineDestinationBanks = () => {
    try {
      let productToCheck = firstProduct

      console.log("[DEBUG] determineDestinationBanks - firstProduct:", firstProduct)

      // Fallback to localStorage if firstProduct is not provided
      if (!productToCheck) {
        const invoiceData = localStorage.getItem("currentInvoiceData")
        if (invoiceData) {
          const invoice = JSON.parse(invoiceData)
          if (invoice.products && invoice.products.length > 0) {
            productToCheck = invoice.products[0]
            console.log("[DEBUG] Using product from localStorage:", productToCheck)
          }
        }
      }

      if (productToCheck) {
        const category = extractProductCategory(productToCheck)
        console.log("[DEBUG] Final extracted category:", category)
        console.log("[DEBUG] Product name:", productToCheck.name)
        console.log("[DEBUG] Product categories:", productToCheck.categories)

        if (category === "Sepeda Listrik") {
          console.log("[DEBUG] Setting sepedaListrik bank accounts")
          setDestinationBanks(bankAccounts.sepedaListrik)
          return
        }

        if (category === "Elektronik") {
          console.log("[DEBUG] Setting elektronik bank accounts")
          setDestinationBanks(bankAccounts.elektronik)
          return
        }

        console.log("[DEBUG] No specific category match, using default bank accounts")
      } else {
        console.log("[DEBUG] No product found, using default bank accounts")
      }

      setDestinationBanks(bankAccounts.default)
    } catch (error) {
      console.error("[ERROR] Error determining destination banks:", error)
      setDestinationBanks(bankAccounts.default)
    }
  }

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopyFeedback(`${label} berhasil disalin!`)
      setTimeout(() => setCopyFeedback(null), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
      setCopyFeedback("Gagal menyalin")
      setTimeout(() => setCopyFeedback(null), 2000)
    }
  }

  const handleDestinationSelect = (destination: DestinationBank) => {
    setSelectedDestination(destination)
    onDestinationSelected(destination)
  }

  useEffect(() => {
    determineDestinationBanks()
  }, [firstProduct])

  useEffect(() => {
    if (!selectedDestination) {
      onDestinationCleared()
    }
  }, [selectedDestination, onDestinationCleared])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Tujuan Transfer
        </CardTitle>
        <CardDescription>Pilih salah satu rekening tujuan untuk transfer pembayaran</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {copyFeedback && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{copyFeedback}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectedDestination?.bankName === destinationBanks.bca.bankName
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => handleDestinationSelect(destinationBanks.bca)}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-blue-600">🏦 {destinationBanks.bca.bankName}</h3>
                <input
                  type="radio"
                  checked={selectedDestination?.bankName === destinationBanks.bca.bankName}
                  onChange={() => handleDestinationSelect(destinationBanks.bca)}
                  className="text-blue-600"
                />
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600">Nama Rekening:</p>
                  <p className="font-medium">{destinationBanks.bca.accountName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Nomor Rekening:</p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono font-bold text-lg">{destinationBanks.bca.accountNumber}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        copyToClipboard(destinationBanks.bca.accountNumber, "Nomor rekening BCA")
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectedDestination?.bankName === destinationBanks.mandiri.bankName
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => handleDestinationSelect(destinationBanks.mandiri)}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-blue-600">🏦 {destinationBanks.mandiri.bankName}</h3>
                <input
                  type="radio"
                  checked={selectedDestination?.bankName === destinationBanks.mandiri.bankName}
                  onChange={() => handleDestinationSelect(destinationBanks.mandiri)}
                  className="text-blue-600"
                />
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600">Nama Rekening:</p>
                  <p className="font-medium">{destinationBanks.mandiri.accountName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Nomor Rekening:</p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono font-bold text-lg">{destinationBanks.mandiri.accountNumber}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        copyToClipboard(destinationBanks.mandiri.accountNumber, "Nomor rekening Mandiri")
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {!selectedDestination && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <span className="text-red-500">*</span> Pilih salah satu rekening tujuan sebelum melanjutkan ke detail
              transfer.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
