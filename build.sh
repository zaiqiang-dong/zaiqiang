rm ~/tmp/ -rf
mkdir ~/tmp/
vuepress build docs --no-cache --dest ~/tmp/
git checkout master
git add .
git commit -m "update"
git push origin master
git checkout source

