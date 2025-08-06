"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, Package, User, MapPin, CreditCard, Phone, Mail } from 'lucide-react'
import PaymentProofUpload from "@/components/payment-proof-upload"
import { Button } from "@/components/ui/button"

interface Product {
  id: string
  name: string
  price: string
  qty: number
  images: Array<{
    src: string
    alt: string
  }>
}

interface InvoiceData {
  invoice: string
  name: string
  email: string
  phone: string
  address: string
  total: number
  products: Product[]
  paymentMethod: {
    name: string
    icon: string
  }
  shipping: {
    title: string
    description: string
  }
  status: string
}

// Separate component for the main page content to be wrapped in Suspense
function PaymentConfirmationContent() {
  const searchParams = useSearchParams()
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchInvoiceData = async () => {
      try {
        // Get the base64 encoded parameter
        const encodedInvoice = searchParams.get("") || searchParams.toString().split("=")[1]
        
        if (!encodedInvoice) {
          setError("Parameter invoice tidak ditemukan")
          setLoading(false)
          return
        }

        // Decode base64 to get invoice number
        const invoiceNumber = atob(encodedInvoice)
        
        // Fetch invoice data
        const response = await fetch(`/api/invoice?invoice=${invoiceNumber}`)
        
        if (!response.ok) {
          throw new Error("Gagal mengambil data invoice")
        }

        const data = await response.json()
        setInvoiceData(data.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan")
      } finally {
        setLoading(false)
      }
    }

    fetchInvoiceData()
  }, [searchParams])

  // Store invoice data in localStorage for the upload component
  useEffect(() => {
    if (invoiceData) {
      localStorage.setItem('currentInvoiceData', JSON.stringify(invoiceData))
    }
  }, [invoiceData])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg border border-red-200 shadow-sm">
          <div className="p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Terjadi Kesalahan
                </h3>
                <div className="text-sm text-gray-600 mb-4">
                  {error.includes("Parameter invoice tidak ditemukan") ? (
                    <div>
                      <p className="mb-2">Link yang Anda gunakan tidak valid atau sudah kedaluwarsa.</p>
                      <p className="font-medium">Kemungkinan penyebab:</p>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>Link tidak lengkap atau rusak</li>
                        
                        <li>Link sudah tidak berlaku</li>
                      </ul>
                    </div>
                  ) : error.includes("Gagal mengambil data invoice") ? (
                    <div>
                      <p className="mb-2">Tidak dapat mengambil data invoice dari server.</p>
                      <p className="font-medium">Kemungkinan penyebab:</p>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>Invoice tidak ditemukan dalam sistem</li>
                        <li>Koneksi internet bermasalah</li>
                        <li>Server sedang mengalami gangguan</li>
                      </ul>
                    </div>
                  ) : (
                    <div>
                      <p className="mb-2">Terjadi kesalahan yang tidak terduga.</p>
                      <p className="text-red-600 font-mono text-xs bg-red-50 p-2 rounded border">
                        {'Error: ' + error}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={() => window.location.reload()} 
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Coba Lagi
                  </Button>
                  <Button 
                    onClick={() => window.open('https://links.topsellbelanja.com/wa-cs-topsellbelanja', '_blank')}
                    className="flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.703"/>
                    </svg>
                    Hubungi Admin
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    )
  }

  if (!invoiceData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Data invoice tidak ditemukan</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl">Konfirmasi Pembayaran</CardTitle>
                <CardDescription>
                  Invoice: <span className="font-mono font-medium">{invoiceData.invoice}</span>
                </CardDescription>
              </div>
              <Badge 
                variant={invoiceData.status === "pending" ? "secondary" : "default"}
                className="w-fit"
              >
                {invoiceData.status.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informasi Pelanggan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  Nama
                </div>
                <p className="font-medium">{invoiceData.name}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  Email
                </div>
                <p className="font-medium">{invoiceData.email}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  Telepon
                </div>
                <p className="font-medium">{invoiceData.phone}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CreditCard className="h-4 w-4" />
                  Metode Pembayaran
                </div>
                <div className="flex items-center gap-2">
                  <img 
                    src={invoiceData.paymentMethod.icon || "/placeholder.svg"} 
                    alt={invoiceData.paymentMethod.name}
                    className="h-6 w-6"
                  />
                  <p className="font-medium">{invoiceData.paymentMethod.name}</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                Alamat Pengiriman
              </div>
              <p className="font-medium">{invoiceData.address}</p>
            </div>
          </CardContent>
        </Card>

        {/* Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Produk yang Dibeli
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {invoiceData.products.map((product, index) => (
                <div key={product.id}>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-shrink-0">
                      <img
                        src={product.images[0]?.src || "/placeholder.svg?height=80&width=80"}
                        alt={product.name}
                        className="w-20 h-20 object-cover rounded-lg border"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <h3 className="font-medium text-sm sm:text-base leading-tight">
                        {product.name}
                      </h3>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Qty: {product.qty}</span>
                          <span>Harga: {formatCurrency(parseInt(product.price))}</span>
                        </div>
                        <div className="font-semibold">
                          {formatCurrency(parseInt(product.price) * product.qty)}
                        </div>
                      </div>
                    </div>
                  </div>
                  {index < invoiceData.products.length - 1 && (
                    <Separator className="mt-4" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Total */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Total Pembayaran:</span>
              <span className="text-2xl text-primary">
                {formatCurrency(invoiceData.total)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Payment Proof Upload */}
        <PaymentProofUpload invoiceNumber={invoiceData.invoice} />
      </div>
    </div>
  )
}

export default function PaymentConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    }>
      <PaymentConfirmationContent />
    </Suspense>
  )
}
