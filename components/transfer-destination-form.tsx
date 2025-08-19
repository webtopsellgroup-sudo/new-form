"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { CheckCircle, Info, Copy, Building } from "lucide-react"

interface TransferDestinationFormProps {
  onDestinationSelected: (destination: DestinationBank) => void
  onDestinationCleared: () => void
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
}: TransferDestinationFormProps) {
  const [selectedDestination, setSelectedDestination] = useState<DestinationBank | null>(null)
  const [destinationBanks, setDestinationBanks] = useState(bankAccounts.default)
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null)

  const determineDestinationBanks = () => {
    try {
      const invoiceData = localStorage.getItem("currentInvoiceData")
      if (invoiceData) {
        const invoice = JSON.parse(invoiceData)
        if (invoice.products && invoice.products.length > 0) {
          const firstProduct = invoice.products[0]
          const productName = firstProduct.name.toLowerCase()

          if (
            productName.includes("elektronik") ||
            productName.includes("handphone") ||
            productName.includes("laptop") ||
            productName.includes("smartphone") ||
            productName.includes("tablet") ||
            productName.includes("gadget")
          ) {
            setDestinationBanks(bankAccounts.elektronik)
            return
          }

          if (
            productName.includes("sepeda listrik") ||
            productName.includes("e-bike") ||
            productName.includes("electric bike")
          ) {
            setDestinationBanks(bankAccounts.sepedaListrik)
            return
          }
        }
      }

      setDestinationBanks(bankAccounts.default)
    } catch (error) {
      console.error("Error determining destination banks:", error)
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
  }, [])

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
