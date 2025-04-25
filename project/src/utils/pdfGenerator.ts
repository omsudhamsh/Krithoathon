/**
 * PDF Generator Utility for Waste Classification App
 * 
 * This utility provides functionality to generate PDF reports for waste classifications.
 * It creates a formatted PDF document with classification details.
 */

interface Classification {
  id: string;
  timestamp: string;
  imageUrl: string | null;
  category: string;
  accuracy: number;
  wasteType: string;
}

/**
 * Generates a PDF from classification data and triggers a download
 * 
 * @param data - The classification data to include in the PDF
 * @param filename - Optional custom filename (defaults to 'waste-classifications')
 */
export const generatePDF = (data: Classification[], filename: string = 'waste-classifications'): void => {
  // In a real implementation, we would use a library like jsPDF or pdfmake
  // Since we can't install new dependencies, we'll simulate PDF generation with HTML
  
  // Create a new window for the PDF preview
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to download PDF reports');
    return;
  }
  
  // Calculate summary statistics
  const totalItems = data.length;
  const recyclableItems = data.filter(item => item.category === 'Recyclable').length;
  const biodegradableItems = data.filter(item => item.category === 'Biodegradable').length;
  const nonRecyclableItems = data.filter(item => item.category === 'Non-recyclable').length;
  
  // Calculate estimated environmental impact
  const avgWeightPerItem = 0.2; // kg per waste item
  const recyclableCO2PerKg = 2.5; // kg of CO2 saved per kg of recycled material
  const biodegradableCO2PerKg = 0.5; // kg of CO2 saved per kg of composted material
  
  const totalRecycledWeight = recyclableItems * avgWeightPerItem;
  const totalBiodegradableWeight = biodegradableItems * avgWeightPerItem;
  
  const co2Saved = (totalRecycledWeight * recyclableCO2PerKg) + (totalBiodegradableWeight * biodegradableCO2PerKg);
  const landfillReduction = totalRecycledWeight + totalBiodegradableWeight;
  const waterSaved = totalRecycledWeight * 1000; // 1000L of water per kg of recycled material
  const energySaved = totalRecycledWeight * 5; // 5 kWh per kg of recycled material
  
  // Generate the HTML content
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Waste Classification Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1, h2 { color: #2d3748; }
        table { border-collapse: collapse; width: 100%; margin-top: 20px; }
        th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; }
        th { background-color: #f7fafc; }
        .recyclable { color: #22543d; background-color: #c6f6d5; }
        .biodegradable { color: #744210; background-color: #fefcbf; }
        .non-recyclable { color: #742a2a; background-color: #fed7d7; }
        .accuracy-bar { 
          height: 10px;
          background-color: #e2e8f0;
          border-radius: 5px;
          overflow: hidden;
          width: 100px;
          display: inline-block;
          margin-right: 10px;
        }
        .accuracy-fill {
          height: 100%;
          background-color: #3182ce;
          border-radius: 5px;
        }
        .accuracy-container {
          display: flex;
          align-items: center;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #38a169;
        }
        .date {
          color: #718096;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 12px;
          color: #718096;
        }
        .summary-box {
          background-color: #f0fff4;
          border: 1px solid #c6f6d5;
          border-radius: 5px;
          padding: 15px;
          margin: 20px 0;
        }
        .impact-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-top: 15px;
        }
        .impact-cell {
          background-color: #ebf8ff;
          border-radius: 5px;
          padding: 10px;
          text-align: center;
        }
        .impact-value {
          font-size: 18px;
          font-weight: bold;
          color: #2b6cb0;
        }
        .impact-label {
          font-size: 12px;
          color: #4a5568;
        }
        .pie-chart {
          width: 150px;
          height: 150px;
          position: relative;
        }
        @media print {
          .page-break {
            page-break-after: always;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">Waste Bot</div>
        <div class="date">Generated on: ${new Date().toLocaleString()}</div>
      </div>

      <h1>Waste Classification Report</h1>
      
      <div class="summary-box">
        <h2>Environmental Impact Summary</h2>
        <p>Based on ${totalItems} classified waste items:</p>
        
        <div class="impact-grid">
          <div class="impact-cell">
            <div class="impact-value">${co2Saved.toFixed(2)}</div>
            <div class="impact-label">kg CO₂ Saved</div>
          </div>
          <div class="impact-cell">
            <div class="impact-value">${landfillReduction.toFixed(2)}</div>
            <div class="impact-label">kg Waste Diverted</div>
          </div>
          <div class="impact-cell">
            <div class="impact-value">${waterSaved.toFixed(0)}</div>
            <div class="impact-label">Liters Water Saved</div>
          </div>
          <div class="impact-cell">
            <div class="impact-value">${energySaved.toFixed(2)}</div>
            <div class="impact-label">kWh Energy Saved</div>
          </div>
        </div>
        
        <div style="margin-top: 15px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <p><strong>Distribution of Waste:</strong></p>
              <ul>
                <li><span style="color: #22543d;">Recyclable: ${recyclableItems} (${((recyclableItems/totalItems)*100).toFixed(1)}%)</span></li>
                <li><span style="color: #744210;">Biodegradable: ${biodegradableItems} (${((biodegradableItems/totalItems)*100).toFixed(1)}%)</span></li>
                <li><span style="color: #742a2a;">Non-recyclable: ${nonRecyclableItems} (${((nonRecyclableItems/totalItems)*100).toFixed(1)}%)</span></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <h2>Classification Details</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Waste Type</th>
            <th>Category</th>
            <th>Accuracy</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(item => `
            <tr>
              <td>${new Date(item.timestamp).toLocaleString()}</td>
              <td>${item.wasteType}</td>
              <td class="${item.category.toLowerCase().replace('-', '')}">${item.category}</td>
              <td>
                <div class="accuracy-container">
                  <div class="accuracy-bar">
                    <div class="accuracy-fill" style="width: ${item.accuracy}%;"></div>
                  </div>
                  <span>${item.accuracy}%</span>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="footer">
        <p>© ${new Date().getFullYear()} Waste Bot - All rights reserved</p>
      </div>

      <script>
        // Auto print and prompt download
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
  `;
  
  // Write the HTML content to the new window
  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  // Rename file in print dialog
  printWindow.document.title = `${filename}.pdf`;
}; 