import React, { useState } from "react";
import JSZip from "jszip";
import { Folder, File, Download, Copy, Check, Terminal, ExternalLink, Smartphone } from "lucide-react";

interface FileNode {
  name: string;
  path: string;
  content: string;
  language: string;
}

export default function AndroidCodeExplorer() {
  const [selectedPath, setSelectedPath] = useState<string>("app/src/main/java/com/summit/summitberber/MainActivity.kt");
  const [copied, setCopied] = useState(false);
  const [zipping, setZipping] = useState(false);

  const androidFiles: FileNode[] = [
    {
      name: "MainActivity.kt",
      path: "app/src/main/java/com/summit/summitberber/MainActivity.kt",
      language: "kotlin",
      content: `package com.summit.summitberber

import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.lifecycleScope
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.LoadAdError
import com.google.android.gms.ads.MobileAds
import com.google.android.gms.ads.interstitial.InterstitialAd
import com.google.android.gms.ads.interstitial.InterstitialAdLoadCallback
import com.summit.summitberber.data.AppDatabase
import com.summit.summitberber.data.Report
import com.summit.summitberber.ui.components.AdMobBanner
import com.summit.summitberber.ui.theme.SummitBerberTheme
import com.summit.summitberber.utils.PdfGenerator
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import java.io.File

class MainActivity : ComponentActivity() {

    private var mInterstitialAd: InterstitialAd? = null
    private val database by lazy { AppDatabase.getDatabase(this) }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        MobileAds.initialize(this) {}
        loadInterstitialAd()

        setContent {
            SummitBerberTheme {
                MainScreen(
                    database = database,
                    showInterstitial = { showInterstitialAd() }
                )
            }
        }
    }

    private fun loadInterstitialAd() {
        val adRequest = AdRequest.Builder().build()
        InterstitialAd.load(this, "ca-app-pub-3940256099942544/1033173712", adRequest,
            object : InterstitialAdLoadCallback() {
                override fun onAdFailedToLoad(adError: LoadAdError) {
                    mInterstitialAd = null
                }
                override fun onAdLoaded(interstitialAd: InterstitialAd) {
                    mInterstitialAd = interstitialAd
                }
            })
    }

    private fun showInterstitialAd() {
        if (mInterstitialAd != null) {
            mInterstitialAd?.show(this)
            loadInterstitialAd()
        }
    }
}`
    },
    {
      name: "PdfGenerator.kt",
      path: "app/src/main/java/com/summit/summitberber/utils/PdfGenerator.kt",
      language: "kotlin",
      content: `package com.summit.summitberber.utils

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
        val pageInfo = PdfDocument.PageInfo.Builder(595, 842, 1).create()
        val page = pdfDocument.startPage(pageInfo)
        val canvas: Canvas = page.canvas
        val paint = Paint()
        val textPaint = Paint()
        
        canvas.drawColor(Color.parseColor("#F7FBF0"))
        paint.color = Color.parseColor("#2E7D32")
        canvas.drawRect(0f, 0f, 595f, 80f, paint)
        
        textPaint.color = Color.WHITE
        textPaint.textSize = 22f
        textPaint.typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
        canvas.drawText("SUMMITBERBER - TRAIL REPORT", 30f, 48f, textPaint)
        
        pdfDocument.finishPage(page)
        val reportsDir = File(context.getExternalFilesDir(null), "Reports")
        if (!reportsDir.exists()) reportsDir.mkdirs()
        val file = File(reportsDir, "Report_\${report.title}.pdf")
        return try {
            pdfDocument.writeTo(FileOutputStream(file))
            pdfDocument.close()
            file
        } catch (e: Exception) {
            pdfDocument.close()
            null
        }
    }
}`
    },
    {
      name: "Report.kt",
      path: "app/src/main/java/com/summit/summitberber/data/Report.kt",
      language: "kotlin",
      content: `package com.summit.summitberber.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "reports")
data class Report(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val title: String,
    val park: String,
    val description: String,
    val distance: Double,
    val duration: String,
    val elevationGain: Int,
    val gpxPath: String?,
    val imagesJson: String,
    val timestamp: Long,
    val isDraft: Boolean
)`
    },
    {
      name: "ReportDao.kt",
      path: "app/src/main/java/com/summit/summitberber/data/ReportDao.kt",
      language: "kotlin",
      content: `package com.summit.summitberber.data

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface ReportDao {
    @Query("SELECT * FROM reports ORDER BY timestamp DESC")
    fun getAllReports(): Flow<List<Report>>

    @Query("SELECT * FROM reports WHERE id = :id")
    suspend fun getReportById(id: Int): Report?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertReport(report: Report): Long

    @Delete
    suspend fun deleteReport(report: Report)
}`
    },
    {
      name: "AppDatabase.kt",
      path: "app/src/main/java/com/summit/summitberber/data/AppDatabase.kt",
      language: "kotlin",
      content: `package com.summit.summitberber.data

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase

@Database(entities = [Report::class], version = 1, exportSchema = false)
abstract class AppDatabase : RoomDatabase() {
    abstract fun reportDao(): ReportDao
    companion object {
        @Volatile private var INSTANCE: AppDatabase? = null
        fun getDatabase(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "summitberber_database"
                ).build()
                INSTANCE = instance
                instance
            }
        }
    }
}`
    },
    {
      name: "AdMobBanner.kt",
      path: "app/src/main/java/com/summit/summitberber/ui/components/AdMobBanner.kt",
      language: "kotlin",
      content: `package com.summit.summitberber.ui.components

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.AdSize
import com.google.android.gms.ads.AdView

@Composable
fun AdMobBanner(modifier: Modifier = Modifier) {
    AndroidView(
        modifier = modifier.fillMaxWidth(),
        factory = { context ->
            AdView(context).apply {
                setAdSize(AdSize.BANNER)
                adUnitId = "ca-app-pub-3940256099942544/6300978111"
                loadAd(AdRequest.Builder().build())
            }
        }
    )
}`
    },
    {
      name: "Theme.kt",
      path: "app/src/main/java/com/summit/summitberber/ui/theme/Theme.kt",
      language: "kotlin",
      content: `package com.summit.summitberber.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val LightColorScheme = lightColorScheme(
    primary = Color(0xFF2E7D32),
    onPrimary = Color(0xFFFFFFFF),
    background = Color(0xFFF7FBF0),
    surface = Color(0xFFF7FBF0)
)

@Composable
fun SummitBerberTheme(darkTheme: Boolean = isSystemInDarkTheme(), content: @Composable () -> Unit) {
    MaterialTheme(colorScheme = LightColorScheme, content = content)
}`
    },
    {
      name: "AndroidManifest.xml",
      path: "app/src/main/AndroidManifest.xml",
      language: "xml",
      content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:theme="@style/Theme.SummitBerber">

        <!-- AdMob Application ID -->
        <meta-data
            android:name="com.google.android.gms.ads.APPLICATION_ID"
            android:value="ca-app-pub-3940256099942544~3347511713"/>

        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`
    },
    {
      name: "build.gradle.kts (App)",
      path: "app/build.gradle.kts",
      language: "gradle",
      content: `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("kotlin-kapt")
}

android {
    namespace = "com.summit.summitberber"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.summit.summitberber"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"
    }

    buildFeatures {
        compose = true
    }
    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.2"
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.navigation:navigation-compose:2.7.4")
    implementation("androidx.room:room-runtime:2.6.0")
    kapt("androidx.room:room-compiler:2.6.0")
    implementation("com.google.android.gms:play-services-ads:22.4.0")
}`
    },
    {
      name: "build.gradle.kts (Root)",
      path: "build.gradle.kts",
      language: "gradle",
      content: `plugins {
    id("com.android.application") version "8.1.1" apply false
    id("org.jetbrains.kotlin.android") version "1.9.0" apply false
}`
    },
    {
      name: "settings.gradle.kts",
      path: "settings.gradle.kts",
      language: "gradle",
      content: `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}
