git checkout source
gitbook build . ~/tmp/
git checkout master
cp ~/tmp/* . -R

