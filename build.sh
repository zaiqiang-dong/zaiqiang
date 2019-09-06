gitbook build . ~/tmp/
git checkout master
cp ~/tmp/* . -r
git add .
git commit -m "update"
git push origin master
git checkout source

