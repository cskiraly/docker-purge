// format documented at https://github.com/docker/docker/blob/master/image/spec/v1.2.md#combined-image-json--filesystem-changeset-format
var fs = require('fs');
var pattern = process.argv[2];
var postfix = process.argv[3]

// read manifest
fs.readFile('manifest.json', 'utf8', function (err, data) {
  if (err) throw err; // we'll not consider error handling for now
  fs.writeFile("manifest.json.bak", data, (err) => {
    if (err) throw err; // we'll not consider error handling for now
    var manifest = JSON.parse(data);
    // read image[0] config
    fs.readFile(manifest[0].Config , 'utf8', function (err, data) {
      var config = JSON.parse(data);

      var history = config.history;
      var diff_ids = config.rootfs.diff_ids;
      for (var i = 0, j = 0; i < history.length; i++) {
        console.log(i);
        console.log(history[i].created_by);
        // check for layer to be removed
        var match = history[i].created_by.search(pattern);
        //console.log(history[i].empty_layer);
        if (! history[i].empty_layer) {
          console.log(diff_ids[j]);
          console.log(manifest[0].Layers[j])
          if (match >= 0) {
            diff_ids.splice(j, 1);
            manifest[0].Layers.splice(j, 1);
            j--;
          }
          j++;
        }
        if (match >= 0) {
          history.splice(i, 1);
          i--;
        }
      }

      // output files: we overwrite the manifest. We could calculate the sha256
      // for the image, but I've yet to find the correct documentetion for that.
      // See e.g. https://github.com/docker/docker/issues/16482
      manifest[0].Config = "0000" + manifest[0].Config.substr(4);
      manifest[0].RepoTags[0] += postfix;
      // We also fake an image sha256 in the config. Note that this field is not documented
      if ("Image" in config.config) {
        config.config.Image = config.config.Image.replace(/sha256:.{4}/,"sha256:0000");
      }

      fs.writeFile("manifest.json", JSON.stringify(manifest), (err) => {
        if (err) throw err; // we'll not consider error handling for now
        fs.writeFile(manifest[0].Config, JSON.stringify(config), (err) => {
          if (err) throw err; // we'll not consider error handling for now
        });
        //TODO: handle repositories file
      });
    });
  });
});
