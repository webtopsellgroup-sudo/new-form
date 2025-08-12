"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CreditCard, AlertTriangle, CheckCircle, Info } from "lucide-react"

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
  })

  const [amountValidation, setAmountValidation] = useState<{
    type: "valid" | "overpaid" | "underpaid" | "empty"
    message: string
    difference?: number
  }>({ type: "empty", message: "" })

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
    // Remove non-numeric characters except for decimal point
    const numericValue = value.replace(/[^\d]/g, "")
    const amount = numericValue ? Number.parseInt(numericValue) : 0

    setFormData((prev) => ({ ...prev, transferAmount: amount }))
    validateTransferAmount(amount)
  }

  const formatAmountDisplay = (amount: number) => {
    if (amount === 0) return ""
    return amount.toLocaleString("id-ID")
  }

  // Check if form is complete
  const isFormComplete = () => {
    return (
      formData.customerName.trim() !== "" &&
      formData.senderBank !== "" &&
      formData.transferDate !== "" &&
      formData.transferTime !== "" &&
      formData.transferAmount > 0
    )
  }

  // Notify parent component when form completion status changes
  useEffect(() => {
    if (isFormComplete()) {
      onFormComplete(formData)
    } else {
      onFormIncomplete()
    }
  }, [formData, onFormComplete, onFormIncomplete])

  // Set default date to today
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0]
    setFormData((prev) => ({ ...prev, transferDate: today }))
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Detail Transfer
        </CardTitle>
        <CardDescription>Lengkapi detail transfer pembayaran Anda</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total Amount Display */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-800 mb-2">
            <Info className="h-4 w-4" />
            <span className="font-medium">Total Tagihan</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">{formatCurrency(totalAmount)}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Name */}
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

          {/* Account Number */}
          <div className="space-y-2">
            <Label htmlFor="accountNumber">No Rekening (Opsional)</Label>
            <Input
              id="accountNumber"
              value={formData.accountNumber}
              onChange={(e) => setFormData((prev) => ({ ...prev, accountNumber: e.target.value }))}
              placeholder="Nomor rekening pengirim"
            />
          </div>

          {/* Sender Bank */}
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

          {/* Transfer Date */}
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

          {/* Transfer Time */}
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

          {/* Transfer Amount */}
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

            {/* Amount Validation Messages */}
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
                  <div className="mt-1 font-medium">Kelebihan: {formatCurrency(amountValidation.difference || 0)}</div>
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

        {/* Notes */}
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

        {/* Form Status */}
        {!isFormComplete() && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Lengkapi semua field yang wajib diisi (bertanda *) untuk melanjutkan ke upload bukti transfer.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
