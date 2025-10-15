

start "regional server 1" cmd /K "cd /d C:\users\mzaman\GIT\CKKS\CKKS-DEMO\regional_server && node index"

start "regional server 2" cmd /K "cd /d C:\users\mzaman\GIT\CKKS\CKKS-DEMO\regional_server2 && node index"

start "send data to regional server 1" cmd /K "cd /d C:\users\mzaman\GIT\CKKS\CKKS-DEMO\send_data && node send-data"

start "send data to regional server 2" cmd /K "cd /d C:\users\mzaman\GIT\CKKS\CKKS-DEMO\send_data2 && node send-data2"

start "aggregation server" cmd /K "cd /d C:\users\mzaman\GIT\CKKS\CKKS-DEMO\aggregation_server && node index"

start "trusted authority server" cmd /K "cd /d C:\users\mzaman\GIT\CKKS\CKKS-DEMO\trusted_authority && node index"



