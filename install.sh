

curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt-get update && sudo apt-get install yarn

yarn global add vuepress
yarn global  add vuepress-plugin-mathjax
yarn global add vuepress-plugin-container
yarn global add @vuepress/plugin-back-to-top -D
yarn global add @vuepress/plugin-google-analytics -D
