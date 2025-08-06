"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Upload, CheckCircle, AlertCircle, X, ImageIcon, Send } from 'lucide-react'

interface PaymentProofUploadProps {
  invoiceNumber: string
}

export default function PaymentProofUpload({ invoiceNumber }: PaymentProofUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [uploadedImageData, setUploadedImageData] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg']
    const maxSize = 5 * 1024 * 1024 // 5MB

    if (!allowedTypes.includes(file.type)) {
      return "Format file harus PNG, JPEG, atau JPG"
    }

    if (file.size > maxSize) {
      return "Ukuran file maksimal 5MB"
    }

    return null
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setSelectedFile(file)
    setError(null)
    setUploadSuccess(false)
    setUploadedImageData(null)

    // Create preview URL
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }

  // Auto upload when file is selected
  useEffect(() => {
    if (selectedFile && !uploading && !uploadSuccess) {
      handleUpload()
    }
  }, [selectedFile])

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    setUploadProgress(0)
    setError(null)

    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const result = reader.result as string
          // Remove data:image/...;base64, prefix
          const base64Data = result.split(',')[1]
          resolve(base64Data)
        }
        reader.onerror = reject
        reader.readAsDataURL(selectedFile)
      })

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      // Upload to imgbb
      const formData = new FormData()
      formData.append('image', base64)

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        throw new Error('Gagal mengupload gambar')
      }

      const result = await response.json()
      
      if (result.success) {
        setUploadSuccess(true)
        setUploadedImageData(result.data)
        setTimeout(() => {
          setUploadProgress(0)
        }, 2000)
      } else {
        throw new Error(result.error || 'Gagal mengupload gambar')
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat upload')
      setUploadProgress(0)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async () => {
    if (!uploadedImageData) return

    setSubmitting(true)
    setError(null)

    try {
      // Get invoice data from localStorage
      const invoiceDataString = localStorage.getItem('currentInvoiceData')
      const invoiceData = invoiceDataString ? JSON.parse(invoiceDataString) : null

      if (!invoiceData) {
        throw new Error('Data invoice tidak ditemukan')
      }

      // Prepare simplified data for webhook
      const webhookData = {
        invoice: invoiceData.invoice,
        customer: {
          name: invoiceData.name,
          email: invoiceData.email,
          phone: invoiceData.phone,
          address: invoiceData.address
        },
        products: invoiceData.products.map((product: any) => ({
          id: product.id,
          name: product.name,
          price: product.price,
          qty: product.qty,
          total: parseInt(product.price) * product.qty
        })),
        total: invoiceData.total,
        paymentMethod: invoiceData.paymentMethod.name,
        paymentProof: uploadedImageData.display_url, // Only the display URL
        submittedAt: new Date().toISOString()
      }

      console.log('Sending data to webhook:', webhookData) // For debugging

      const response = await fetch('https://n8n.topsell.co.id/webhook/inbound_invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData)
      })

      const responseText = await response.text()
      console.log('Webhook response:', response.status, responseText) // For debugging

      if (!response.ok) {
        throw new Error(`Webhook error: ${response.status} - ${responseText}`)
      }

      setSubmitSuccess(true)
    } catch (err) {
      console.error('Webhook submission error:', err)
      
      let errorMessage = 'Terjadi kesalahan saat mengirim data'
      
      if (err instanceof Error) {
        if (err.message.includes('Failed to fetch')) {
          errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda dan coba lagi.'
        } else if (err.message.includes('500')) {
          errorMessage = 'Server sedang mengalami gangguan. Silakan coba beberapa saat lagi.'
        } else if (err.message.includes('400')) {
          errorMessage = 'Data yang dikirim tidak valid. Silakan muat ulang halaman dan coba lagi.'
        } else if (err.message.includes('timeout')) {
          errorMessage = 'Koneksi timeout. Periksa koneksi internet dan coba lagi.'
        } else {
          errorMessage = `Webhook error: ${err.message}`
        }
      }
      
      setError(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setError(null)
    setUploadSuccess(false)
    setUploadedImageData(null)
    setSubmitSuccess(false)
    setUploadProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        return
      }

      setSelectedFile(file)
      setError(null)
      setUploadSuccess(false)
      setUploadedImageData(null)

      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Bukti Transfer
        </CardTitle>
        <CardDescription>
          Upload bukti transfer pembayaran untuk invoice {invoiceNumber}. 
          Format yang diterima: PNG, JPEG, JPG (maksimal 5MB)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="bg-white rounded-lg border border-red-200 shadow-sm">
            <div className="p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">
                    {error.includes("Format file") ? "Format File Tidak Didukung" :
                     error.includes("Ukuran file") ? "Ukuran File Terlalu Besar" :
                     error.includes("Gagal mengupload") ? "Upload Gagal" :
                     error.includes("Webhook error") ? "Gagal Mengirim Data" :
                     error.includes("Data invoice tidak ditemukan") ? "Data Tidak Lengkap" :
                     "Terjadi Kesalahan"}
                  </h4>
                  <div className="text-xs text-gray-600 mb-3">
                    {error.includes("Format file") ? (
                      <div>
                        <p className="mb-1">File yang Anda pilih tidak dalam format yang didukung.</p>
                        <p className="font-medium">Solusi:</p>
                        <ul className="list-disc list-inside mt-1 space-y-0.5">
                          <li>Gunakan file dengan format PNG, JPEG, atau JPG</li>
                          <li>Pastikan ekstensi file benar (.png, .jpg, .jpeg)</li>
                        </ul>
                      </div>
                    ) : error.includes("Ukuran file") ? (
                      <div>
                        <p className="mb-1">File yang Anda pilih terlalu besar untuk diupload.</p>
                        <p className="font-medium">Solusi:</p>
                        <ul className="list-disc list-inside mt-1 space-y-0.5">
                          <li>Kompres gambar menggunakan aplikasi foto</li>
                          <li>Pilih gambar dengan resolusi lebih kecil</li>
                          <li>Maksimal ukuran file adalah 5MB</li>
                        </ul>
                      </div>
                    ) : error.includes("Gagal mengupload") ? (
                      <div>
                        <p className="mb-1">Gambar tidak dapat diupload ke server.</p>
                        <p className="font-medium">Kemungkinan penyebab:</p>
                        <ul className="list-disc list-inside mt-1 space-y-0.5">
                          <li>Koneksi internet tidak stabil</li>
                          <li>Server upload sedang bermasalah</li>
                          <li>File rusak atau corrupt</li>
                        </ul>
                      </div>
                    ) : error.includes("Webhook error") ? (
                      <div>
                        <p className="mb-1">Data berhasil diupload tapi gagal dikirim ke sistem.</p>
                        <p className="font-medium">Kemungkinan penyebab:</p>
                        <ul className="list-disc list-inside mt-1 space-y-0.5">
                          <li>Server sistem sedang maintenance</li>
                          <li>Koneksi ke server terputus</li>
                          <li>Data tidak lengkap atau format salah</li>
                        </ul>
                        <div className="mt-2 p-2 bg-red-50 rounded text-xs font-mono text-red-700">
                          {'Error: ' + error}
                        </div>
                      </div>
                    ) : error.includes("Data invoice tidak ditemukan") ? (
                      <div>
                        <p className="mb-1">Data invoice tidak dapat ditemukan di sistem.</p>
                        <p className="font-medium">Kemungkinan penyebab:</p>
                        <ul className="list-disc list-inside mt-1 space-y-0.5">
                          <li>Halaman dimuat ulang dan data hilang</li>
                          <li>Session browser bermasalah</li>
                          <li>Link invoice sudah kedaluwarsa</li>
                        </ul>
                      </div>
                    ) : (
                      <div>
                        <p className="mb-1">Terjadi kesalahan yang tidak terduga.</p>
                        <div className="mt-2 p-2 bg-red-50 rounded text-xs font-mono text-red-700">
                          {'Error: ' + error}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setError(null)
                        if (error.includes("Data invoice tidak ditemukan")) {
                          window.location.reload()
                        }
                      }}
                      className="flex items-center gap-1 text-xs"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      {error.includes("Data invoice tidak ditemukan") ? "Muat Ulang" : "Coba Lagi"}
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => window.open('https://wa.me/6285157975587?text=Halo,%20saya%20mengalami%20masalah%20upload%20bukti%20transfer:%20' + encodeURIComponent(error), '_blank')}
                      className="flex items-center gap-1 text-xs"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.703"/>
                      </svg>
                      Bantuan
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {uploadSuccess && !submitSuccess && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Bukti transfer berhasil diupload! Silakan klik tombol Submit untuk mengirim konfirmasi.
            </AlertDescription>
          </Alert>
        )}

        {submitSuccess && (
          <Alert className="border-blue-200 bg-blue-50">
            <CheckCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Konfirmasi pembayaran berhasil dikirim! Terima kasih atas pembayaran Anda.
            </AlertDescription>
          </Alert>
        )}

        {!selectedFile ? (
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              Pilih file atau drag & drop
            </p>
            <p className="text-sm text-gray-500 mb-4">
              PNG, JPEG, JPG hingga 5MB
            </p>
            <Button variant="outline">
              Pilih File
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 border rounded-lg">
              {previewUrl && (
                <img
                  src={previewUrl || "/placeholder.svg"}
                  alt="Preview"
                  className="w-20 h-20 object-cover rounded-lg border"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                {uploadSuccess && (
                  <p className="text-sm text-green-600 font-medium">
                    ✓ Upload berhasil
                  </p>
                )}
              </div>
              {!submitSuccess && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                  disabled={uploading || submitting}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Mengupload gambar...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}

            {uploadSuccess && !submitSuccess && (
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full"
                size="lg"
              >
                <Send className="h-4 w-4 mr-2" />
                {submitting ? "Mengirim Konfirmasi..." : "Submit Konfirmasi Pembayaran"}
              </Button>
            )}

            {submitSuccess && (
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="font-medium text-green-800">
                  Konfirmasi Pembayaran Berhasil Dikirim
                </p>
                <p className="text-sm text-green-600 mt-1">
                  Tim kami akan memproses pembayaran Anda segera.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
