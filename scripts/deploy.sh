set -e

# define color
RED='\033[0;31m'
NC='\033[0m' # No Color


# 0.1 Check if jq has been installed
type jq >/dev/null 2>&1 || { echo >&2 "I require jq but it's not installed.  Aborting."; exit 1; }

# 0.2 check if on master
if [ "$(git rev-parse --abbrev-ref HEAD)" != "vy2-master" ]; then
  echo "${RED}Not on vy2-master, please checkout vy2-master branch before running this script${NC}"
  exit 1
fi

# 0.3 Check if all files are committed
if [ -z "$(git status --porcelain)" ]; then
  echo "All tracked files are committed.  Publishing on npm and bower. \n"
else
  echo "${RED}There are uncommitted files. Please commit or stash first!${NC} \n\n"
  git status
  exit 1
fi

gitsha=$(git rev-parse HEAD)
version=$(cat package.json | jq .version | sed -e 's/^"//'  -e 's/"$//')

git clone git@github.com:uwdata/voyager2.git gh-pages
cd gh-pages
git checkout gh-pages
cd ..
npm run build
rm -rf dist/.git
mv gh-pages/.git dist
rm -rf gh-pages
cd dist
git add .
git commit -am "release $version $gitsha"
git tag -am "Release v$version." "v$version"
git push --tags
git push origin gh-pages:gh-pages
cd ..

