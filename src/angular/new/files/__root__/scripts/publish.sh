#!/bin/bash
npm publish ./dist/<%=name%>/core
npm publish ./dist/<%=name%>/web
read -p "Press any key to continue... " -n1 -s