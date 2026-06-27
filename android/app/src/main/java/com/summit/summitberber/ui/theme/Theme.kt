package com.summit.summitberber.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val LightColorScheme = lightColorScheme(
    primary = Color(0xFF2E7D32), // Forest Green
    onPrimary = Color(0xFFFFFFFF),
    primaryContainer = Color(0xFFC3C8BB),
    secondary = Color(0xFF795548), // Earthy Brown
    onSecondary = Color(0xFFFFFFFF),
    background = Color(0xFFF7FBF0), // Clean off-white
    onBackground = Color(0xFF1C1D1A),
    surface = Color(0xFFF7FBF0),
    onSurface = Color(0xFF1C1D1A),
    surfaceVariant = Color(0xFFE1E4D5),
    onSurfaceVariant = Color(0xFF44483D)
)

private val DarkColorScheme = darkColorScheme(
    primary = Color(0xFF81C784), // Lightened Forest Green
    onPrimary = Color(0xFF00390A),
    background = Color(0xFF12140E),
    onBackground = Color(0xFFE2E3DC),
    surface = Color(0xFF12140E),
    onSurface = Color(0xFFE2E3DC),
    secondary = Color(0xFFD7CCC8),
    onSecondary = Color(0xFF3E2723)
)

@Composable
fun SummitBerberTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        content = content
    )
}
