rm ~/tmp/ -rf
mkdir ~/tmp/
vuepress build docs --no-cache --dest ~/tmp/
git checkout master
rm * -rf
cp -R ~/tmp/* .
git add .
git commit -m "update"
git push origin master
git checkout source

