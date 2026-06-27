import { jsPDF } from "jspdf";
import { TrailReport } from "../types";

export function generateReportWebPdf(report: TrailReport) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });
  
  // A4 size is 210 x 297 mm
  
  // Banner background (Forest Green #2E7D32)
  doc.setFillColor(46, 125, 50);
  doc.rect(0, 0, 210, 30, "F");
  
  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("SUMMITBERBER - TRAIL ASSESSMENT REPORT", 12, 18);
  
  // Status tag
  doc.setFillColor(report.isDraft ? 230 : 46, report.isDraft ? 81 : 125, report.isDraft ? 0 : 50);
  doc.roundedRect(172, 9, 26, 10, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.text(report.isDraft ? "DRAFT" : "FINALIZED", 185, 15.5, { align: "center" });
  
  // Main metadata
  doc.setTextColor(28, 29, 26);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(report.title || "Unnamed Assessment", 12, 42);
  
  doc.setTextColor(92, 94, 87);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9.5);
  doc.text(`Region / Park: ${report.park || "Not Specified"}`, 12, 48);
  doc.text(`Date Filed: ${new Date(report.timestamp).toLocaleString()}`, 12, 53);
  
  // Divider line
  doc.setDrawColor(225, 228, 213);
  doc.setLineWidth(0.4);
  doc.line(12, 57, 198, 57);
  
  // Metrics Grid table
  doc.setTextColor(46, 125, 50);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.text("TRAIL METRICS", 12, 65);
  
  // Outer border of table
  doc.setDrawColor(195, 200, 187);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(12, 69, 186, 18, 2, 2, "FD");
  
  // Column dividers
  doc.line(74, 69, 74, 87);
  doc.line(136, 69, 136, 87);
  
  // Column Labels
  doc.setTextColor(92, 94, 87);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Total Distance", 20, 74);
  doc.text("Est. Duration", 82, 74);
  doc.text("Elevation Gain", 144, 74);
  
  // Column values
  doc.setTextColor(28, 29, 26);
  doc.setFontSize(10.5);
  doc.setFont("helvetica", "bold");
  doc.text(`${report.distance} km`, 20, 81);
  doc.text(report.duration || "00:00", 82, 81);
  doc.text(`${report.elevationGain} m`, 144, 81);
  
  // Description section
  doc.setTextColor(46, 125, 50);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.text("DESCRIPTION & SAFETY ANALYSIS", 12, 97);
  
  doc.setTextColor(28, 29, 26);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  
  // Split description text to fit PDF width
  const splitText = doc.splitTextToSize(report.description || "No description provided.", 186);
  doc.text(splitText, 12, 103);
  
  let currentY = 103 + (splitText.length * 4.8) + 8;
  
  // GPX Track details if attached
  if (report.gpxFileName) {
    doc.setFillColor(235, 243, 231);
    doc.roundedRect(12, currentY, 186, 12, 1.5, 1.5, "F");
    
    doc.setTextColor(46, 125, 50);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("GPX ROUTE ATTACHED", 16, currentY + 5);
    
    doc.setTextColor(92, 94, 87);
    doc.setFont("helvetica", "normal");
    doc.text(`File: ${report.gpxFileName}`, 16, currentY + 9);
    
    currentY += 18;
  }
  
  // Photo gallery section
  if (report.images && report.images.length > 0) {
    doc.setTextColor(46, 125, 50);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.text("FIELD DOCUMENTATION PHOTOS", 12, currentY);
    currentY += 6;
    
    // Draw photos grid
    report.images.forEach((img, idx) => {
      if (currentY + 48 > 280) {
        doc.addPage();
        currentY = 20;
      }
      
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      
      const x = col === 0 ? 12 : 110;
      const y = currentY + (row * 46);
      
      try {
        // Draw image
        doc.addImage(img.dataUrl, "JPEG", x, y, 88, 36);
        doc.setFillColor(242, 245, 238);
        doc.rect(x, y + 36, 88, 5, "F");
        doc.setTextColor(50, 50, 50);
        doc.setFontSize(7.5);
        doc.setFont("helvetica", "normal");
        doc.text(img.caption || `Photo #${idx + 1}`, x + 3, y + 39.5);
      } catch (e) {
        // Fallback placeholder box
        doc.setDrawColor(200, 200, 200);
        doc.rect(x, y, 88, 36, "S");
        doc.setTextColor(150, 150, 150);
        doc.text("[Image render placeholder]", x + 15, y + 18);
      }
    });
  }
  
  // Footer
  doc.setTextColor(142, 145, 130);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Generated via SummitBerber V1 Mountain Productivity Suite", 12, 288);
  doc.text("Page 1 of 1", 198, 288, { align: "right" });
  
  // Save
  const cleanTitle = (report.title || "Report").replace(/\s+/g, "_");
  doc.save(`SummitBerber_Report_${cleanTitle}.pdf`);
}
