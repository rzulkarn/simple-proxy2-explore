function FindProxyForURL(url, host)
{
    // If hostname matches.... 
    if (shExpMatch(host, "*.labelindo.com") ||
        isInNet(myIpAddress(), "10.10.10.0", "255.255.255.0")) {
       return "PROXY 127.0.0.1:3000";
    }
    return "DIRECT";
}
