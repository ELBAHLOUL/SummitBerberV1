package com.summit.summitberber.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "reports")
data class Report(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val title: String,
    val park: String,
    val description: String,
    val distance: Double,
    val duration: String, // format "H:M"
    val elevationGain: Int, // in meters
    val gpxPath: String?,
    val imagesJson: String, // serialized image data (list of paths & captions)
    val timestamp: Long,
    val isDraft: Boolean
)
