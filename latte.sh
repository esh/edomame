#!/bin/sh

java -server -Xms24m -Xmx24m -server -classpath lib/latte.jar:lib/jetty-6.1.12rc1.jar:lib/jetty-util-6.1.12rc1.jar:lib/servlet-api-2.5-6.1.12rc1.jar:lib/commons-pool-1.4.jar:lib/commons-beanutils-1.8.0.jar:lib/commons-codec-1.3.jar:lib/commons-logging-1.1.1.jar:lib/log4j-1.2.15.jar:lib/js.jar:lib/sqlitejdbc-v056.jar org.latte.Run $@
