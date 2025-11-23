$javaHome = 'C:\Program Files\Eclipse Adoptium\jdk-21.0.9.10-hotspot'
[Environment]::SetEnvironmentVariable('JAVA_HOME',$javaHome,'User')
$env:JAVA_HOME = $javaHome
$env:Path = "$javaHome\bin;" + $env:Path
Write-Host "JAVA_HOME set to $javaHome"
java -version
mvn -v
