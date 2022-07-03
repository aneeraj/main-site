#!/bin/bash
#
#--Update SSL certificates

STEP_HOME=/opt/stibo/step
HTTPD_HOME=/etc/httpd/conf.d
CERTNAME=wildcard.scloud.stibo.com.crt
CERTNAME2=wildcard.scloud.stibo.com.pem
URL=https://zahktest.s3.ap-south-1.amazonaws.com/SSLcert/$CERTNAME    #New SSL Cert (apache)
URL2=https://zahktest.s3.ap-south-1.amazonaws.com/SSLcert/$CERTNAME2    #New SSL Cert (haproxy)
JCONF=step-jetty-proxy-https.conf
#CERT_NAME=scloud.stibo.com-wildcard.crt
NOW=$(date +"%m-%d-%Y")
SCONF=$( sudo grep "^@include.*sharedconfig.properties" $STEP_HOME/config.properties | awk {'print $2'} )
WORKAREA=$( dirname $SCONF )
yum install wget -y



scloud_httpd() {
cd $WORKAREA
LBURL=$( sudo grep "^System.Servers.*scloud.stibo.com" sharedconfig.properties | awk -F"=" {'print $2'} )
echo "Loadbalancer URL is: $LBURL"
cd $HTTPD_HOME
CertPath=$( grep "SSLCertificateFile" $JCONF | grep -v "#" | awk {'print $2'} | tr  "'\"" " " )
echo "Certificate path is: $CertPath"
filename=$( basename $CertPath )
dirname=$( dirname $CertPath )
if [[ -z $filename || -z $dirname ]] ;then
ech "Could not find certificate file or directory path, exiting.."
exit
fi
wget -q $URL -P /tmp
if [ $? -eq 0 ];then
echo "Certificate downloaded successfully.."
cd $dirname
	if [ ! -f "$filename"_old_"$NOW" ];then
	sudo cp "$filename" "$filename"_old_"$NOW"
	fi
cat /tmp/$CERTNAME | sudo tee $filename
  if [ $? -eq 0 ];then
	sudo httpd -t
    sudo systemctl reload httpd
	echo "Certificate replaced successfully.."
  else
    echo "Certificate replace failed, exiting!!!"
    exit
  fi
else
echo "Certificate download failed, exiting!!!"
exit
fi
}

scloud_haproxy() {
cd $WORKAREA
LBURL=$( sudo grep System.LoadBalancer.URI.*scloud.stibo.com  $SCONF | awk -F"//" {'print $2'} )
echo "Loadbalancer URL is: $LBURL"
CertPath=$( grep ^System.LoadBalancer.Certificate.File $SCONF | awk -F"="  {'print $2'} | tr  "'\"" " " )
echo "Certificate path is: $CertPath"
filename=$( basename $CertPath )
dirname=$( dirname $CertPath )
if [[ -z $filename || -z $dirname ]] ;then
ech "Could not find certificate file or directory path, exiting.."
exit
fi
wget -q $URL2 -P /tmp
cd $dirname
if [ ! -f "$filename"_old_"$NOW" ];then
sudo cp "$filename" "$filename"_old_"$NOW"
fi
cat /tmp/$CERTNAME2 | sudo tee $filename
 if [ $? -eq 0 ];then
    echo "Certificate replaced successfully.."
  else
    echo "Certificate replace failed, exiting!!!"
    exit
  fi
}

#Is scloud?
if [[ $( sudo grep "^System.Servers.*scloud.stibo.com"  $SCONF ) ]] || [[ $( sudo grep System.LoadBalancer.URI.*scloud.stibo.com  $SCONF ) ]] ; then
echo "This system is using scloud certificate"
EXP=$( echo | openssl s_client -showcerts -servername localhost -connect localhost:443 2>/dev/null | openssl x509 -inform pem -noout -dates | grep notAfter | awk -F"=" {'print $2'}   )
echo "SSL Expiry date for the currently installed (local) certificate is : $EXP"
if [[ "$EXP" == "Jul 16 14:43:31 2023 GMT" ]];then
echo SSL is already updated.. Exiting
exit
fi
else
echo "This system is not using scloud certificate, nothing to do.."
exit
fi

#check webserver
if ( sudo systemctl is-active --quiet httpd ) ;then
HTTPD=1
echo "System is running on Apache HTTPD"
scloud_httpd
elif [[ $( sudo grep ^System.LoadBalancer.Certificate.File $SCONF ) ]]; then
HAPROXY=1
echo "System is running on Apache HaProxy"
scloud_haproxy
else
echo "Unknown webserver, exiting script..."
exit
fi



#echo "New expiry: ALB cert.."
#echo | openssl s_client -showcerts -servername $LBURL -connect $LBURL:443 2>/dev/null | openssl x509 -inform pem -noout -dates
echo "------"
echo "New expiry: Local cert.."
sudo touch $CertPath
#sleep 5
echo | openssl s_client -showcerts -servername localhost -connect localhost:443 2>/dev/null | openssl x509 -inform pem -noout -dates
echo "----"

rm -f /tmp/wildcard*

exit 0
