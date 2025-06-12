# Script to mass update test files with correct technique values and required fields
$ErrorActionPreference = "Stop"

# Define the test directories to process
$testDirs = @(
    "test",
    "tests"
)

# Define the technique mappings
$techniqueMappings = @{
    "cgi_3d_pre_render" = "3d_render"
    "cgi_3d_realtime" = "3d_realtime"
    "volumetric_capture" = "capture_volumetric"
    "photogrammetry" = "capture_photogrammetry"
    "hand_drawn_2d" = "2d_hand_drawn"
    "vector_2d" = "2d_shape_animation"
    "cutout_animation" = "2d_shape_animation"
    "motion_graphics" = "2d_montage"
    "info_graphics" = "2d_info_graphics"
    "procedural_geometry" = "gen_procedural"
    "particle_system" = "gen_particle"
    "fractal_render" = "gen_procedural"
    "data_driven_visual" = "gen_data_viz"
    "fluid_sim" = "sim_fluid"
    "smoke_fire_sim" = "sim_smoke_fire"
    "cloth_softbody_sim" = "sim_cloth_softbody"
    "ai_image" = "ai_generate"
    "ai_video" = "ai_generate"
    "style_transfer" = "ai_style_transfer"
    "live_action_plate" = "capture_video"
    "macro_photography" = "capture_video"
    "timelapse" = "capture_video"
    "stereo_3d_capture" = "capture_volumetric"
    "mixed_media_collage" = "2d_video_collage"
    "cel_shaded" = "3d_render"
    "toon_shader" = "3d_render"
    "stop_motion" = "capture_video"
    "audio_reactive" = "gen_audio_reactive"
    "music_visualizer" = "gen_audio_reactive"
}

# Define tech group mappings
$techGroupMappings = @{
    "3d_render" = "3D"
    "3d_realtime" = "3D"
    "capture_video" = "CAP"
    "capture_volumetric" = "CAP"
    "capture_photogrammetry" = "CAP"
    "capture_360" = "CAP"
    "capture_stock" = "CAP"
    "rig_animation" = "3D"
    "mocap_performance" = "3D"
    "2d_montage" = "2D"
    "2d_multiscreen" = "2D"
    "2d_video_collage" = "2D"
    "2d_hand_drawn" = "2D"
    "2d_shape_animation" = "2D"
    "2d_info_graphics" = "2D"
    "2d_typography" = "2D"
    "gen_procedural" = "GEN"
    "gen_particle" = "GEN"
    "gen_data_viz" = "GEN"
    "gen_audio_reactive" = "GEN"
    "gen_generative_art" = "GEN"
    "sim_fluid" = "SIM"
    "sim_smoke_fire" = "SIM"
    "sim_cloth_softbody" = "SIM"
    "ai_generate" = "AI"
    "ai_style_transfer" = "AI"
    "ai_avatar" = "AI"
    "ai_face_swap" = "AI"
}

function Update-JsonFile {
    param (
        [string]$FilePath
    )

    Write-Host "Processing $FilePath"
    
    try {
        # Read and parse JSON
        $json = Get-Content $FilePath -Raw | ConvertFrom-Json

        # If this is a test suite (has a 'tests' array), process each test
        if ($json.PSObject.Properties.Name -contains 'tests') {
            foreach ($test in $json.tests) {
                # If the schema path is for the technique slice, replace data with only allowed properties
                if ($test.schema -and $test.schema -like '*technique.slice.schema.json*') {
                    $data = $test.data
                    $primary = $null
                    $other = @()
                    if ($data.PSObject.Properties.Name -contains 'primaryTechnique') {
                        $primary = $data.primaryTechnique
                    }
                    if ($data.PSObject.Properties.Name -contains 'otherTechniques') {
                        $other = $data.otherTechniques
                    }
                    $test.data = @{ primaryTechnique = $primary; otherTechniques = $other }
                }
            }
        }

        # Function to recursively update objects
        function Update-Object {
            param (
                [PSCustomObject]$obj
            )

            $obj.PSObject.Properties | ForEach-Object {
                if ($_.Value -is [PSCustomObject]) {
                    Update-Object $_.Value
                }
                elseif ($_.Value -is [Array]) {
                    for ($i = 0; $i -lt $_.Value.Count; $i++) {
                        if ($_.Value[$i] -is [PSCustomObject]) {
                            Update-Object $_.Value[$i]
                        }
                    }
                }
                elseif ($_.Name -eq "primaryTechnique" -and $_.Value -in $techniqueMappings.Keys) {
                    $newTechnique = $techniqueMappings[$_.Value]
                    Write-Host "  Updating technique: $($_.Value) -> $newTechnique"
                    $obj.$($_.Name) = $newTechnique
                }
                elseif ($_.Name -eq "otherTechniques" -and $_.Value -is [Array]) {
                    for ($i = 0; $i -lt $_.Value.Count; $i++) {
                        if ($_.Value[$i] -in $techniqueMappings.Keys) {
                            $newTechnique = $techniqueMappings[$_.Value[$i]]
                            Write-Host "  Updating otherTechnique: $($_.Value[$i]) -> $newTechnique"
                            $_.Value[$i] = $newTechnique
                        }
                    }
                }
            }
        }

        # Update the JSON object
        Update-Object $json

        # Add description if missing
        if (-not $json.PSObject.Properties.Name.Contains("description")) {
            $json | Add-Member -NotePropertyName "description" -NotePropertyValue "A test shot for schema validation"
            Write-Host "  Added description"
        }

        # Convert back to JSON with proper formatting
        $json | ConvertTo-Json -Depth 10 | Set-Content $FilePath
        Write-Host "✅ Updated $FilePath"
    }
    catch {
        Write-Host "❌ Error processing $FilePath : $_"
    }
}

# Process all JSON files in test directories
foreach ($dir in $testDirs) {
    if (Test-Path $dir) {
        Get-ChildItem -Path $dir -Filter "*.json" -Recurse | ForEach-Object {
            Update-JsonFile $_.FullName
        }
    }
}

Write-Host "`n�� Update Complete" 