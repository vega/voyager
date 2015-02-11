
gitsha=$(git rev-parse HEAD)

git clone git@github.com:uwdata/facetedviz.git gh-pages
cd gh-pages
git co gh-pages
cd ..
gulp
mv gh-pages/.git dist
rm -rf gh-pages
cd dist
git add .
git commit -am "release $gitsha"
git push
cd ..