package com.summit.summitberber.utils

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Typeface
import android.graphics.pdf.PdfDocument
import com.summit.summitberber.data.Report
import java.io.File
import java.io.FileOutputStream
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

object PdfGenerator {

    fun generateReportPdf(context: Context, report: Report): File? {
        val pdfDocument = PdfDocument()
        
        // A4 Dimensions: 595 x 842 points
        val pageInfo = PdfDocument.PageInfo.Builder(595, 842, 1).create()
        val page = pdfDocument.startPage(pageInfo)
        
        val canvas: Canvas = page.canvas
        val paint = Paint()
        val textPaint = Paint()
        
        // Background
        canvas.drawColor(Color.parseColor("#F7FBF0")) // Muted off-white
        
        // Header
        paint.color = Color.parseColor("#2E7D32") // Forest Green
        canvas.drawRect(0f, 0f, 595f, 80f, paint)
        
        // Header Text
        textPaint.color = Color.WHITE
        textPaint.textSize = 22f
        textPaint.typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
        canvas.drawText("SUMMITBERBER - TRAIL REPORT", 30f, 48f, textPaint)
        
        // Status tag (Draft/Completed)
        paint.color = if (report.isDraft) Color.parseColor("#E65100") else Color.parseColor("#2E7D32")
        val statusText = if (report.isDraft) "DRAFT" else "COMPLETED"
        canvas.drawRoundRect(460f, 25f, 565f, 55f, 8f, 8f, paint)
        
        textPaint.color = Color.WHITE
        textPaint.textSize = 10f
        textPaint.typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
        textPaint.textAlign = Paint.Align.CENTER
        canvas.drawText(statusText, 512.5f, 43f, textPaint)
        textPaint.textAlign = Paint.Align.LEFT // reset
        
        // Metadata / Main info
        textPaint.color = Color.parseColor("#1C1D1A")
        textPaint.textSize = 18f
        textPaint.typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
        canvas.drawText(report.title, 30f, 120f, textPaint)
        
        textPaint.color = Color.parseColor("#5C5E57")
        textPaint.textSize = 12f
        textPaint.typeface = Typeface.create(Typeface.DEFAULT, Typeface.ITALIC)
        canvas.drawText("Region / Park: ${report.park}", 30f, 140f, textPaint)
        
        val sdf = SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.getDefault())
        canvas.drawText("Date: ${sdf.format(Date(report.timestamp))}", 30f, 155f, textPaint)
        
        // Divider
        paint.color = Color.parseColor("#E1E4D5")
        canvas.drawRect(30f, 170f, 565f, 172f, paint)
        
        // METRICS SECTION (Table style)
        textPaint.color = Color.parseColor("#2E7D32")
        textPaint.textSize = 14f
        textPaint.typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
        canvas.drawText("TRAIL METRICS", 30f, 200f, textPaint)
        
        // Draw standard Table boxes
        paint.color = Color.parseColor("#FFFFFF")
        canvas.drawRoundRect(30f, 215f, 565f, 275f, 8f, 8f, paint)
        paint.style = Paint.Style.STROKE
        paint.color = Color.parseColor("#C3C8BB")
        paint.strokeWidth = 1f
        canvas.drawRoundRect(30f, 215f, 565f, 275f, 8f, 8f, paint)
        paint.style = Paint.Style.FILL // reset
        
        // Grid vertical dividers
        canvas.drawLine(208.3f, 215f, 208.3f, 275f, paint)
        canvas.drawLine(386.6f, 215f, 386.6f, 275f, paint)
        
        // Fill Table Titles
        textPaint.color = Color.parseColor("#5C5E57")
        textPaint.textSize = 11f
        textPaint.typeface = Typeface.create(Typeface.DEFAULT, Typeface.NORMAL)
        canvas.drawText("Distance", 60f, 235f, textPaint)
        canvas.drawText("Duration", 238.3f, 235f, textPaint)
        canvas.drawText("Elevation Gain", 416.6f, 235f, textPaint)
        
        // Fill Table Values
        textPaint.color = Color.parseColor("#1C1D1A")
        textPaint.textSize = 16f
        textPaint.typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
        canvas.drawText("${report.distance} km", 60f, 260f, textPaint)
        canvas.drawText(report.duration, 238.3f, 260f, textPaint)
        canvas.drawText("${report.elevationGain} m", 416.6f, 260f, textPaint)
        
        // DESCRIPTION
        textPaint.color = Color.parseColor("#2E7D32")
        textPaint.textSize = 14f
        canvas.drawText("DESCRIPTION", 30f, 310f, textPaint)
        
        textPaint.color = Color.parseColor("#1C1D1A")
        textPaint.textSize = 11f
        textPaint.typeface = Typeface.create(Typeface.DEFAULT, Typeface.NORMAL)
        
        // Simple word wrap
        var y = 335f
        val words = report.description.split(" ")
        var line = ""
        for (word in words) {
            val testLine = if (line.isEmpty()) word else "$line $word"
            val width = textPaint.measureText(testLine)
            if (width > 535f) {
                canvas.drawText(line, 30f, y, textPaint)
                y += 18f
                line = word
            } else {
                line = testLine
            }
        }
        if (line.isNotEmpty()) {
            canvas.drawText(line, 30f, y, textPaint)
            y += 25f
        }
        
        // GPX LINK
        if (!report.gpxPath.isNullOrEmpty()) {
            paint.color = Color.parseColor("#EBF3E7")
            canvas.drawRoundRect(30f, y, 565f, y + 35f, 6f, 6f, paint)
            
            textPaint.color = Color.parseColor("#2E7D32")
            textPaint.textSize = 10f
            textPaint.typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
            canvas.drawText("ATTACHED GPX ROUTE DATA", 45f, y + 16f, textPaint)
            
            textPaint.color = Color.parseColor("#5C5E57")
            textPaint.typeface = Typeface.create(Typeface.DEFAULT, Typeface.NORMAL)
            val fileName = report.gpxPath.substringAfterLast("/")
            canvas.drawText("Linked file: $fileName", 45f, y + 28f, textPaint)
            
            y += 55f
        }
        
        // SIGNATURE / FOOTER at bottom
        textPaint.color = Color.parseColor("#8E9182")
        textPaint.textSize = 10f
        textPaint.typeface = Typeface.create(Typeface.DEFAULT, Typeface.NORMAL)
        canvas.drawText("Generated offline via SummitBerber V1 Mountain Productivity Suite.", 30f, 800f, textPaint)
        canvas.drawText("Page 1 of 1", 515f, 800f, textPaint)
        
        pdfDocument.finishPage(page)
        
        // Write to file
        val reportsDir = File(context.getExternalFilesDir(null), "Reports")
        if (!reportsDir.exists()) {
            reportsDir.mkdirs()
        }
        val cleanTitle = report.title.replace("\\s+".toRegex(), "_")
        val file = File(reportsDir, "Report_${cleanTitle}_${report.timestamp}.pdf")
        
        return try {
            pdfDocument.writeTo(FileOutputStream(file))
            pdfDocument.close()
            file
        } catch (e: Exception) {
            e.printStackTrace()
            pdfDocument.close()
            null
        }
    }
}
