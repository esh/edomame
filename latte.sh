#!/bin/sh

java -classpath lib/latte.jar:lib/jetty-6.1.12rc1.jar:lib/jetty-util-6.1.12rc1.jar:lib/servlet-api-2.5-6.1.12rc1.jar:lib/commons-codec-1.4.jar:lib/twitter4j-core-2.1.2.jar:lib/js.jar:app:scripts org.latte.Run $@
