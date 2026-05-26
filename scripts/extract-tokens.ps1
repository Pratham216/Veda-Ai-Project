$ErrorActionPreference = "Stop"
$root = "C:\Users\prath\OneDrive\Desktop\Veda Ai"
$json = Get-Content "$root\figma-nodes.json" -Raw | ConvertFrom-Json
$colors = @{}
$fonts = @{}
$texts = @{}

function ToHex($c) {
    $r = [int]([math]::Round($c.r * 255))
    $g = [int]([math]::Round($c.g * 255))
    $b = [int]([math]::Round($c.b * 255))
    $a = if ($null -ne $c.a) { $c.a } else { 1 }
    if ($a -lt 1) {
        "#{0:X2}{1:X2}{2:X2} ({3:N2})" -f $r,$g,$b,$a
    } else {
        "#{0:X2}{1:X2}{2:X2}" -f $r,$g,$b
    }
}

function Walk($node, $frame) {
    if ($node.fills) {
        foreach ($f in $node.fills) {
            if ($f.type -eq "SOLID" -and $f.color) {
                $hex = ToHex $f.color
                if (-not $colors.ContainsKey($hex)) { $colors[$hex] = 0 }
                $colors[$hex]++
            }
        }
    }
    if ($node.strokes) {
        foreach ($f in $node.strokes) {
            if ($f.type -eq "SOLID" -and $f.color) {
                $hex = ToHex $f.color
                $key = "stroke $hex"
                if (-not $colors.ContainsKey($key)) { $colors[$key] = 0 }
                $colors[$key]++
            }
        }
    }
    if ($node.style -and $node.style.fontFamily) {
        $k = "$($node.style.fontFamily) $($node.style.fontWeight) $($node.style.fontSize)px"
        if (-not $fonts.ContainsKey($k)) { $fonts[$k] = 0 }
        $fonts[$k]++
    }
    if ($node.type -eq "TEXT" -and $node.characters) {
        $t = $node.characters
        if ($t.Length -lt 200 -and -not $texts.ContainsKey($t)) {
            $texts[$t] = $frame
        }
    }
    if ($node.children) {
        foreach ($c in $node.children) { Walk $c $frame }
    }
}

foreach ($p in $json.nodes.PSObject.Properties) {
    $doc = $p.Value.document
    Walk $doc $doc.name
}

"=== COLORS (by usage) ==="
$colors.GetEnumerator() | Sort-Object -Property Value -Descending | Select-Object -First 30 | ForEach-Object { "  $($_.Value.ToString().PadLeft(4)) :: $($_.Key)" }

""
"=== FONTS ==="
$fonts.GetEnumerator() | Sort-Object -Property Value -Descending | ForEach-Object { "  $($_.Value.ToString().PadLeft(4)) :: $($_.Key)" }

""
"=== UNIQUE TEXTS (sample) ==="
$texts.GetEnumerator() | Select-Object -First 80 | ForEach-Object { "  [$($_.Value)] $($_.Key)" }
