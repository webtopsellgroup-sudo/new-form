import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const invoice = searchParams.get("invoice")

  if (!invoice) {
    return NextResponse.json({ error: "Parameter invoice tidak ditemukan" }, { status: 400 })
  }

  try {
    const response = await fetch(`https://service.topsellbelanja.com/api/v1/cms/orders/detail?invoice=${invoice}`, {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOiI4NTNiYTIzNC1lMDExLTRlMzAtYWMyNS0zZTU5OGUzN2JlMDUiLCJlbWFpbCI6InN1cGVyYWRtaW5AdG9wc2VsbGJlbGFuamEuY29tIiwiaXNBY3RpdmUiOmZhbHNlfQ.AUOxsLNTENhW7mCuhdj2PQ5NHr2Feid2REDAGP5Szmo",
      },
    })

    if (!response.ok) {
      // Try to get the response text to see what the actual error is
      const errorText = await response.text()
      console.error(`HTTP error! status: ${response.status}, response: ${errorText}`)

      if (response.status === 429) {
        return NextResponse.json({ error: "RATE_LIMIT_EXCEEDED" }, { status: 429 })
      } else if (response.status === 404) {
        return NextResponse.json({ error: "INVOICE_NOT_FOUND" }, { status: 404 })
      } else if (response.status === 401) {
        return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 })
      } else {
        return NextResponse.json({ error: "SERVER_ERROR" }, { status: response.status })
      }
    }

    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      const responseText = await response.text()
      console.error("Non-JSON response received:", responseText)
      return NextResponse.json({ error: "INVALID_RESPONSE" }, { status: 500 })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching invoice:", error)

    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "INVALID_RESPONSE" }, { status: 500 })
    } else if (error instanceof TypeError && error.message.includes("fetch")) {
      return NextResponse.json({ error: "NETWORK_ERROR" }, { status: 503 })
    } else {
      return NextResponse.json({ error: "UNKNOWN_ERROR" }, { status: 500 })
    }
  }
}