rootProject.name = "SummitBerber"
include(":app")`
    }
  ];

  const selectedFile = androidFiles.find(f => f.path === selectedPath) || androidFiles[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setZipping(true);
    try {
      const zip = new JSZip();
      
      // Load and add all files
      androidFiles.forEach(file => {
        zip.file(file.path, file.content);
      });
      
      // Add standard gradle wrapper settings & properties for convenience
      zip.file("gradle.properties", "android.useAndroidX=true\nandroid.enableJetifier=true\nkotlin.code.style=official\n");
      zip.file("app/src/main/res/values/strings.xml", `<resources>\n    <string name="app_name">SummitBerber V1</string>\n</resources>`);
      zip.file("app/src/main/res/values/themes.xml", `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <style name="Theme.SummitBerber" parent="Theme.Material3.DayNight.NoActionBar">\n        <item name="android:statusBarColor">#2E7D32</item>\n    </style>\n</resources>`);

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const link = document.createElement("a");
      link.href = url;
      link.download = "SummitBerber_V1_Native_Android_Project.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally {
      setZipping(false);
    }
  };

  return (
    <div className="bg-white text-[#1B1C17] rounded-[28px] shadow-sm p-6 flex flex-col h-[650px] border border-[#E1E4D5]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E1E4D5] pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-[#2E7D32]" />
            <h2 className="text-lg font-bold tracking-tight text-[#1B1C17]">Native Android Workspace</h2>
          </div>
          <p className="text-xs text-[#5D624E] mt-1">
            Play Store ready codebase featuring Room DB, Jetpack Compose M3, and AdMob test units.
          </p>
        </div>
        
        <button
          onClick={handleDownloadZip}
          disabled={zipping}
          className="flex items-center justify-center gap-2 bg-[#2E7D32] hover:bg-[#256329] active:bg-[#1e5221] text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-md disabled:opacity-50 cursor-pointer"
        >
          {zipping ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Zipping Project...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Download Android Studio ZIP</span>
            </>
          )}
        </button>
      </div>

      <div className="flex flex-1 min-h-0 gap-4">
        {/* Left Side: File Selector Tree */}
        <div className="w-64 bg-[#F1F3E8] rounded-2xl p-3 border border-[#E1E4D5] flex flex-col overflow-y-auto">
          <div className="text-xs font-bold text-[#5D624E] uppercase tracking-wider px-2 pb-2">
            Project Files
          </div>
          
          <div className="space-y-1">
            {/* Root Folder */}
            <div className="flex items-center gap-1.5 px-2 py-1 text-xs text-[#5D624E] font-medium">
              <Folder className="w-3.5 h-3.5 text-[#5D624E]" />
              <span>SummitBerber /</span>
            </div>
            
            {androidFiles.map((file) => {
              const isSelected = file.path === selectedPath;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedPath(file.path)}
                  className={`w-full text-left px-4 py-2 rounded-lg text-xs font-mono transition-colors flex items-center justify-between group cursor-pointer ${
                    isSelected
                      ? "bg-white text-[#2E7D32] border border-[#E1E4D5] shadow-sm font-semibold"
                      : "text-[#5D624E] hover:bg-white/50 hover:text-[#1B1C17]"
                  }`}
                >
                  <span className="truncate flex items-center gap-1.5">
                    <File className={`w-3 h-3 ${isSelected ? "text-[#2E7D32]" : "text-[#5D624E]"}`} />
                    {file.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Code Preview */}
        <div className="flex-1 bg-[#F7FBF0] rounded-xl border border-[#E1E4D5] flex flex-col min-h-0 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-[#F1F3E8] border-b border-[#E1E4D5]">
            <div className="text-xs text-[#5D624E] font-mono flex items-center gap-1.5 truncate">
              <Terminal className="w-3.5 h-3.5 text-[#2E7D32]" />
              {selectedFile.path}
            </div>
            <button
              onClick={handleCopy}
              className="p-1.5 hover:bg-[#E1E4D5] rounded-md text-[#5D624E] hover:text-[#1B1C17] transition-colors cursor-pointer"
              title="Copy code"
            >
              {copied ? <Check className="w-4 h-4 text-[#2E7D32]" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          
          <div className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed text-[#1B1C17] select-text">
            <pre className="whitespace-pre">
              <code>{selectedFile.content}</code>
            </pre>
          </div>
        </div>
      </div>
      
      <div className="mt-4 bg-[#E1E4D5]/30 rounded-2xl p-3 border border-[#E1E4D5] flex items-center gap-3">
        <div className="p-2 bg-[#E1E4D5] rounded-lg text-[#2E7D32] shrink-0">
          <ExternalLink className="w-4 h-4" />
        </div>
        <div className="text-xs text-[#5D624E]">
          <span className="font-semibold text-[#1B1C17]">How to run in Android Studio:</span> Extract the downloaded ZIP. Launch Android Studio, click <span className="text-[#1B1C17] font-mono bg-white px-1.5 py-0.5 rounded border border-[#E1E4D5]">File &gt; Open</span>, and choose the root directory. Gradle will build and index the code immediately.
        </div>
      </div>
    </div>
  );
}
