$f = 'c:\Users\admin\new project\gigora\frontend\src\pages\Home.jsx'
$arr = [System.IO.File]::ReadAllLines($f)
$arr[248] = '      </section>'
[System.IO.File]::WriteAllLines($f, $arr)
Write-Host "Done"
