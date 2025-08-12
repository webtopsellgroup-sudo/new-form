"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, MessageCircle, ShoppingBag } from "lucide-react"
import { useRouter } from "next/navigation"

interface InvoiceData {
  invoice: string
  name: string
  total: number
}

export default function ThankYouPage() {
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Get invoice data from localStorage for WhatsApp message
    const invoiceDataString = localStorage.getItem("currentInvoiceData")

    if (invoiceDataString) {
      try {
        setInvoiceData(JSON.parse(invoiceDataString))
      } catch (error) {
        console.error("Error parsing invoice data:", error)
      }
    }
  }, [])

  const handleWhatsAppContact = () => {
    const message = invoiceData?.invoice
      ? `Halo Admin, saya telah melakukan transfer pembayaran untuk invoice ${invoiceData.invoice}. Mohon konfirmasi status pembayaran saya. Terima kasih.`
      : `Halo Admin, saya telah melakukan transfer pembayaran. Mohon konfirmasi status pembayaran saya. Terima kasih.`

    const whatsappUrl = `https://wa.me/6281236075777?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Success Header */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-green-800 mb-2">Data Berhasil Dikirim!</h1>
              <p className="text-green-700">
               Terima kasih telah mengirimkan data pembayaran. Saat ini data sedang dalam proses verifikasi.
              </p>
               <p className="text-green-700">
               Anda akan menerima notifikasi dan status pada pesanan Anda akan berubah menjadi Diproses ketika pembayaran berhasil diterima atau telah terverifikasi.
              </p>
               <p className="text-red-600 text-sm">
                <span className="font-semibold">Penting:</span> Proses verifikasi membutuhkan waktu 1x24 jam.
              </p>
            </div>
          </CardContent>
        </Card>

       

      

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button onClick={handleWhatsAppContact} className="bg-green-600 hover:bg-green-700 text-white" size="lg">
            <MessageCircle className="h-5 w-5 mr-2" />
            Chat Admin - Konfirmasi Transfer
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open("https://topsellbelanja.com", "_blank")}
            size="lg"
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            <ShoppingBag className="h-5 w-5 mr-2" />
            Kembali Belanja
          </Button>
        </div>

      
      </div>
    </div>
  )
}
