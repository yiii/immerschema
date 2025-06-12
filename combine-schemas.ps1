# PowerShell Script to Combine JSON Schemas
param(
    [string]$SchemasPath = ".\schemas",
    [string]$OutputPath = ".\combined-schema.json"
)

Write-Host "Starting schema combination process..." -ForegroundColor Green

# Function to recursively find all schema files
function Get-SchemaFiles {
    param([string]$Path)
    
    $files = @()
    $items = Get-ChildItem -Path $Path -Recurse -File -Filter "*.json" | Where-Object {
        $_.Name -match "(schema\.json|\.enum\.json|\.taxonomy\.json)$"
    }
    
    return $items
}

# Function to convert file path to definition key
function ConvertTo-DefinitionKey {
    param([string]$FilePath)
    
    return $FilePath -replace '\\', '/' -replace '\.schema\.json$|\.enum\.json$|\.taxonomy\.json$|\.json$', '' -replace '[^a-zA-Z0-9]', '_'
}

# Function to resolve $ref references
function Resolve-References {
    param(
        [object]$Object,
        [string]$BasePath = "",
        [hashtable]$PathMap
    )
    
    if ($null -eq $Object -or $Object -is [string] -or $Object -is [int] -or $Object -is [bool]) {
        return $Object
    }
    
    if ($Object -is [array]) {
        $resolved = @()
        foreach ($item in $Object) {
            $resolved += Resolve-References -Object $item -BasePath $BasePath -PathMap $PathMap
        }
        return $resolved
    }
    
    $resolved = @{}
    foreach ($key in $Object.Keys) {
        if ($key -eq '$ref' -and $Object[$key] -is [string]) {
            $refPath = $Object[$key]
            if ($refPath.StartsWith('../') -or $refPath.StartsWith('./')) {
                # Resolve relative path
                $baseDir = Split-Path $BasePath -Parent
                $resolvedPath = Join-Path $baseDir $refPath -Resolve
                $relativePath = $PathMap[$resolvedPath]
                if ($relativePath) {
                    $defKey = ConvertTo-DefinitionKey -FilePath $relativePath
                    $resolved[$key] = "#/definitions/$defKey"
                } else {
                    $defKey = ConvertTo-DefinitionKey -FilePath $refPath
                    $resolved[$key] = "#/definitions/$defKey"
                }
            } elseif ($refPath.Contains('#/')) {
                # Handle fragment references
                $parts = $refPath -split '#/'
                if ($parts[0]) {
                    $defKey = ConvertTo-DefinitionKey -FilePath $parts[0]
                    $resolved[$key] = "#/definitions/$defKey/$($parts[1])"
                } else {
                    $resolved[$key] = "#/$($parts[1])"
                }
            } else {
                # Direct file reference
                $defKey = ConvertTo-DefinitionKey -FilePath $refPath
                $resolved[$key] = "#/definitions/$defKey"
            }
        } else {
            $resolved[$key] = Resolve-References -Object $Object[$key] -BasePath $BasePath -PathMap $PathMap
        }
    }
    return $resolved
}

# Main execution
try {
    if (-not (Test-Path $SchemasPath)) {
        throw "Schemas directory not found: $SchemasPath"
    }
    
    Write-Host "Finding schema files in: $SchemasPath" -ForegroundColor Yellow
    $schemaFiles = Get-SchemaFiles -Path $SchemasPath
    Write-Host "Found $($schemaFiles.Count) schema files" -ForegroundColor Cyan
    
    # Initialize combined schema
    $combinedSchema = @{
        '$schema' = 'http://json-schema.org/draft-07/schema#'
        '$id' = 'immerschema/combined-schema.json'
        'title' = 'Combined Immerschema - All Schemas'
        'description' = 'Complete schema combining all slices, enums, profiles, and project schemas'
        'definitions' = @{}
    }
    
    # Load all schemas
    $loadedSchemas = @()
    $pathMap = @{}
    
    foreach ($file in $schemaFiles) {
        try {
            Write-Host "Loading: $($file.Name)" -ForegroundColor Gray
            $content = Get-Content -Path $file.FullName -Raw | ConvertFrom-Json
            $relativePath = (Resolve-Path -Path $file.FullName -Relative) -replace '^\.\\', '' -replace '\\', '/'
            
            $schemaData = @{
                FilePath = $file.FullName
                RelativePath = $relativePath
                Schema = $content
                Id = if ($content.'$id') { $content.'$id' } else { $relativePath }
            }
            
            $loadedSchemas += $schemaData
            $pathMap[$file.FullName] = $relativePath
            
        } catch {
            Write-Warning "Error loading schema $($file.FullName): $($_.Exception.Message)"
        }
    }
    
    Write-Host "Loaded $($loadedSchemas.Count) schemas successfully" -ForegroundColor Cyan
    
    # Add each schema to definitions
    foreach ($schemaData in $loadedSchemas) {
        $defKey = ConvertTo-DefinitionKey -FilePath $schemaData.RelativePath
        
        # Create a clean copy of the schema without $id
        $cleanSchema = $schemaData.Schema.PSObject.Copy()
        if ($cleanSchema.'$id') {
            $cleanSchema.PSObject.Properties.Remove('$id')
        }
        
        # Resolve references
        $resolvedSchema = Resolve-References -Object $cleanSchema -BasePath $schemaData.RelativePath -PathMap $pathMap
        
        $combinedSchema.definitions[$defKey] = $resolvedSchema
        Write-Host "Added definition: $defKey" -ForegroundColor Green
    }
    
    # Add main project schemas as top-level properties
    $projectSchemas = $loadedSchemas | Where-Object { $_.RelativePath.StartsWith('schemas/project.') -or $_.RelativePath.StartsWith('project.') }
    
    if ($projectSchemas.Count -gt 0) {
        $combinedSchema.properties = @{}
        $combinedSchema.oneOf = @()
        
        foreach ($projectSchema in $projectSchemas) {
            $propName = (Split-Path $projectSchema.RelativePath -Leaf) -replace 'project\.' -replace '\.schema\.json$'
            $defKey = ConvertTo-DefinitionKey -FilePath $projectSchema.RelativePath
            
            $combinedSchema.properties[$propName] = @{ '$ref' = "#/definitions/$defKey" }
            $combinedSchema.oneOf += @{ '$ref' = "#/definitions/$defKey" }
        }
    }
    
    # Save combined schema
    $output = $combinedSchema | ConvertTo-Json -Depth 50
    $output | Out-File -FilePath $OutputPath -Encoding UTF8
    
    Write-Host "`nCombined schema saved to: $OutputPath" -ForegroundColor Green
    Write-Host "Total definitions: $($combinedSchema.definitions.Count)" -ForegroundColor Cyan
    
    # Print summary by category
    $categories = @{}
    foreach ($key in $combinedSchema.definitions.Keys) {
        $category = $key.Split('_')[0]
        if ($categories.ContainsKey($category)) {
            $categories[$category]++
        } else {
            $categories[$category] = 1
        }
    }
    
    Write-Host "`nSchema categories:" -ForegroundColor Yellow
    foreach ($category in $categories.Keys | Sort-Object) {
        Write-Host "  $category`: $($categories[$category]) schemas" -ForegroundColor White
    }
    
    Write-Host "`nSchema combination completed successfully!" -ForegroundColor Green
    
} catch {
    Write-Error "Error during schema combination: $($_.Exception.Message)"
    exit 1
} 