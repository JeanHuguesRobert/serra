# list-dir.ps1 - Generate directory structure markdown file
#
# Usage: .\utils\list-dir.ps1

$rootPath = Get-Location
$output = New-Object System.Collections.Generic.List[string]

function Write-TreeNode {
    param (
        [string]$path,
        [int]$level
    )
    
    $indent = "  " * $level
    $items = Get-ChildItem -Path $path -ErrorAction SilentlyContinue | 
        Where-Object { $_.Name -notmatch "^(node_modules|dist|\.git|\.next|\.cache|\.vs)$" } |
        Sort-Object { $_.PSIsContainer }, Name
    
    foreach ($item in $items) {
        if ($item.PSIsContainer) {
            $output.Add("$indent- **$($item.Name)/**")
            Write-TreeNode -path $item.FullName -level ($level + 1)
        } else {
            $output.Add("$indent- $($item.Name)")
        }
    }
}

# Add Markdown header and metadata
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$output.Add("<!-- File generated on: $timestamp -->")
$output.Add("<!-- Project: Serra -->")
$output.Add("<!-- Directory: $rootPath -->")
$output.Add("")
$output.Add("# Project Structure")
$output.Add("")

# Generate tree
Write-TreeNode -path $rootPath -level 0

# Write output
$output | Out-File -FilePath ".\docs\FILES.md" -Encoding UTF8