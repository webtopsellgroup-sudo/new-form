import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const invoice = searchParams.get('invoice')

  if (!invoice) {
    return NextResponse.json(
      { error: 'Invoice parameter is required' },
      { status: 400 }
    )
  }

  try {
    const response = await fetch(
      `https://service.topsellbelanja.com/api/v1/cms/orders/detail?invoice=${invoice}`,
      {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOiI4NTNiYTIzNC1lMDExLTRlMzAtYWMyNS0zZTU5OGUzN2JlMDUiLCJlbWFpbCI6InN1cGVyYWRtaW5AdG9wc2VsbGJlbGFuamEuY29tIiwiaXNBY3RpdmUiOmZhbHNlfQ.AUOxsLNTENhW7mCuhdj2PQ5NHr2Feid2REDAGP5Szmo'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Error fetching invoice:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoice data' },
      { status: 500 }
    )
  }
}
