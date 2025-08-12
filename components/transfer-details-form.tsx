"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { CreditCard, AlertTriangle, CheckCircle, Info, Copy, Building } from "lucide-react"

interface TransferDetailsFormProps {
  totalAmount: number
  onFormComplete: (data: TransferDetailsData) => void
  onFormIncomplete: () => void
}

export interface TransferDetailsData {
  customerName: string
  accountNumber: string
  senderBank: string
  transferDate: string
  transferTime: string
  transferAmount: number
  notes: string
  destinationBank: {
    bankName: string
    accountNumber: string
    accountName: string
  } | null
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

const bankOptions = [
  "BCA",
  "BRI",
  "BNI",
  "Mandiri",
  "CIMB Niaga",
  "Danamon",
  "Permata",
  "BTN",
  "Bank Mega",
  "OCBC NISP",
  "Panin Bank",
  "Bank Syariah Indonesia (BSI)",
  "Muamalat",
  "Bank Jago",
  "Jenius",
  "Blu BCA",
  "Allo Bank",
  "Seabank",
  "GoPay",
  "OVO",
  "DANA",
  "ShopeePay",
  "LinkAja",
]

export default function TransferDetailsForm({
  totalAmount,
  onFormComplete,
  onFormIncomplete,
}: TransferDetailsFormProps) {
  const [formData, setFormData] = useState<TransferDetailsData>({
    customerName: "",
    accountNumber: "",
    senderBank: "",
    transferDate: "",
    transferTime: "",
    transferAmount: 0,
    notes: "",
    destinationBank: null,
  })

  const [amountValidation, setAmountValidation] = useState<{
    type: "valid" | "overpaid" | "underpaid" | "empty"
    message: string
    difference?: number
  }>({ type: "empty", message: "" })

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const validateTransferAmount = (amount: number) => {
    if (amount === 0) {
      setAmountValidation({ type: "empty", message: "" })
      return
    }

    if (amount > totalAmount) {
      const difference = amount - totalAmount
      setAmountValidation({
        type: "overpaid",
        message: `Nominal yang diinput kelebihan dari total tagihan`,
        difference,
      })
    } else if (amount < totalAmount) {
      const difference = totalAmount - amount
      setAmountValidation({
        type: "underpaid",
        message: `Nominal yang diinput kurang dari total tagihan`,
        difference,
      })
    } else {
      setAmountValidation({
        type: "valid",
        message: "Nominal transfer sesuai dengan total tagihan",
      })
    }
  }

  const handleAmountChange = (value: string) => {
    const numericValue = value.replace(/[^\d]/g, "")
    const amount = numericValue ? Number.parseInt(numericValue) : 0

    setFormData((prev) => ({ ...prev, transferAmount: amount }))
    validateTransferAmount(amount)
  }

  const formatAmountDisplay = (amount: number) => {
    if (amount === 0) return ""
    return amount.toLocaleString("id-ID")
  }

  const isFormComplete = () => {
    return (
      formData.customerName.trim() !== "" &&
      formData.senderBank !== "" &&
      formData.transferDate !== "" &&
      formData.transferTime !== "" &&
      formData.transferAmount > 0 &&
      formData.destinationBank !== null
    )
  }

  useEffect(() => {
    if (isFormComplete()) {
      onFormComplete(formData)
    } else {
      onFormIncomplete()
    }
  }, [formData, onFormComplete, onFormIncomplete])

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0]
    setFormData((prev) => ({ ...prev, transferDate: today }))
  }, [])

  useEffect(() => {
    determineDestinationBanks()
  }, [])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Detail Transfer
          </CardTitle>
          <CardDescription>Lengkapi detail transfer pembayaran Anda</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-800 mb-2">
              <Info className="h-4 w-4" />
              <span className="font-medium">Total Tagihan</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">{formatCurrency(totalAmount)}</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="customerName">
                Nama Anda <span className="text-red-500">*</span>
              </Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) => setFormData((prev) => ({ ...prev, customerName: e.target.value }))}
                placeholder="Masukkan nama lengkap Anda"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountNumber">No Rekening (Opsional)</Label>
              <Input
                id="accountNumber" type="number"
                value={formData.accountNumber}
                onChange={(e) => setFormData((prev) => ({ ...prev, accountNumber: e.target.value }))}
                placeholder="Nomor rekening pengirim"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="senderBank">
                Pilih Bank Pengirim <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.senderBank}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, senderBank: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih bank pengirim" />
                </SelectTrigger>
                <SelectContent>
                  {bankOptions.map((bank) => (
                    <SelectItem key={bank} value={bank}>
                      {bank}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="transferDate">
                Tanggal Transfer <span className="text-red-500">*</span>
              </Label>
              <Input
                id="transferDate"
                type="date"
                value={formData.transferDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, transferDate: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="transferTime">
                Waktu Transfer <span className="text-red-500">*</span>
              </Label>
              <Input
                id="transferTime"
                type="time"
                value={formData.transferTime}
                onChange={(e) => setFormData((prev) => ({ ...prev, transferTime: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="transferAmount">
                Nominal Transfer <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">Rp</span>
                <Input
                  id="transferAmount"
                  value={formatAmountDisplay(formData.transferAmount)}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="0"
                  className="pl-8"
                />
              </div>

              {amountValidation.type === "valid" && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">{amountValidation.message}</AlertDescription>
                </Alert>
              )}

              {amountValidation.type === "overpaid" && (
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    {amountValidation.message}
                    <div className="mt-1 font-medium">
                      Kelebihan: {formatCurrency(amountValidation.difference || 0)}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {amountValidation.type === "underpaid" && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {amountValidation.message}
                    <div className="mt-1 font-medium">Selisih: {formatCurrency(amountValidation.difference || 0)}</div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Catatan</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Catatan tambahan (opsional)"
              rows={3}
            />
          </div>

          {!isFormComplete() && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription  className="font-semibold text-red-600">
                Lengkapi semua field yang wajib diisi (bertanda *) untuk melanjutkan ke upload bukti transfer.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

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
                formData.destinationBank?.bankName === destinationBanks.bca.bankName
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setFormData((prev) => ({ ...prev, destinationBank: destinationBanks.bca }))}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-blue-600">🏦 {destinationBanks.bca.bankName}</h3>
                  <input
                    type="radio"
                    checked={formData.destinationBank?.bankName === destinationBanks.bca.bankName}
                    onChange={() => setFormData((prev) => ({ ...prev, destinationBank: destinationBanks.bca }))}
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
                formData.destinationBank?.bankName === destinationBanks.mandiri.bankName
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setFormData((prev) => ({ ...prev, destinationBank: destinationBanks.mandiri }))}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-blue-600">🏦 {destinationBanks.mandiri.bankName}</h3>
                  <input
                    type="radio"
                    checked={formData.destinationBank?.bankName === destinationBanks.mandiri.bankName}
                    onChange={() => setFormData((prev) => ({ ...prev, destinationBank: destinationBanks.mandiri }))}
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

          {!formData.destinationBank && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <span className="text-red-500">*</span> Pilih salah satu rekening tujuan sebelum melanjutkan ke upload
                bukti transfer.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
