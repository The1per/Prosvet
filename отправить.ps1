# Отправка репозитория сайта на GitHub.
#
# Всё до этого уже сделано: git init, фиксация, ветка main. Осталась отправка,
# а она требует входа в ваш GitHub -- сделать это за вас нельзя.
#
# 1. Создать ПУСТОЙ репозиторий на github.com/new
#    (можно приватный; НЕ ставить галочки Add README / .gitignore / license --
#     иначе репозиторий будет непустым и отправка упрётся в расхождение)
#
# 2. Запустить отсюда:
#
#    .\отправить.ps1 https://github.com/ВЫ/имя-репозитория.git
#
# При первой отправке откроется окно входа в GitHub. Дальше пароль спрашивать
# не будет: помощник запомнит.

param([Parameter(Mandatory = $true)][string]$Адрес)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

if ($Адрес -notmatch '^https://github\.com/.+/.+') {
  throw "адрес должен быть вида https://github.com/ВЫ/имя.git — было «$Адрес»"
}

# Проверка, что не отправляем лишнего: прибора здесь быть не должно
$лишнее = Get-ChildItem -Recurse -File -Include *.py, *_rule.md -ErrorAction SilentlyContinue |
          Where-Object { $_.FullName -notmatch 'node_modules' }
if ($лишнее) {
  Write-Output "СТОП. В папке нашлись файлы прибора — отправлять нельзя:"
  $лишнее | ForEach-Object { Write-Output "  $($_.FullName)" }
  throw "уберите их и запустите снова"
}

if (git remote 2>$null) { git remote remove origin }
git remote add origin $Адрес
git branch -M main

Write-Output ""
Write-Output "Отправляю. Если откроется окно входа в GitHub — войдите."
git push -u origin main
if ($LASTEXITCODE -ne 0) { throw "отправка не прошла" }

Write-Output ""
Write-Output "=========================================================="
Write-Output "ГОТОВО. Дальше:"
Write-Output ""
Write-Output "  cloudflare.com -> Workers & Pages -> Create -> Pages"
Write-Output "  -> Connect to Git -> выбрать этот репозиторий"
Write-Output ""
Write-Output "  Framework preset:  Vite"
Write-Output "  Build command:     npm run build"
Write-Output "  Build output:      dist"
Write-Output ""
Write-Output "  Потом Custom domains -> ваш домен."
Write-Output "=========================================================="
