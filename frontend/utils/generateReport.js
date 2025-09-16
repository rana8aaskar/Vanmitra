import jsPDF from 'jspdf'

export function generateClaimReport(claimData) {
  const doc = new jsPDF()

  // Helper function to format dates
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    } catch {
      return dateStr
    }
  }

  // Set document properties
  doc.setProperties({
    title: `Claim Report - ${claimData.claimant_name || 'Unknown'}`,
    subject: 'Forest Rights Act Claim Report',
    author: 'Vanmitra System',
    keywords: 'claim, report, fra',
    creator: 'Vanmitra Dashboard'
  })

  // Title
  doc.setFontSize(20)
  doc.setTextColor(0, 100, 0)
  doc.text('VANMITRA - CLAIM REPORT', 105, 20, { align: 'center' })

  // Report generation date
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text(`Generated on: ${formatDate(new Date())}`, 105, 30, { align: 'center' })

  // Status Badge
  doc.setFontSize(12)
  const statusColor = claimData.status_of_claim?.toLowerCase() === 'approved' ? [0, 128, 0] :
                      claimData.status_of_claim?.toLowerCase() === 'pending' ? [255, 165, 0] :
                      [255, 0, 0]
  doc.setTextColor(...statusColor)
  doc.text(`Status: ${claimData.status_of_claim || 'Unknown'}`, 105, 40, { align: 'center' })

  let yPos = 55

  // Helper function to add a section
  const addSection = (title, data) => {
    // Check if we need a new page
    if (yPos > 250) {
      doc.addPage()
      yPos = 20
    }

    // Section title
    doc.setFontSize(14)
    doc.setTextColor(0, 51, 102)
    doc.setFont(undefined, 'bold')
    doc.text(title, 20, yPos)
    yPos += 10

    // Section data
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    doc.setFont(undefined, 'normal')

    data.forEach(([label, value]) => {
      if (yPos > 270) {
        doc.addPage()
        yPos = 20
      }
      doc.text(`${label}:`, 25, yPos)
      doc.text(value || 'N/A', 80, yPos)
      yPos += 7
    })

    yPos += 5
  }

  // Add sections
  addSection('PERSONAL INFORMATION', [
    ['Claimant Name', claimData.claimant_name],
    ['Spouse Name', claimData.spouse_name],
    ['Age', String(claimData.age || 'N/A')],
    ['Gender', claimData.gender],
    ['Category', claimData.category],
    ['Aadhaar Number', claimData.aadhaar_no]
  ])

  addSection('LOCATION DETAILS', [
    ['State', claimData.state],
    ['District', claimData.district],
    ['Tehsil/Block', claimData.tehsil],
    ['Village', claimData.village],
    ['Gram Panchayat', claimData.gram_panchayat],
    ['Coordinates', claimData.geo_coordinates]
  ])

  addSection('CLAIM INFORMATION', [
    ['Claim Type', claimData.claim_type],
    ['Land Use', claimData.land_use],
    ['Area Claimed', claimData.land_claimed],
    ['Annual Income', claimData.annual_income],
    ['Tax Payer', claimData.tax_payer],
    ['Patta Title No', claimData.patta_title_no]
  ])

  addSection('INFRASTRUCTURE & RESOURCES', [
    ['Water Body', claimData.water_body],
    ['Irrigation Source', claimData.irrigation_source],
    ['Infrastructure', claimData.infrastructure_present]
  ])

  addSection('VERIFICATION & AUTHORITIES', [
    ['Gram Sabha Verified', claimData.verified_by_gram_sabha],
    ['Gram Sabha Chairperson', claimData.gram_sabha_chairperson],
    ['Forest Dept Officer', claimData.forest_dept_officer],
    ['Revenue Dept Officer', claimData.revenue_dept_officer]
  ])

  addSection('IMPORTANT DATES', [
    ['Submission Date', formatDate(claimData.date_of_submission)],
    ['Decision Date', formatDate(claimData.date_of_decision)],
    ['Created At', formatDate(claimData.created_at)],
    ['Last Updated', formatDate(claimData.updated_at)]
  ])

  // Add boundary description if available
  if (claimData.boundary_description && yPos < 230) {
    addSection('BOUNDARY DESCRIPTION', [])
    doc.setFontSize(10)
    const lines = doc.splitTextToSize(claimData.boundary_description, 170)
    lines.forEach(line => {
      if (yPos > 270) {
        doc.addPage()
        yPos = 20
      }
      doc.text(line, 25, yPos)
      yPos += 6
    })
  }

  // Footer
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(`Page ${i} of ${pageCount}`, 105, 285, { align: 'center' })
    doc.text('© Vanmitra - Forest Rights Management System', 105, 290, { align: 'center' })
  }

  // Save the PDF
  const fileName = `Claim_Report_${claimData.claimant_name?.replace(/\s+/g, '_') || 'Unknown'}_${Date.now()}.pdf`
  doc.save(fileName)

  return fileName
}

// Alternative function to generate CSV report
export function generateCSVReport(claimData) {
  const headers = [
    'Field',
    'Value'
  ]

  const rows = [
    ['Claimant Name', claimData.claimant_name || 'N/A'],
    ['Spouse Name', claimData.spouse_name || 'N/A'],
    ['Age', claimData.age || 'N/A'],
    ['Gender', claimData.gender || 'N/A'],
    ['Category', claimData.category || 'N/A'],
    ['Aadhaar Number', claimData.aadhaar_no || 'N/A'],
    ['State', claimData.state || 'N/A'],
    ['District', claimData.district || 'N/A'],
    ['Tehsil/Block', claimData.tehsil || 'N/A'],
    ['Village', claimData.village || 'N/A'],
    ['Gram Panchayat', claimData.gram_panchayat || 'N/A'],
    ['Coordinates', claimData.geo_coordinates || 'N/A'],
    ['Claim Type', claimData.claim_type || 'N/A'],
    ['Land Use', claimData.land_use || 'N/A'],
    ['Area Claimed', claimData.land_claimed || 'N/A'],
    ['Annual Income', claimData.annual_income || 'N/A'],
    ['Tax Payer', claimData.tax_payer || 'N/A'],
    ['Patta Title No', claimData.patta_title_no || 'N/A'],
    ['Status', claimData.status_of_claim || 'N/A'],
    ['Submission Date', claimData.date_of_submission || 'N/A'],
    ['Decision Date', claimData.date_of_decision || 'N/A'],
    ['Water Body', claimData.water_body || 'N/A'],
    ['Irrigation Source', claimData.irrigation_source || 'N/A'],
    ['Infrastructure', claimData.infrastructure_present || 'N/A'],
    ['Gram Sabha Verified', claimData.verified_by_gram_sabha || 'N/A'],
    ['Gram Sabha Chairperson', claimData.gram_sabha_chairperson || 'N/A'],
    ['Forest Dept Officer', claimData.forest_dept_officer || 'N/A'],
    ['Revenue Dept Officer', claimData.revenue_dept_officer || 'N/A']
  ]

  // Convert to CSV format
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  const fileName = `Claim_Data_${claimData.claimant_name?.replace(/\s+/g, '_') || 'Unknown'}_${Date.now()}.csv`

  link.setAttribute('href', url)
  link.setAttribute('download', fileName)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  return fileName
}