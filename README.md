docker-purge
===

docker-purge is a small tool to manipulate docker images by selectively removing
layers. Its intended use is to remove layers that are required during the docker
build process, but not needed during execution.

Requirements
===

 - bash
 - node.js

Usage
===

```
  docker-purge -i <image> -r <regex> [-p postfix]
      -i image: docker image to start from
      -r regex: regular expression to select layers to purge
      -p postfix: postfix to apply at the end of the tag name
      -h : this help
```

If -p is omitted, docker-purge will replace image with the new reduced version.
