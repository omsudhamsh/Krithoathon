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
  
  // Generate the HTML content
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Waste Classification Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #2d3748; }
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
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">Waste Bot</div>
        <div class="date">Generated on: ${new Date().toLocaleString()}</div>
      </div>

      <h1>Waste Classification Report</h1>
      
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