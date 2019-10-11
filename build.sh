git add .
git commit -m "modify blog"
git push origin source
rm ~/tmp/ -rf
mkdir ~/tmp/
vuepress build docs --no-cache --dest ~/tmp/
cp ./CNAME ~/tmp/
cp ./googlefe3186928c5acc85 ~/tmp/
git checkout master
rm * -rf
cp -R ~/tmp/* .
git add .
git commit -m "update"
git push origin master
git checkout source

