@echo off
title p2227自制的JS压缩工具，基于YUI
cd %~dp0

REM p2227自制的JS压缩工具，基于YUI
REM 配置环境:j java bin的目录，只安装myeclipse的话，默认是不会配置在PATH中的
REM 配置环境:y YUIcompressor的目录
REM 配置环境:p 压缩来源的目录
REM 配置环境:f 生成文件名
REM 配置环境:t 临时文件名（一般不需要配置）


set j=E:\Genuitec\Common\binary\com.sun.java.jdk.win32.x86_1.6.0.013\bin\
set y=F:\Program\Solutions\YUI\yuicompressor-2.4.8.jar
set p=F:\Program\MyTest\easyValidator\src
set n=easyValidator.min.js
set t=p2227temp.js

for /f %%i in ('dir %p%\*.js /od /b') do type %p%\%%i>>%t%

%j%java -jar %y% --type js --charset utf-8 -v %t% > %n%

del %t%