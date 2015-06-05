set -e

gitsha=$(git rev-parse HEAD)

git clone git@github.com:uwdata/voyager.git gh-pages
cd gh-pages
git checkout gh-pages
cd ..
gulp
rm -rf dist/.git
mv gh-pages/.git dist
rm -rf gh-pages
cd dist
git add .
git commit -am "release $gitsha"
git push
cd ..
